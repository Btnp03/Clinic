import { useMemo, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, TextInput, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const SKIN_TYPES = ["Normal", "Dry", "Oily", "Combination", "Sensitive"] as const;
const SKIN_TONES = ["Fair", "Light", "Medium", "Tan", "Deep"] as const;
const CONCERNS = ["Acne", "Pores", "Pigmentation", "Redness", "Fine Lines", "Dullness"] as const;
const SEVERITY = ["Mild", "Moderate", "Severe"] as const;
const GOALS = ["Glow", "Clear Skin", "Hydration", "Anti-Aging", "Even Tone"] as const;
const SUN_EXPOSURE = ["Low", "Medium", "High"] as const;
const STRESS_LEVEL = ["Low", "Medium", "High"] as const;

type IssueKey = "acne" | "pigmentation" | "aging" | "sensitivity" | "dehydration" | "oiliness";

type AnalysisResult = {
  skinScore: number;
  primaryIssue: IssueKey;
  secondaryIssue: IssueKey;
  insights: string[];
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const computeAnalysis = (input: {
  skinType: string;
  concerns: string[];
  severityLevel: string;
  lifestyle: { sunExposure: string; sleepHours: number | null; waterIntake: number | null; stressLevel: string };
  skincareRoutine: { cleanser: boolean; toner: boolean; serum: boolean; moisturizer: boolean; sunscreen: boolean };
}): AnalysisResult => {
  const scores: Record<IssueKey, number> = {
    acne: 0,
    pigmentation: 0,
    aging: 0,
    sensitivity: 0,
    dehydration: 0,
    oiliness: 0
  };

  const skinType = input.skinType.toLowerCase();
  if (skinType === "oily") {
    scores.acne += 3;
    scores.oiliness += 3;
  }
  if (skinType === "dry") {
    scores.dehydration += 3;
    scores.aging += 2;
  }
  if (skinType === "combination") {
    scores.acne += 1;
    scores.oiliness += 1;
  }
  if (skinType === "sensitive") {
    scores.sensitivity += 3;
  }

  const severityMultiplier = input.severityLevel.toLowerCase() === "severe" ? 3
    : input.severityLevel.toLowerCase() === "moderate" ? 2
    : 1;

  input.concerns.forEach((concern) => {
    const c = concern.toLowerCase();
    if (c.includes("acne")) scores.acne += 4 * severityMultiplier;
    if (c.includes("wrinkle") || c.includes("fine")) scores.aging += 4 * severityMultiplier;
    if (c.includes("pigment")) scores.pigmentation += 4 * severityMultiplier;
    if (c.includes("red")) scores.sensitivity += 3 * severityMultiplier;
    if (c.includes("dull")) scores.dehydration += 2 * severityMultiplier;
    if (c.includes("pore")) scores.oiliness += 2 * severityMultiplier;
  });

  const lifestyle = input.lifestyle;
  if (lifestyle.sunExposure.toLowerCase() === "high") {
    scores.pigmentation += 3;
    scores.aging += 2;
  }
  if (!input.skincareRoutine.sunscreen) {
    scores.pigmentation += 3;
    scores.aging += 2;
  }
  if (typeof lifestyle.sleepHours === "number" && lifestyle.sleepHours < 6) {
    scores.aging += 2;
    scores.acne += 1;
  }
  if (typeof lifestyle.waterIntake === "number" && lifestyle.waterIntake < 1.5) {
    scores.dehydration += 2;
  }
  if (lifestyle.stressLevel.toLowerCase() === "high") {
    scores.acne += 2;
  }

  if (!input.skincareRoutine.cleanser) {
    scores.acne += 1;
  }
  if (!input.skincareRoutine.moisturizer) {
    scores.dehydration += 2;
  }

  const sorted = (Object.keys(scores) as IssueKey[]).sort((a, b) => scores[b] - scores[a]);
  const primaryIssue = sorted[0];
  const secondaryIssue = sorted[1] ?? sorted[0];

  let skinScore = 100 - (
    scores.acne * 2 +
    scores.pigmentation * 2 +
    scores.aging * 2 +
    scores.sensitivity * 1.5 +
    scores.dehydration * 1.5
  );
  skinScore = clamp(Math.round(skinScore), 0, 100);

  const insights: string[] = [];
  if (lifestyle.sunExposure.toLowerCase() === "high" && !input.skincareRoutine.sunscreen) {
    insights.push("High sun exposure without sunscreen increases pigmentation risk");
  }
  if (typeof lifestyle.sleepHours === "number" && lifestyle.sleepHours < 6) {
    insights.push("Lack of sleep may accelerate skin aging");
  }
  if (lifestyle.stressLevel.toLowerCase() === "high") {
    insights.push("High stress may trigger acne breakouts");
  }
  if (typeof lifestyle.waterIntake === "number" && lifestyle.waterIntake < 1.5) {
    insights.push("Low water intake can lead to dehydrated skin");
  }

  return { skinScore, primaryIssue, secondaryIssue, insights };
};

type DropdownProps = {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

const Dropdown = ({ label, value, options, onChange }: DropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.dropdownWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Pressable style={styles.dropdownButton} onPress={() => setOpen((prev) => !prev)}>
        <Text style={styles.dropdownValue}>{value || "Select"}</Text>
        <FontAwesome name={open ? "chevron-up" : "chevron-down"} size={12} color="#6B7C96" />
      </Pressable>
      {open ? (
        <View style={styles.dropdownList}>
          {options.map((item, index) => (
            <Pressable
              key={item}
              style={[
                styles.dropdownItem,
                index === options.length - 1 && styles.dropdownItemLast
              ]}
              onPress={() => {
                onChange(item);
                setOpen(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const SkinFormScreen = () => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [skinType, setSkinType] = useState<string>(SKIN_TYPES[0]);
  const [skinTone, setSkinTone] = useState<string>(SKIN_TONES[2]);
  const [allergies, setAllergies] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [severityLevel, setSeverityLevel] = useState<string>(SEVERITY[0]);

  const [goals, setGoals] = useState<string[]>([]);
  const [sunExposure, setSunExposure] = useState<string>(SUN_EXPOSURE[1]);
  const [sleepHours, setSleepHours] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [stressLevel, setStressLevel] = useState<string>(STRESS_LEVEL[1]);

  const [cleanser, setCleanser] = useState(true);
  const [toner, setToner] = useState(false);
  const [serum, setSerum] = useState(false);
  const [moisturizer, setMoisturizer] = useState(true);
  const [sunscreen, setSunscreen] = useState(true);

  const [previousTreatments, setPreviousTreatments] = useState("");

  const progressText = useMemo(() => `Step ${step} of 3`, [step]);

  const toggle = (value: string, list: string[], setList: (next: string[]) => void) => {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const onNext = () => {
    if (step === 1 && concerns.length === 0) {
      Alert.alert("Select concerns", "Please select at least one concern.");
      return;
    }
    if (step === 2 && goals.length === 0) {
      Alert.alert("Select goals", "Please select at least one goal.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const onSubmit = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Sign in required", "Please sign in to submit the assessment.");
      return;
    }

    const sleep = sleepHours.trim() ? Number(sleepHours) : null;
    const water = waterIntake.trim() ? Number(waterIntake) : null;

    const analysisResult = computeAnalysis({
      skinType,
      concerns,
      severityLevel,
      lifestyle: { sunExposure, sleepHours: sleep, waterIntake: water, stressLevel },
      skincareRoutine: { cleanser, toner, serum, moisturizer, sunscreen }
    });

    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "skinAssessment"), {
        userId: uid,
        skinType,
        skinTone,
        allergies: allergies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        concerns,
        severityLevel,
        lifestyle: {
          sunExposure,
          sleepHours: sleep,
          waterIntake: water,
          stressLevel
        },
        skincareRoutine: { cleanser, toner, serum, moisturizer, sunscreen },
        previousTreatments: previousTreatments
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        goals,
        analysisResult,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, "skinAssessment", docRef.id), { assessmentId: docRef.id });

      router.replace({ pathname: "/assessment/skin-processing", params: { id: docRef.id } });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => (step === 1 ? router.back() : setStep(step - 1))}>
          <FontAwesome name="chevron-left" size={14} color="#0B1B3A" />
        </Pressable>
        <Text style={styles.headerTitle}>Assessment Form</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Skin Assessment</Text>
        <Text style={styles.heroSubtitle}>Answer a few questions to personalize your care.</Text>
        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{progressText}</Text>
      </View>

      {step === 1 && (
        <>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Basic Info</Text>
            <Dropdown label="Skin Type" value={skinType} options={SKIN_TYPES} onChange={setSkinType} />
            <Dropdown label="Skin Tone" value={skinTone} options={SKIN_TONES} onChange={setSkinTone} />
            <Text style={styles.inputLabel}>Allergies</Text>
            <TextInput
              value={allergies}
              onChangeText={setAllergies}
              placeholder="e.g. Penicillin, Latex"
              style={styles.input}
            />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Concerns</Text>
            <Text style={styles.sectionHint}>Select all that apply</Text>
            <View style={styles.chipRow}>
              {CONCERNS.map((item) => {
                const active = concerns.includes(item);
                return (
                  <Pressable key={item} style={[styles.chip, active && styles.chipActive]} onPress={() => toggle(item, concerns, setConcerns)}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Dropdown label="Severity" value={severityLevel} options={SEVERITY} onChange={setSeverityLevel} />
          </View>
        </>
      )}

      {step === 2 && (
        <>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Goals</Text>
            <Text style={styles.sectionHint}>Select all that apply</Text>
            <View style={styles.chipRow}>
              {GOALS.map((item) => {
                const active = goals.includes(item);
                return (
                  <Pressable key={item} style={[styles.chip, active && styles.chipActive]} onPress={() => toggle(item, goals, setGoals)}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Lifestyle</Text>
            <Dropdown label="Sun exposure" value={sunExposure} options={SUN_EXPOSURE} onChange={setSunExposure} />
            <View style={styles.fieldRow}>
              <View style={styles.fieldCol}>
                <Text style={styles.inputLabel}>Sleep hours</Text>
                <TextInput value={sleepHours} onChangeText={setSleepHours} placeholder="e.g. 7" style={styles.input} />
              </View>
              <View style={styles.fieldCol}>
                <Text style={styles.inputLabel}>Water intake (L)</Text>
                <TextInput value={waterIntake} onChangeText={setWaterIntake} placeholder="e.g. 2" style={styles.input} />
              </View>
            </View>
            <Dropdown label="Stress level" value={stressLevel} options={STRESS_LEVEL} onChange={setStressLevel} />
          </View>
        </>
      )}

      {step === 3 && (
        <>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Skincare Routine</Text>
            <View style={styles.chipRow}>
              {[
                { label: "Cleanser", value: cleanser, setter: setCleanser },
                { label: "Toner", value: toner, setter: setToner },
                { label: "Serum", value: serum, setter: setSerum },
                { label: "Moisturizer", value: moisturizer, setter: setMoisturizer },
                { label: "Sunscreen", value: sunscreen, setter: setSunscreen }
              ].map((item) => (
                <Pressable
                  key={item.label}
                  style={[styles.chip, item.value && styles.chipActive]}
                  onPress={() => item.setter(!item.value)}
                >
                  <Text style={[styles.chipText, item.value && styles.chipTextActive]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Treatment History (Optional)</Text>
            <TextInput
              value={previousTreatments}
              onChangeText={setPreviousTreatments}
              placeholder="e.g. Laser, Peel"
              style={styles.input}
            />
          </View>
        </>
      )}

      <View style={styles.footerRow}>
        <Pressable style={styles.secondaryButton} onPress={() => (step === 1 ? router.back() : setStep(step - 1))}>
          <Text style={styles.secondaryText}>Back</Text>
        </Pressable>
        {step < 3 ? (
          <Pressable style={styles.primaryButton} onPress={onNext}>
            <Text style={styles.primaryText}>Next</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.primaryButton, saving && styles.primaryButtonDisabled]} onPress={onSubmit}>
            <Text style={styles.primaryText}>{saving ? "Saving..." : "See Result"}</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
};

export default SkinFormScreen;

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
  heroCard: { backgroundColor: "#0B2B63", borderRadius: 22, padding: 18 },
  heroTitle: { fontSize: 18, fontWeight: "700", color: "white" },
  heroSubtitle: { marginTop: 6, fontSize: 12, color: "#DCE8FF" },
  progressWrap: { marginTop: 12, height: 6, borderRadius: 999, backgroundColor: "rgba(255, 255, 255, 0.2)" },
  progressBar: { height: 6, borderRadius: 999, backgroundColor: "white" },
  progressText: { marginTop: 6, fontSize: 11, color: "#DCE8FF" },
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
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#0B1B3A" },
  sectionHint: { marginTop: 4, fontSize: 11, color: "#6B7C96" },
  fieldRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  fieldCol: { flex: 1 },
  inputLabel: { fontSize: 11, color: "#6B7C96", marginBottom: 6 },
  chipRow: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#F1F5FF",
    borderWidth: 1,
    borderColor: "#E3ECF9"
  },
  chipActive: { backgroundColor: "#0B2B63", borderColor: "#0B2B63" },
  chipText: { fontSize: 11, fontWeight: "600", color: "#49608F" },
  chipTextActive: { color: "white" },
  input: {
    backgroundColor: "#F7FAFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: "#0B1B3A",
    borderWidth: 1,
    borderColor: "#E3ECF9"
  },
  dropdownWrap: {
    marginTop: 10
  },
  dropdownButton: {
    backgroundColor: "#F7FAFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D6E2F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#0B2B63",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  dropdownValue: {
    fontSize: 12,
    color: "#0B1B3A",
    fontWeight: "600"
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D6E2F5",
    overflow: "hidden",
    shadowColor: "#0B2B63",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7"
  },
  dropdownItemLast: {
    borderBottomWidth: 0
  },
  dropdownItemText: {
    fontSize: 12,
    color: "#0B1B3A",
    fontWeight: "600"
  },
  footerRow: { flexDirection: "row", gap: 10 },
  primaryButton: {
    flex: 1,
    backgroundColor: "#052659",
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: "center"
  },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryText: { color: "white", fontSize: 13, fontWeight: "700" },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#E7F0FF",
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: "center"
  },
  secondaryText: { color: "#0B1B3A", fontSize: 13, fontWeight: "700" }
});
