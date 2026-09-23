import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useState } from "react";

import { api } from "@/services/api";

export default function AddRelapseScreen() {
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [actress, setActress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!date.trim() || !actress.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter the date and actress."
      );
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(date.trim())) {
      Alert.alert(
        "Invalid date",
        "Please use YYYY-MM-DD format."
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/relapse", {
        date: date.trim(),
        actress: actress.trim(),
        note: note.trim(),
      });

      Alert.alert(
        "Relapse recorded",
        "Your relapse has been successfully recorded.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/dashboard"),
          },
        ]
      );
    } catch (error: any) {
      console.log("Add relapse error:", error);

      const message =
        error?.response?.data?.msg ||
        "Unable to record relapse. Please try again.";

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        {/* Header */}
        <Text style={styles.title}>
          Record Relapse
        </Text>

        <Text style={styles.subtitle}>
          Add the details of your relapse.
        </Text>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Date
          </Text>

          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#6b7280"
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.hint}>
            Format: YYYY-MM-DD
          </Text>
        </View>

        {/* Actress */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Actress
          </Text>

          <TextInput
            value={actress}
            onChangeText={setActress}
            placeholder="Enter actress name"
            placeholderTextColor="#6b7280"
            style={styles.input}
            editable={!loading}
          />
        </View>

        {/* Note */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Note{" "}
            <Text style={styles.optional}>
              (optional)
            </Text>
          </Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            placeholderTextColor="#6b7280"
            multiline
            textAlignVertical="top"
            style={[
              styles.input,
              styles.noteInput,
            ]}
            editable={!loading}
          />
        </View>

        {/* Submit */}
        <Pressable
          style={[
            styles.submitButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>
              Record Relapse
            </Text>
          )}
        </Pressable>

        {/* Cancel */}
        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>
            Cancel
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 65,
    paddingBottom: 40,
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 30,
  },

  backText: {
    color: "#60a5fa",
    fontSize: 17,
    fontWeight: "600",
  },

  title: {
    color: "#f9fafb",
    fontSize: 32,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 8,
    marginBottom: 35,
  },

  field: {
    marginBottom: 24,
  },

  label: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  optional: {
    color: "#6b7280",
    fontWeight: "400",
  },

  input: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 16,
    color: "#f9fafb",
    fontSize: 17,
    paddingHorizontal: 18,
    paddingVertical: 17,
  },

  noteInput: {
    minHeight: 120,
    paddingTop: 17,
  },

  hint: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 7,
  },

  submitButton: {
    backgroundColor: "#ef4444",
    borderRadius: 16,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  submitText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },

  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    marginTop: 8,
  },

  cancelText: {
    color: "#9ca3af",
    fontSize: 16,
  },
});