import { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase";

const SkinHistoryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const snapshot = await getDocs(
          query(collection(db, "skinAssessment"), where("userId", "==", uid))
        );
        const data = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        if (isMounted) setItems(data);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={14} color="#0B1B3A" />
        </Pressable>
        <Text style={styles.headerTitle}>Assessment History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.card}>
          <Text style={styles.cardSubtitle}>Loading history...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardSubtitle}>No assessment history yet.</Text>
        </View>
      ) : (
        items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() =>
              router.push({ pathname: "/assessment/skin-result", params: { id: item.id, from: "history" } })
            }
          >
            <Text style={styles.cardTitle}>{item.skinType} - {item.severityLevel}</Text>
            <Text style={styles.cardSubtitle}>Score: {item.analysisResult?.skinScore ?? "-"}</Text>
            <Text style={styles.cardSubtitle}>Primary: {item.analysisResult?.primaryIssue ?? "-"}</Text>
            <View style={styles.badgeRow}>
              {(item.goals || []).slice(0, 3).map((goal: string) => (
                <Text key={goal} style={styles.badge}>{goal}</Text>
              ))}
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
};

export default SkinHistoryScreen;

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
    elevation: 2
  },
  cardTitle: { fontSize: 13, fontWeight: "700", color: "#0B1B3A" },
  cardSubtitle: { marginTop: 4, fontSize: 11, color: "#6B7C96" },
  badgeRow: { marginTop: 10, flexDirection: "row", gap: 8, flexWrap: "wrap" },
  badge: {
    backgroundColor: "#F1F5FF",
    color: "#0B1B3A",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
    fontSize: 11
  }
});
