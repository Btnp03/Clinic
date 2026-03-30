import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";

const SkinAssessmentIntro = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={14} color="#0B1B3A" />
        </Pressable>
        <Text style={styles.headerTitle}>Skin Assessment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />
        <Text style={styles.heroTitle}>Start Your Skin Journey</Text>
        <Text style={styles.heroSubtitle}>
          Answer a few quick questions so our doctors can tailor the best recommendations for you.
        </Text>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>5 min</Text>
          <Text style={styles.badge}>Personalized</Text>
          <Text style={styles.badge}>Secure</Text>
        </View>
      </View>

      <View style={styles.stepsCard}>
        <Text style={styles.sectionTitle}>What happens next</Text>
        <View style={styles.stepRow}>
          <View style={styles.stepDot} />
          <Text style={styles.stepText}>Fill in your skin details</Text>
        </View>
        <View style={styles.stepRow}>
          <View style={styles.stepDot} />
          <Text style={styles.stepText}>We process your answers</Text>
        </View>
        <View style={styles.stepRow}>
          <View style={styles.stepDot} />
          <Text style={styles.stepText}>Get recommended care plan</Text>
        </View>
      </View>

      <Pressable style={styles.primaryButton} onPress={() => router.push("/assessment/skin-form")}> 
        <Text style={styles.primaryText}>Start Assessment</Text>
      </Pressable>
    </ScrollView>
  );
};

export default SkinAssessmentIntro;

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
  heroCard: {
    backgroundColor: "#0B2B63",
    borderRadius: 24,
    padding: 18,
    overflow: "hidden"
  },
  heroGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(93, 135, 183, 0.5)",
    top: -100,
    right: -60
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white"
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: "#DCE8FF",
    lineHeight: 18
  },
  badgeRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "white",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
    fontSize: 11
  },
  stepsCard: {
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0B1B3A",
    marginBottom: 8
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#5D87B7"
  },
  stepText: {
    fontSize: 12,
    color: "#6B7C96"
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: "#052659",
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: "center"
  },
  primaryText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700"
  }
});
