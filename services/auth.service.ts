import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  FacebookAuthProvider,
  User,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { LoginInput, PatientUser, RegisterInput } from "../types/user";

const ensureUserProfile = async (user: User) => {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const baseData: PatientUser = {
    name: user.displayName || user.email || "ABB User",
    email: user.email || "",
    phone: user.phoneNumber || "",
    role: "patient",
    gender: "",
    age: null,
    photoUrl: user.photoURL || "",
    createdAt: serverTimestamp(),
    allergy: []
  };

  await setDoc(ref, baseData);
};

export const registerUser = async (data: RegisterInput) => {
  const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);

  const uid = cred.user.uid;

  const baseData: PatientUser = {
    name: `${data.firstName} ${data.lastName}`,
    email: data.email,
    phone: data.phone,
    role: "patient",
    gender: data.gender || "",
    age: data.age ? Number(data.age) : null,
    photoUrl: "",
    createdAt: serverTimestamp(),
    allergy: []
  };

  await setDoc(doc(db, "users", uid), baseData);
};

export const loginUser = async (data: LoginInput) => {
  await signInWithEmailAndPassword(auth, data.email, data.password);
};

export const loginWithGoogle = async (idToken: string, accessToken?: string) => {
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const result = await signInWithCredential(auth, credential);
  await ensureUserProfile(result.user);
};

export const loginWithFacebook = async (accessToken: string) => {
  const credential = FacebookAuthProvider.credential(accessToken);
  const result = await signInWithCredential(auth, credential);
  await ensureUserProfile(result.user);
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};
