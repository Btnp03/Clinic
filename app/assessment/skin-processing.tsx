import { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

const SkinProcessingScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace({ pathname: "/assessment/skin-result", params: { id } });
    }, 2000);
    return () => clearTimeout(timer);
  }, [id]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#052659" />
      <Text style={styles.title}>Analyzing your skin...</Text>
      <Text style={styles.subtitle}>This usually takes a few seconds</Text>
    </View>
  );
};

export default SkinProcessingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  title: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7C96"
  }
});
