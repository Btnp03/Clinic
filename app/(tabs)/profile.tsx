import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, StyleSheet, TextInput, Pressable, Image, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [allergy, setAllergy] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const uid = auth.currentUser?.uid;

  const initials = useMemo(() => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (!parts.length) return "U";
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
    return `${first}${last}`.toUpperCase();
  }, [name]);

  const completeness = useMemo(() => {
    const fields = [name, email, phone, gender, age, allergy, photoUrl];
    const filled = fields.filter((value) => value && value.trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [name, email, phone, gender, age, allergy, photoUrl]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!uid) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          const fallback = {
            name: auth.currentUser?.displayName || auth.currentUser?.email || "",
            email: auth.currentUser?.email || "",
            phone: auth.currentUser?.phoneNumber || "",
            role: "patient",
            gender: "",
            age: null,
            photoUrl: auth.currentUser?.photoURL || "",
            allergy: [] as string[]
          };
          await setDoc(ref, fallback, { merge: true });
          if (!isMounted) return;
          setName(fallback.name || "");
          setEmail(fallback.email || "");
          setPhone(fallback.phone || "");
          setGender("");
          setAge("");
          setAllergy("");
          setPhotoUrl(fallback.photoUrl || "");
          return;
        }
        const data = snap.data();
        if (!isMounted) return;
        setName((data.name as string) || "");
        setEmail((data.email as string) || auth.currentUser?.email || "");
        setPhone((data.phone as string) || "");
        setGender((data.gender as string) || "");
        setAge(data.age !== null && data.age !== undefined ? String(data.age) : "");
        setPhotoUrl((data.photoUrl as string) || "");
        if (Array.isArray(data.allergy)) {
          setAllergy(data.allergy.filter(Boolean).join(", "));
        } else {
          setAllergy("");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [uid]);

  const onSave = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      const ref = doc(db, "users", uid);
      const ageNumber = age.trim() ? Number(age.trim()) : null;
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        gender: gender.trim(),
        age: Number.isNaN(ageNumber as number) ? null : ageNumber,
        photoUrl: photoUrl.trim(),
        allergy: allergy
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      };
      await updateDoc(ref, payload);
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await auth.signOut();
          router.replace("/(auth)/login");
        }
      }
    ]);
  };

  if (!uid) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>Sign in required</Text>
        <Text style={styles.emptyText}>Please sign in to view and edit your profile.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.primaryText}>Go to Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerGlow} />
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Keep your health details up to date</Text>
          </View>
          <View style={styles.scorePill}>
            <FontAwesome name="sparkles" size={12} color="#0B1B3A" />
            <Text style={styles.scoreText}>{completeness}%</Text>
          </View>
        </View>

        <View style={styles.heroRow}>
          <View style={styles.avatarWrap}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.avatarBadge}>
              <FontAwesome name="camera" size={12} color="#0B1B3A" />
            </View>
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{name || "Your name"}</Text>
            <Text style={styles.heroEmail}>{email || "email@example.com"}</Text>
            <View style={styles.progressWrap}>
              <View style={[styles.progressBar, { width: `${completeness}%` }]} />
            </View>
            <Text style={styles.progressText}>Profile strength</Text>
          </View>
        </View>

        <View style={styles.photoRow}>
          <Text style={styles.inputLabel}>Photo URL</Text>
          <TextInput
            value={photoUrl}
            onChangeText={setPhotoUrl}
            placeholder="https://..."
            placeholderTextColor="#9AA8C1"
            style={styles.input}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Personal Info</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.inputLabel}>Full name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Your name" style={styles.input} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput value={email} editable={false} style={[styles.input, styles.inputDisabled]} />
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldCol}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput value={phone} onChangeText={setPhone} placeholder="Phone" style={styles.input} />
          </View>
          <View style={styles.fieldCol}>
            <Text style={styles.inputLabel}>Gender</Text>
            <TextInput value={gender} onChangeText={setGender} placeholder="Gender" style={styles.input} />
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldCol}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="Age"
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
          <View style={styles.fieldCol}>
            <Text style={styles.inputLabel}>Allergies</Text>
            <TextInput
              value={allergy}
              onChangeText={setAllergy}
              placeholder="e.g. Penicillin, Latex"
              style={styles.input}
            />
          </View>
        </View>
      </View>

      <View style={styles.insightRow}>
        <View style={styles.insightCard}>
          <FontAwesome name="heartbeat" size={16} color="#0B1B3A" />
          <Text style={styles.insightLabel}>Health Snapshot</Text>
          <Text style={styles.insightValue}>{allergy ? "Allergies noted" : "No allergies"}</Text>
        </View>
        <View style={styles.insightCard}>
          <FontAwesome name="clock-o" size={16} color="#0B1B3A" />
          <Text style={styles.insightLabel}>Updated</Text>
          <Text style={styles.insightValue}>{loading ? "Checking..." : "Just now"}</Text>
        </View>
      </View>

      <Pressable style={[styles.primaryButton, saving && styles.primaryButtonDisabled]} onPress={onSave}>
        <Text style={styles.primaryText}>{saving ? "Saving..." : "Save Changes"}</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>

      {loading ? <Text style={styles.loadingText}>Loading profile...</Text> : null}
    </ScrollView>
  );
};

export default ProfileScreen;

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
  headerCard: {
    backgroundColor: "#0B2B63",
    borderRadius: 24,
    padding: 18,
    overflow: "hidden"
  },
  headerGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(84, 131, 179, 0.4)",
    top: -90,
    right: -60
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white"
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#DCE8FF"
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.85)"
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  heroRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: "#0B1B3A",
    fontSize: 22,
    fontWeight: "700"
  },
  avatarBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  },
  heroInfo: {
    flex: 1
  },
  heroName: {
    fontSize: 16,
    fontWeight: "700",
    color: "white"
  },
  heroEmail: {
    marginTop: 4,
    fontSize: 12,
    color: "#DCE8FF"
  },
  progressWrap: {
    marginTop: 10,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden"
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#FFFFFF"
  },
  progressText: {
    marginTop: 6,
    fontSize: 11,
    color: "#DCE8FF"
  },
  photoRow: {
    marginTop: 14,
    gap: 6
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
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
    color: "#0B1B3A",
    marginBottom: 10
  },
  fieldGroup: {
    marginBottom: 12
  },
  fieldRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12
  },
  fieldCol: {
    flex: 1
  },
  inputLabel: {
    fontSize: 11,
    color: "#6B7C96",
    marginBottom: 6
  },
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
  inputDisabled: {
    color: "#94A3B8"
  },
  insightRow: {
    flexDirection: "row",
    gap: 10
  },
  insightCard: {
    flex: 1,
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
  insightLabel: {
    marginTop: 8,
    fontSize: 11,
    color: "#6B7C96"
  },
  insightValue: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  primaryButton: {
    backgroundColor: "#052659",
    paddingVertical: 12,
    borderRadius: 18,
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
  logoutButton: {
    backgroundColor: "#FBE9EA",
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F7C7CC"
  },
  logoutText: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "700"
  },
  loadingText: {
    textAlign: "center",
    fontSize: 12,
    color: "#6B7C96"
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#EEF4FF",
    gap: 10
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B1B3A"
  },
  emptyText: {
    fontSize: 12,
    color: "#6B7C96",
    textAlign: "center"
  }
});
