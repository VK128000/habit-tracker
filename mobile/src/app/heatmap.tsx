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

type DayCell = {
  date: string;
  relapseCount: number;
  clean: boolean;
};

const CELL_SIZE = 15;
const CELL_GAP = 4;
const COLUMN_WIDTH = CELL_SIZE + CELL_GAP;

const HEATMAP_DAYS = 365;

const EMPTY = "#1f2937";

function toDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function getHeatColor(day: DayCell) {
  if (day.relapseCount > 0) {
    if (day.relapseCount >= 3) return "#991b1b";
    if (day.relapseCount === 2) return "#dc2626";
    return "#ef4444";
  }

  if (day.clean) {
    return "#22c55e";
  }

  return EMPTY;
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("en-IN", {
    month: "short",
  });
}

export default function HeatmapScreen() {
  const [relapses, setRelapses] = useState<Relapse[]>([]);
  const [cleanDays, setCleanDays] = useState<CleanDay[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHeatmap = useCallback(async () => {
    try {
      setError("");

      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const [relapseResponse, cleanResponse] =
        await Promise.all([
          api.get("/relapse"),
          api.get("/clean"),
        ]);

      setRelapses(relapseResponse.data);
      setCleanDays(cleanResponse.data);
    } catch (err: any) {
      console.log("Heatmap error:", err);

      if (err?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }

      setError(
        err?.response?.data?.msg ||
          "Unable to load heatmap. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHeatmap();
  }, [loadHeatmap]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadHeatmap();
  }

  const relapseCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const relapse of relapses) {
      counts[relapse.date] =
        (counts[relapse.date] || 0) + 1;
    }

    return counts;
  }, [relapses]);

  const cleanSet = useMemo(() => {
    return new Set(cleanDays.map((day) => day.date));
  }, [cleanDays]);

  const days = useMemo(() => {
    const today = new Date();

    const start = addDays(
      today,
      -(HEATMAP_DAYS - 1)
    );

    /*
     * Move backwards to Sunday so the first column
     * forms a complete week.
     */
    start.setDate(
      start.getDate() - start.getDay()
    );

    const result: DayCell[] = [];

    const totalColumns = Math.ceil(
      (HEATMAP_DAYS + today.getDay()) / 7
    );

    const totalDays = totalColumns * 7;

    for (let i = 0; i < totalDays; i++) {
      const current = addDays(start, i);
      const key = dateKey(current);

      result.push({
        date: key,
        relapseCount: relapseCounts[key] || 0,
        clean: cleanSet.has(key),
      });
    }

    return result;
  }, [relapseCounts, cleanSet]);

  const weeks = useMemo(() => {
    const result: DayCell[][] = [];

    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }

    return result;
  }, [days]);

  const monthLabels = useMemo(() => {
    return weeks.map((week, index) => {
      const firstDay = toDate(week[0].date);

      /*
       * Only display a label when the month changes.
       */
      if (index === 0) {
        return {
          index,
          label: getMonthLabel(firstDay),
        };
      }

      const previousWeek = toDate(
        weeks[index - 1][0].date
      );

      if (
        firstDay.getMonth() !==
        previousWeek.getMonth()
      ) {
        return {
          index,
          label: getMonthLabel(firstDay),
        };
      }

      return null;
    });
  }, [weeks]);

  const activeDays = useMemo(() => {
    return days.filter(
      (day) => day.relapseCount > 0 || day.clean
    ).length;
  }, [days]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#60a5fa"
        />

        <Text style={styles.loadingText}>
          Loading heatmap...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#60a5fa"
          />
        }
        contentContainerStyle={styles.content}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        <Text style={styles.title}>
          365-Day Heatmap
        </Text>

        <Text style={styles.subtitle}>
          Your activity over the last year.
        </Text>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              Something went wrong
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={loadHeatmap}
            >
              <Text style={styles.retryText}>
                Retry
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryNumber}>
              {activeDays}
            </Text>

            <Text style={styles.summaryLabel}>
              Active days
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View>
            <Text style={styles.summaryNumber}>
              {relapses.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Relapses
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View>
            <Text style={styles.summaryNumber}>
              {cleanDays.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Clean days
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Activity
          </Text>

          <Text style={styles.cardSubtitle}>
            Green = clean · Red = relapse
          </Text>

          <View style={styles.heatmapWrapper}>
            <View style={styles.dayLabels}>
              <Text style={styles.dayLabel}>Sun</Text>
              <Text style={styles.dayLabel}>Mon</Text>
              <Text style={styles.dayLabel}>Tue</Text>
              <Text style={styles.dayLabel}>Wed</Text>
              <Text style={styles.dayLabel}>Thu</Text>
              <Text style={styles.dayLabel}>Fri</Text>
              <Text style={styles.dayLabel}>Sat</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={
                styles.horizontalContent
              }
            >
              <View>
                <View style={styles.monthRow}>
                  {monthLabels.map((item) => {
                    if (!item) {
                      return (
                        <View
                          key={`empty-${Math.random()}`}
                          style={styles.monthSpacer}
                        />
                      );
                    }

                    return (
                      <Text
                        key={`month-${item.index}`}
                        style={[
                          styles.monthLabel,
                          {
                            left:
                              item.index *
                              COLUMN_WIDTH,
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    );
                  })}
                </View>

                <View style={styles.grid}>
                  {weeks.map((week, weekIndex) => (
                    <View
                      key={`week-${weekIndex}`}
                      style={styles.column}
                    >
                      {week.map((day) => (
                        <View
                          key={day.date}
                          style={[
                            styles.cell,
                            {
                              backgroundColor:
                                getHeatColor(day),
                            },
                          ]}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>

          <View style={styles.legend}>
            <Text style={styles.legendText}>
              Less
            </Text>

            <View
              style={[
                styles.legendCell,
                {
                  backgroundColor: EMPTY,
                },
              ]}
            />

            <View
              style={[
                styles.legendCell,
                {
                  backgroundColor: "#22c55e",
                },
              ]}
            />

            <View
              style={[
                styles.legendCell,
                {
                  backgroundColor: "#ef4444",
                },
              ]}
            />

            <View
              style={[
                styles.legendCell,
                {
                  backgroundColor: "#dc2626",
                },
              ]}
            />

            <View
              style={[
                styles.legendCell,
                {
                  backgroundColor: "#991b1b",
                },
              ]}
            />

            <Text style={styles.legendText}>
              More
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>
            💡
          </Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              How it works
            </Text>

            <Text style={styles.infoText}>
              Each square represents one day. Clean
              days appear green, while relapse days
              appear red. Multiple relapses on the same
              day use a darker red.
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
    fontSize: 34,
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

  summaryCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginTop: 24,
    paddingVertical: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  summaryNumber: {
    color: "#f9fafb",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  summaryLabel: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 3,
    textAlign: "center",
  },

  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: "#1f2937",
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 18,
    marginTop: 18,
  },

  cardTitle: {
    color: "#f9fafb",
    fontSize: 20,
    fontWeight: "700",
  },

  cardSubtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 4,
  },

  heatmapWrapper: {
    marginTop: 20,
  },

  dayLabels: {
    position: "absolute",
    left: 0,
    top: 30,
    zIndex: 2,
  },

  dayLabel: {
    color: "#6b7280",
    fontSize: 9,
    height: CELL_SIZE + CELL_GAP,
    textAlignVertical: "center",
    width: 30,
  },

  horizontalContent: {
    paddingLeft: 36,
  },

  monthRow: {
    height: 24,
    position: "relative",
  },

  monthLabel: {
    position: "absolute",
    top: 0,
    color: "#9ca3af",
    fontSize: 10,
    width: 40,
  },

  monthSpacer: {
    width: COLUMN_WIDTH,
  },

  grid: {
    flexDirection: "row",
  },

  column: {
    width: COLUMN_WIDTH,
  },

  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 3,
    marginBottom: CELL_GAP,
  },

  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 18,
    gap: 5,
  },

  legendText: {
    color: "#6b7280",
    fontSize: 10,
    marginHorizontal: 3,
  },

  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },

  infoCard: {
    backgroundColor: "#0b1220",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 18,
    marginTop: 20,
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