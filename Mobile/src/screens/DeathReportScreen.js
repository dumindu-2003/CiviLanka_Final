import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
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
import {
  DEATH_GENDERS,
  DEATH_RELATIONSHIPS,
  validateDeathReport,
} from "../constants/deathReportOptions";
import { submitDeathReport } from "../services/api";

const EMPTY_FORM = {
  fullName: "",
  nic: "",
  dateOfDeath: "",
  placeOfDeath: "",
  gender: "Male",
  age: "",
  informantName: "",
  informantNic: "",
  relationship: "",
  informantPhone: "",
  division: "",
};

function dateFromForm(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value || "");
  if (!match) {
    return new Date();
  }
  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function formFromReport(report) {
  return {
    fullName: report.fullName || "",
    nic: report.nic || "",
    dateOfDeath: report.dateOfDeath || "",
    placeOfDeath: report.placeOfDeath || "",
    gender: report.gender || "Male",
    age: report.age === 0 || report.age ? String(report.age) : "",
    informantName: report.informantName || "",
    informantNic: report.informantNic || "",
    relationship: report.relationship || "",
    informantPhone: report.informantPhone || "",
    division: report.division || "",
  };
}

export default function DeathReportScreen({ navigation, route }) {
  const existing = route.params?.report?.id ? route.params.report : null;
  const isLocked = Boolean(existing);
  const [form, setForm] = useState(() => (existing ? formFromReport(existing) : EMPTY_FORM));
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRelationshipOpen, setIsRelationshipOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const report = route.params?.report?.id ? route.params.report : null;
    setForm(report ? formFromReport(report) : EMPTY_FORM);
    setErrors({});
    setNotice("");
  }, [route.params?.fresh, route.params?.report]);

  function updateField(field, value) {
    if (isLocked) {
      return;
    }
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setNotice("");
  }

  function onDateChange(event, selected) {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
    if (event?.type === "dismissed" || !selected) {
      return;
    }
    updateField("dateOfDeath", formatDate(selected));
  }

  async function handleSubmit() {
    if (isLocked) {
      return;
    }
    const nextErrors = validateDeathReport(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setNotice("Check the highlighted fields.");
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        nic: form.nic.replace(/\s/g, "").toUpperCase(),
        informantNic: form.informantNic.replace(/\s/g, "").toUpperCase(),
        informantPhone: form.informantPhone.replace(/[\s-]/g, ""),
        age: form.age.trim(),
      };
      const report = await submitDeathReport(payload);
      navigation.replace("DeathReportSent", { report });
    } catch (error) {
      if (error.fields) {
        setErrors(error.fields);
      }
      setNotice(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {isLocked ? "Death Application" : "Create Death Application"}
          </Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <Text style={styles.hint}>
            {isLocked
              ? "Village officers can view submitted applications here. Only the District Registrar can update application details and status."
              : "Create a death application to send it to the District Registrar for review."}
          </Text>

          <View pointerEvents={isLocked ? "none" : "auto"}>
          <Text style={styles.sectionTitle}>Deceased person</Text>
          <Field
            label="FULL NAME"
            value={form.fullName}
            error={errors.fullName}
            onChangeText={(value) => updateField("fullName", value)}
            placeholder="Enter the full name"
          />
          <Field
            label="NIC NUMBER"
            value={form.nic}
            error={errors.nic}
            onChangeText={(value) => updateField("nic", value.toUpperCase())}
            placeholder="Optional"
            autoCapitalize="characters"
          />

          <Text style={styles.label}>DATE OF DEATH</Text>
          <Pressable
            style={[styles.inputRow, errors.dateOfDeath && styles.inputError]}
            onPress={() => setShowDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel="Select date of death"
          >
            <Text style={form.dateOfDeath ? styles.selectValue : styles.selectPlaceholder}>
              {form.dateOfDeath || "DD/MM/YYYY"}
            </Text>
            <Ionicons name="calendar-outline" size={18} color={COLORS.MUTED_TEXT} />
          </Pressable>
          {showDatePicker ? (
            <View>
              <DateTimePicker
                value={dateFromForm(form.dateOfDeath)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                onChange={onDateChange}
              />
              {Platform.OS === "ios" ? (
                <Pressable onPress={() => setShowDatePicker(false)} style={styles.dateDone}>
                  <Text style={styles.dateDoneText}>Done</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          <FieldError message={errors.dateOfDeath} />

          <Field
            label="PLACE OF DEATH"
            value={form.placeOfDeath}
            error={errors.placeOfDeath}
            onChangeText={(value) => updateField("placeOfDeath", value)}
            placeholder="Enter the place"
          />

          <Text style={styles.label}>GENDER</Text>
          <View style={styles.genderRow}>
            {DEATH_GENDERS.map((option) => {
              const selected = form.gender === option;
              return (
                <Pressable
                  key={option}
                  style={styles.genderOption}
                  onPress={() => updateField("gender", option)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <Ionicons
                    name={selected ? "radio-button-on" : "radio-button-off"}
                    size={18}
                    color={COLORS.PRIMARY_NAVY}
                  />
                  <Text style={styles.genderText}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
          <FieldError message={errors.gender} />

          <Field
            label="AGE"
            value={form.age}
            error={errors.age}
            onChangeText={(value) => updateField("age", value.replace(/\D/g, "").slice(0, 3))}
            placeholder="Enter the age"
            keyboardType="number-pad"
          />

          <Text style={styles.sectionTitle}>Person reporting the death</Text>
          <Field
            label="INFORMANT FULL NAME"
            value={form.informantName}
            error={errors.informantName}
            onChangeText={(value) => updateField("informantName", value)}
            placeholder="Enter the informant's name"
          />
          <Field
            label="INFORMANT NIC"
            value={form.informantNic}
            error={errors.informantNic}
            onChangeText={(value) => updateField("informantNic", value.toUpperCase())}
            placeholder="NIC number"
            autoCapitalize="characters"
          />

          <Text style={styles.label}>RELATIONSHIP</Text>
          <Pressable
            style={[styles.inputRow, errors.relationship && styles.inputError]}
            onPress={() => setIsRelationshipOpen(true)}
            accessibilityRole="button"
          >
            <Text style={form.relationship ? styles.selectValue : styles.selectPlaceholder}>
              {form.relationship || "Select a relationship"}
            </Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.MUTED_TEXT} />
          </Pressable>
          <FieldError message={errors.relationship} />

          <Field
            label="PHONE"
            value={form.informantPhone}
            error={errors.informantPhone}
            onChangeText={(value) => updateField("informantPhone", value)}
            placeholder="0771234567"
            keyboardType="phone-pad"
          />
          <Field
            label="DIVISION"
            value={form.division}
            error={errors.division}
            onChangeText={(value) => updateField("division", value)}
            placeholder="Grama Niladhari division"
          />
          </View>

          {isLocked ? null : (
          <Pressable
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSaving}
            accessibilityRole="button"
          >
            <Text style={styles.submitText}>
              {isSaving ? "Submitting..." : "Send to District Registrar"}
            </Text>
          </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={isRelationshipOpen} transparent animationType="fade" onRequestClose={() => setIsRelationshipOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setIsRelationshipOpen(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select a relationship</Text>
            {DEATH_RELATIONSHIPS.map((option) => (
              <Pressable
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  updateField("relationship", option);
                  setIsRelationshipOpen(false);
                }}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function Field({ label, error, ...inputProps }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={COLORS.MUTED_TEXT}
        style={[styles.input, error && styles.inputError]}
        {...inputProps}
      />
      <FieldError message={error} />
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
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  headerSafe: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  headerAccent: {
    height: 4,
    backgroundColor: COLORS.ACCENT_YELLOW,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  hint: {
    color: COLORS.MUTED_TEXT,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 4,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 16,
    fontWeight: "700",
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
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
  inputRow: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 10,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputError: {
    borderColor: COLORS.PRIMARY_NAVY,
  },
  selectValue: {
    flex: 1,
    color: COLORS.DARK_TEXT,
    fontSize: 15,
  },
  selectPlaceholder: {
    flex: 1,
    color: COLORS.MUTED_TEXT,
    fontSize: 15,
  },
  dateDone: {
    alignSelf: "flex-end",
    paddingVertical: 8,
  },
  dateDoneText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  genderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  genderText: {
    color: COLORS.DARK_TEXT,
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    marginTop: 4,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 12,
    fontWeight: "600",
  },
  notice: {
    marginBottom: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_NAVY,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  submitButton: {
    marginTop: 18,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 31, 68, 0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 28,
  },
  modalTitle: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalOption: {
    minHeight: 44,
    justifyContent: "center",
  },
  modalOptionText: {
    color: COLORS.DARK_TEXT,
    fontSize: 15,
  },
});
