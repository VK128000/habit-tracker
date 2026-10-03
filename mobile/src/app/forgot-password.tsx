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

import {
  api,
  getApiErrorMessage,
} from "@/services/api";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleForgotPassword() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      Alert.alert(
        "Missing email",
        "Please enter your email address."
      );
      return;
    }

    try {
      setLoading(true);

      setSent(false);

      const response = await api.post(
        "/auth/forgot-password",
        {
          email: normalizedEmail,
        }
      );

      console.log(
        "FORGOT PASSWORD RESPONSE:",
        response.data
      );

      setSent(true);
    } catch (error: any) {
      console.log(
        "FORGOT PASSWORD ERROR:",
        error
      );

      const message = getApiErrorMessage(error);

      Alert.alert(
        "Unable to send reset link",
        message
      );
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
        <View style={styles.card}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
            <Text style={styles.backLabel}>
              Back to Login
            </Text>
          </Pressable>

          <View style={styles.icon}>
            <Text style={styles.iconText}>?</Text>
          </View>

          <Text style={styles.title}>
            Forgot Password?
          </Text>

          <Text style={styles.subtitle}>
            Enter your email address and we'll send you
            a password reset link.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>
              Email
            </Text>

            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setSent(false);
              }}
              placeholder="Enter your email"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              style={styles.input}
            />

            <Pressable
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.resetButtonText}>
                  Send Reset Link
                </Text>
              )}
            </Pressable>

            {sent && (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>
                  Check your email
                </Text>

                <Text style={styles.successText}>
                  If an account exists for that email,
                  a password reset link has been sent.
                </Text>

                <Text style={styles.successHint}>
                  The reset link is valid for 15 minutes.
                </Text>
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Remember your password?
              </Text>

              <Pressable
                onPress={() => router.replace("/login")}
              >
                <Text style={styles.loginLink}>
                  Login
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
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
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },

  card: {
    width: "100%",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 30,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 34,
  },

  backText: {
    color: "#60a5fa",
    fontSize: 36,
    lineHeight: 30,
    marginRight: 6,
  },

  backLabel: {
    color: "#60a5fa",
    fontSize: 16,
    fontWeight: "600",
  },

  icon: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: "#1e3a8a",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  iconText: {
    color: "#93c5fd",
    fontSize: 40,
    fontWeight: "700",
  },

  title: {
    color: "#f9fafb",
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 36,
  },

  form: {
    width: "100%",
  },

  label: {
    color: "#d1d5db",
    fontSize: 17,
    marginBottom: 12,
  },

  input: {
    height: 64,
    backgroundColor: "#030712",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 18,
    paddingHorizontal: 22,
    color: "#f9fafb",
    fontSize: 17,
    marginBottom: 22,
  },

  resetButton: {
    height: 64,
    backgroundColor: "#2563eb",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  resetButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  successBox: {
    backgroundColor: "#052e16",
    borderWidth: 1,
    borderColor: "#166534",
    borderRadius: 18,
    padding: 18,
    marginTop: 22,
  },

  successTitle: {
    color: "#86efac",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },

  successText: {
    color: "#d1fae5",
    fontSize: 15,
    lineHeight: 22,
  },

  successHint: {
    color: "#86efac",
    fontSize: 13,
    marginTop: 10,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },

  footerText: {
    color: "#9ca3af",
    fontSize: 15,
    marginRight: 5,
  },

  loginLink: {
    color: "#60a5fa",
    fontSize: 15,
    fontWeight: "600",
  },
});