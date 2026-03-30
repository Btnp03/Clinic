export type UserRole = "patient" | "doctor";

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender?: string;
  age?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface BaseUser {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  gender?: string;
  age?: number | null;
  photoUrl?: string;
  createdAt?: any;
}

export interface PatientUser extends BaseUser {
  role: "patient";
  allergy?: string[];
}

export interface DoctorUser extends BaseUser {
  role: "doctor";
  doctorType?: string;
  doctorTypeName?: string;
  doctorTypeKey?: string;
  experience?: number;
  rating?: number;
  online?: boolean;
}

export type User = PatientUser | DoctorUser;
