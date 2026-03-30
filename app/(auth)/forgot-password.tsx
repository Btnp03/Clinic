import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { resetPassword } from "../../services/auth.service";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const mapError = (error: any) => {
    const code = String(error?.code || error?.message || "");
    if (code.includes("auth/invalid-email")) return "Please enter a valid email address.";
    if (code.includes("auth/user-not-found")) return "We couldn't find that account.";
    if (code.includes("auth/too-many-requests")) return "Too many attempts. Please try again later.";
    if (code.includes("auth/network-request-failed")) return "Network error. Please check your connection.";
    return "Request failed. Please try again.";
  };

  const onSubmit = async () => {
    if (!email.trim()) {
      setMessageType("error");
      setMessage("Please enter your email.");
      return;
    }
    setLoading(true);
    setMessage("");
    setMessageType("");
    try {
      await resetPassword(email.trim());
      setMessageType("success");
      setMessage("Reset link sent. Please check your inbox.");
      Alert.alert("Email sent", "Check your inbox for password reset instructions.");
    } catch (error: any) {
      const text = mapError(error);
      setMessageType("error");
      setMessage(text);
      Alert.alert("Request failed", text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={14} color="#0B1B3A" />
        </Pressable>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>
          Enter the email you used to sign up and we will send a reset link.
        </Text>

        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#9AA8C1"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <Pressable style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={onSubmit}>
          <Text style={styles.primaryText}>{loading ? "Sending..." : "Send Reset Link"}</Text>
        </Pressable>

        {message ? (
          <Text style={[styles.messageText, messageType === "error" && styles.messageError]}>
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF4FF",
    padding: 18
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
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
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DDE7F8",
    shadowColor: "#052659",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7C96",
    lineHeight: 18
  },
  inputLabel: {
    marginTop: 16,
    fontSize: 11,
    color: "#6B7C96"
  },
  input: {
    marginTop: 8,
    backgroundColor: "#F7FAFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: "#0B1B3A",
    borderWidth: 1,
    borderColor: "#E3ECF9"
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: "#052659",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center"
  },
  primaryButtonDisabled: {
    opacity: 0.7
  },
  primaryText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700"
  },
  messageText: {
    marginTop: 12,
    fontSize: 12,
    color: "#1E3A8A"
  },
  messageError: {
    color: "#B42318"
  }
});
