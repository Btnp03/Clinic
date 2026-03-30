import { useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";

const SKIN_TYPES = ["Normal", "Dry", "Oily", "Combination", "Sensitive"] as const;
const CONCERNS = ["Acne", "Pores", "Pigmentation", "Redness", "Fine Lines", "Dullness"] as const;
const GOALS = ["Glow", "Clear Skin", "Hydration", "Anti-Aging", "Even Tone"] as const;
const ROUTINE = ["Beginner", "Intermediate", "Advanced"] as const;

const SkinAssessmentScreen = () => {
  const [skinType, setSkinType] = useState<string>(SKIN_TYPES[0]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [goal, setGoal] = useState<string>(GOALS[0]);
  const [routine, setRoutine] = useState<string>(ROUTINE[0]);
  const [notes, setNotes] = useState("");

  const toggleConcern = (value: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

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
        <Text style={styles.heroTitle}>Tell us about your skin</Text>
        <Text style={styles.heroSubtitle}>
          Answer a few questions to receive personalized recommendations from our doctors.
        </Text>
        <View style={styles.progressWrap}>
          <View style={styles.progressBar} />
        </View>
        <Text style={styles.progressText}>Step 1 of 3</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Skin Type</Text>
        <View style={styles.chipRow}>
          {SKIN_TYPES.map((type) => {
            const active = skinType === type;
            return (
              <Pressable
                key={type}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSkinType(type)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{type}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Main Concerns</Text>
        <Text style={styles.sectionHint}>Select all that apply</Text>
        <View style={styles.chipRow}>
          {CONCERNS.map((concern) => {
            const active = selectedConcerns.includes(concern);
            return (
              <Pressable
                key={concern}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleConcern(concern)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{concern}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Goal</Text>
        <View style={styles.chipRow}>
          {GOALS.map((item) => {
            const active = goal === item;
            return (
              <Pressable
                key={item}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setGoal(item)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Routine Level</Text>
        <View style={styles.chipRow}>
          {ROUTINE.map((item) => {
            const active = routine === item;
            return (
              <Pressable
                key={item}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setRoutine(item)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Tell us about allergies, current products, or treatments"
          placeholderTextColor="#9AA8C1"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryText}>Continue Assessment</Text>
      </Pressable>
    </ScrollView>
  );
};

export default SkinAssessmentScreen;

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
    borderRadius: 22,
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
    fontSize: 18,
    fontWeight: "700",
    color: "white"
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: "#DCE8FF",
    lineHeight: 18
  },
  progressWrap: {
    marginTop: 12,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.2)"
  },
  progressBar: {
    height: 6,
    width: "35%",
    borderRadius: 999,
    backgroundColor: "white"
  },
  progressText: {
    marginTop: 6,
    fontSize: 11,
    color: "#DCE8FF"
  },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
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
    color: "#0B1B3A"
  },
  sectionHint: {
    marginTop: 4,
    fontSize: 11,
    color: "#6B7C96"
  },
  chipRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#F1F5FF",
    borderWidth: 1,
    borderColor: "#E3ECF9"
  },
  chipActive: {
    backgroundColor: "#0B2B63",
    borderColor: "#0B2B63"
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#49608F"
  },
  chipTextActive: {
    color: "white"
  },
  textArea: {
    marginTop: 10,
    minHeight: 90,
    backgroundColor: "#F7FAFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: "#0B1B3A",
    borderWidth: 1,
    borderColor: "#E3ECF9",
    textAlignVertical: "top"
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
