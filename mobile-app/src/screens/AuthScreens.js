import { Alert, Image, Text, View } from "react-native";
import { useState } from "react";
import {
  Button,
  Card,
  Field,
  GhostButton,
  Screen,
  Subtitle,
  Title,
} from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Screen>
      <Card>
        <Image
          source={{ uri: "https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=1200" }}
          style={{ width: "100%", height: 180, borderRadius: 12 }}
          resizeMode="cover"
        />
      </Card>
      <Card>
        <Text style={{ color: "#2563EB", fontWeight: "700", fontSize: 12 }}>
          CONNECTING MINDS
        </Text>
        <Title>Welcome Back!</Title>
        <Subtitle>Login to your account</Subtitle>
      </Card>
      <Card>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
        <Button
          label={loading ? "Logging in..." : "Login"}
          onPress={async () => {
            try {
              setLoading(true);
              await login(email, password);
            } catch (e) {
              Alert.alert("Login failed", e.message);
            } finally {
              setLoading(false);
            }
          }}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <GhostButton
            label="Forgot password?"
            onPress={() => navigation.navigate("ForgotPassword")}
          />
          <GhostButton
            label="Create account"
            onPress={() => navigation.navigate("Register")}
          />
        </View>
      </Card>
    </Screen>
  );
}

export function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Screen>
      <Card>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: "#DBEAFE",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <Text style={{ color: "#1D4ED8", fontSize: 26, fontWeight: "800" }}>E</Text>
        </View>
        <Title>Create account</Title>
        <Subtitle>Register to get started with EduHub</Subtitle>
      </Card>
      <Card>
        <Field
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="Full name"
        />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="College email address"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Password (min. 6 characters)"
          secureTextEntry
        />
        <Field
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          secureTextEntry
        />
        <Button
          label={loading ? "Creating account..." : "Create account"}
          onPress={async () => {
            try {
              if (password !== confirmPassword) {
                Alert.alert("Validation", "Passwords do not match.");
                return;
              }
              setLoading(true);
              await register({ name, email, password });
            } catch (e) {
              Alert.alert("Register failed", e.message);
            } finally {
              setLoading(false);
            }
          }}
        />
        <GhostButton
          label="Back to login"
          onPress={() => navigation.navigate("Login")}
        />
      </Card>
    </Screen>
  );
}

export function ForgotPasswordScreen() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <Screen>
      <Card>
        <Title>Forgot password?</Title>
        <Subtitle>
          Enter your registered email and we will send a reset link.
        </Subtitle>
      </Card>
      <Card>
        {sent ? (
          <>
            <Text style={{ color: "#059669", fontWeight: "700" }}>
              Check your inbox for the reset link.
            </Text>
            <GhostButton
              label="Use another email"
              onPress={() => {
                setSent(false);
                setEmail("");
              }}
            />
          </>
        ) : (
          <>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your college email"
            />
            <Button
              label="Send reset link"
              onPress={async () => {
                try {
                  await forgotPassword(email);
                  setSent(true);
                } catch (e) {
                  Alert.alert("Error", e.message);
                }
              }}
            />
          </>
        )}
      </Card>
    </Screen>
  );
}
