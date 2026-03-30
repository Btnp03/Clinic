import { useState } from "react";
import { View, Button, StyleSheet, Text } from "react-native";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function Test() {
  const [status, setStatus] = useState("Ready");

  const loadUsers = async () => {
    setStatus("Loading users...");
    const snapshot = await getDocs(collection(db, "users"));

    snapshot.forEach((doc) => {
      console.log(doc.id, doc.data());
    });
    setStatus(`Loaded ${snapshot.size} users`);
  };

  const addTestDoc = async () => {
    setStatus("Writing test document...");
    await addDoc(collection(db, "test"), {
      message: "hello firebase",
      createdAt: serverTimestamp()
    });
    setStatus("Wrote 1 doc to test");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{status}</Text>
      <View style={styles.buttonRow}>
        <Button title="Load Users" onPress={loadUsers} />
      </View>
      <View style={styles.buttonRow}>
        <Button title="Write Test" onPress={addTestDoc} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center"
  },
  status: {
    marginBottom: 16,
    fontSize: 14
  },
  buttonRow: {
    marginVertical: 6
  }
});
