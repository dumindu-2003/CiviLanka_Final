import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { DEATH_GENDERS, DEATH_RELATIONSHIPS, validateDeathReport } from "../constants/deathReportOptions";
import { updateDeathReport } from "../services/api";

const STATUS_OPTIONS = [
  { key: "open", label: "Open" },
  { key: "approved", label: "Approved" },
];

function formFromReport(report) {
  return {
    fullName: report?.fullName || "",
    nic: report?.nic || "",
    dateOfDeath: report?.dateOfDeath || "",
    placeOfDeath: report?.placeOfDeath || "",
    gender: report?.gender || "Male",
    age: report?.age === 0 || report?.age ? String(report.age) : "",
    informantName: report?.informantName || "",
    informantNic: report?.informantNic || "",
    relationship: report?.relationship || "",
    informantPhone: report?.informantPhone || "",
    division: report?.division || "",
  };
}

export default function DistrictDeathReportDetailScreen({ navigation, route }) {
  const [report, setReport] = useState(route.params?.report || null);
  const [form, setForm] = useState(() => formFromReport(route.params?.report));
  const [status, setStatus] = useState(route.params?.report?.statusCode || "open");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setNotice("");
  }

  async function saveApplication() {
    if (!report?.id || isSaving) {
      return;
    }
    const nextErrors = validateDeathReport(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setNotice("Check the highlighted fields.");
      return;
    }

    setIsSaving(true);
    setNotice("");
    try {
      const updated = await updateDeathReport(report.id, {
        ...form,
        nic: form.nic.replace(/\s/g, "").toUpperCase(),
        informantNic: form.informantNic.replace(/\s/g, "").toUpperCase(),
        informantPhone: form.informantPhone.replace(/[\s-]/g, ""),
        age: form.age.trim(),
        status,
      });
      setReport(updated);
      setForm(formFromReport(updated));
      setStatus(updated.statusCode);
      setNotice("Death application updated.");
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
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>Death Application</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {report ? (
          <>
            <View style={styles.card}>
              <Text style={styles.reference}>{report.reportReference}</Text>
              <Text style={styles.sectionTitle}>Application details</Text>
              <Field label="DECEASED FULL NAME" value={form.fullName} error={errors.fullName} onChangeText={(value) => updateField("fullName", value)} />
              <Field label="DECEASED NIC" value={form.nic} error={errors.nic} onChangeText={(value) => updateField("nic", value.toUpperCase())} />
              <Field label="DATE OF DEATH (DD/MM/YYYY)" value={form.dateOfDeath} error={errors.dateOfDeath} onChangeText={(value) => updateField("dateOfDeath", value)} />
              <Field label="PLACE OF DEATH" value={form.placeOfDeath} error={errors.placeOfDeath} onChangeText={(value) => updateField("placeOfDeath", value)} />
              <ChoiceField label="GENDER" options={DEATH_GENDERS} value={form.gender} onChange={(value) => updateField("gender", value)} />
              <Field label="AGE" value={form.age} error={errors.age} keyboardType="number-pad" onChangeText={(value) => updateField("age", value.replace(/\D/g, "").slice(0, 3))} />
              <Field label="INFORMANT FULL NAME" value={form.informantName} error={errors.informantName} onChangeText={(value) => updateField("informantName", value)} />
              <Field label="INFORMANT NIC" value={form.informantNic} error={errors.informantNic} onChangeText={(value) => updateField("informantNic", value.toUpperCase())} />
              <ChoiceField label="RELATIONSHIP" options={DEATH_RELATIONSHIPS} value={form.relationship} onChange={(value) => updateField("relationship", value)} />
              <Field label="INFORMANT PHONE" value={form.informantPhone} error={errors.informantPhone} keyboardType="phone-pad" onChangeText={(value) => updateField("informantPhone", value)} />
              <Field label="DIVISION" value={form.division} error={errors.division} onChangeText={(value) => updateField("division", value)} />
              <Text style={styles.sectionTitle}>Application status</Text>
              <View style={styles.choices}>
                {STATUS_OPTIONS.map((option) => (
                  <Pressable
                    key={option.key}
                    style={[styles.choice, status === option.key && styles.choiceActive]}
                    onPress={() => {
                      setStatus(option.key);
                      setNotice("");
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: status === option.key }}
                  >
                    <Text style={[styles.choiceText, status === option.key && styles.choiceTextActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {notice ? <Text style={styles.notice}>{notice}</Text> : null}
              <Pressable style={styles.saveButton} onPress={saveApplication} disabled={isSaving}>
                <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save application"}</Text>
              </Pressable>
              <Text style={styles.submitted}>Submitted: {formatSubmitted(report.submittedAt)}</Text>
              <Text style={styles.submitted}>Village officer: {report.officerName || "—"}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.notice}>This death application could not be found.</Text>
        )}
      </ScrollView>
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
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function ChoiceField({ label, options, value, onChange }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choices}>
        {options.map((option) => (
          <Pressable
            key={option}
            style={[styles.choice, value === option && styles.choiceActive]}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: value === option }}
          >
            <Text style={[styles.choiceText, value === option && styles.choiceTextActive]}>{option}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function formatSubmitted(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.BACKGROUND },
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
  headerTitle: { flex: 1, textAlign: "center", color: COLORS.WHITE, fontSize: 18, fontWeight: "700" },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 16,
  },
  reference: { color: COLORS.PRIMARY_NAVY, fontSize: 16, fontWeight: "700" },
  sectionTitle: { marginTop: 18, color: COLORS.PRIMARY_NAVY, fontSize: 16, fontWeight: "700" },
  label: { marginTop: 12, marginBottom: 6, color: COLORS.MUTED_TEXT, fontSize: 11, fontWeight: "700" },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 10,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 12,
    color: COLORS.DARK_TEXT,
    fontSize: 15,
  },
  inputError: { borderColor: COLORS.PRIMARY_NAVY },
  error: { marginTop: 4, color: COLORS.PRIMARY_NAVY, fontSize: 12 },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  choice: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 9,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceActive: { backgroundColor: COLORS.PRIMARY_NAVY, borderColor: COLORS.PRIMARY_NAVY },
  choiceText: { color: COLORS.PRIMARY_NAVY, fontSize: 13, fontWeight: "700" },
  choiceTextActive: { color: COLORS.WHITE },
  notice: { marginTop: 12, color: COLORS.PRIMARY_NAVY, fontSize: 14, fontWeight: "600" },
  saveButton: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: { color: COLORS.WHITE, fontSize: 15, fontWeight: "700" },
  submitted: { marginTop: 10, color: COLORS.MUTED_TEXT, fontSize: 12 },
});
