import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "../firebase";

const AuthContext = createContext(null);
const PROFILE_STORAGE_PREFIX = "civicai-profile-";

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function getStoredProfile(uid) {
  try {
    const value = localStorage.getItem(`${PROFILE_STORAGE_PREFIX}${uid}`);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function saveProfile(uid, profile) {
  try {
    localStorage.setItem(`${PROFILE_STORAGE_PREFIX}${uid}`, JSON.stringify(profile));
  } catch {
    // Firebase authentication must still work if browser storage is unavailable.
  }
}

async function createSessionUser(firebaseUser) {
  const localProfile = getStoredProfile(firebaseUser.uid);
  const email = normalizeEmail(firebaseUser.email || "");
  let cloudProfile = {};

  try {
    const profileSnapshot = await getDoc(doc(db, "users", firebaseUser.uid));
    if (profileSnapshot.exists()) {
      cloudProfile = profileSnapshot.data();
    }
  } catch (error) {
    // Authentication should remain usable if Firestore has not been configured.
    // In that case, fail closed to the citizen role; never infer authority from email.
    console.error("Unable to load CivicAI role profile from Firestore:", error?.code || error);
  }

  const storedRole = String(cloudProfile.role || "citizen").trim().toLowerCase();
  const role = storedRole === "authority" || storedRole === "admin" ? "authority" : "citizen";

  return {
    id: firebaseUser.uid,
    fullName: firebaseUser.displayName || cloudProfile.fullName || localProfile.fullName || "",
    email,
    phone: cloudProfile.phone || localProfile.phone || "",
    // Role comes from Firestore. Client-side routes are UI guards, not server authorization.
    role,
    createdAt: firebaseUser.metadata?.creationTime || "",
  };
}

function getErrorMessage(error) {
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";
    case "auth/requires-recent-login":
      return "For security, sign in again and then retry account deletion.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled in Firebase Authentication.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/unauthorized-continue-uri":
    case "auth/invalid-continue-uri":
      return "Firebase password-reset settings need to be checked in the Firebase Console.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Remove legacy prototype credentials (which stored passwords in localStorage).
    // Do not clear grievance records or theme preferences.
    try {
      localStorage.removeItem("civicai-users");
      localStorage.removeItem("civicai-current-user");
    } catch {
      // Ignore unavailable browser storage.
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          setUser(firebaseUser ? await createSessionUser(firebaseUser) : null);
        } catch (error) {
          console.error("Unable to restore CivicAI session:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setUser(null);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const register = async (userData) => {
    const email = normalizeEmail(userData?.email || "");
    const password = userData?.password || "";

    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }

    if (password.length < 6) {
      return { success: false, message: "Password must contain at least 6 characters." };
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const fullName = (userData.fullName || "").trim();
      const phone = (userData.phone || "").trim();

      if (fullName) {
        await updateProfile(credential.user, { displayName: fullName });
      }

      saveProfile(credential.user.uid, { fullName, phone });

      let verificationEmailSent = false;
      try {
        await sendEmailVerification(credential.user);
        verificationEmailSent = true;
      } catch (verificationError) {
        // The Firebase Auth account already exists; do not misreport account creation as failed.
        console.error("Account created, but verification email could not be sent:", verificationError?.code || verificationError);
      }

      let firestoreProfileSaved = true;
      try {
        await setDoc(doc(db, "users", credential.user.uid), {
          uid: credential.user.uid,
          fullName,
          email,
          phone,
          role: "citizen",
          createdAt: serverTimestamp(),
        });
      } catch (profileError) {
        // Auth account creation has already succeeded. Do not falsely report that
        // account creation failed; show a setup warning and keep the user a citizen.
        firestoreProfileSaved = false;
        console.error("Firebase Auth account created, but Firestore profile write failed:", profileError?.code || profileError);
      }

      const sessionUser = await createSessionUser(credential.user);
      setUser(sessionUser);
      return {
        success: true,
        user: sessionUser,
        message: [
          verificationEmailSent
            ? "Account created. A verification email has been sent."
            : "Account created, but Firebase could not send the verification email. Check Authentication email templates and authorized domains.",
          !firestoreProfileSaved
            ? "The Firestore profile could not be saved. Enable Cloud Firestore and publish the supplied security rules."
            : "",
        ].filter(Boolean).join(" "),
      };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const login = async (emailInput, password) => {
    const email = normalizeEmail(emailInput || "");

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const sessionUser = await createSessionUser(credential.user);
      setUser(sessionUser);
      return { success: true, user: sessionUser };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const deleteAccount = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return { success: false, message: "No active account found." };
    }

    const currentSession = await createSessionUser(currentUser);
    if (currentSession.role === "authority") {
      return {
        success: false,
        message: "Authority accounts cannot be deleted from this screen.",
      };
    }

    try {
      const uid = currentUser.uid;
      await deleteUser(currentUser);
      try {
        localStorage.removeItem(`${PROFILE_STORAGE_PREFIX}${uid}`);
      } catch {
        // Account deletion has succeeded; local profile cleanup is best-effort.
      }
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const resetPassword = async (emailInput) => {
    const email = normalizeEmail(emailInput || "");

    if (!email) {
      return { success: false, message: "Please enter your email address." };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: "If an account exists for this email, a password-reset email has been sent. Check your inbox and spam folder.",
      };
    } catch (error) {
      // Do not reveal whether an email address is registered.
      if (error?.code === "auth/user-not-found") {
        return {
          success: true,
          message: "If an account exists for this email, a password-reset email has been sent. Check your inbox and spam folder.",
        };
      }
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const isAuthenticated = Boolean(user);
  const isAuthority = Boolean(user && user.role === "authority");
  const isCitizen = Boolean(user && user.role === "citizen");

  const value = {
    user,
    loading,
    isAuthenticated,
    isAuthority,
    isCitizen,
    register,
    login,
    logout,
    deleteAccount,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
