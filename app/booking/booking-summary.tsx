import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, Image } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import { auth } from "../../firebase";
import { createAppointment, getBookedIntervals } from "../../services/appointment.service";
import { getDoctorById } from "../../services/doctor.service";
import { getServiceById } from "../../services/service.service";
import { DoctorUser } from "../../types/user";

type SummaryParams = {
  doctorId?: string;
  serviceId?: string;
  date?: string;
  time?: string;
  consultAt?: string;
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

const parseTimeToMinutes = (value: string | undefined) => {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]m)?$/);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2] ?? "00", 10);
  const meridiem = match[3];
  if (meridiem) {
    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
  }
  return hours * 60 + minutes;
};

const overlaps = (start: number, end: number, otherStart: number, otherEnd: number) =>
  start < otherEnd && end > otherStart;

const BookingSummaryScreen = () => {
  const { doctorId, serviceId, date, time, consultAt } = useLocalSearchParams<SummaryParams>();
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [serviceName, setServiceName] = useState<string>("-");
  const [serviceMeta, setServiceMeta] = useState<string>("");
  const [servicePrice, setServicePrice] = useState<number | null>(null);
  const [serviceDuration, setServiceDuration] = useState<number>(30);
  const [isConsultation, setIsConsultation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookedIntervals, setBookedIntervals] = useState<Array<{ start: number; end: number }>>([]);

  const hasParams = Boolean(doctorId && serviceId && date && time);
  const bookingEmail = auth.currentUser?.email || "-";

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!doctorId || !serviceId || !date) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const [doctorData, serviceData, intervals] = await Promise.all([
          getDoctorById(doctorId),
          getServiceById(serviceId),
          getBookedIntervals(doctorId, date)
        ]);
        if (!isMounted) return;
        setDoctor(doctorData);
        setBookedIntervals(intervals);
        if (serviceData) {
          setServiceName(serviceData.name);
          const metaParts = [];
          if (serviceData.durationMin) metaParts.push(`${serviceData.durationMin} min`);
          if (serviceData.price) metaParts.push(`THB ${serviceData.price.toLocaleString()}`);
          setServiceMeta(metaParts.join(" • "));
          setServicePrice(typeof serviceData.price === "number" ? serviceData.price : null);
          setServiceDuration(serviceData.durationMin || 30);
          setIsConsultation(Boolean(serviceData.isConsultation));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [doctorId, serviceId, date]);

  const isTimeAvailable = useMemo(() => {
    if (!time) return false;
    const start = parseTimeToMinutes(time);
    if (start === null) return false;
    const end = start + (serviceDuration || 30);
    return !bookedIntervals.some((interval) => overlaps(start, end, interval.start, interval.end));
  }, [bookedIntervals, serviceDuration, time]);

  const onConfirm = async () => {
    if (!hasParams || !doctorId || !serviceId || !date || !time) {
      Alert.alert("Missing info", "Please go back and complete the booking details.");
      return;
    }
    if (!isTimeAvailable) {
      Alert.alert("Time unavailable", "This time slot is already booked.");
      return;
    }
    const patientId = auth.currentUser?.uid;
    if (!patientId) {
      Alert.alert("Sign in required", "Please sign in to book an appointment.");
      return;
    }

    setBooking(true);
    try {
      await createAppointment({
        date,
        time,
        doctorId,
        patientId,
        serviceId,
        consultAt: isConsultation && typeof consultAt === "string" ? (consultAt as "onsite" | "online") : undefined,
        status: "confirmed"
      });
      Alert.alert("Booked", "Your appointment has been confirmed.", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/booking/booking-history");
          }
        }
      ]);
    } catch (error) {
      Alert.alert("Booking failed", "Please try again.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="chevron-left" size={14} color="#0B1B3A" />
        </Pressable>
        <Text style={styles.headerTitle}>Review Summary</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.card}>
        <View style={styles.doctorRow}>
          <Image
            source={{
              uri:
                doctor?.photoUrl ||
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80"
            }}
            style={styles.doctorAvatar}
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor?.name || "Doctor"}</Text>
            <Text style={styles.doctorRole}>{doctor?.doctorTypeName || doctor?.doctorType || "Medical Specialist"}</Text>
            <View style={styles.locationRow}>
              <FontAwesome name="map-marker" size={12} color="#5D87B7" />
              <Text style={styles.locationText}>Bangkok, Thailand</Text>
            </View>
          </View>
          <View style={styles.verifiedBadge}>
            <FontAwesome name="check" size={10} color="#0B5ED7" />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Date & Hour</Text>
            <Text style={styles.summaryValueText}>
              {formatDateDisplay(date)} {time ? `| ${time}` : ""}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Package</Text>
            <Text style={styles.summaryValueText}>{serviceName}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValueText}>{serviceDuration} minutes</Text>
          </View>
          {isConsultation ? (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Consultation At</Text>
              <Text style={styles.summaryValueText}>
                {typeof consultAt === "string"
                  ? consultAt === "online"
                    ? "Online"
                    : "Onsite"
                  : "Onsite"}
              </Text>
            </View>
          ) : null}
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Booking for</Text>
            <Text style={styles.summaryValueText}>{bookingEmail}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.amountBox}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>
              {servicePrice !== null ? `THB ${servicePrice.toLocaleString()}` : "-"}
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Duration ({serviceDuration} mins)</Text>
            <Text style={styles.amountValue}>1 x {serviceDuration} mins</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Discount</Text>
            <Text style={styles.amountValue}>THB 0</Text>
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.amountRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {servicePrice !== null ? `THB ${servicePrice.toLocaleString()}` : "-"}
            </Text>
          </View>
        </View>

        <View style={styles.paymentRow}>
          <View style={styles.paymentIcon}>
            <FontAwesome name="money" size={14} color="#0B1B3A" />
          </View>
          <Text style={styles.paymentText}>Cash</Text>
          <Text style={styles.paymentChange}>Change</Text>
        </View>

        {!loading && !isTimeAvailable ? (
          <View style={styles.warningBox}>
            <FontAwesome name="exclamation-circle" size={14} color="#B45309" />
            <Text style={styles.warningText}>This time slot is already booked.</Text>
          </View>
        ) : null}
      </View>

      <Pressable
        style={[styles.bookButton, (!hasParams || !isTimeAvailable || booking) && styles.bookButtonDisabled]}
        onPress={onConfirm}
        disabled={!hasParams || !isTimeAvailable || booking}
      >
        <Text style={styles.bookText}>{booking ? "Booking..." : "Pay Now"}</Text>
      </Pressable>
    </ScrollView>
  );
};

export default BookingSummaryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF4FF"
  },
  content: {
    padding: 18,
    paddingBottom: 32
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingTop: 6,
    zIndex: 5
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6,
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7C96",
    textTransform: "uppercase"
  },
  doctorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  doctorAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F1F5FF"
  },
  doctorInfo: {
    flex: 1
  },
  doctorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  doctorRole: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7C96"
  },
  locationRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  locationText: {
    fontSize: 11,
    color: "#6B7C96"
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E7F0FF",
    alignItems: "center",
    justifyContent: "center"
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF2F7",
    marginVertical: 14
  },
  summaryGrid: {
    gap: 10
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7C96"
  },
  summaryValueText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1B3A",
    maxWidth: "55%",
    textAlign: "right"
  },
  amountBox: {
    backgroundColor: "#F6F9FF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E3ECF9"
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6
  },
  amountLabel: {
    fontSize: 12,
    color: "#6B7C96"
  },
  amountValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8
  },
  rowLabel: {
    fontSize: 12,
    color: "#6B7C96"
  },
  rowValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#EEF2F7",
    marginVertical: 10
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0B1B3A"
  },
  paymentRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  paymentIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#E7F0FF",
    alignItems: "center",
    justifyContent: "center"
  },
  paymentText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  paymentChange: {
    marginLeft: "auto",
    fontSize: 12,
    color: "#5D87B7",
    fontWeight: "700"
  },
  warningBox: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    padding: 10,
    borderRadius: 12
  },
  warningText: {
    fontSize: 12,
    color: "#B45309",
    fontWeight: "600"
  },
  bookButton: {
    marginTop: 22,
    backgroundColor: "#052659",
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: "center"
  },
  bookButtonDisabled: {
    opacity: 0.6
  },
  bookText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700"
  }
});
