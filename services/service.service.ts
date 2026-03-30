import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export type ServiceItem = {
  id: string;
  name: string;
  category?: string;
  type?: string;
  durationMin?: number;
  price?: number;
  isConsultation?: boolean;
};

const toNumber = (value: any) => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const normalizeService = (id: string, data: Record<string, any>): ServiceItem | null => {
  const name =
    (typeof data.name === "string" && data.name.trim()) ||
    (typeof data.title === "string" && data.title.trim()) ||
    (typeof data.serviceName === "string" && data.serviceName.trim()) ||
    "";

  if (!name) return null;

  const categoryRaw =
    (typeof data.category === "string" && data.category.trim()) ||
    (typeof data.group === "string" && data.group.trim()) ||
    (typeof data.type === "string" && data.type.trim()) ||
    "";

  const typeRaw =
    (typeof data.serviceType === "string" && data.serviceType.trim()) ||
    (typeof data.type === "string" && data.type.trim()) ||
    "";

  const durationMin =
    toNumber(data.durationMin) ??
    toNumber(data.durationMinutes) ??
    toNumber(data.duration) ??
    toNumber(data.timeMin);

  const price = toNumber(data.price) ?? toNumber(data.cost) ?? toNumber(data.fee);

  const nameLower = name.toLowerCase();
  const typeLower = `${typeRaw} ${categoryRaw}`.toLowerCase();
  const isConsultation =
    data.isConsultation === true ||
    nameLower.includes("consult") ||
    nameLower.includes("ปรึกษา") ||
    typeLower.includes("consult") ||
    typeLower.includes("ปรึกษา");

  return {
    id,
    name,
    category: categoryRaw || undefined,
    type: typeRaw || undefined,
    durationMin,
    price,
    isConsultation
  };
};

export const getServices = async () => {
  const snapshot = await getDocs(collection(db, "services"));
  if (snapshot.empty) return [];
  const items = snapshot.docs
    .map((docSnap) => normalizeService(docSnap.id, docSnap.data()))
    .filter((item): item is ServiceItem => Boolean(item));

  return items.sort((a, b) => {
    const aCat = (a.category || "").toLowerCase();
    const bCat = (b.category || "").toLowerCase();
    if (aCat !== bCat) return aCat.localeCompare(bCat);
    return a.name.localeCompare(b.name);
  });
};

export const getServiceById = async (id: string) => {
  const ref = doc(db, "services", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return normalizeService(snap.id, snap.data());
};
