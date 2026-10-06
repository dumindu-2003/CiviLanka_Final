import { useCallback, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { NIC_MARITAL_STATUSES, validateContactDetails } from "../constants/nicFormOptions";
import { saveNicForm } from "../services/api";
import { readNicDraft, saveContactDraft, saveNicFormId, savePersonalDraft } from "../services/nicFormDraft";

const EMPTY_CONTACT = {
  permanentAddress: "",
  currentAddress: "",
  sameAsPermanent: false,
  phone: "",
  email: "",
  fatherFullName: "",
  fatherNic: "",
  motherFullName: "",
  motherNic: "",
  maritalStatus: "",
};

const STEPS = ["Personal", "Contact & Family", "Documents", "Review"];

export default function NicFormContactScreen({ navigation, route }) {
  const personal = route.params?.personal || readNicDraft().personal;
  const [nicFormId, setNicFormId] = useState(
    () => route.params?.nicFormId || readNicDraft().nicFormId || ""
  );
  const [form, setForm] = useState(
    () => route.params?.contact || readNicDraft().contact || EMPTY_CONTACT
  );
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const draft = readNicDraft();
      if (draft.contact) {
        setForm(draft.contact);
      }
    }, [])
  );

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "permanentAddress" && current.sameAsPermanent) {
        next.currentAddress = value;
      }
      saveContactDraft(next);
      return next;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
    setNotice("");
  }

  function toggleSameAddress() {
    setForm((current) => {
      const sameAsPermanent = !current.sameAsPermanent;
      const next = {
        ...current,
        sameAsPermanent,
        currentAddress: sameAsPermanent ? current.permanentAddress : current.currentAddress,
      };
      saveContactDraft(next);
      return next;
    });
    setErrors((current) => ({ ...current, currentAddress: "" }));
  }

  function goToPersonal() {
    saveContactDraft(form);
    if (personal) {
      savePersonalDraft(personal);
    }
    saveNicFormId(nicFormId);
    navigation.navigate("NicForm", {
      contactDraft: form,
      nicFormId,
      personal,
    });
  }

  async function handleContinue() {
    const nextErrors = validateContactDetails(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !personal) {
      if (!personal) {
        setNotice("Go back and complete personal details.");
      }
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveNicForm({
        id: nicFormId || undefined,
        ...personal,
        ...form,
        currentAddress: form.sameAsPermanent ? form.permanentAddress : form.currentAddress,
        includeContact: true,
      });
      setNicFormId(saved.id);
      saveNicFormId(saved.id);
      saveContactDraft({
        ...form,
        currentAddress: form.sameAsPermanent ? form.permanentAddress : form.currentAddress,
      });
      navigation.navigate("NicFormDocuments", {
        nicFormId: saved.id,
        personal,
        contact: {
          ...form,
          currentAddress: form.sameAsPermanent ? form.permanentAddress : form.currentAddress,
        },
      });
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
          <Pressable onPress={goToPersonal} style={styles.headerBack} accessibilityLabel="Back to step 1">
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>Residential Address</Text>
          <View style={styles.headerBack} />
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.stepLabel}>STEP 2 OF 4 • Contact & Family</Text>
          <View style={styles.stepper}>
            {STEPS.map((label, index) => {
              const active = index === 1;
              const done = index === 0;
              return (
                <View key={label} style={styles.stepItem}>
                  <View style={[styles.stepDot, (active || done) && styles.stepDotOn]}>
                    {done ? (
                      <Ionicons name="checkmark" size={12} color={COLORS.WHITE} />
                    ) : (
                      <Text style={[styles.stepNumber, (active || done) && styles.stepNumberOn]}>
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.stepName, active && styles.stepNameOn]}>{label}</Text>
                </View>
              );
            })}
          </View>

          {notice ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="home-outline" size={16} color={COLORS.PRIMARY_NAVY} />
              </View>
              <Text style={styles.cardTitle}>2. CONTACT INFORMATION</Text>
            </View>

            <Text style={styles.label}>PERMANENT ADDRESS *</Text>
            <TextInput
              value={form.permanentAddress}
              onChangeText={(value) => updateField("permanentAddress", value)}
              placeholder="Enter your permanent address"
              placeholderTextColor={COLORS.MUTED_TEXT}
              style={[styles.input, errors.permanentAddress && styles.inputError]}
            />
            <FieldError message={errors.permanentAddress} />

            <View style={styles.addressHeader}>
              <Text style={styles.labelInline}>CURRENT ADDRESS *</Text>
              <Pressable style={styles.checkRow} onPress={toggleSameAddress} accessibilityRole="checkbox">
                <View style={[styles.checkbox, form.sameAsPermanent && styles.checkboxOn]}>
                  {form.sameAsPermanent ? (
                    <Ionicons name="checkmark" size={12} color={COLORS.WHITE} />
                  ) : null}
                </View>
                <Text style={styles.checkLabel}>Same as permanent</Text>
              </Pressable>
            </View>
            <TextInput
              value={form.sameAsPermanent ? form.permanentAddress : form.currentAddress}
              onChangeText={(value) => updateField("currentAddress", value)}
              placeholder="Enter your current address"
              placeholderTextColor={COLORS.MUTED_TEXT}
              editable={!form.sameAsPermanent}
              style={[styles.input, errors.currentAddress && styles.inputError]}
            />
            <FieldError message={errors.currentAddress} />

            <Text style={styles.label}>PHONE NUMBER *</Text>
            <TextInput
              value={form.phone}
              onChangeText={(value) => updateField("phone", value)}
              placeholder="+94 XX XXX XXXX"
              placeholderTextColor={COLORS.MUTED_TEXT}
              keyboardType="phone-pad"
              style={[styles.input, errors.phone && styles.inputError]}
            />
            <Text style={styles.help}>
              SMS alerts will be dispatched to this verified Sri Lankan mobile number.
            </Text>
            <FieldError message={errors.phone} />

            <Text style={styles.label}>EMAIL ADDRESS (OPTIONAL)</Text>
            <TextInput
              value={form.email}
              onChangeText={(value) => updateField("email", value)}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.MUTED_TEXT}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, errors.email && styles.inputError]}
            />
            <FieldError message={errors.email} />
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="people-outline" size={16} color={COLORS.PRIMARY_NAVY} />
              </View>
              <Text style={styles.cardTitle}>FAMILY PARTICULARS</Text>
            </View>

            <Text style={styles.recordLabel}>FATHER'S RECORD</Text>
            <Text style={styles.label}>Father's Full Name *</Text>
            <TextInput
              value={form.fatherFullName}
              onChangeText={(value) => updateField("fatherFullName", value)}
              placeholder="Enter father's full name as in birth cert"
              placeholderTextColor={COLORS.MUTED_TEXT}
              style={[styles.input, errors.fatherFullName && styles.inputError]}
            />
            <FieldError message={errors.fatherFullName} />

            <Text style={styles.label}>Father's NIC Number *</Text>
            <TextInput
              value={form.fatherNic}
              onChangeText={(value) => updateField("fatherNic", value.toUpperCase())}
              placeholder="E.G. 199812345678 OR 651234567V"
              placeholderTextColor={COLORS.MUTED_TEXT}
              autoCapitalize="characters"
              style={[styles.input, errors.fatherNic && styles.inputError]}
            />
            <FieldError message={errors.fatherNic} />

            <Text style={styles.recordLabel}>MOTHER'S RECORD</Text>
            <Text style={styles.label}>Mother's Full Name *</Text>
            <TextInput
              value={form.motherFullName}
              onChangeText={(value) => updateField("motherFullName", value)}
              placeholder="Enter mother's maiden / full name"
              placeholderTextColor={COLORS.MUTED_TEXT}
              style={[styles.input, errors.motherFullName && styles.inputError]}
            />
            <FieldError message={errors.motherFullName} />

            <Text style={styles.label}>Mother's NIC Number *</Text>
            <TextInput
              value={form.motherNic}
              onChangeText={(value) => updateField("motherNic", value.toUpperCase())}
              placeholder="E.G. 196812345678 OR 681234567V"
              placeholderTextColor={COLORS.MUTED_TEXT}
              autoCapitalize="characters"
              style={[styles.input, errors.motherNic && styles.inputError]}
            />
            <FieldError message={errors.motherNic} />

            <Text style={styles.label}>MARITAL STATUS *</Text>
            <Pressable
              style={[styles.inputRow, errors.maritalStatus && styles.inputError]}
              onPress={() => setIsStatusOpen(true)}
              accessibilityRole="button"
            >
              <Text style={form.maritalStatus ? styles.selectValue : styles.selectPlaceholder}>
                {form.maritalStatus || "Select marital status"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.MUTED_TEXT} />
            </Pressable>
            <FieldError message={errors.maritalStatus} />

            <View style={styles.infoBox}>
              <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.PRIMARY_NAVY} />
              <Text style={styles.infoText}>
                All family lineage data will be verified directly against the Department of the
                Registrar General civil database registers.
              </Text>
            </View>
          </View>

          <Pressable
            style={[styles.primaryButton, isSaving && styles.buttonBusy]}
            onPress={handleContinue}
            disabled={isSaving}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              {isSaving ? "SAVING..." : "CONTINUE TO DOCUMENTS"}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.WHITE} />
          </Pressable>
          <Pressable style={styles.backLink} onPress={goToPersonal} accessibilityRole="button">
            <Ionicons name="chevron-back" size={16} color={COLORS.PRIMARY_NAVY} />
            <Text style={styles.backLinkText}>BACK TO STEP 1</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={isStatusOpen} transparent animationType="fade" onRequestClose={() => setIsStatusOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setIsStatusOpen(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select marital status</Text>
            {NIC_MARITAL_STATUSES.map((option) => (
              <Pressable
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  updateField("maritalStatus", option);
                  setIsStatusOpen(false);
                }}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </Pressable>
            ))}
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
    letterSpacing: 0.3,
  },
  stepper: {
    flexDirection: "row",
    marginTop: 12,
    marginBottom: 16,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    backgroundColor: COLORS.WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotOn: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderColor: COLORS.PRIMARY_NAVY,
  },
  stepNumber: {
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "700",
  },
  stepNumberOn: {
    color: COLORS.WHITE,
  },
  stepName: {
    color: COLORS.MUTED_TEXT,
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  stepNameOn: {
    color: COLORS.PRIMARY_NAVY,
    fontWeight: "700",
  },
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
  noticeText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    flex: 1,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  label: {
    marginTop: 14,
    marginBottom: 6,
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  labelInline: {
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  recordLabel: {
    marginTop: 16,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 12,
    fontWeight: "700",
  },
  addressHeader: {
    marginTop: 14,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.WHITE,
  },
  checkboxOn: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderColor: COLORS.PRIMARY_NAVY,
  },
  checkLabel: {
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 10,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 12,
    color: COLORS.DARK_TEXT,
    fontSize: 15,
  },
  inputRow: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 10,
    backgroundColor: COLORS.BACKGROUND,
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
  help: {
    marginTop: 6,
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
    lineHeight: 16,
  },
  error: {
    marginTop: 4,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 12,
    fontWeight: "600",
  },
  infoBox: {
    marginTop: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    backgroundColor: COLORS.BACKGROUND,
    padding: 12,
    flexDirection: "row",
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
    lineHeight: 17,
  },
  primaryButton: {
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
  backLink: {
    marginTop: 14,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  backLinkText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
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
