import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase";
import { getServiceById } from "./service.service";

const normalizeTime24 = (value: string | undefined) => {
  if (!value || typeof value !== "string") return "";
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]m)?$/i);
  if (!match) return value.trim();
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2] ?? "00", 10);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem) {
    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
  }
  const hh = hours < 10 ? `0${hours}` : `${hours}`;
  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hh}:${mm}`;
};

const timeToMinutes = (value: string | undefined) => {
  const normalized = normalizeTime24(value);
  if (!normalized) return null;
  const parts = normalized.split(":");
  if (parts.length !== 2) return null;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const isBlockingStatus = (value: any) => {
  if (!value || typeof value !== "string") return true;
  const status = value.trim().toLowerCase();
  return !["cancelled", "canceled", "rejected", "failed"].includes(status);
};

export const getBookedTimes = async (doctorId: string, date: string) => {
  const snapshot = await getDocs(
    query(collection(db, "appointments"), where("doctorId", "==", doctorId), where("date", "==", date))
  );
  if (snapshot.empty) return [];

  const times = snapshot.docs
    .map((docSnap) => docSnap.data())
    .filter((data) => isBlockingStatus(data.status))
    .map((data) => normalizeTime24(data.time))
    .filter(Boolean);

  return Array.from(new Set(times));
};

type BookedInterval = { start: number; end: number };

export const getBookedIntervals = async (doctorId: string, date: string) => {
  const snapshot = await getDocs(
    query(collection(db, "appointments"), where("doctorId", "==", doctorId), where("date", "==", date))
  );
  if (snapshot.empty) return [] as BookedInterval[];

  const serviceCache = new Map<string, number | null>();

  const intervals: BookedInterval[] = [];
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (!isBlockingStatus(data.status)) continue;
    const startMinutes = timeToMinutes(data.time);
    if (startMinutes === null) continue;
    const serviceId = typeof data.serviceId === "string" ? data.serviceId : "";
    let duration = 30;
    if (serviceId) {
      if (serviceCache.has(serviceId)) {
        const cached = serviceCache.get(serviceId);
        if (typeof cached === "number") duration = cached;
      } else {
        const service = await getServiceById(serviceId);
        const durationMin = service?.durationMin;
        const value = typeof durationMin === "number" ? durationMin : null;
        serviceCache.set(serviceId, value);
        if (value) duration = value;
      }
    }
    intervals.push({ start: startMinutes, end: startMinutes + duration });
  }

  return intervals;
};

type CreateAppointmentInput = {
  date: string;
  time: string;
  doctorId: string;
  patientId: string;
  serviceId: string;
  consultAt?: "onsite" | "online";
  status?: string;
};

export const createAppointment = async (payload: CreateAppointmentInput) => {
  const data = {
    ...payload,
    status: payload.status || "confirmed",
    createdAt: serverTimestamp()
  };
  const docRef = await addDoc(collection(db, "appointments"), data);
  return docRef.id;
};

export type AppointmentRecord = {
  id: string;
  date?: string;
  time?: string;
  doctorId?: string;
  patientId?: string;
  serviceId?: string;
  consultAt?: "onsite" | "online";
  status?: string;
  createdAt?: any;
};

export const getAppointmentsByPatient = async (patientId: string) => {
  const snapshot = await getDocs(
    query(collection(db, "appointments"), where("patientId", "==", patientId))
  );
  if (snapshot.empty) return [] as AppointmentRecord[];
  const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as AppointmentRecord));
  return items.sort((a, b) => {
    const aTime = a.createdAt?.seconds ? a.createdAt.seconds : 0;
    const bTime = b.createdAt?.seconds ? b.createdAt.seconds : 0;
    return bTime - aTime;
  });
};

export const getAppointmentById = async (id: string) => {
  const ref = doc(db, "appointments", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as AppointmentRecord;
};

export const cancelAppointment = async (id: string) => {
  const ref = doc(db, "appointments", id);
  await updateDoc(ref, { status: "cancelled", cancelledAt: serverTimestamp() });
};
