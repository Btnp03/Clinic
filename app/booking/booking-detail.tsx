import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, Image } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import { getAppointmentById } from "../../services/appointment.service";
import { getDoctorById } from "../../services/doctor.service";
import { getServiceById } from "../../services/service.service";
import { DoctorUser } from "../../types/user";

const formatDateDisplay = (value?: string) => {
  if (!value) return "-";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const [year, month, day] = parts.map((item) => parseInt(item, 10));
  if (!year || !month || !day) return value;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const formatTime = (value?: string) => {
  if (!value) return "-";
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!match) return value;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ?? "00";
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${meridiem}`;
};

type DetailParams = {
  id?: string;
};

const BookingDetailScreen = () => {
  const { id } = useLocalSearchParams<DetailParams>();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [service, setService] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!id) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const appt = await getAppointmentById(id);
        if (!appt) {
          if (isMounted) {
            setAppointment(null);
            setLoading(false);
          }
          return;
        }
        if (isMounted) setAppointment(appt);
        const [docData, serviceData] = await Promise.all([
          appt.doctorId ? getDoctorById(appt.doctorId) : Promise.resolve(null),
          appt.serviceId ? getServiceById(appt.serviceId) : Promise.resolve(null)
        ]);
        if (isMounted) {
          setDoctor(docData as DoctorUser | null);
          setService(serviceData);
        }
      } catch (error) {
        if (isMounted) Alert.alert("Error", "Unable to load booking detail.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const serviceMeta = useMemo(() => {
    if (!service) return "-";
    const parts: string[] = [];
    if (service.durationMin) parts.push(`${service.durationMin} min`);
    if (service.price) parts.push(`THB ${service.price.toLocaleString()}`);
    return parts.join(" • ") || "-";
  }, [service]);

  if (loading) {
    return (
      <View style={styles.stateWrap}>
        <Text style={styles.stateText}>Loading booking...</Text>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.stateWrap}>
        <Text style={styles.stateText}>Booking not found.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const statusLabel = appointment.status ? String(appointment.status).toUpperCase() : "CONFIRMED";
  const consultAtLabel = appointment.consultAt === "online" ? "Online" : "Onsite";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={14} color="#0B1B3A" />
        </Pressable>
        <Text style={styles.headerTitle}>Booking Detail</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.card}>
        <View style={styles.bookingIdRow}>
          <Text style={styles.bookingIdLabel}>Booking ID</Text>
          <Text style={styles.bookingIdValue}>#{appointment.id}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>

        <View style={styles.doctorRow}>
          <Image
            source={{
              uri:
                doctor?.photoUrl ||
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80"
            }}
            style={styles.avatar}
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor?.name || "Doctor"}</Text>
            <Text style={styles.doctorRole}>{doctor?.doctorTypeName || doctor?.doctorType || "Medical Specialist"}</Text>
            <View style={styles.ratingRow}>
              <FontAwesome name="star" size={12} color="#F6C453" />
              <Text style={styles.ratingText}>{doctor?.rating ? doctor.rating.toFixed(1) : "-"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date</Text>
          <Text style={styles.summaryValue}>{formatDateDisplay(appointment.date)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Time</Text>
          <Text style={styles.summaryValue}>{formatTime(appointment.time)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service</Text>
          <Text style={styles.summaryValue}>{service?.name || "-"}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration</Text>
          <Text style={styles.summaryValue}>{service?.durationMin ? `${service.durationMin} min` : "-"}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Consultation</Text>
          <Text style={styles.summaryValue}>{appointment.consultAt ? consultAtLabel : "-"}</Text>
        </View>

        <View style={styles.amountBox}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Service Fee</Text>
            <Text style={styles.amountValue}>{service?.price ? `THB ${service.price.toLocaleString()}` : "-"}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Discount</Text>
            <Text style={styles.amountValue}>THB 0</Text>
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.amountRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{service?.price ? `THB ${service.price.toLocaleString()}` : "-"}</Text>
          </View>
        </View>

        <Text style={styles.metaText}>Package: {service?.name ? `${service.name} • ${serviceMeta}` : "-"}</Text>
      </View>
    </ScrollView>
  );
};

export default BookingDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF4FF" },
  content: { padding: 18, paddingBottom: 32, gap: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#052659",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#0B1B3A" },
  headerSpacer: { width: 34 },
  stateWrap: {
    flex: 1,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 24
  },
  stateText: { fontSize: 12, color: "#6B7C96" },
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DDE7F8",
    shadowColor: "#052659",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  bookingIdRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bookingIdLabel: { fontSize: 11, color: "#8A9AB4", fontWeight: "600" },
  bookingIdValue: { fontSize: 11, color: "#0B1B3A", fontWeight: "700" },
  statusBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#E8F1FF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  statusText: { fontSize: 10, fontWeight: "700", color: "#1D4ED8" },
  doctorRow: { marginTop: 14, flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#F1F5FF" },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 14, fontWeight: "700", color: "#0B1B3A" },
  doctorRole: { marginTop: 4, fontSize: 11, color: "#6B7C96" },
  ratingRow: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { fontSize: 11, color: "#6B7C96", fontWeight: "600" },
  divider: { marginVertical: 14, height: 1, backgroundColor: "#EEF2F7" },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  summaryLabel: { fontSize: 12, color: "#6B7C96" },
  summaryValue: { fontSize: 12, fontWeight: "700", color: "#0B1B3A", maxWidth: "60%", textAlign: "right" },
  amountBox: {
    marginTop: 14,
    backgroundColor: "#F6F9FF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E3ECF9"
  },
  amountRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  amountLabel: { fontSize: 12, color: "#6B7C96" },
  amountValue: { fontSize: 12, fontWeight: "700", color: "#0B1B3A" },
  rowDivider: { height: 1, backgroundColor: "#EEF2F7", marginVertical: 10 },
  totalLabel: { fontSize: 13, fontWeight: "700", color: "#0B1B3A" },
  totalValue: { fontSize: 14, fontWeight: "800", color: "#0B1B3A" },
  metaText: { marginTop: 12, fontSize: 11, color: "#6B7C96" },
  primaryButton: {
    backgroundColor: "#052659",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16
  },
  primaryText: { color: "white", fontSize: 12, fontWeight: "700" }
});
