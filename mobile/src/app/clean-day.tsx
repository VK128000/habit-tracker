import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Calendar,
  DateData,
} from "react-native-calendars";

import { api, getToken } from "@/services/api";

type CleanDay = {
  _id: string;
  date: string;
};

type Relapse = {
  _id: string;
  date: string;
};

export default function CleanDayScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [cleanDays, setCleanDays] = useState<CleanDay[]>([]);
  const [relapses, setRelapses] = useState<Relapse[]>([]);

  const [selectedDate, setSelectedDate] =
    useState(getLocalDateString());

  const loadData = useCallback(async () => {
    try {
      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const [cleanResponse, relapseResponse] =
        await Promise.all([
          api.get("/clean"),
          api.get("/relapse"),
        ]);

      setCleanDays(
        Array.isArray(cleanResponse.data)
          ? cleanResponse.data
          : []
      );

      setRelapses(
        Array.isArray(relapseResponse.data)
          ? relapseResponse.data
          : relapseResponse.data?.relapses || []
      );
    } catch (error: any) {
      console.log("Clean day error:", error);

      if (error?.response?.status === 401) {
        router.replace("/login");
        return;
      }

      Alert.alert(
        "Unable to load",
        error?.response?.data?.msg ||
          "Unable to load clean days. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const cleanDates = new Set(
    cleanDays.map((item) =>
      item.date?.slice(0, 10)
    )
  );

  const relapseDates = new Set(
    relapses.map((item) =>
      item.date?.slice(0, 10)
    )
  );

  const isClean = cleanDates.has(selectedDate);
  const hasRelapse = relapseDates.has(selectedDate);

  const markedDates: Record<string, any> = {};

  cleanDates.forEach((date) => {
    if (!date) return;

    markedDates[date] = {
      ...(markedDates[date] || {}),
      marked: true,
      dotColor: "#22c55e",
    };
  });

  relapseDates.forEach((date) => {
    if (!date) return;

    markedDates[date] = {
      ...(markedDates[date] || {}),
      marked: true,
      dotColor: "#ef4444",
    };
  });

  markedDates[selectedDate] = {
    ...(markedDates[selectedDate] || {}),
    selected: true,
    selectedColor: "#2563eb",
  };

  function handleDayPress(day: DateData) {
    setSelectedDate(day.dateString);
  }

  function handleToggleCleanDay() {
    if (isClean) {
      Alert.alert(
        "Remove clean-day mark?",
        `Remove the clean-day mark from ${formatDate(
          selectedDate
        )}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: removeCleanDay,
          },
        ]
      );

      return;
    }

    const warning = hasRelapse
      ? "\n\nImportant: this date already has a relapse. Marking it as a clean day will remove that relapse from your history."
      : "";

    Alert.alert(
      "Mark as clean day?",
      `Mark ${formatDate(
        selectedDate
      )} as a clean day?${warning}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Mark Clean",
          onPress: saveCleanDay,
        },
      ]
    );
  }

  async function saveCleanDay() {
    try {
      setSaving(true);

      await api.post("/clean", {
        date: selectedDate,
      });

      await loadData();

      Alert.alert(
        "Clean day recorded",
        `${formatDate(
          selectedDate
        )} has been marked as a clean day.`
      );
    } catch (error: any) {
      console.log(
        "Mark clean day error:",
        error
      );

      if (error?.response?.status === 401) {
        router.replace("/login");
        return;
      }

      Alert.alert(
        "Unable to mark clean day",
        error?.response?.data?.msg ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeCleanDay() {
    try {
      setSaving(true);

      await api.delete(
        `/clean/${selectedDate}`
      );

      await loadData();

      Alert.alert(
        "Clean day removed",
        `${formatDate(
          selectedDate
        )} is no longer marked as a clean day.`
      );
    } catch (error: any) {
      console.log(
        "Remove clean day error:",
        error
      );

      if (error?.response?.status === 401) {
        router.replace("/login");
        return;
      }

      Alert.alert(
        "Unable to remove",
        error?.response?.data?.msg ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#60a5fa"
        />

        <Text style={styles.loadingText}>
          Loading clean days...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        {/* Header */}
        <Text style={styles.title}>
          Clean Days
        </Text>

        <Text style={styles.subtitle}>
          Mark the days you stayed clean and keep
          your progress visible.
        </Text>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              backgroundColor: "#111827",
              calendarBackground: "#111827",

              textSectionTitleColor: "#9ca3af",

              selectedDayBackgroundColor: "#2563eb",
              selectedDayTextColor: "#ffffff",

              todayTextColor: "#60a5fa",

              dayTextColor: "#f9fafb",
              textDisabledColor: "#374151",

              monthTextColor: "#f9fafb",
              arrowColor: "#60a5fa",

              textDayFontSize: 15,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13,
            }}
          />
        </View>

        {/* Selected date */}
        <View style={styles.selectedCard}>
          <Text style={styles.selectedLabel}>
            SELECTED DATE
          </Text>

          <Text style={styles.selectedDate}>
            {formatDate(selectedDate)}
          </Text>

          {/* Status */}
          <View
            style={[
              styles.statusPill,
              isClean
                ? styles.cleanPill
                : styles.notCleanPill,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isClean
                  ? styles.cleanStatusText
                  : styles.notCleanStatusText,
              ]}
            >
              {isClean
                ? "🟢 Clean day recorded"
                : "⚪ Not marked as clean"}
            </Text>
          </View>

          {/* Relapse warning */}
          {hasRelapse && !isClean ? (
            <Text style={styles.warningText}>
              ⚠️ A relapse is recorded on this date.
              Marking it clean will remove that relapse.
            </Text>
          ) : null}

          {/* Action */}
          <Pressable
            style={[
              styles.actionButton,
              isClean
                ? styles.removeButton
                : styles.markButton,
              saving && styles.disabledButton,
            ]}
            onPress={handleToggleCleanDay}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.actionIcon}>
                  {isClean ? "🗑️" : "🟢"}
                </Text>

                <Text style={styles.actionText}>
                  {isClean
                    ? "Remove Clean-Day Mark"
                    : "Mark as Clean Day"}
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            How it works
          </Text>

          <Text style={styles.infoText}>
            • Green dots show recorded clean days.
          </Text>

          <Text style={styles.infoText}>
            • Red dots show relapse dates.
          </Text>

          <Text style={styles.infoText}>
            • Select any date and add or remove its
            clean-day mark.
          </Text>

          <Text style={styles.infoText}>
            • Marking a date as clean removes any
            relapse recorded on that same date.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function getLocalDateString() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString: string) {
  const [year, month, day] =
    dateString.split("-").map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
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
    paddingBottom: 50,
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
    marginBottom: 20,
  },

  backText: {
    color: "#60a5fa",
    fontSize: 18,
  },

  title: {
    color: "#f9fafb",
    fontSize: 38,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 17,
    lineHeight: 24,
    marginTop: 8,
    marginBottom: 25,
  },

  calendarCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    overflow: "hidden",
  },

  selectedCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  selectedLabel: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  selectedDate: {
    color: "#f9fafb",
    fontSize: 22,
    fontWeight: "600",
    marginTop: 8,
  },

  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 14,
    borderWidth: 1,
  },

  cleanPill: {
    backgroundColor: "#0f2419",
    borderColor: "#166534",
  },

  notCleanPill: {
    backgroundColor: "#111827",
    borderColor: "#374151",
  },

  statusText: {
    fontSize: 13,
    fontWeight: "700",
  },

  cleanStatusText: {
    color: "#4ade80",
  },

  notCleanStatusText: {
    color: "#9ca3af",
  },

  warningText: {
    color: "#fbbf24",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },

  actionButton: {
    minHeight: 54,
    borderRadius: 16,
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
  },

  markButton: {
    backgroundColor: "#16a34a",
  },

  removeButton: {
    backgroundColor: "#991b1b",
  },

  disabledButton: {
    opacity: 0.65,
  },

  actionIcon: {
    fontSize: 18,
  },

  actionText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },

  infoCard: {
    backgroundColor: "#0b1220",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  infoTitle: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },

  infoText: {
    color: "#9ca3af",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
});