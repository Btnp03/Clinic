import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, useRouter } from "expo-router";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { loginUser, loginWithGoogle } from "../../services/auth.service";
import { styles } from "./login.styles";

WebBrowser.maybeCompleteAuthSession();

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const redirectUri = makeRedirectUri({ scheme: "my-app" });
  const [googleRequest, , promptGoogle] = Google.useIdTokenAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri
  });

  const mapAuthError = (message: string) => {
    if (!message) return "Something went wrong. Please try again.";
    if (message.includes("auth/invalid-credential")) {
      return "Incorrect email or password.";
    }
    if (message.includes("auth/user-not-found")) {
      return "We couldn't find that account.";
    }
    if (message.includes("auth/wrong-password")) {
      return "Incorrect password.";
    }
    if (message.includes("auth/invalid-email")) {
      return "Please enter a valid email address.";
    }
    if (message.includes("auth/too-many-requests")) {
      return "Too many attempts. Please try again later.";
    }
    if (message.includes("auth/network-request-failed")) {
      return "Network error. Please check your connection.";
    }
    return "Something went wrong. Please try again.";
  };

  const submit = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await loginUser({ email, password });
      router.replace("/(tabs)/home");
    } catch (e: any) {
      setError(mapAuthError(e?.message ?? ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      setError("Google sign-in is not configured.");
      return;
    }
    if (!googleRequest) return;
    setSocialLoading(true);
    setError("");
    try {
      const result = await promptGoogle();
      if (result.type !== "success") return;
      const idToken = result.params?.id_token;
      const accessToken = result.params?.access_token;
      if (!idToken) {
        setError("Google sign-in failed. Please try again.");
        return;
      }
      await loginWithGoogle(idToken, accessToken);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      setError(e?.message ?? "Google sign-in failed.");
    } finally {
      setSocialLoading(false);
    }
  };


  return (
    <>
      <View style={styles.inputWrap}>
        <FontAwesome name="envelope" size={14} color="#7DA0CA" />
        <TextInput
          placeholder="Email address"
          placeholderTextColor="#A8B9D9"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputWrap}>
        <FontAwesome name="lock" size={14} color="#7DA0CA" />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#A8B9D9"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.optionsRow}>
        <Pressable style={styles.checkboxRow} onPress={() => setRemember(!remember)}>
          <View style={[styles.checkbox, remember && styles.checkboxActive]}>
            {remember ? <FontAwesome name="check" size={10} color="white" /> : null}
          </View>
          <Text style={styles.checkboxText}>Remember me</Text>
        </Pressable>
        <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
          Forgot password?
        </Link>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable style={styles.submitButton} onPress={submit} disabled={loading}>
        <Text style={styles.submitText}>{loading ? "Signing in..." : "Sign In"}</Text>
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.socialRow}>
        <Pressable
          style={[styles.socialButton, styles.socialButtonGoogle]}
          onPress={handleGoogle}
          disabled={socialLoading || !googleRequest}
        >
          <FontAwesome name="google" size={14} color="#FFFFFF" />
          <Text style={styles.socialText}>Continue with Google</Text>
        </Pressable>
      </View>

      <View style={styles.registerRow}>
        <Text style={styles.registerText}>New to ABB?</Text>
        <Link href="/register" style={styles.registerLink}>
          Create an account
        </Link>
      </View>
    </>
  );
};

export default LoginForm;

