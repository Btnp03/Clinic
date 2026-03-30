import { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Image, Pressable, ActivityIndicator } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { getDoctorById, getDoctorSchedules } from "../../services/doctor.service";
import { DoctorUser } from "../../types/user";

const DoctorDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<string[]>([]);
  const todayLabel = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    new Date().getDay()
  ];
  const isAvailableToday = schedules.some((item) => item.toLowerCase().includes(todayLabel.toLowerCase()));

  useEffect(() => {
    let isMounted = true;

    const loadDoctor = async () => {
      if (!id || Array.isArray(id)) {
        if (isMounted) {
          setDoctor(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getDoctorById(id);
        if (isMounted) {
          setDoctor(data);
        }
        const schedule = await getDoctorSchedules(id);
        if (isMounted) {
          setSchedules(schedule);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDoctor();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#5483B3" />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.loaderWrap}>
        <Text style={styles.emptyText}>Doctor not found.</Text>
        <Pressable style={styles.bookButton} onPress={() => router.back()}>
          <Text style={styles.bookText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Doctor Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.card}>
        <View style={styles.heroActions}>
          <Pressable style={styles.circleButton} onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={14} color="#1E2C4C" />
          </Pressable>
        </View>
        <Image
          source={{
            uri:
              doctor.photoUrl ||
              "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80"
          }}
          style={styles.photo}
        />

        <Text style={styles.name}>{doctor.name}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.specialty}>{doctor.doctorTypeName || doctor.doctorType || "Aesthetic Specialist"}</Text>
          <View style={styles.ratingBox}>
            <FontAwesome name="star" size={12} color="#F6C453" />
            <Text style={styles.ratingText}>
              {doctor.rating ? doctor.rating.toFixed(1) : "No ratings"}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <FontAwesome name="clock-o" size={12} color={isAvailableToday ? "#16A34A" : "#9CA3AF"} />
          <Text style={[styles.statusText, !isAvailableToday && styles.statusTextMuted]}>
            {isAvailableToday ? "Available today" : "Not available today"}
          </Text>
        </View>

        <View style={styles.scheduleWrap}>
          {schedules.length === 0 ? (
            <View style={styles.schedulePill}>
              <FontAwesome name="clock-o" size={12} color="#FFFFFF" />
              <Text style={styles.scheduleText}>Schedule not available</Text>
            </View>
          ) : (
            schedules.map((item) => (
              <View key={item} style={styles.schedulePill}>
                <FontAwesome name="clock-o" size={12} color="#FFFFFF" />
                <Text style={styles.scheduleText}>{item}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          {doctor.description?.trim()
            ? doctor.description
            : doctor.doctorTypeName || doctor.doctorType
              ? `Specialized in ${doctor.doctorTypeName || doctor.doctorType}. ${doctor.experience ? `${doctor.experience} years of experience.` : ""}`
              : "Experienced specialist with a focus on personalized care."}
        </Text>

        <Pressable
          style={styles.bookButton}
          onPress={() => {
            if (id && !Array.isArray(id)) {
              router.push({ pathname: "/booking/book-appointment", params: { doctorId: id } });
              return;
            }
            router.push("/booking/book-appointment");
          }}
        >
          <Text style={styles.bookText}>Book Appointment</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default DoctorDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF4FF"
  },
  content: {
    padding: 18,
    paddingBottom: 32
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF4FF",
    padding: 24,
    gap: 12
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7C96"
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18
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
  heroActions: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 2
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 0,
    borderWidth: 0,
    borderColor: "transparent",
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0
  },
  photo: {
    width: "100%",
    height: 240,
    borderRadius: 18
  },
  name: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  ratingRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  specialty: {
    fontSize: 12,
    color: "#6B7C96"
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F7FAFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3ECF9"
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  schedulePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(84, 131, 179, 0.35)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14
  },
  scheduleText: {
    color: "#0B1B3A",
    fontSize: 12,
    fontWeight: "700"
  },
  scheduleWrap: {
    marginTop: 14,
    gap: 8
  },
  statusRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A"
  },
  statusTextMuted: {
    color: "#9CA3AF"
  },
  scheduleText: {
    color: "#0B1B3A",
    fontSize: 12,
    fontWeight: "700"
  },
  sectionTitle: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  description: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7C96",
    lineHeight: 18
  },
  bookButton: {
    marginTop: 20,
    backgroundColor: "#052659",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center"
  },
  bookText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700"
  }
});
