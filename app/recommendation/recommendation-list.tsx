import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Image } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase";

const ISSUE_TO_TYPES: Record<string, string[]> = {
  acne: ["dermatologist", "aesthetic_doctor"],
  pigmentation: ["laser_specialist", "dermatologist"],
  aging: ["anti_aging_doctor", "aesthetic_doctor"],
  sensitivity: ["dermatologist"],
  dehydration: ["skin_therapist"],
  oiliness: ["dermatologist"]
};

const ISSUE_REASONS: Record<string, string[]> = {
  acne: ["Acne care", "Skin inflammation"],
  pigmentation: ["Pigmentation control", "Even tone"],
  aging: ["Anti-aging plan", "Firmness & wrinkles"],
  sensitivity: ["Sensitive skin", "Barrier recovery"],
  dehydration: ["Hydration recovery", "Barrier support"],
  oiliness: ["Oil control", "Pores care"]
};

const PRIORITY_MAP: Record<string, number> = {
  dermatologist: 1,
  laser_specialist: 2,
  aesthetic_doctor: 3,
  anti_aging_doctor: 4,
  skin_therapist: 5
};

type DoctorRecord = {
  id: string;
  name?: string;
  doctorType?: string; // doc id in doctorType collection
  experience?: number;
  rating?: number;
  photoUrl?: string;
};

type DoctorTypeMap = {
  keyToId: Record<string, string>;
  idToName: Record<string, string>;
  keyToName: Record<string, string>;
};

const RecommendationList = () => {
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [typeMap, setTypeMap] = useState<DoctorTypeMap>({ keyToId: {}, idToName: {}, keyToName: {} });

  const primaryIssue = assessment?.analysisResult?.primaryIssue as string | undefined;
  const secondaryIssue = assessment?.analysisResult?.secondaryIssue as string | undefined;

  const recommendedKeys = useMemo(() => {
    const list: string[] = [];
    if (primaryIssue && ISSUE_TO_TYPES[primaryIssue]) list.push(...ISSUE_TO_TYPES[primaryIssue]);
    if (secondaryIssue && ISSUE_TO_TYPES[secondaryIssue]) list.push(...ISSUE_TO_TYPES[secondaryIssue]);
    const unique = Array.from(new Set(list));
    unique.sort((a, b) => (PRIORITY_MAP[a] ?? 999) - (PRIORITY_MAP[b] ?? 999));
    return unique.slice(0, 3);
  }, [primaryIssue, secondaryIssue]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const assessSnap = await getDocs(
          query(collection(db, "skinAssessment"), where("userId", "==", uid))
        );
        const latest = assessSnap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as any))
          .sort((a, b) => {
            const aTime = a.createdAt?.seconds ? a.createdAt.seconds : 0;
            const bTime = b.createdAt?.seconds ? b.createdAt.seconds : 0;
            return bTime - aTime;
          })[0];
        if (isMounted) setAssessment(latest || null);

        const typeSnap = await getDocs(collection(db, "doctorType"));
        const keyToId: Record<string, string> = {};
        const idToName: Record<string, string> = {};
        const keyToName: Record<string, string> = {};
        typeSnap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const key = typeof data.key === "string" ? data.key.trim() : "";
          const name = typeof data.name === "string" ? data.name.trim() : "";
          if (key) keyToId[key] = docSnap.id;
          if (docSnap.id) idToName[docSnap.id] = name || key || docSnap.id;
          if (key) keyToName[key] = name || key;
        });
        if (isMounted) setTypeMap({ keyToId, idToName, keyToName });

        const computedKeys: string[] = [];
        const primary = latest?.analysisResult?.primaryIssue as string | undefined;
        const secondary = latest?.analysisResult?.secondaryIssue as string | undefined;
        if (primary && ISSUE_TO_TYPES[primary]) computedKeys.push(...ISSUE_TO_TYPES[primary]);
        if (secondary && ISSUE_TO_TYPES[secondary]) computedKeys.push(...ISSUE_TO_TYPES[secondary]);
        const uniqueKeys = Array.from(new Set(computedKeys));
        uniqueKeys.sort((a, b) => (PRIORITY_MAP[a] ?? 999) - (PRIORITY_MAP[b] ?? 999));
        const typeIds = uniqueKeys.slice(0, 3).map((key) => keyToId[key]).filter(Boolean);

        const doctorsSnap = await getDocs(
          query(collection(db, "users"), where("role", "==", "doctor"))
        );
        const data = doctorsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as DoctorRecord));
        const filtered = typeIds.length
          ? data.filter((doc) => doc.doctorType && typeIds.includes(doc.doctorType))
          : data;
        const sorted = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        if (isMounted) setDoctors(sorted);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const insightText = useMemo(() => {
    if (!primaryIssue) return "Complete a skin assessment to receive doctor suggestions.";
    const primary = ISSUE_TO_TYPES[primaryIssue]?.[0] || "specialist";
    const primaryName = typeMap.keyToName[primary] || primary;
    if (!secondaryIssue) return `Based on your assessment, we recommend ${primaryName} specialists.`;
    const secondary = ISSUE_TO_TYPES[secondaryIssue]?.[0];
    const secondaryName = secondary ? typeMap.keyToName[secondary] || secondary : null;
    return secondaryName && secondaryName !== primaryName
      ? `Based on your assessment, we recommend ${primaryName} and ${secondaryName} specialists.`
      : `Based on your assessment, we recommend ${primaryName} specialists.`;
  }, [primaryIssue, secondaryIssue, typeMap.keyToName]);

  if (loading) {
    return (
      <View style={styles.stateWrap}>
        <Text style={styles.stateText}>Loading recommendations...</Text>
      </View>
    );
  }

  if (!assessment) {
    return (
      <View style={styles.stateWrap}>
        <Text style={styles.stateText}>No assessment found.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push("/assessment/skin-intro")}>
          <Text style={styles.primaryText}>Start Assessment</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={14} color="#0B1B3A" />
        </Pressable>
        <Text style={styles.headerTitle}>Doctor Recommendation</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Your Skin Summary</Text>
        <Text style={styles.heroSubtitle}>Skin Score {assessment?.analysisResult?.skinScore ?? "-"}</Text>
        <Text style={styles.heroMeta}>Primary: {primaryIssue || "-"}</Text>
        <Text style={styles.heroMeta}>Secondary: {secondaryIssue || "-"}</Text>
        <Text style={styles.heroInsight}>{insightText}</Text>
      </View>

      <Text style={styles.sectionTitle}>Recommended Doctors</Text>

      {doctors.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No matching doctors found.</Text>
        </View>
      ) : (
        doctors.map((doctor) => {
          const typeId = doctor.doctorType || "";
          const typeLabel = typeMap.idToName[typeId] || "Medical Specialist";
          const reasons = primaryIssue ? ISSUE_REASONS[primaryIssue] || [] : [];
          return (
            <Pressable
              key={doctor.id}
              style={styles.card}
              onPress={() => router.push(`/doctor/${doctor.id}`)}
            >
              <Image
                source={{
                  uri:
                    doctor.photoUrl ||
                    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80"
                }}
                style={styles.avatar}
              />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{doctor.name || "Doctor"}</Text>
                <Text style={styles.cardSubtitle}>{typeLabel}</Text>
                <View style={styles.reasonRow}>
                  {reasons.slice(0, 2).map((reason) => (
                    <Text key={reason} style={styles.reasonBadge}>{reason}</Text>
                  ))}
                </View>
              </View>
              <FontAwesome name="chevron-right" size={12} color="#9AA8C1" />
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
};

export default RecommendationList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF4FF" },
  content: { padding: 18, paddingBottom: 32, gap: 12 },
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
  heroCard: {
    backgroundColor: "#0B2B63",
    borderRadius: 22,
    padding: 18
  },
  heroTitle: { fontSize: 16, fontWeight: "700", color: "white" },
  heroSubtitle: { marginTop: 6, fontSize: 12, color: "#DCE8FF" },
  heroMeta: { marginTop: 4, fontSize: 12, color: "#DCE8FF" },
  heroInsight: { marginTop: 10, fontSize: 12, color: "#E7F0FF" },
  sectionTitle: { marginTop: 6, fontSize: 13, fontWeight: "700", color: "#0B1B3A" },
  emptyCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE7F8"
  },
  emptyText: { fontSize: 12, color: "#6B7C96" },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DDE7F8",
    shadowColor: "#052659",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#F1F5FF" },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 13, fontWeight: "700", color: "#0B1B3A" },
  cardSubtitle: { marginTop: 4, fontSize: 11, color: "#6B7C96" },
  reasonRow: { marginTop: 8, flexDirection: "row", gap: 6, flexWrap: "wrap" },
  reasonBadge: {
    backgroundColor: "#F1F5FF",
    color: "#0B1B3A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 10,
    overflow: "hidden"
  },
  stateWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF4FF",
    padding: 24,
    gap: 10
  },
  stateText: { fontSize: 12, color: "#6B7C96" },
  primaryButton: {
    backgroundColor: "#052659",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16
  },
  primaryText: { color: "white", fontSize: 12, fontWeight: "700" }
});
