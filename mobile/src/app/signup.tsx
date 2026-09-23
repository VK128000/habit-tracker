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

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert(
        "Missing fields",
        "Please fill in all fields."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak password",
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/signup", {
        name: name.trim(),
        email: email.trim(),
        pass: password,
      });

      const { token, user } = response.data;

      await saveToken(token);
      await saveUser(user);

      router.replace("/dashboard");
    } catch (error: any) {
      console.log("SIGNUP ERROR:", error?.response?.data || error);

      const message =
        error?.response?.data?.msg ||
        "Unable to create your account.";

      Alert.alert("Signup failed", message);
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
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <View style={styles.logo}>
          <Text style={styles.logoText}>NF</Text>
        </View>

        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.subtitle}>
          Start tracking your progress today.
        </Text>

        <Text style={styles.label}>Name</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#6b7280"
          style={styles.input}
        />

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
          placeholder="Create a password"
          placeholderTextColor="#6b7280"
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              Create Account
            </Text>
          )}
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>
            Already have an account?{" "}
          </Text>

          <Pressable onPress={() => router.replace("/login")}>
            <Text style={styles.loginLink}>Login</Text>
          </Pressable>
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
    paddingHorizontal: 46,
    paddingVertical: 45,
  },

  backButton: {
    marginBottom: 30,
  },

  backText: {
    color: "#60a5fa",
    fontSize: 18,
  },

  logo: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },

  logoText: {
    color: "#60a5fa",
    fontSize: 32,
    fontWeight: "700",
  },

  title: {
    color: "#f9fafb",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 42,
  },

  label: {
    color: "#d1d5db",
    fontSize: 17,
    marginBottom: 10,
  },

  input: {
    height: 62,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 18,
    paddingHorizontal: 24,
    color: "#f9fafb",
    fontSize: 17,
    marginBottom: 25,
  },

  button: {
    height: 64,
    backgroundColor: "#2563eb",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },

  loginText: {
    color: "#9ca3af",
    fontSize: 16,
  },

  loginLink: {
    color: "#60a5fa",
    fontSize: 16,
    fontWeight: "600",
  },
});