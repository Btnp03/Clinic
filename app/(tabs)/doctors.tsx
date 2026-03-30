import { StyleSheet } from "react-native";
import DoctorsHeader from "../../components/doctors/DoctorsHeader";
import DoctorsList from "../../components/doctors/DoctorsList";
import { useMemo, useEffect, useState } from "react";
import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { DoctorUser } from "../../types/user";
import { attachDoctorTypeNames } from "../../services/doctor.service";

const DoctorsScreen = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<DoctorUser[]>([]);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDoctors = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, "users"), where("role", "==", "doctor")));
        if (!isMounted) return;
        const data = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as DoctorUser));
        const enriched = await attachDoctorTypeNames(data);
        setDoctors(enriched);
      } catch (error) {
        if (isMounted) {
          setDoctors([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDoctors();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDoctors = useMemo(() => {
    if (!search.trim()) return doctors;
    const term = search.trim().toLowerCase();
    return doctors.filter((doctor) =>
      [doctor.name, doctor.doctorTypeName || doctor.doctorType || doctor.specialty]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [doctors, search]);

  const sortedDoctors = useMemo(() => {
    return [...filteredDoctors].sort((a, b) => {
      const aName = (a.name || "").toLowerCase();
      const bName = (b.name || "").toLowerCase();
      if (aName === bName) return 0;
      return sortAsc ? aName.localeCompare(bName) : bName.localeCompare(aName);
    });
  }, [filteredDoctors, sortAsc]);

  return (
    <>
      <DoctorsHeader
        title="All Doctors"
        search={search}
        onSearchChange={setSearch}
        onBack={() => router.back()}
        onToggleSort={() => setSortAsc((prev) => !prev)}
      />
      <DoctorsList
        doctors={sortedDoctors}
        loading={loading}
        onSelect={(doctorId) => router.push(`/doctor/${doctorId}`)}
      />
    </>
  );
};

export default DoctorsScreen;

const styles = StyleSheet.create({});
