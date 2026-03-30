import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const RECOMMENDATION_MAP: Record<string, { treatments: string[]; skincare: string[] }> = {
  acne: {
    treatments: ["Acne Facial", "Acne Laser"],
    skincare: ["Salicylic Cleanser", "Niacinamide Serum"]
  },
  aging: {
    treatments: ["Botox", "HIFU"],
    skincare: ["Retinol", "Vitamin C"]
  },
  pigmentation: {
    treatments: ["Laser Toning", "Chemical Peel"],
    skincare: ["Vitamin C", "Sunscreen"]
  },
  sensitivity: {
    treatments: ["Soothing Mask", "LED Therapy"],
    skincare: ["Barrier Cream", "Centella Serum"]
  },
  dehydration: {
    treatments: ["Hydra Facial", "Moisture Infusion"],
    skincare: ["Hyaluronic Serum", "Ceramide Moisturizer"]
  },
  oiliness: {
    treatments: ["Oil Control Facial", "Clay Detox"],
    skincare: ["Gel Cleanser", "BHA Toner"]
  }
};

const SkinResultScreen = () => {
  const { id, from } = useLocalSearchParams<{ id?: string; from?: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [markedComplete, setMarkedComplete] = useState(false);
  const isHistoryView = from === "history";

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!id) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const ref = doc(db, "skinAssessment", id);
        const snap = await getDoc(ref);
        if (snap.exists() && isMounted) {
          setData(snap.data());
          if (!isHistoryView && !markedComplete) {
            await updateDoc(ref, { status: "completed", completedAt: serverTimestamp() });
            if (isMounted) setMarkedComplete(true);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [id, markedComplete, isHistoryView]);

  const analysis = useMemo(() => {
    if (!data?.analysisResult) {
      return {
        skinScore: "-",
        primaryIssue: "acne",
        secondaryIssue: "pigmentation",
        insights: [] as string[]
      };
    }
    return data.analysisResult;
  }, [data]);

  const recommendations = useMemo(() => {
    const primary = RECOMMENDATION_MAP[analysis.primaryIssue] || RECOMMENDATION_MAP.acne;
    const secondary = RECOMMENDATION_MAP[analysis.secondaryIssue] || RECOMMENDATION_MAP.pigmentation;
    return {
      treatments: Array.from(new Set([...primary.treatments, ...secondary.treatments])).slice(0, 4),
      skincare: Array.from(new Set([...primary.skincare, ...secondary.skincare])).slice(0, 4)
    };
  }, [analysis.primaryIssue, analysis.secondaryIssue]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={14} color="#0B1B3A" />
        </Pressable>
        <Text style={styles.headerTitle}>{isHistoryView ? "Assessment History" : "Assessment Result"}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>Fake AI Analysis</Text>
        <Text style={styles.resultSubtitle}>{loading ? "Analyzing..." : `Skin Score ${analysis.skinScore}`}</Text>
        <Text style={styles.resultMeta}>Primary: {analysis.primaryIssue}</Text>
        <Text style={styles.resultMeta}>Secondary: {analysis.secondaryIssue}</Text>
      </View>

      <View style={styles.planCard}>
        <Text style={styles.sectionTitle}>Insights</Text>
        {analysis.insights?.length ? (
          analysis.insights.map((item: string) => (
            <Text key={item} style={styles.planText}>- {item}</Text>
          ))
        ) : (
          <Text style={styles.planText}>No additional insights</Text>
        )}
      </View>

      <View style={styles.planCard}>
        <Text style={styles.sectionTitle}>Recommended Treatments</Text>
        {recommendations.treatments.map((item) => (
          <Text key={item} style={styles.planText}>- {item}</Text>
        ))}
      </View>

      <View style={styles.planCard}>
        <Text style={styles.sectionTitle}>Recommended Skincare</Text>
        {recommendations.skincare.map((item) => (
          <Text key={item} style={styles.planText}>- {item}</Text>
        ))}
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => {
          if (isHistoryView) {
            router.back();
            return;
          }
          router.push("/assessment/skin-history");
        }}
      >
        <Text style={styles.primaryText}>{isHistoryView ? "Back to History" : "View History"}</Text>
      </Pressable>
    </ScrollView>
  );
};

export default SkinResultScreen;

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
  resultCard: {
    backgroundColor: "#0B2B63",
    borderRadius: 22,
    padding: 18
  },
  resultTitle: { fontSize: 16, fontWeight: "700", color: "white" },
  resultSubtitle: { marginTop: 6, fontSize: 12, color: "#DCE8FF" },
  resultMeta: { marginTop: 6, fontSize: 12, color: "#DCE8FF" },
  planCard: {
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
  planText: { marginTop: 6, fontSize: 12, color: "#6B7C96" },
  primaryButton: {
    marginTop: 6,
    backgroundColor: "#052659",
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: "center"
  },
  primaryText: { color: "white", fontSize: 13, fontWeight: "700" }
});
