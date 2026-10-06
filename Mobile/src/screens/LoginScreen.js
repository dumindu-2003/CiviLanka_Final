import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { login } from "../services/api";
import Logo from "../components/Logo";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [serviceNumber, setServiceNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);

  function clearErrors() {
    if (errors.length > 0) {
      setErrors([]);
    }
  }

  async function handleLogin() {
    const nextErrors = [];
    const usernameValue = username.trim();
    const serviceValue = serviceNumber.trim().toUpperCase();
    const passwordValue = password.trim();

    if (usernameValue === "") {
      nextErrors.push("Government username cannot be empty.");
    } else if (!/^[a-zA-Z]+(\.[a-zA-Z]+)+$/.test(usernameValue)) {
      nextErrors.push("Enter a valid government username, such as j.perera.");
    }

    if (serviceValue === "") {
      nextErrors.push("Service number cannot be empty.");
    } else if (!/^[A-Z]{2,}-\d{3,}$/.test(serviceValue)) {
      nextErrors.push("Enter a valid service number, such as AG-884210.");
    }

    if (passwordValue === "") {
      nextErrors.push("Password cannot be empty.");
    } else if (passwordValue.length < 6) {
      nextErrors.push("Password must be at least 6 characters.");
    }

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const user = await login(usernameValue, serviceValue, passwordValue);
      if (user.role === "marriage_registrar") {
        navigation.replace("MarriageRegistrar");
        return;
      }
      if (user.role === "bank_manager") {
        navigation.replace("BankOfficer");
        return;
      }
      if (user.role === "village_officer") {
        navigation.replace("VillageOfficer");
        return;
      }
      if (user.role === "district_registrar") {
        navigation.replace("DistrictRegistrar");
        return;
      }
      if (user.role === "admin") {
        navigation.replace("AdminDashboard");
        return;
      }
      navigation.replace("Main", {
        screen: "Home",
        params: { role: user.role, name: user.name },
      });
    } catch (error) {
      setErrors([error.message]);
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <View style={styles.brandRow}>
            <Logo size={36} />
            <Text style={styles.brandName}>Civil Registration Tracker</Text>
          </View>
          <Text style={styles.portalLine}>
            CIVIL REGISTRATION TRACKER • OFFICIAL GOVERNMENT PORTAL
          </Text>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.pageTitle}>Officer Login</Text>
          <Text style={styles.description}>
            Enter your official credentials to access birth, marriage, and death
            records, track applications, and manage civil registration workflows.
          </Text>

          <Text style={styles.label}>Government Username</Text>
          <TextInput
            value={username}
            onChangeText={(value) => {
              setUsername(value);
              clearErrors();
            }}
            placeholder="Enter your government username (e.g. j.perera)"
            placeholderTextColor={COLORS.MUTED_TEXT}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            accessibilityLabel="Government Username"
          />

          <Text style={styles.label}>Service No</Text>
          <TextInput
            value={serviceNumber}
            onChangeText={(value) => {
              setServiceNumber(value.replace(/\n/g, ""));
              clearErrors();
            }}
            placeholder="ENTER YOUR OFFICIAL SERVICE NUMBER (E.G. AG-884210)"
            placeholderTextColor={COLORS.MUTED_TEXT}
            autoCapitalize="characters"
            autoCorrect={false}
            multiline
            style={styles.serviceInput}
            accessibilityLabel="Service No"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                clearErrors();
              }}
              placeholder="Enter your secure password"
              placeholderTextColor={COLORS.MUTED_TEXT}
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.passwordInput}
              accessibilityLabel="Password"
            />
            <Pressable
              onPress={() => setIsPasswordVisible((current) => !current)}
              style={styles.eyeButton}
              accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={COLORS.MUTED_TEXT}
              />
            </Pressable>
          </View>

          {errors.length > 0 ? (
            <View style={styles.errorBox}>
              {errors.map((message) => (
                <Text key={message} style={styles.errorText}>
                  {message}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={styles.helpRow}>
            <Ionicons name="information-circle" size={18} color={COLORS.ACCENT_YELLOW} />
            <Text style={styles.helpText}>
              Need credential assistance? Contact the Civil Registration Help Desk.
            </Text>
          </View>

          <Pressable
            style={[styles.loginButton, isSubmitting && styles.loginButtonBusy]}
            onPress={handleLogin}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Sign in to tracker"
          >
            <Text style={styles.loginButtonText}>
              {isSubmitting ? "Signing in..." : "Sign In to Tracker →"}
            </Text>
          </Pressable>

          <View style={styles.noticeCard}>
            <View style={styles.noticeHeading}>
              <View style={styles.noticeIcon}>
                <Ionicons name="business" size={16} color={COLORS.PRIMARY_NAVY} />
              </View>
              <Text style={styles.noticeTitle}>Official Access Notice & Legal Warning</Text>
            </View>
            <Text style={styles.republic}>DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Account Registration Protocol</Text>
            <Text style={styles.infoBody}>
              Accounts cannot be created online. If you do not have an official
              account, please report to the Divisional Secretariat or AG Office in
              your district with your official service identification.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Statutory Computer Crimes Warning</Text>
            <Text style={styles.infoBody}>
              Unauthorized access or attempted unauthorized entry into this system
              is strictly prohibited under the Computer Crimes Act No. 24 of 2007
              of Sri Lanka. Violators will face immediate revocation of credentials,
              administrative action, and criminal prosecution by courts in Sri Lanka.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  headerSafe: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 8,
  },
  brandName: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "700",
    flexShrink: 1,
  },
  portalLine: {
    marginTop: 10,
    color: COLORS.ACCENT_YELLOW,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 32,
  },
  pageTitle: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 28,
    fontWeight: "700",
  },
  description: {
    marginTop: 8,
    color: COLORS.MUTED_TEXT,
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    marginTop: 18,
    marginBottom: 8,
    color: COLORS.DARK_TEXT,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 8,
    paddingHorizontal: 14,
    color: COLORS.DARK_TEXT,
    backgroundColor: COLORS.WHITE,
    fontSize: 14,
  },
  serviceInput: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: COLORS.DARK_TEXT,
    backgroundColor: COLORS.WHITE,
    fontSize: 14,
    textAlignVertical: "top",
  },
  passwordRow: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
  },
  passwordInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    color: COLORS.DARK_TEXT,
    fontSize: 14,
  },
  eyeButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    marginTop: 14,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  errorText: {
    color: COLORS.DARK_TEXT,
    fontSize: 14,
    lineHeight: 20,
  },
  helpRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  helpText: {
    flex: 1,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  loginButton: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonBusy: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "700",
  },
  noticeCard: {
    marginTop: 22,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
  },
  noticeHeading: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  noticeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeTitle: {
    flex: 1,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  republic: {
    marginTop: 10,
    marginLeft: 38,
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  infoCard: {
    marginTop: 12,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
  },
  infoTitle: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  infoBody: {
    color: COLORS.DARK_TEXT,
    fontSize: 14,
    lineHeight: 21,
  },
});
