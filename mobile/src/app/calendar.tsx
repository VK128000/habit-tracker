import { router } from "expo-router";
import { useEffect, useState } from "react";
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

type Relapse = {
  _id: string;
  date: string;
  actress: string;
  note?: string;
};

export default function CalendarScreen() {
  const [loading, setLoading] = useState(true);
  const [relapses, setRelapses] = useState<Relapse[]>([]);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    loadRelapses();
  }, []);

  async function loadRelapses() {
    try {
      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await api.get("/relapse");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.relapses || [];

      setRelapses(data);
    } catch (error) {
      console.log("Calendar error:", error);
    } finally {
      setLoading(false);
    }
  }

  const selectedRelapses = relapses.filter(
    (item) =>
      item.date?.slice(0, 10) === selectedDate
  );

  const markedDates: Record<string, any> = {};

  relapses.forEach((item) => {
    const date = item.date?.slice(0, 10);

    if (!date) return;

    markedDates[date] = {
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

  function handleDelete(relapse: Relapse) {
    Alert.alert(
      "Delete relapse?",
      `Remove the relapse recorded on ${formatDate(
        relapse.date.slice(0, 10)
      )}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(relapse._id);

              await api.delete(
                `/relapse/${relapse._id}`
              );

              setRelapses((current) =>
                current.filter(
                  (item) => item._id !== relapse._id
                )
              );
            } catch (error: any) {
              console.log(
                "Delete relapse error:",
                error
              );

              if (error?.response?.status === 401) {
                router.replace("/login");
                return;
              }

              Alert.alert(
                "Delete failed",
                error?.response?.data?.msg ||
                  "Unable to delete this relapse. Please try again."
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#60a5fa"
        />

        <Text style={styles.loadingText}>
          Loading calendar...
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
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Calendar
        </Text>

        <Text style={styles.subtitle}>
          View your relapse history by date.
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
        </View>

        <Text style={styles.sectionTitle}>
          Relapses on this day
        </Text>

        {selectedRelapses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>
              🟢
            </Text>

            <Text style={styles.emptyTitle}>
              No relapse recorded
            </Text>

            <Text style={styles.emptyText}>
              This was a clean day.
            </Text>
          </View>
        ) : (
          selectedRelapses.map((item, index) => (
            <View
              key={
                item._id ||
                `${item.date}-${index}`
              }
              style={styles.relapseCard}
            >
              <View style={styles.relapseIcon}>
                <Text style={styles.relapseEmoji}>
                  🔴
                </Text>
              </View>

              <View style={styles.relapseInfo}>
                <Text style={styles.relapseTitle}>
                  Relapse
                </Text>

                {item.actress ? (
                  <Text style={styles.actress}>
                    {item.actress}
                  </Text>
                ) : null}

                {item.note ? (
                  <Text style={styles.note}>
                    {item.note}
                  </Text>
                ) : null}

                {/* Delete */}
                <Pressable
                  style={[
                    styles.deleteButton,
                    deletingId === item._id &&
                      styles.deleteButtonDisabled,
                  ]}
                  onPress={() =>
                    handleDelete(item)
                  }
                  disabled={
                    deletingId === item._id
                  }
                >
                  {deletingId === item._id ? (
                    <ActivityIndicator
                      size="small"
                      color="#fca5a5"
                    />
                  ) : (
                    <Text style={styles.deleteText}>
                      Delete
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function formatDate(dateString: string) {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

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
    borderRadius: 18,
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

  sectionTitle: {
    color: "#f9fafb",
    fontSize: 23,
    fontWeight: "700",
    marginTop: 30,
    marginBottom: 14,
  },

  emptyCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  emptyEmoji: {
    fontSize: 30,
  },

  emptyTitle: {
    color: "#f9fafb",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 15,
    marginTop: 6,
  },

  relapseCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 12,
  },

  relapseIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#3f1118",
    alignItems: "center",
    justifyContent: "center",
  },

  relapseEmoji: {
    fontSize: 22,
  },

  relapseInfo: {
    marginLeft: 14,
    flex: 1,
  },

  relapseTitle: {
    color: "#f9fafb",
    fontSize: 17,
    fontWeight: "600",
  },

  actress: {
    color: "#9ca3af",
    fontSize: 15,
    marginTop: 4,
  },

  note: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 5,
  },

  deleteButton: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#2a1115",
    borderWidth: 1,
    borderColor: "#7f1d1d",
  },

  deleteButtonDisabled: {
    opacity: 0.6,
  },

  deleteText: {
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: "700",
  },
});