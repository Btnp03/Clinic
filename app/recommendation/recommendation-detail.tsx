import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";

const RecommendationDetail = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={14} color="#0B1B3A" />
        </Pressable>
        <Text style={styles.headerTitle}>Recommendation Detail</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>Plan {id || ""}</Text>
        <Text style={styles.detailSubtitle}>Personalized doctor recommendation</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morning Routine</Text>
          <Text style={styles.sectionText}>Gentle cleanser, hydrating serum, SPF 50+</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Night Routine</Text>
          <Text style={styles.sectionText}>Barrier repair cream, peptide serum</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>In-clinic</Text>
          <Text style={styles.sectionText}>Hydra facial, LED therapy, soothing mask</Text>
        </View>
      </View>

      <Pressable style={styles.primaryButton} onPress={() => router.push("/booking/book-appointment")}>
        <Text style={styles.primaryText}>Book Appointment</Text>
      </Pressable>
    </ScrollView>
  );
};

export default RecommendationDetail;

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
  detailCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE7F8",
    shadowColor: "#052659",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  detailTitle: { fontSize: 16, fontWeight: "700", color: "#0B1B3A" },
  detailSubtitle: { marginTop: 4, fontSize: 12, color: "#6B7C96" },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#0B1B3A" },
  sectionText: { marginTop: 4, fontSize: 12, color: "#6B7C96" },
  primaryButton: {
    marginTop: 6,
    backgroundColor: "#052659",
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: "center"
  },
  primaryText: { color: "white", fontSize: 13, fontWeight: "700" }
});
