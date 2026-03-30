import { ScrollView, View, Text, StyleSheet, Image, Pressable } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const DoctorDetailScreen = () => {
  const doctor = {
    name: "Dr. Vargo Ho",
    doctorType: "Neurologist",
    rating: 4.8,
    reviews: 210,
    schedule: "Sunday - Friday (07:00-12:00 pm)",
    description:
      "Dr. Vargo Ho is a board-certified neurologist with 12 years of experience in advanced diagnostics, migraine care, and personalized treatment plans.",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80"
  };

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
        <LinearGradient
          colors={["#052659", "#5483B3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.photoWrap}
        >
          <Image source={{ uri: doctor.image }} style={styles.photo} />
        </LinearGradient>

        <Text style={styles.name}>{doctor.name}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.specialty}>{doctor.doctorTypeName || doctor.doctorType}</Text>
          <View style={styles.ratingBox}>
            <FontAwesome name="star" size={12} color="#F6C453" />
            <Text style={styles.ratingText}>
              {doctor.rating} ({doctor.reviews})
            </Text>
          </View>
        </View>

        <View style={styles.schedulePill}>
          <FontAwesome name="clock-o" size={12} color="#FFFFFF" />
          <Text style={styles.scheduleText}>{doctor.schedule}</Text>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{doctor.description}</Text>

        <Pressable style={styles.bookButton} onPress={() => router.push("/booking/book-appointment")}>
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
    backgroundColor: "white",
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DDE7F8",
    shadowColor: "#052659",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  photoWrap: {
    borderRadius: 22,
    padding: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  photo: {
    width: "100%",
    height: 220,
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
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#5483B3",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14
  },
  scheduleText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600"
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
