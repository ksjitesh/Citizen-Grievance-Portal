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
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "../firebase";

const AuthContext = createContext(null);
const AUTHORITY_EMAIL = "ksjitesh17@gmail.com";
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

function createSessionUser(firebaseUser) {
  const profile = getStoredProfile(firebaseUser.uid);
  const email = normalizeEmail(firebaseUser.email || "");

  return {
    id: firebaseUser.uid,
    fullName: firebaseUser.displayName || profile.fullName || "",
    email,
    phone: profile.phone || "",
    // UI routing hint only. This is NOT secure server-side authorization.
    role: email === AUTHORITY_EMAIL ? "authority" : "citizen",
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
      (firebaseUser) => {
        setUser(firebaseUser ? createSessionUser(firebaseUser) : null);
        setLoading(false);
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

    if (email === AUTHORITY_EMAIL) {
      return {
        success: false,
        message: "This email is reserved for the authority account. Please sign in instead.",
      };
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
      const sessionUser = createSessionUser(credential.user);
      setUser(sessionUser);
      return { success: true, user: sessionUser };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const login = async (emailInput, password) => {
    const email = normalizeEmail(emailInput || "");

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const sessionUser = createSessionUser(credential.user);
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

    if (normalizeEmail(currentUser.email || "") === AUTHORITY_EMAIL) {
      return {
        success: false,
        message: "The designated authority account cannot be deleted from this screen.",
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
