import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { DoctorUser } from "../types/user";

const DOCTOR_TYPE_COLLECTIONS = ["doctorType", "doctor_types", "doctorTypes", "doctor_type"] as const;
const doctorTypeCache = new Map<string, string>();
const doctorTypeKeyCache = new Map<string, string>();

const extractDoctorTypeName = (data: Record<string, any>) => {
  return (
    (typeof data.name === "string" && data.name.trim()) ||
    (typeof data.title === "string" && data.title.trim()) ||
    (typeof data.label === "string" && data.label.trim()) ||
    (typeof data.type === "string" && data.type.trim()) ||
    ""
  );
};

const looksLikeId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^[A-Za-z0-9_-]{12,}$/.test(trimmed)) return true;
  if (!trimmed.includes(" ") && trimmed.length >= 12) return true;
  return false;
};

const normalizeDoctorTypeName = (value: string | undefined) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return looksLikeId(trimmed) ? "" : trimmed;
};

export const getDoctorTypeNameById = async (doctorTypeId: string) => {
  const id = typeof doctorTypeId === "string" ? doctorTypeId.trim() : "";
  if (!id) return "";
  if (doctorTypeCache.has(id)) return doctorTypeCache.get(id) || "";

  for (const collectionName of DOCTOR_TYPE_COLLECTIONS) {
    const snap = await getDoc(doc(db, collectionName, id));
    if (snap.exists()) {
      const name = extractDoctorTypeName(snap.data());
      if (name) {
        doctorTypeCache.set(id, name);
        return name;
      }
    }
  }

  const fallback = normalizeDoctorTypeName(id);
  if (fallback) {
    doctorTypeCache.set(id, fallback);
    return fallback;
  }
  return "";
};

export const getDoctorTypeNameByKey = async (doctorTypeKey: string) => {
  const key = typeof doctorTypeKey === "string" ? doctorTypeKey.trim() : "";
  if (!key) return "";
  if (doctorTypeKeyCache.has(key)) return doctorTypeKeyCache.get(key) || "";

  const snapshot = await getDocs(
    query(collection(db, "doctorType"), where("key", "==", key), limit(1))
  );
  const docSnap = snapshot.docs[0];
  if (docSnap) {
    const data = docSnap.data() as Record<string, any>;
    const name = extractDoctorTypeName(data);
    if (name) {
      doctorTypeKeyCache.set(key, name);
      return name;
    }
  }

  doctorTypeKeyCache.set(key, key);
  return key;
};

export const attachDoctorTypeNames = async (doctors: DoctorUser[]) => {
  const ids = Array.from(
    new Set(
      doctors
        .map((doctor) => doctor.doctorType)
        .filter((value): value is string => Boolean(value && value.trim()))
    )
  );

  const resolved = await Promise.all(ids.map((id) => getDoctorTypeNameById(id)));
  const map = new Map(ids.map((id, index) => [id, resolved[index] || ""]));

  return doctors.map((doctor) => ({
    ...doctor,
    doctorTypeName: doctor.doctorType ? map.get(doctor.doctorType) || "" : ""
  }));
};

export const getDoctorById = async (id: string) => {
  const doctorRef = doc(db, "doctors", id);
  const doctorSnap = await getDoc(doctorRef);
  if (doctorSnap.exists()) {
    const doctor = { id: doctorSnap.id, ...doctorSnap.data() } as DoctorUser;
    if (doctor.doctorTypeKey) {
      doctor.doctorTypeName = await getDoctorTypeNameByKey(doctor.doctorTypeKey);
    } else if (doctor.doctorType) {
      doctor.doctorTypeName = await getDoctorTypeNameById(doctor.doctorType);
    }
    return doctor;
  }

  const userRef = doc(db, "users", id);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  const doctor = { id: userSnap.id, ...userSnap.data() } as DoctorUser;
  if (doctor.doctorTypeKey) {
    doctor.doctorTypeName = await getDoctorTypeNameByKey(doctor.doctorTypeKey);
  } else if (doctor.doctorType) {
    doctor.doctorTypeName = await getDoctorTypeNameById(doctor.doctorType);
  }
  return doctor;
};

const WEEKDAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type Weekday = (typeof WEEKDAY_ORDER)[number];

const formatTimeAmPm = (value: string | undefined) => {
  if (!value || typeof value !== "string") return "";
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]m)?$/i);
  if (!match) return value;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ?? "00";
  const hasMeridiem = Boolean(match[3]);
  if (hasMeridiem) {
    const meridiem = match[3]!.toUpperCase();
    return `${hours}:${minutes} ${meridiem}`;
  }
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${meridiem}`;
};

const normalizeScheduleItem = (data: Record<string, any>) => {
  const dayRaw = data.day || data.days || data.weekday;
  const day = typeof dayRaw === "string" ? dayRaw.trim() : "";
  const start = formatTimeAmPm(data.startTime || data.start || data.from);
  const end = formatTimeAmPm(data.endTime || data.end || data.to);

  if (day) {
    const timeLabel =
      start || end ? ` (${start || ""}${start && end ? "-" : ""}${end || ""})` : "";
    return { day, label: `${day}${timeLabel}`.trim() };
  }

  if (typeof data.label === "string" && data.label.trim()) {
    return { day: "", label: data.label.trim() };
  }

  return null;
};

export const getDoctorSchedules = async (doctorId: string) => {
  const q = query(collection(db, "doctor_schedules"), where("doctorId", "==", doctorId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return [];

  const items = snapshot.docs
    .map((docSnap) => normalizeScheduleItem(docSnap.data()))
    .filter((item): item is { day: string; label: string } => Boolean(item));

  const unique = Array.from(new Map(items.map((item) => [item.label, item])).values());

  const sorted = unique.sort((a, b) => {
    const aIndex = WEEKDAY_ORDER.indexOf(a.day as Weekday);
    const bIndex = WEEKDAY_ORDER.indexOf(b.day as Weekday);
    const aRank = aIndex === -1 ? 999 : aIndex;
    const bRank = bIndex === -1 ? 999 : bIndex;
    if (aRank !== bRank) return aRank - bRank;
    return a.label.localeCompare(b.label);
  });

  return sorted.map((item) => item.label);
};

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

const normalizeScheduleWindow = (data: Record<string, any>) => {
  const dayRaw = data.day || data.days || data.weekday;
  const day = typeof dayRaw === "string" ? dayRaw.trim() : "";
  const start = normalizeTime24(data.startTime || data.start || data.from);
  const end = normalizeTime24(data.endTime || data.end || data.to);
  if (!day || !start || !end) return null;
  return { day, start, end };
};

export const getDoctorScheduleWindows = async (doctorId: string) => {
  const q = query(collection(db, "doctor_schedules"), where("doctorId", "==", doctorId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return [];

  const items = snapshot.docs
    .map((docSnap) => normalizeScheduleWindow(docSnap.data()))
    .filter((item): item is { day: string; start: string; end: string } => Boolean(item));

  const unique = Array.from(
    new Map(items.map((item) => [`${item.day}-${item.start}-${item.end}`, item])).values()
  );

  const sorted = unique.sort((a, b) => {
    const aIndex = WEEKDAY_ORDER.indexOf(a.day as Weekday);
    const bIndex = WEEKDAY_ORDER.indexOf(b.day as Weekday);
    const aRank = aIndex === -1 ? 999 : aIndex;
    const bRank = bIndex === -1 ? 999 : bIndex;
    if (aRank !== bRank) return aRank - bRank;
    if (a.start !== b.start) return a.start.localeCompare(b.start);
    return a.end.localeCompare(b.end);
  });

  return sorted;
};
