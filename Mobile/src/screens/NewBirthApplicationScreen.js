import { useMemo, useState } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { createBirthApplication } from "../services/api";

const EMPTY_FORM = {
  fatherName: "",
  motherName: "",
  address: "",
  gender: "",
  birthName: "",
  birthDate: "",
  birthTime: "",
  hospitalName: "",
};

function dateFromForm(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value || "");
  if (!match) {
    return new Date();
  }
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}

function formatDate(date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;
}

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function timeFromForm(value) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value || "");
  const date = new Date();
  if (match) {
    date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  }
  return date;
}

export default function NewBirthApplicationScreen({ navigation }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const today = useMemo(() => new Date(), []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setNotice("");
  }

  function validateStepOne() {
    const nextErrors = {};
    ["fatherName", "motherName", "address"].forEach((field) => {
      if (form[field].trim().length < 2) {
        nextErrors[field] = "This field is required.";
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setNotice("Complete the required parent and address details.");
      return false;
    }
    setNotice("");
    return true;
  }

  function validateForm() {
    const nextErrors = {};
    ["birthName", "hospitalName"].forEach((field) => {
      if (form[field].trim().length < 2) {
        nextErrors[field] = "This field is required.";
      }
    });
    if (!form.gender) {
      nextErrors.gender = "Select a gender.";
    }
    if (!form.birthDate) {
      nextErrors.birthDate = "Select the date of birth.";
    }
    if (!form.birthTime) {
      nextErrors.birthTime = "Select the time of birth.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setNotice("Complete the required birth details.");
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    setIsSaving(true);
    setNotice("");
    try {
      await createBirthApplication(form);
      navigation.goBack();
    } catch (error) {
      if (error.fields) {
        setErrors(error.fields);
      }
      setNotice(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  function onDateChange(event, selectedDate) {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
    if (event?.type !== "dismissed" && selectedDate) {
      updateField("birthDate", formatDate(selectedDate));
    }
  }

  function onTimeChange(event, selectedTime) {
    if (Platform.OS !== "ios") {
      setShowTimePicker(false);
    }
    if (event?.type !== "dismissed" && selectedTime) {
      updateField("birthTime", formatTime(selectedTime));
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>New Birth Application</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepCard}>
            <Text style={styles.stepLabel}>STEP {step} OF 2</Text>
            <Text style={styles.title}>
              {step === 1 ? "Parent and address details" : "Child birth details"}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progress, step === 2 && styles.progressComplete]} />
            </View>
          </View>

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

          {step === 1 ? (
            <View style={styles.card}>
              <Field
                label="FATHER'S NAME"
                value={form.fatherName}
                error={errors.fatherName}
                onChangeText={(value) => updateField("fatherName", value)}
                placeholder="Enter father's full name"
              />
              <Field
                label="MOTHER'S NAME"
                value={form.motherName}
                error={errors.motherName}
                onChangeText={(value) => updateField("motherName", value)}
                placeholder="Enter mother's full name"
              />
              <Field
                label="HOME ADDRESS"
                value={form.address}
                error={errors.address}
                onChangeText={(value) => updateField("address", value)}
                placeholder="Enter the family address"
                multiline
              />
              <Pressable style={styles.primaryButton} onPress={() => validateStepOne() && setStep(2)}>
                <Text style={styles.primaryButtonText}>Next</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.WHITE} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.card}>
              <Field
                label="BIRTH NAME"
                value={form.birthName}
                error={errors.birthName}
                onChangeText={(value) => updateField("birthName", value)}
                placeholder="Enter the child's full name"
              />

              <Text style={styles.label}>GENDER</Text>
              <View style={styles.choiceRow}>
                {["Male", "Female", "Other"].map((gender) => (
                  <Pressable
                    key={gender}
                    style={[styles.choice, form.gender === gender && styles.choiceSelected]}
                    onPress={() => updateField("gender", gender)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: form.gender === gender }}
                  >
                    <Text style={[styles.choiceText, form.gender === gender && styles.choiceTextSelected]}>
                      {gender}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errors.gender ? <Text style={styles.fieldError}>{errors.gender}</Text> : null}

              <Text style={styles.label}>DATE OF BIRTH</Text>
              <Pressable
                style={[styles.pickerButton, errors.birthDate && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
                accessibilityRole="button"
              >
                <Text style={form.birthDate ? styles.pickerText : styles.placeholder}>
                  {form.birthDate || "Select date"}
                </Text>
                <Ionicons name="calendar-outline" size={18} color={COLORS.MUTED_TEXT} />
              </Pressable>
              {errors.birthDate ? <Text style={styles.fieldError}>{errors.birthDate}</Text> : null}
              {showDatePicker ? (
                <View>
                  <DateTimePicker
                    value={dateFromForm(form.birthDate)}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    minimumDate={new Date(1900, 0, 1)}
                    maximumDate={today}
                    onChange={onDateChange}
                  />
                  {Platform.OS === "ios" ? (
                    <Pressable style={styles.pickerDone} onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.pickerDoneText}>Done</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              <Text style={styles.label}>TIME OF BIRTH</Text>
              <Pressable
                style={[styles.pickerButton, errors.birthTime && styles.inputError]}
                onPress={() => setShowTimePicker(true)}
                accessibilityRole="button"
              >
                <Text style={form.birthTime ? styles.pickerText : styles.placeholder}>
                  {form.birthTime || "Select time"}
                </Text>
                <Ionicons name="time-outline" size={18} color={COLORS.MUTED_TEXT} />
              </Pressable>
              {errors.birthTime ? <Text style={styles.fieldError}>{errors.birthTime}</Text> : null}
              {showTimePicker ? (
                <View>
                  <DateTimePicker
                    value={timeFromForm(form.birthTime)}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onTimeChange}
                  />
                  {Platform.OS === "ios" ? (
                    <Pressable style={styles.pickerDone} onPress={() => setShowTimePicker(false)}>
                      <Text style={styles.pickerDoneText}>Done</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              <Field
                label="BIRTH HOSPITAL"
                value={form.hospitalName}
                error={errors.hospitalName}
                onChangeText={(value) => updateField("hospitalName", value)}
                placeholder="Enter hospital name"
              />
              <View style={styles.actions}>
                <Pressable style={styles.secondaryButton} onPress={() => setStep(1)}>
                  <Ionicons name="arrow-back" size={18} color={COLORS.PRIMARY_NAVY} />
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </Pressable>
                <Pressable
                  style={[styles.primaryButton, styles.submitButton, isSaving && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={isSaving}
                >
                  <Text style={styles.primaryButtonText}>{isSaving ? "Saving..." : "Create application"}</Text>
                  {!isSaving ? <Ionicons name="checkmark" size={18} color={COLORS.WHITE} /> : null}
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, value, error, onChangeText, placeholder, multiline = false }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.MUTED_TEXT}
        style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        autoCapitalize="words"
        accessibilityLabel={label}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
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
  headerAccent: { height: 4, backgroundColor: COLORS.ACCENT_YELLOW },
  backButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: COLORS.WHITE,
    fontSize: 17,
    fontWeight: "700",
  },
  content: { padding: 16, paddingBottom: 32 },
  stepCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 16,
    marginBottom: 12,
  },
  stepLabel: { color: COLORS.MUTED_TEXT, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  title: { marginTop: 5, color: COLORS.PRIMARY_NAVY, fontSize: 19, fontWeight: "700" },
  progressTrack: { marginTop: 14, height: 5, backgroundColor: COLORS.BACKGROUND, borderRadius: 4 },
  progress: { width: "50%", height: 5, backgroundColor: COLORS.ACCENT_YELLOW, borderRadius: 4 },
  progressComplete: { width: "100%" },
  notice: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFF4D6",
    color: COLORS.PRIMARY_NAVY,
    fontSize: 13,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 16,
  },
  fieldWrap: { marginBottom: 14 },
  label: { marginBottom: 7, color: COLORS.PRIMARY_NAVY, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: COLORS.DARK_TEXT,
    backgroundColor: COLORS.WHITE,
    fontSize: 15,
  },
  multiline: { minHeight: 88, paddingTop: 12 },
  inputError: { borderColor: "#B42318" },
  fieldError: { marginTop: 5, color: "#B42318", fontSize: 12 },
  choiceRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  choice: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceSelected: { borderColor: COLORS.PRIMARY_NAVY, backgroundColor: COLORS.PRIMARY_NAVY },
  choiceText: { color: COLORS.PRIMARY_NAVY, fontSize: 13, fontWeight: "600" },
  choiceTextSelected: { color: COLORS.WHITE },
  pickerButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  pickerText: { color: COLORS.DARK_TEXT, fontSize: 15 },
  placeholder: { color: COLORS.MUTED_TEXT, fontSize: 15 },
  pickerDone: { alignSelf: "flex-end", paddingVertical: 8, paddingHorizontal: 10 },
  pickerDoneText: { color: COLORS.PRIMARY_NAVY, fontSize: 14, fontWeight: "700" },
  primaryButton: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_NAVY,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: { color: COLORS.WHITE, fontSize: 14, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secondaryButtonText: { color: COLORS.PRIMARY_NAVY, fontSize: 14, fontWeight: "700" },
  submitButton: { flex: 1 },
  disabledButton: { opacity: 0.6 },
});
