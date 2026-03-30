import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Image } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { auth } from "../../firebase";
import { getAppointmentsByPatient } from "../../services/appointment.service";
import { getDoctorById } from "../../services/doctor.service";
import { getServiceById } from "../../services/service.service";

type HistoryItem = {
  id: string;
  date?: string;
  time?: string;
  status?: string;
  doctor?: { name?: string; doctorType?: string; doctorTypeName?: string; photoUrl?: string };
  service?: { name?: string; durationMin?: number; price?: number };
};

const formatDateDisplay = (value?: string) => {
  if (!value) return "-";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const [year, month, day] = parts.map((item) => parseInt(item, 10));
  if (!year || !month || !day) return value;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const BookingHistoryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        if (isMounted) {
          setItems([]);
          setLoading(false);
        }
        return;
      }
      try {
        const appointments = await getAppointmentsByPatient(uid);
        const doctorCache = new Map<string, any>();
        const serviceCache = new Map<string, any>();

        const enriched = await Promise.all(
          appointments.map(async (appt) => {
            const doctorId = appt.doctorId || "";
            const serviceId = appt.serviceId || "";
            let doctor = doctorCache.get(doctorId);
            if (!doctor && doctorId) {
              doctor = await getDoctorById(doctorId);
              doctorCache.set(doctorId, doctor);
            }
            let service = serviceCache.get(serviceId);
            if (!service && serviceId) {
              service = await getServiceById(serviceId);
              serviceCache.set(serviceId, service);
            }
            return {
              id: appt.id,
              date: appt.date,
              time: appt.time,
              status: appt.status,
              doctor: doctor
                ? {
                    name: doctor.name,
                    doctorType: doctor.doctorType || doctor.specialty,
                    doctorTypeName: doctor.doctorTypeName,
                    photoUrl: doctor.photoUrl
                  }
                : undefined,
              service: service
                ? { name: service.name, durationMin: service.durationMin, price: service.price }
                : undefined
            } as HistoryItem;
          })
        );

        if (isMounted) {
          setItems(enriched);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>Loading history...</Text>
        </View>
      );
    }
    if (items.length === 0) {
      return (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>No booking history yet.</Text>
        </View>
      );
    }
    return items.map((item) => (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Image
            source={{
              uri:
                item.doctor?.photoUrl ||
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80"
            }}
            style={styles.avatar}
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.doctor?.name || "Doctor"}</Text>
            <Text style={styles.cardSub}>{item.doctor?.doctorTypeName || item.doctor?.doctorType || "Medical Specialist"}</Text>
            <Text style={styles.cardMeta}>
              {formatDateDisplay(item.date)} • {item.time || "-"}
            </Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{item.status || "confirmed"}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Service</Text>
          <Text style={styles.rowValue}>{item.service?.name || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Duration</Text>
          <Text style={styles.rowValue}>
            {item.service?.durationMin ? `${item.service.durationMin} min` : "-"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Price</Text>
          <Text style={styles.rowValue}>
            {typeof item.service?.price === "number"
              ? `THB ${item.service.price.toLocaleString()}`
              : "-"}
          </Text>
        </View>
      </View>
    ));
  }, [items, loading]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={14} color="#0B1B3A" />
        </Pressable>
        <Text style={styles.headerTitle}>Booking History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {content}
    </ScrollView>
  );
};

export default BookingHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF4FF"
  },
  content: {
    padding: 18,
    paddingBottom: 32,
    gap: 14
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
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
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  headerSpacer: {
    width: 34
  },
  stateCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE7F8",
    alignItems: "center"
  },
  stateText: {
    fontSize: 12,
    color: "#6B7C96"
  },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DDE7F8",
    shadowColor: "#052659",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F5FF"
  },
  cardInfo: {
    flex: 1
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  cardSub: {
    marginTop: 2,
    fontSize: 11,
    color: "#6B7C96"
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 11,
    color: "#6B7C96"
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#E7F0FF"
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0B1B3A",
    textTransform: "uppercase"
  },
  row: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  rowLabel: {
    fontSize: 11,
    color: "#6B7C96"
  },
  rowValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0B1B3A"
  }
});
