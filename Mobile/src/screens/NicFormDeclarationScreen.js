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
import { authorizeNicForm } from "../services/api";
import { clearNicDraft } from "../services/nicFormDraft";

export default function NicFormDeclarationScreen({ navigation, route }) {
  const application = route.params?.form;
  const [username, setUsername] = useState("");
  const [serviceNumber, setServiceNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(setter, field, value) {
    setter(value);
    setErrors((current) => ({ ...current, [field]: "" }));
    setNotice("");
  }

  async function handleAuthorize() {
    const nextErrors = {};
    const usernameValue = username.trim();
    const serviceValue = serviceNumber.trim().toUpperCase();

    if (!/^[a-zA-Z]+(\.[a-zA-Z]+)+$/.test(usernameValue)) {
      nextErrors.username = "Enter a valid officer username.";
    }
    if (!/^[A-Za-z]{2,}-\d{3,}$/.test(serviceValue)) {
      nextErrors.serviceNumber = "Enter a valid service number.";
    }
    if (password.trim().length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    if (!application?.id) {
      setNotice("Save the application before authorizing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const receipt = await authorizeNicForm(application.id, {
        username: usernameValue,
        serviceNumber: serviceValue,
        password: password.trim(),
      });
      clearNicDraft();
      navigation.replace("NicFormReceipt", { receipt });
    } catch (error) {
      if (error.fields) {
        setErrors(error.fields);
      }
      setNotice(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.headerBack}
            accessibilityLabel="Back to documents"
          >
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>Review And Declaration</Text>
          <View style={styles.headerBack} />
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.stepLabel}>STEP 4 OF 4: OFFICER AUTHORIZATION</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>Application Summary</Text>
            <Text style={styles.summaryRef}>{application?.fullName || "NIC Application"}</Text>
          </View>

          {notice ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          <View style={styles.verifyCard}>
            <View style={styles.verifyIcon}>
              <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.PRIMARY_NAVY} />
            </View>
            <Text style={styles.verifyTitle}>Authorizing Officer Verification</Text>
            <Text style={styles.verifyBody}>
              Enter officer credentials to authorize and route this application to the District
              Registrar Dashboard for pending review.
            </Text>
          </View>

          <Text style={styles.label}>OFFICER USERNAME</Text>
          <TextInput
            value={username}
            onChangeText={(value) => update(setUsername, "username", value)}
            placeholder="v.perera"
            placeholderTextColor={COLORS.MUTED_TEXT}
            autoCapitalize="none"
            style={[styles.input, errors.username && styles.inputError]}
          />
          <FieldError message={errors.username} />

          <Text style={styles.label}>SERVICE NO / CADRE NO</Text>
          <TextInput
            value={serviceNumber}
            onChangeText={(value) => update(setServiceNumber, "serviceNumber", value)}
            placeholder="e.g. VO-100101"
            placeholderTextColor={COLORS.MUTED_TEXT}
            autoCapitalize="characters"
            style={[styles.input, errors.serviceNumber && styles.inputError]}
          />
          <FieldError message={errors.serviceNumber} />

          <View style={styles.passwordLabelRow}>
            <Text style={styles.labelInline}>OFFICER PASSWORD / PIN</Text>
            <Text style={styles.minNote}>Min 6 characters</Text>
          </View>
          <View style={[styles.passwordRow, errors.password && styles.inputError]}>
            <TextInput
              value={password}
              onChangeText={(value) => update(setPassword, "password", value)}
              placeholder="Enter password"
              placeholderTextColor={COLORS.MUTED_TEXT}
              secureTextEntry={!isPasswordVisible}
              style={styles.passwordInput}
            />
            <Pressable
              onPress={() => setIsPasswordVisible((current) => !current)}
              accessibilityLabel="Show password"
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={COLORS.MUTED_TEXT}
              />
            </Pressable>
          </View>
          <FieldError message={errors.password} />

          <Pressable
            style={[styles.primaryButton, isSubmitting && styles.buttonBusy]}
            onPress={handleAuthorize}
            disabled={isSubmitting}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "SUBMITTING..." : "AUTHORIZE & SUBMIT"}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.WHITE} />
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel & Return to Form</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function FieldError({ message }) {
  if (!message) {
    return null;
  }
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  flex: { flex: 1 },
  header: { backgroundColor: COLORS.PRIMARY_NAVY },
  headerSafe: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  headerBack: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: COLORS.WHITE, fontSize: 17, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  stepLabel: { color: COLORS.MUTED_TEXT, fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  summaryRow: {
    marginTop: 14,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  summaryTitle: { color: COLORS.PRIMARY_NAVY, fontSize: 16, fontWeight: "700" },
  summaryRef: { flex: 1, textAlign: "right", color: COLORS.MUTED_TEXT, fontSize: 12, fontWeight: "700" },
  notice: {
    marginBottom: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 12,
  },
  noticeText: { color: COLORS.PRIMARY_NAVY, fontSize: 14, fontWeight: "700" },
  verifyCard: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderRadius: 14,
    padding: 16,
  },
  verifyIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyTitle: { marginTop: 10, color: COLORS.WHITE, fontSize: 16, fontWeight: "700" },
  verifyBody: { marginTop: 6, color: COLORS.WHITE, fontSize: 13, lineHeight: 18 },
  label: {
    marginTop: 16,
    marginBottom: 6,
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  passwordLabelRow: {
    marginTop: 16,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelInline: { color: COLORS.MUTED_TEXT, fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  minNote: { color: COLORS.MUTED_TEXT, fontSize: 11 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 10,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 12,
    color: COLORS.DARK_TEXT,
    fontSize: 15,
  },
  passwordRow: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 10,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: { flex: 1, minHeight: 46, color: COLORS.DARK_TEXT, fontSize: 15 },
  inputError: { borderColor: COLORS.PRIMARY_NAVY },
  error: { marginTop: 4, color: COLORS.PRIMARY_NAVY, fontSize: 12, fontWeight: "600" },
  primaryButton: {
    marginTop: 18,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonBusy: { opacity: 0.7 },
  primaryButtonText: { color: COLORS.WHITE, fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
  cancelButton: {
    marginTop: 10,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    backgroundColor: COLORS.WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: COLORS.PRIMARY_NAVY, fontSize: 14, fontWeight: "700" },
});
