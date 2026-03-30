import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Image, TextInput, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { auth } from "../../firebase";
import { cancelAppointment, getAppointmentsByPatient } from "../../services/appointment.service";
import { getDoctorById } from "../../services/doctor.service";
import { getServiceById } from "../../services/service.service";

const formatDateDisplay = (value?: string) => {
  if (!value) return "-";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const [year, month, day] = parts.map((item) => parseInt(item, 10));
  if (!year || !month || !day) return value;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

type HistoryItem = {
  id: string;
  date?: string;
  time?: string;
  status?: string;
  doctor?: { name?: string; doctorType?: string; doctorTypeName?: string; photoUrl?: string; rating?: number };
  service?: { name?: string; durationMin?: number; price?: number };
};

const AppointmentsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
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
                  doctorType: doctor.doctorType || doctor.doctor_type || doctor.type || doctor.specialty,
                  doctorTypeName: doctor.doctorTypeName,
                  photoUrl: doctor.photoUrl,
                  rating: doctor.rating
                }
              : undefined,
            service: service
              ? { name: service.name, durationMin: service.durationMin, price: service.price }
              : undefined
          } as HistoryItem;
        })
      );

      setItems(enriched);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => {
      const doctorName = item.doctor?.name || "";
      const doctorType = item.doctor?.doctorTypeName || item.doctor?.doctorType || "";
      const serviceName = item.service?.name || "";
      const dateLabel = formatDateDisplay(item.date);
      return [doctorName, doctorType, serviceName, dateLabel, item.time || ""]
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [items, search]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Booking History</Text>
        <Pressable style={styles.iconButton} onPress={() => router.push("/booking/booking-history")}> 
          <FontAwesome name="list-alt" size={14} color="#0B1B3A" />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <FontAwesome name="search" size={14} color="#7DA0CA" />
        <TextInput
          placeholder="Search by doctor, service, date..."
          placeholderTextColor="#9AA8C1"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>Loading history...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>No booking history found.</Text>
        </View>
      ) : (
        filteredItems.map((item) => {
          const rating = typeof item.doctor?.rating === "number" ? item.doctor.rating.toFixed(1) : "5.0";
          const statusLabel = item.status ? item.status.toUpperCase() : "CONFIRMED";
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.bookingIdRow}>
                <Text style={styles.bookingIdLabel}>Booking ID:</Text>
                <Text style={styles.bookingIdValue}>#{item.id}</Text>
              </View>
              <Text style={styles.bookingDate}>Booking Date: {formatDateDisplay(item.date)} {item.time || ""}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{statusLabel}</Text>
              </View>

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
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <FontAwesome name="star" size={12} color="#F6C453" />
                      <Text style={styles.metaText}>{rating}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <FontAwesome name="stethoscope" size={12} color="#7DA0CA" />
                      <Text style={styles.metaText}>{item.doctor?.doctorTypeName || item.doctor?.doctorType || "General"}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Pressable
                  style={[styles.cancelButton, cancellingId === item.id && styles.cancelButtonDisabled]}
                  onPress={() => {
                    Alert.alert("Cancel booking", "Do you want to cancel this appointment?", [
                      { text: "No", style: "cancel" },
                      {
                        text: "Yes, cancel",
                        style: "destructive",
                        onPress: async () => {
                          setCancellingId(item.id);
                          try {
                            await cancelAppointment(item.id);
                            await load();
                          } finally {
                            setCancellingId(null);
                          }
                        }
                      }
                    ]);
                  }}
                  disabled={cancellingId === item.id}
                >
                  <Text style={styles.cancelText}>{cancellingId === item.id ? "Cancelling..." : "Cancel"}</Text>
                </Pressable>
                <Pressable style={styles.viewButton} onPress={() => router.push({ pathname: "/booking/booking-detail", params: { id: item.id } })}>
                  <Text style={styles.viewText}>View Booking</Text>
                </Pressable>
              </View>

              <View style={styles.serviceRow}>
                <Text style={styles.serviceLabel}>Package</Text>
                <Text style={styles.serviceValue}>{item.service?.name || "-"}</Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

export default AppointmentsScreen;

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
    justifyContent: "space-between"
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  iconButton: {
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DDE7F8",
    shadowColor: "#052659",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: "#0B1B3A"
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
  bookingIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  bookingIdLabel: {
    fontSize: 11,
    color: "#8A9AB4",
    fontWeight: "600"
  },
  bookingIdValue: {
    fontSize: 11,
    color: "#0B1B3A",
    fontWeight: "700"
  },
  bookingDate: {
    marginTop: 4,
    fontSize: 11,
    color: "#6B7C96"
  },
  statusBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#E8F1FF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1D4ED8"
  },
  cardHeader: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
  metaRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  metaText: {
    fontSize: 11,
    color: "#6B7C96"
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FBE9EA",
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: "center"
  },
  cancelButtonDisabled: {
    opacity: 0.6
  },
  cancelText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B42318"
  },
  viewButton: {
    flex: 1,
    backgroundColor: "#2C7BE5",
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: "center"
  },
  viewText: {
    fontSize: 12,
    fontWeight: "700",
    color: "white"
  },
  serviceRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  serviceLabel: {
    fontSize: 11,
    color: "#8A9AB4"
  },
  serviceValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0B1B3A",
    maxWidth: "60%",
    textAlign: "right"
  }
});

