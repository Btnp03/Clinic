export type DoctorSchedule = {
  label: string;
};

export type DoctorDetail = {
  id: string;
  name: string;
  doctorType?: string;
  doctorTypeName?: string;
  rating?: number;
  reviews?: number;
  experience?: number;
  photoUrl?: string;
  schedule?: DoctorSchedule;
  description?: string;
};
