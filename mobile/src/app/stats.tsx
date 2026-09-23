import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api, getToken, logout } from "@/services/api";

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

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    try {
      setError("");

      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await api.get("/stats");
      setStats(response.data);
    } catch (err: any) {
      console.log("Stats error:", err);

      if (err?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }

      setError(
        err?.response?.data?.msg ||
          "Unable to load statistics. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadStats();
  }

  const monthlyEntries = useMemo(() => {
    if (!stats) return [];

    return Object.entries(stats.monthlyCount || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12);
  }, [stats]);

  const actressEntries = useMemo(() => {
    if (!stats) return [];

    return Object.entries(stats.actressCount || {})
      .sort(([, a], [, b]) => b - a);
  }, [stats]);

  const maxMonthly = Math.max(
    1,
    ...monthlyEntries.map(([, count]) => count)
  );

  const maxActress = Math.max(
    1,
    ...actressEntries.map(([, count]) => count)
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text style={styles.loadingText}>
          Loading statistics...
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
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Statistics</Text>

        <Text style={styles.subtitle}>
          Understand your progress and relapse patterns.
        </Text>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              Something went wrong
            </Text>

            <Text style={styles.errorText}>{error}</Text>

            <Pressable
              style={styles.retryButton}
              onPress={loadStats}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statNumber}>
              {stats?.streak ?? 0}
            </Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔴</Text>
            <Text style={styles.statNumber}>
              {stats?.totalRelapses ?? 0}
            </Text>
            <Text style={styles.statLabel}>Total Relapses</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🟢</Text>
            <Text style={styles.statNumber}>
              {stats?.cleanDays?.length ?? 0}
            </Text>
            <Text style={styles.statLabel}>Clean Days</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statNumber}>
              {actressEntries.length}
            </Text>
            <Text style={styles.statLabel}>People Logged</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Monthly Relapses
          </Text>

          <Text style={styles.sectionSubtitle}>
            Last 12 months with recorded relapses
          </Text>

          <View style={styles.chartCard}>
            {monthlyEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📊</Text>
                <Text style={styles.emptyTitle}>
                  No monthly data yet
                </Text>
                <Text style={styles.emptyText}>
                  Your monthly relapse activity will appear here.
                </Text>
              </View>
            ) : (
              monthlyEntries.map(([month, count]) => {
                const width = `${Math.max(
                  4,
                  (count / maxMonthly) * 100
                )}%` as `${number}%`;

                return (
                  <View key={month} style={styles.barRow}>
                    <Text style={styles.barLabel}>
                      {formatMonth(month)}
                    </Text>

                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.monthBar,
                          { width },
                        ]}
                      />
                    </View>

                    <Text style={styles.barValue}>{count}</Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Relapses by Person
          </Text>

          <Text style={styles.sectionSubtitle}>
            Recorded relapse entries grouped by name
          </Text>

          <View style={styles.chartCard}>
            {actressEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>👤</Text>
                <Text style={styles.emptyTitle}>
                  No relapse data yet
                </Text>
                <Text style={styles.emptyText}>
                  Names from your relapse records will appear here.
                </Text>
              </View>
            ) : (
              actressEntries.map(([name, count]) => {
                const width = `${Math.max(
                  4,
                  (count / maxActress) * 100
                )}%` as `${number}%`;

                return (
                  <View key={name} style={styles.personRow}>
                    <View style={styles.personHeader}>
                      <Text
                        style={styles.personName}
                        numberOfLines={1}
                      >
                        {name}
                      </Text>

                      <Text style={styles.personCount}>
                        {count}
                      </Text>
                    </View>

                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.personBar,
                          { width },
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Streak Details
          </Text>

          <View style={styles.detailsCard}>
            <DetailRow
              label="Current streak"
              value={`${stats?.streak ?? 0} days`}
            />

            <DetailRow
              label="Last relapse"
              value={
                stats?.lastRelapseDate
                  ? formatDate(stats.lastRelapseDate)
                  : "None"
              }
            />

            <DetailRow
              label="Streak reset"
              value={
                stats?.streakResetDate
                  ? formatDate(stats.streakResetDate)
                  : "None"
              }
            />

            <DetailRow
              label="Streak base date"
              value={
                stats?.baseDate
                  ? formatDate(stats.baseDate)
                  : "None"
              }
              last
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Keep tracking
            </Text>

            <Text style={styles.infoText}>
              Statistics update automatically whenever you record
              a relapse, add a clean day, or reset your streak.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          NoFap Tracker Pro
        </Text>
      </ScrollView>
    </View>
  );
}

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        !last && styles.detailBorder,
      ]}
    >
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function formatMonth(value: string) {
  const parsed = new Date(`${value}-01T00:00:00`);

  return parsed.toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}

function formatDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
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

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
  },

  backText: {
    color: "#60a5fa",
    fontSize: 17,
  },

  title: {
    color: "#f9fafb",
    fontSize: 40,
    fontWeight: "700",
    marginTop: 20,
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 8,
    lineHeight: 24,
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

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  statIcon: {
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
    marginTop: 3,
  },

  section: {
    marginTop: 30,
  },

  sectionTitle: {
    color: "#f9fafb",
    fontSize: 21,
    fontWeight: "700",
  },

  sectionSubtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 4,
  },

  chartCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 18,
    marginTop: 12,
  },

  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  barLabel: {
    width: 58,
    color: "#9ca3af",
    fontSize: 11,
  },

  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: "#1f2937",
    borderRadius: 999,
    overflow: "hidden",
  },

  monthBar: {
    height: "100%",
    backgroundColor: "#60a5fa",
    borderRadius: 999,
  },

  barValue: {
    width: 28,
    textAlign: "right",
    color: "#f9fafb",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 8,
  },

  personRow: {
    marginBottom: 18,
  },

  personHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },

  personName: {
    color: "#e5e7eb",
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },

  personCount: {
    color: "#f9fafb",
    fontSize: 13,
    fontWeight: "700",
  },

  personBar: {
    height: "100%",
    backgroundColor: "#a78bfa",
    borderRadius: 999,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 25,
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

  detailsCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginTop: 12,
    overflow: "hidden",
  },

  detailRow: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },

  detailLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },

  detailValue: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 15,
    textAlign: "right",
  },

  infoCard: {
    backgroundColor: "#0b1220",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 18,
    marginTop: 24,
    flexDirection: "row",
  },

  infoIcon: {
    fontSize: 22,
  },

  infoContent: {
    flex: 1,
    marginLeft: 12,
  },

  infoTitle: {
    color: "#f9fafb",
    fontSize: 15,
    fontWeight: "700",
  },

  infoText: {
    color: "#9ca3af",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  footer: {
    color: "#4b5563",
    textAlign: "center",
    fontSize: 12,
    marginTop: 25,
  },
});
