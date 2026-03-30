import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { Link } from "expo-router";

const HomeScreen = () => {
  const doctorCardStyle = StyleSheet.flatten([styles.card, styles.smallCard]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Smart Aesthetic Clinic</Text>
      <Text style={styles.subtitle}>ยินดีต้อนรับกลับมา</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>นัดหมายถัดไป</Text>
        <Text style={styles.cardText}>ยังไม่มีการนัดหมายในวันนี้</Text>
      </View>

      <View style={styles.cardRow}>
        <Link href="/(tabs)/doctors" asChild>
          <Pressable style={doctorCardStyle}>
            <Text style={styles.cardTitle}>ค้นหาแพทย์</Text>
            <Text style={styles.cardText}>ดูรายชื่อและจองคิว</Text>
          </Pressable>
        </Link>
        <Link href="/assessment/skin-intro" asChild>
          <Pressable style={doctorCardStyle}>
            <Text style={styles.cardTitle}>Skin Assessment</Text>
            <Text style={styles.cardText}>เริ่มแบบประเมินผิว</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.cardRow}>
        <Link href="/recommendation/recommendation-list" asChild>
          <Pressable style={doctorCardStyle}>
            <Text style={styles.cardTitle}>Doctor Recommendation</Text>
            <Text style={styles.cardText}>แผนดูแลผิวเฉพาะคุณ</Text>
          </Pressable>
        </Link>
        <Link href="/assessment/skin-history" asChild>
          <Pressable style={doctorCardStyle}>
            <Text style={styles.cardTitle}>History</Text>
            <Text style={styles.cardText}>ดูผลและการประเมินย้อนหลัง</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF4FF"
  },
  content: {
    padding: 20,
    paddingBottom: 28
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F1E3A"
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 12,
    color: "#6B7C96"
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE7F8",
    marginBottom: 12
  },
  cardRow: {
    flexDirection: "row",
    gap: 12
  },
  smallCard: {
    flex: 1
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F1E3A"
  },
  cardText: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7C96"
  }
});
