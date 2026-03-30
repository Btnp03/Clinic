import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { registerUser, loginWithGoogle } from "../../services/auth.service";
import { styles } from "./register.styles";

WebBrowser.maybeCompleteAuthSession();

const RegisterForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
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

  const submit = async () => {
    if (!email || !password || !firstName || !lastName) {
      setError("Please complete all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await registerUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        role: "patient",
        gender,
        age
      });
      setError("Account created successfully.");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
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
      <View style={styles.row}>
        <View style={styles.inputWrap}>
          <FontAwesome name="user" size={14} color="#7DA0CA" />
          <TextInput
            placeholder="First name"
            placeholderTextColor="#A8B9D9"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        <View style={styles.inputWrap}>
          <FontAwesome name="user" size={14} color="#7DA0CA" />
          <TextInput
            placeholder="Last name"
            placeholderTextColor="#A8B9D9"
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
      </View>

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
        <FontAwesome name="phone" size={14} color="#7DA0CA" />
        <TextInput
          placeholder="Phone number"
          placeholderTextColor="#A8B9D9"
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.inputWrap}>
          <FontAwesome name="venus-mars" size={14} color="#7DA0CA" />
          <TextInput
            placeholder="Gender"
            placeholderTextColor="#A8B9D9"
            style={styles.input}
            value={gender}
            onChangeText={setGender}
          />
        </View>
        <View style={styles.inputWrap}>
          <FontAwesome name="birthday-cake" size={14} color="#7DA0CA" />
          <TextInput
            placeholder="Age"
            placeholderTextColor="#A8B9D9"
            style={styles.input}
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
          />
        </View>
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

      <View style={styles.inputWrap}>
        <FontAwesome name="lock" size={14} color="#7DA0CA" />
        <TextInput
          placeholder="Confirm password"
          placeholderTextColor="#A8B9D9"
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable style={styles.submitButton} onPress={submit} disabled={loading}>
        <Text style={styles.submitText}>{loading ? "Creating..." : "Create Account"}</Text>
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

      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <Link href="/login" style={styles.loginLink}>
          Sign In
        </Link>
      </View>
    </>
  );
};

export default RegisterForm;
