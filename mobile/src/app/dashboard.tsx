import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";

import { api, getToken, getUser, logout } from "@/services/api";

type User = {
  id?: string;
  name?: string;
  email?: string;
};

type Stats = {
  totalRelapses: number;
  streak: number;
  baseDate: string;
  lastRelapseDate: string;
  streakResetDate: string;
  actressCount: Record<string, number>;
  monthlyCount: Record<string, number>;
  cleanDays: string[];
};

type Relapse = {
  _id: string;
  date: string;
  actress: string;
  note?: string;
};

type CleanDay = {
  _id: string;
  date: string;
};

type Activity = {
  id: string;
  date: string;
  type: "relapse" | "clean";
  actress?: string;
};

export default function DashboardScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const savedUser = await getUser();
      setUser(savedUser);

      const [statsResponse, relapseResponse, cleanResponse] =
        await Promise.all([
          api.get("/stats"),
          api.get("/relapse"),
          api.get("/clean"),
        ]);

      const statsData: Stats = statsResponse.data;
      const relapses: Relapse[] = relapseResponse.data;
      const cleanDays: CleanDay[] = cleanResponse.data;

      setStats(statsData);

      const relapseActivities: Activity[] = relapses.map((item) => ({
        id: `relapse-${item._id}`,
        date: item.date,
        type: "relapse",
        actress: item.actress,
      }));

      const cleanActivities: Activity[] = cleanDays.map((item) => ({
        id: `clean-${item._id}`,
        date: item.date,
        type: "clean",
      }));

      const merged = [...relapseActivities, ...cleanActivities]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 8);

      setActivities(merged);
    } catch (err: any) {
      console.log("Dashboard error:", err);

      if (err?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }

      setError(
        err?.response?.data?.msg ||
          "Unable to load your dashboard. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadDashboard();
  }

  async function handleResetStreak() {
    Alert.alert(
      "Reset streak?",
      "This will set today as your new streak starting point.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              setResetting(true);

              const today = new Date().toISOString().slice(0, 10);

              await api.post("/auth/reset-streak", {
                date: today,
              });

              await loadDashboard();

              Alert.alert(
                "Streak reset",
                "Your streak has been reset successfully."
              );
            } catch (err: any) {
              Alert.alert(
                "Unable to reset",
                err?.response?.data?.msg ||
                  "Something went wrong. Please try again."
              );
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  }

  function handleAddRelapse() {
    router.push("/add-relapse");
  }

  function handleCalendar() {
    router.push("/calendar");
  }

  function handleStats() {
    router.push("/stats");
  }

  function handleHeatmap() {
    router.push("/heatmap");
  }

  async function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
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
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#60a5fa"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
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

        {/* Error */}
        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              Something went wrong
            </Text>

            <Text style={styles.errorText}>{error}</Text>

            <Pressable
              style={styles.retryButton}
              onPress={loadDashboard}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Main streak card */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>

          <Text style={styles.streakNumber}>
            {stats?.streak ?? 0}
          </Text>

          <Text style={styles.streakLabel}>
            CURRENT STREAK
          </Text>

          <Text style={styles.streakSubtext}>
            Keep going. Stay consistent.
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsRow}>
          <View style={styles.smallCard}>
            <Text style={styles.smallCardIcon}>🟢</Text>

            <Text style={styles.statNumber}>
              {stats?.cleanDays?.length ?? 0}
            </Text>

            <Text style={styles.statLabel}>
              Clean Days
            </Text>
          </View>

          <View style={styles.smallCard}>
            <Text style={styles.smallCardIcon}>🔴</Text>

            <Text style={styles.statNumber}>
              {stats?.totalRelapses ?? 0}
            </Text>

            <Text style={styles.statLabel}>
              Relapses
            </Text>
          </View>
        </View>

        {/* Last relapse */}
        <View style={styles.infoCard}>
          <View>
            <Text style={styles.infoLabel}>
              LAST RELAPSE
            </Text>

            <Text style={styles.infoValue}>
              {stats?.lastRelapseDate
                ? formatDate(stats.lastRelapseDate)
                : "No relapses recorded"}
            </Text>
          </View>

          <Text style={styles.infoIcon}>📅</Text>
        </View>

        {/* Reset streak */}
        <Pressable
          style={[
            styles.resetButton,
            resetting && styles.disabledButton,
          ]}
          onPress={handleResetStreak}
          disabled={resetting}
        >
          {resetting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={styles.resetIcon}>🔄</Text>

              <Text style={styles.resetText}>
                Reset Streak
              </Text>
            </>
          )}
        </Pressable>

        {/* Add relapse */}
        <Pressable
          style={styles.addRelapseButton}
          onPress={handleAddRelapse}
        >
          <Text style={styles.addRelapseIcon}>🔴</Text>

          <Text style={styles.addRelapseText}>
            Add Relapse
          </Text>
        </Pressable>

        {/* Calendar */}
        <Pressable
          style={styles.calendarButton}
          onPress={handleCalendar}
        >
          <Text style={styles.calendarIcon}>📅</Text>

          <Text style={styles.calendarText}>
            Calendar
          </Text>
        </Pressable>

        {/* Statistics */}
        <Pressable
          style={styles.statsButton}
          onPress={handleStats}
        >
          <Text style={styles.statsButtonIcon}>📊</Text>

          <Text style={styles.statsButtonText}>
            Statistics
          </Text>
        </Pressable>

        {/* 365-Day Heatmap */}
        <Pressable
          style={styles.heatmapButton}
          onPress={handleHeatmap}
        >
          <Text style={styles.heatmapButtonIcon}>🟩</Text>

          <Text style={styles.heatmapButtonText}>
            365-Day Heatmap
          </Text>
        </Pressable>

        {/* Recent activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recent Activity
          </Text>

          <Text style={styles.sectionSubtitle}>
            Latest updates
          </Text>
        </View>

        <View style={styles.activityCard}>
          {activities.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyEmoji}>🌱</Text>

              <Text style={styles.emptyTitle}>
                No activity yet
              </Text>

              <Text style={styles.emptyText}>
                Your clean days and relapses will appear here.
              </Text>
            </View>
          ) : (
            activities.map((activity, index) => (
              <View
                key={activity.id}
                style={[
                  styles.activityRow,
                  index !== activities.length - 1 &&
                    styles.activityBorder,
                ]}
              >
                <View
                  style={[
                    styles.activityIcon,
                    activity.type === "relapse"
                      ? styles.relapseIcon
                      : styles.cleanIcon,
                  ]}
                >
                  <Text>
                    {activity.type === "relapse"
                      ? "🔴"
                      : "🟢"}
                  </Text>
                </View>

                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {activity.type === "relapse"
                      ? "Relapse"
                      : "Clean Day"}
                  </Text>

                  {activity.type === "relapse" &&
                  activity.actress ? (
                    <Text style={styles.activityDetail}>
                      {activity.actress}
                    </Text>
                  ) : null}
                </View>

                <Text style={styles.activityDate}>
                  {formatShortDate(activity.date)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Account */}
        <View style={styles.accountCard}>
          <Text style={styles.accountTitle}>
            Account
          </Text>

          <Text style={styles.accountEmail}>
            {user?.email || "No email"}
          </Text>
        </View>

        <Text style={styles.footer}>
          NoFap Tracker Pro
        </Text>
      </ScrollView>
    </View>
  );
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
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

  headerText: {
    flex: 1,
  },

  greeting: {
    color: "#9ca3af",
    fontSize: 15,
  },

  name: {
    color: "#f9fafb",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 4,
  },

  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#374151",
  },

  logoutText: {
    color: "#f87171",
    fontWeight: "600",
    fontSize: 14,
  },

  errorCard: {
    backgroundColor: "#2a1115",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#7f1d1d",
  },

  errorTitle: {
    color: "#fca5a5",
    fontSize: 16,
    fontWeight: "700",
  },

  errorText: {
    color: "#fecaca",
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20,
  },

  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#991b1b",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
  },

  retryText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  streakCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    paddingVertical: 30,
    alignItems: "center",
    marginTop: 28,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  streakEmoji: {
    fontSize: 32,
  },

  streakNumber: {
    color: "#f9fafb",
    fontSize: 64,
    lineHeight: 72,
    fontWeight: "800",
    marginTop: 5,
  },

  streakLabel: {
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 2,
  },

  streakSubtext: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 9,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },

  smallCard: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  smallCardIcon: {
    fontSize: 20,
  },

  statNumber: {
    color: "#f9fafb",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 8,
  },

  statLabel: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 2,
  },

  infoCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  infoLabel: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  infoValue: {
    color: "#f9fafb",
    fontSize: 17,
    fontWeight: "600",
    marginTop: 6,
  },

  infoIcon: {
    fontSize: 26,
  },

  resetButton: {
    height: 54,
    backgroundColor: "#2563eb",
    borderRadius: 16,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  disabledButton: {
    opacity: 0.65,
  },

  resetIcon: {
    fontSize: 18,
  },

  resetText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  addRelapseButton: {
    height: 54,
    backgroundColor: "#111827",
    borderRadius: 16,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#ef4444",
  },

  addRelapseIcon: {
    fontSize: 17,
  },

  addRelapseText: {
    color: "#f87171",
    fontSize: 16,
    fontWeight: "700",
  },

  calendarButton: {
    height: 54,
    backgroundColor: "#111827",
    borderRadius: 16,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },

  calendarIcon: {
    fontSize: 18,
  },

  calendarText: {
    color: "#60a5fa",
    fontSize: 16,
    fontWeight: "700",
  },

  statsButton: {
    height: 54,
    backgroundColor: "#111827",
    borderRadius: 16,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },

  statsButtonIcon: {
    fontSize: 18,
  },

  statsButtonText: {
    color: "#a78bfa",
    fontSize: 16,
    fontWeight: "700",
  },

  heatmapButton: {
    height: 54,
    backgroundColor: "#111827",
    borderRadius: 16,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#22c55e",
  },

  heatmapButtonIcon: {
    fontSize: 18,
  },

  heatmapButtonText: {
    color: "#4ade80",
    fontSize: 16,
    fontWeight: "700",
  },

  sectionHeader: {
    marginTop: 30,
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#f9fafb",
    fontSize: 20,
    fontWeight: "700",
  },

  sectionSubtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 3,
  },

  activityCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
    overflow: "hidden",
  },

  activityRow: {
    minHeight: 70,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  activityBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },

  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  relapseIcon: {
    backgroundColor: "#2a1115",
  },

  cleanIcon: {
    backgroundColor: "#0f2419",
  },

  activityContent: {
    flex: 1,
    marginLeft: 12,
  },

  activityTitle: {
    color: "#f9fafb",
    fontSize: 15,
    fontWeight: "600",
  },

  activityDetail: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 3,
  },

  activityDate: {
    color: "#6b7280",
    fontSize: 12,
  },

  emptyActivity: {
    alignItems: "center",
    padding: 30,
  },

  emptyEmoji: {
    fontSize: 30,
  },

  emptyTitle: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },

  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  accountCard: {
    backgroundColor: "#0b1220",
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  accountTitle: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "600",
  },

  accountEmail: {
    color: "#e5e7eb",
    fontSize: 15,
    marginTop: 6,
  },

  footer: {
    color: "#4b5563",
    textAlign: "center",
    fontSize: 12,
    marginTop: 25,
  },
});