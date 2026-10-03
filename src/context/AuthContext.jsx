import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext =
  createContext(null);

const USERS_STORAGE_KEY =
  "civicai-users";

const CURRENT_USER_KEY =
  "civicai-current-user";

const DEMO_AUTHORITY_EMAIL =
  "authority@civicai.gov.in";

const DEMO_AUTHORITY_PASSWORD =
  "Authority@123";

function getStoredUsers() {
  try {
    const storedUsers =
      localStorage.getItem(
        USERS_STORAGE_KEY
      );

    return storedUsers
      ? JSON.parse(storedUsers)
      : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(
    USERS_STORAGE_KEY,
    JSON.stringify(users)
  );
}

function getStoredCurrentUser() {
  try {
    const storedUser =
      localStorage.getItem(
        CURRENT_USER_KEY
      );

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    return null;
  }
}

function createSessionUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || "",
    role: user.role || "citizen",
    createdAt: user.createdAt,
  };
}

/*
 * Create demo authority account
 * automatically if it does not exist.
 */
function ensureDemoAuthority() {
  const users = getStoredUsers();

  const authorityExists =
    users.some(
      (user) =>
        user.email ===
        DEMO_AUTHORITY_EMAIL
    );

  if (authorityExists) {
    return;
  }

  const authorityUser = {
    id: "AUTH-DEMO-001",

    fullName:
      "CivicAI Authority Officer",

    email:
      DEMO_AUTHORITY_EMAIL,

    password:
      DEMO_AUTHORITY_PASSWORD,

    phone:
      "+91 9000000000",

    role: "authority",

    createdAt:
      new Date().toISOString(),
  };

  saveUsers([
    ...users,
    authorityUser,
  ]);
}

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(
      getStoredCurrentUser
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    /*
     * Make sure the demo authority
     * account exists before authentication
     * is evaluated.
     */
    ensureDemoAuthority();

    const storedUser =
      getStoredCurrentUser();

    setUser(storedUser);
    setLoading(false);
  }, []);

  /*
   * ----------------------------------------
   * REGISTER CITIZEN
   * ----------------------------------------
   */

  const register = (
    userData
  ) => {
    const users =
      getStoredUsers();

    const normalizedEmail =
      userData.email
        .trim()
        .toLowerCase();

    const existingUser =
      users.find(
        (existingUser) =>
          existingUser.email ===
          normalizedEmail
      );

    if (existingUser) {
      return {
        success: false,
        message:
          "An account with this email already exists.",
      };
    }

    const newUser = {
      ...userData,

      id:
        userData.id ||
        `USR-${Date.now()}`,

      email:
        normalizedEmail,

      /*
       * Public registration can
       * only create citizen accounts.
       */
      role: "citizen",

      createdAt:
        userData.createdAt ||
        new Date().toISOString(),
    };

    const updatedUsers = [
      ...users,
      newUser,
    ];

    saveUsers(updatedUsers);

    const sessionUser =
      createSessionUser(
        newUser
      );

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(
        sessionUser
      )
    );

    setUser(sessionUser);

    return {
      success: true,
      user: sessionUser,
    };
  };

  /*
   * ----------------------------------------
   * LOGIN
   * ----------------------------------------
   */

  const login = (
    email,
    password
  ) => {
    /*
     * Make sure demo authority
     * exists even if login is called
     * before the initial effect finishes.
     */
    ensureDemoAuthority();

    const users =
      getStoredUsers();

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const existingUser =
      users.find(
        (storedUser) =>
          storedUser.email ===
          normalizedEmail
      );

    if (!existingUser) {
      return {
        success: false,
        message:
          "No account was found with this email address.",
      };
    }

    if (
      existingUser.password !==
      password
    ) {
      return {
        success: false,
        message:
          "Incorrect password. Please try again.",
      };
    }

    const sessionUser =
      createSessionUser(
        existingUser
      );

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(
        sessionUser
      )
    );

    setUser(sessionUser);

    return {
      success: true,
      user: sessionUser,
    };
  };

  /*
   * ----------------------------------------
   * LOGOUT
   * ----------------------------------------
   */

  const logout = () => {
    localStorage.removeItem(
      CURRENT_USER_KEY
    );

    setUser(null);
  };

  /*
   * ----------------------------------------
   * DELETE ACCOUNT
   * ----------------------------------------
   */

  const deleteAccount = () => {
    if (!user) {
      return {
        success: false,
        message:
          "No active account found.",
      };
    }

    /*
     * Prevent deleting the demo
     * authority account accidentally.
     */
    if (
      user.role ===
        "authority" &&
      user.email ===
        DEMO_AUTHORITY_EMAIL
    ) {
      return {
        success: false,
        message:
          "The demo authority account cannot be deleted.",
      };
    }

    const users =
      getStoredUsers();

    const updatedUsers =
      users.filter(
        (storedUser) =>
          storedUser.id !==
          user.id
      );

    saveUsers(updatedUsers);

    localStorage.removeItem(
      CURRENT_USER_KEY
    );

    setUser(null);

    return {
      success: true,
    };
  };

  /*
   * ----------------------------------------
   * RESET PASSWORD
   * ----------------------------------------
   */

  const resetPassword = (
    email,
    newPassword
  ) => {
    const users =
      getStoredUsers();

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const userIndex =
      users.findIndex(
        (storedUser) =>
          storedUser.email ===
          normalizedEmail
      );

    if (userIndex === -1) {
      return {
        success: false,
        message:
          "No account was found with this email address.",
      };
    }

    if (
      newPassword.length < 6
    ) {
      return {
        success: false,
        message:
          "Password must contain at least 6 characters.",
      };
    }

    /*
     * Protect demo authority
     * credentials in this prototype.
     */
    if (
      normalizedEmail ===
      DEMO_AUTHORITY_EMAIL
    ) {
      return {
        success: false,
        message:
          "The demo authority password is managed by the prototype.",
      };
    }

    const updatedUsers = [
      ...users,
    ];

    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      password: newPassword,
    };

    saveUsers(updatedUsers);

    return {
      success: true,
      message:
        "Password updated successfully.",
    };
  };

  /*
   * ----------------------------------------
   * ROLE HELPERS
   * ----------------------------------------
   */

  const isAuthenticated =
    Boolean(user);

  const isAuthority =
    Boolean(
      user &&
        user.role ===
          "authority"
    );

  const isCitizen =
    Boolean(
      user &&
        user.role ===
          "citizen"
    );

  /*
   * ----------------------------------------
   * CONTEXT VALUE
   * ----------------------------------------
   */

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

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}