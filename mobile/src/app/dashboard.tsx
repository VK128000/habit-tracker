import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useState } from "react";

import {
  api,
  getToken,
  getUser,
  logout,
} from "@/services/api";

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const savedUser = await getUser();

      setUser(savedUser);

      // Verify JWT against backend
      await api.get("/stats");
    } catch (error) {
      await logout();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text style={styles.loadingText}>
          Loading your dashboard...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>

          <Text style={styles.name}>
            {user?.name || "User"}
          </Text>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          NoFap Tracker Pro
        </Text>

        <Text style={styles.cardSubtitle}>
          Your mobile app is successfully connected to the backend.
        </Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Account</Text>

        <Text style={styles.email}>
          {user?.email || "No email"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712",
    paddingHorizontal: 24,
    paddingTop: 70,
  },

  loading: {
    flex: 1,
    backgroundColor: "#030712",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#9ca3af",
    marginTop: 14,
    fontSize: 15,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greeting: {
    color: "#9ca3af",
    fontSize: 16,
  },

  name: {
    color: "#f9fafb",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 5,
  },

  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#374151",
  },

  logoutText: {
    color: "#f87171",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 24,
    marginTop: 35,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  cardTitle: {
    color: "#f9fafb",
    fontSize: 23,
    fontWeight: "700",
  },

  cardSubtitle: {
    color: "#9ca3af",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },

  statCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  statLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },

  email: {
    color: "#f9fafb",
    fontSize: 17,
    marginTop: 8,
  },
});