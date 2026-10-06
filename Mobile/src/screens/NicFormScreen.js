import { useCallback, useEffect, useRef, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import {
  NIC_DISTRICTS,
  NIC_GENDERS,
  NIC_RELIGIONS,
  validatePersonalDetails,
} from "../constants/nicFormOptions";
import { saveNicForm } from "../services/api";
import { beginFreshDraft, readNicDraft, saveNicFormId, savePersonalDraft } from "../services/nicFormDraft";

const EMPTY_FORM = {
  fullName: "",
  dateOfBirth: "",
  gender: "Male",
  placeOfBirth: "",
  district: "",
  religion: "",
  occupation: "",
};

function dateFromForm(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value || "");
  if (!match) {
    return new Date(2000, 0, 1);
  }
  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  if (Number.isNaN(date.getTime())) {
    return new Date(2000, 0, 1);
  }
  return date;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export default function NicFormScreen({ navigation, route }) {
  const [form, setForm] = useState(() => {
    const draft = readNicDraft();
    if (route.params?.fresh && draft.handledFresh !== route.params.fresh) {
      return EMPTY_FORM;
    }
    return draft.personal || EMPTY_FORM;
  });
  const [errors, setErrors] = useState({});
  const [nicFormId, setNicFormId] = useState(
    () => route.params?.nicFormId || readNicDraft().nicFormId || ""
  );
  const [picker, setPicker] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const formRef = useRef(form);
  formRef.current = form;

  useEffect(() => {
    if (!route.params?.fresh) {
      return;
    }
    if (!beginFreshDraft(route.params.fresh)) {
      return;
    }
    setForm(EMPTY_FORM);
    setErrors({});
    setNicFormId("");
    setNotice("");
  }, [route.params?.fresh]);

  useFocusEffect(
    useCallback(() => {
      const draft = readNicDraft();
      if (draft.personal) {
        setForm(draft.personal);
      }
      const id = route.params?.nicFormId || draft.nicFormId;
      if (id) {
        setNicFormId(id);
      }
    }, [route.params?.nicFormId])
  );

  useEffect(() => {
    if (!notice) {
      return undefined;
    }
    const timer = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  function updateField(field, value) {
    const next = { ...formRef.current, [field]: value };
    formRef.current = next;
    savePersonalDraft(next);
    setForm(next);
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
    updateField("dateOfBirth", formatDate(selected));
  }

  async function handleSave() {
    const nextErrors = validatePersonalDetails(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveNicForm({
        id: nicFormId || undefined,
        ...form,
        includeContact: false,
      });
      setNicFormId(saved.id);
      saveNicFormId(saved.id);
      savePersonalDraft(form);
      setNotice("Saved successfully!");
    } catch (error) {
      if (error.fields) {
        setErrors(error.fields);
      }
      setNotice(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleContinue() {
    const nextErrors = validatePersonalDetails(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    savePersonalDraft(form);
    saveNicFormId(nicFormId);
    navigation.navigate("NicFormContact", {
      nicFormId,
      personal: form,
      contact: route.params?.contactDraft || readNicDraft().contact,
    });
  }

  const pickerOptions = picker === "district" ? NIC_DISTRICTS : NIC_RELIGIONS;
  const pickerTitle = picker === "district" ? "Select your district" : "Select your religion";

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.headerBack}
            accessibilityLabel="Back to dashboard"
          >
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>NIC Form</Text>
          <View style={styles.headerBack} />
        </SafeAreaView>
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
          <Text style={styles.stepLabel}>STEP 1 OF 4: PERSONAL DETAILS</Text>
          <View style={styles.progressRow}>
            <View style={[styles.progressBar, styles.progressOn]} />
            <View style={styles.progressBar} />
            <View style={styles.progressBar} />
            <View style={styles.progressBar} />
          </View>

          {notice ? (
            <View style={styles.notice}>
              <Ionicons
                name={notice === "Saved successfully!" ? "checkmark-circle" : "alert-circle-outline"}
                size={18}
                color={COLORS.PRIMARY_NAVY}
              />
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="id-card-outline" size={16} color={COLORS.PRIMARY_NAVY} />
            </View>
            <Text style={styles.sectionTitle}>1. Applicant's Personal Details</Text>
          </View>
          <Text style={styles.sectionHint}>
            Ensure details match your civil register documents exactly.
          </Text>

          <Text style={styles.label}>FULL NAME</Text>
          <TextInput
            value={form.fullName}
            onChangeText={(value) => updateField("fullName", value)}
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.MUTED_TEXT}
            style={[styles.input, errors.fullName && styles.inputError]}
          />
          <FieldError message={errors.fullName} />

          <Text style={styles.label}>DATE OF BIRTH</Text>
          <Pressable
            style={[styles.inputRow, errors.dateOfBirth && styles.inputError]}
            onPress={() => setShowDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel="Select date of birth"
          >
            <Text style={form.dateOfBirth ? styles.selectValue : styles.selectPlaceholder}>
              {form.dateOfBirth || "DD/MM/YYYY"}
            </Text>
            <Ionicons name="calendar-outline" size={18} color={COLORS.MUTED_TEXT} />
          </Pressable>
          {showDatePicker ? (
            <View>
              <DateTimePicker
                value={dateFromForm(form.dateOfBirth)}
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
          <FieldError message={errors.dateOfBirth} />

          <Text style={styles.label}>GENDER</Text>
          <View style={styles.genderRow}>
            {NIC_GENDERS.map((option) => {
              const selected = form.gender === option;
              return (
                <Pressable
                  key={option}
                  style={styles.genderOption}
                  onPress={() => updateField("gender", option)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <View style={[styles.radio, selected && styles.radioOn]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <Text style={styles.genderText}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
          <FieldError message={errors.gender} />

          <Text style={styles.label}>PLACE OF BIRTH</Text>
          <TextInput
            value={form.placeOfBirth}
            onChangeText={(value) => updateField("placeOfBirth", value)}
            placeholder="Enter your birth city"
            placeholderTextColor={COLORS.MUTED_TEXT}
            style={[styles.input, errors.placeOfBirth && styles.inputError]}
          />
          <FieldError message={errors.placeOfBirth} />

          <Text style={styles.label}>DISTRICT</Text>
          <Pressable
            style={[styles.inputRow, errors.district && styles.inputError]}
            onPress={() => setPicker("district")}
            accessibilityRole="button"
          >
            <Text style={form.district ? styles.selectValue : styles.selectPlaceholder}>
              {form.district || "Select your district"}
            </Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.MUTED_TEXT} />
          </Pressable>
          <FieldError message={errors.district} />

          <Text style={styles.label}>RELIGION</Text>
          <Pressable
            style={[styles.inputRow, errors.religion && styles.inputError]}
            onPress={() => setPicker("religion")}
            accessibilityRole="button"
          >
            <Text style={form.religion ? styles.selectValue : styles.selectPlaceholder}>
              {form.religion || "Select your religion"}
            </Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.MUTED_TEXT} />
          </Pressable>
          <FieldError message={errors.religion} />

          <Text style={styles.label}>OCCUPATION</Text>
          <TextInput
            value={form.occupation}
            onChangeText={(value) => updateField("occupation", value)}
            placeholder="Enter your occupation"
            placeholderTextColor={COLORS.MUTED_TEXT}
            style={[styles.input, errors.occupation && styles.inputError]}
          />
          <FieldError message={errors.occupation} />

          <Pressable
            style={styles.primaryButton}
            onPress={handleContinue}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>CONTINUE TO CONTACT DETAILS</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.WHITE} />
          </Pressable>
          <Pressable
            style={[styles.primaryButton, isSaving && styles.buttonBusy]}
            onPress={handleSave}
            disabled={isSaving}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>{isSaving ? "SAVING..." : "SAVE AS DRAFT"}</Text>
          </Pressable>

          <Text style={styles.footer}>NIC-FORM-REG-V4.2.1 • SESSION ID: 9482-AD3</Text>
          <Text style={styles.footer}>
            Department for Registration of Persons • Official Electronic Portal
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={picker !== ""} transparent animationType="fade" onRequestClose={() => setPicker("")}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setPicker("")} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{pickerTitle}</Text>
            <ScrollView>
              {pickerOptions.map((option) => (
                <Pressable
                  key={option}
                  style={styles.modalOption}
                  onPress={() => {
                    updateField(picker, option);
                    setPicker("");
                  }}
                >
                  <Text style={styles.modalOptionText}>{option}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerBack: {
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  stepLabel: {
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.LIGHT_BORDER,
  },
  progressOn: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  notice: {
    marginBottom: 14,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  noticeText: {
    flex: 1,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    flex: 1,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionHint: {
    marginTop: 8,
    color: COLORS.MUTED_TEXT,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    marginTop: 16,
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
  inputFlex: {
    flex: 1,
    minHeight: 46,
    color: COLORS.DARK_TEXT,
    fontSize: 15,
  },
  inputError: {
    borderColor: COLORS.PRIMARY_NAVY,
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
  genderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.LIGHT_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: {
    borderColor: COLORS.PRIMARY_NAVY,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  genderText: {
    color: COLORS.DARK_TEXT,
    fontSize: 15,
  },
  error: {
    marginTop: 4,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 12,
    fontWeight: "600",
  },
  primaryButton: {
    marginTop: 14,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonBusy: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  footer: {
    marginTop: 14,
    textAlign: "center",
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 31, 68, 0.45)",
    justifyContent: "flex-end",
  },
  modalDismiss: {
    flex: 1,
  },
  modalCard: {
    maxHeight: "70%",
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalTitle: {
    paddingHorizontal: 16,
    marginBottom: 8,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 16,
    fontWeight: "700",
  },
  modalOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_BORDER,
  },
  modalOptionText: {
    color: COLORS.DARK_TEXT,
    fontSize: 15,
  },
});
