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

import { api, saveToken, saveUser } from "@/services/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert(
        "Missing fields",
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: email.trim(),
        pass: password,
      });

      const { token, user } = response.data;

      await saveToken(token);
      await saveUser(user);

      router.replace("/dashboard");
    } catch (error: any) {
      console.log("LOGIN ERROR:", error?.response?.data || error);

      const message =
        error?.response?.data?.msg ||
        "Unable to login. Please check your credentials.";

      Alert.alert("Login failed", message);
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
        <View style={styles.logo}>
          <Text style={styles.logoText}>NF</Text>
        </View>

        <Text style={styles.title}>NoFap Tracker Pro</Text>

        <Text style={styles.subtitle}>
          Track your progress. Stay consistent.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#6b7280"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#6b7280"
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginText}>Login</Text>
            )}
          </Pressable>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>
              Don't have an account?{" "}
            </Text>

            <Pressable onPress={() => router.push("/signup")}>
              <Text style={styles.signupLink}>Create one</Text>
            </Pressable>
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
    paddingHorizontal: 46,
    paddingVertical: 50,
  },

  logo: {
    width: 140,
    height: 140,
    borderRadius: 28,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },

  logoText: {
    color: "#60a5fa",
    fontSize: 46,
    fontWeight: "700",
  },

  title: {
    color: "#f9fafb",
    fontSize: 38,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 19,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 58,
  },

  form: {
    width: "100%",
  },

  label: {
    color: "#d1d5db",
    fontSize: 18,
    marginBottom: 12,
  },

  input: {
    height: 68,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 20,
    paddingHorizontal: 30,
    color: "#f9fafb",
    fontSize: 18,
    marginBottom: 34,
  },

  loginButton: {
    height: 68,
    backgroundColor: "#2563eb",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  loginText: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "700",
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 34,
  },

  signupText: {
    color: "#9ca3af",
    fontSize: 17,
  },

  signupLink: {
    color: "#60a5fa",
    fontSize: 17,
    fontWeight: "600",
  },
});