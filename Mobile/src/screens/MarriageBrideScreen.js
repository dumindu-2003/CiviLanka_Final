import { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../constants/colors";
import {
  MARRIAGE_NATIONALITIES,
  MARRIAGE_RELIGIONS,
  patchMarriageForm,
  validateBrideStep,
} from "../constants/marriageRegistrationForm";
import { readMarriageDraft, saveMarriageDraft } from "../services/marriageRegistrationDraft";
import MarriageFormLayout, {
  DateField,
  FormInput,
  FormSection,
  OptionField,
  PrimaryButton,
  ReadOnlyValue,
  SecondaryButton,
  MaritalStatusField,
} from "../components/MarriageFormLayout";

export default function MarriageBrideScreen({ navigation }) {
  const [form, setForm] = useState(readMarriageDraft);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const scrollRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      setForm(readMarriageDraft());
    }, [])
  );

  function updateField(field, value) {
    setForm((current) => {
      const next = patchMarriageForm(current, field, value);
      saveMarriageDraft(next);
      return next;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
    setNotice("");
  }

  function goNext() {
    const nextErrors = validateBrideStep(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setNotice("Check the highlighted fields.");
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    saveMarriageDraft(form);
    navigation.navigate("MarriageWitnessSignOff");
  }

  function saveDraft() {
    saveMarriageDraft(form);
    setNotice("Draft saved.");
  }

  function goBack() {
    saveMarriageDraft(form);
    navigation.goBack();
  }

  return (
    <MarriageFormLayout
      title="Bride & Solemnization"
      step={2}
      stepLabel="Step 2 of 3: Bride & Solemnization"
      notice={notice}
      onBack={goBack}
      scrollRef={scrollRef}
      footer={
        <>
          <PrimaryButton label="Next: Witness & Sign-Off" onPress={goNext} />
          <SecondaryButton label="Back to Groom's Details" onPress={goBack} />
          <SecondaryButton label="Save as Draft" onPress={saveDraft} />
        </>
      }
    >
      <FormSection icon="woman-outline" title="Bride's Details" badge="MANDATORY">
        <FormInput
          label="Bride's Full Legal Name"
          value={form.brideName}
          onChangeText={(value) => updateField("brideName", value)}
          error={errors.brideName}
          placeholder="Thilini Manusha Senanayake"
        />
        <FormInput
          label="Female NIC Number"
          value={form.brideNic}
          onChangeText={(value) => updateField("brideNic", value)}
          error={errors.brideNic}
          placeholder="199208302158"
        />
        <DateField
          label="Date of Birth"
          value={form.brideDob}
          error={errors.brideDob}
          onChange={(value) => updateField("brideDob", value)}
        />
        <ReadOnlyValue label="Age (Completed Years)" value={form.brideAge ? `${form.brideAge} yrs` : ""} />
        <FormInput
          label="Mobile Number"
          value={form.brideMobile}
          onChangeText={(value) => updateField("brideMobile", value)}
          error={errors.brideMobile}
          placeholder="+94 77 987 1023"
          keyboardType="phone-pad"
        />
        <FormInput
          label="Occupation / Profession"
          value={form.brideOccupation}
          onChangeText={(value) => updateField("brideOccupation", value)}
          error={errors.brideOccupation}
          placeholder="Chartered Accountant"
        />
        <FormInput
          label="Permanent Address"
          value={form.brideAddress}
          onChangeText={(value) => updateField("brideAddress", value)}
          error={errors.brideAddress}
          placeholder="77/1, Flower Road, Colombo 07"
        />
        <OptionField
          label="Religion / Faith"
          value={form.brideReligion}
          options={MARRIAGE_RELIGIONS}
          error={errors.brideReligion}
          onChange={(value) => updateField("brideReligion", value)}
          placeholder="Select religion"
        />
        <OptionField
          label="Nationality"
          value={form.brideNationality}
          options={MARRIAGE_NATIONALITIES}
          error={errors.brideNationality}
          onChange={(value) => updateField("brideNationality", value)}
          placeholder="Select nationality"
        />
        <MaritalStatusField
          label="Marital Status"
          options={["Spinster", "Widowed", "Divorced"]}
          value={form.brideMaritalStatus}
          error={errors.brideMaritalStatus}
          onChange={(value) => updateField("brideMaritalStatus", value)}
        />
      </FormSection>

      <FormSection icon="calendar-outline" title="Solemnization Details">
        <DateField
          label="Date of Marriage"
          value={form.marriageDate}
          error={errors.marriageDate}
          onChange={(value) => updateField("marriageDate", value)}
        />
        <FormInput
          label="Place of Marriage"
          value={form.marriagePlace}
          onChangeText={(value) => updateField("marriagePlace", value)}
          error={errors.marriagePlace}
          placeholder="Divisional Secretariat, Colombo Fort"
        />
        <FormInput
          label="Marriage Registrar Name & Title"
          value={form.registrarName}
          onChangeText={(value) => updateField("registrarName", value)}
          error={errors.registrarName}
          placeholder="Mr. W. M. Bandusena, Justice of Peace"
        />
        <FormInput
          label="Registration Number"
          value={form.registrationNumber}
          onChangeText={(value) => updateField("registrationNumber", value)}
          error={errors.registrationNumber}
          placeholder="REG/COL/2024/0982"
          autoCapitalize="characters"
        />
      </FormSection>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>Identity Validation Served</Text>
        <Text style={styles.noteText}>
          Notice required for Registration of Marriages has been prepared for verification before
          the witnesses sign.
        </Text>
      </View>
    </MarriageFormLayout>
  );
}

const styles = StyleSheet.create({
  note: {
    marginTop: 14,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 12,
  },
  noteTitle: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  noteText: {
    marginTop: 4,
    color: COLORS.MUTED_TEXT,
    fontSize: 13,
    lineHeight: 18,
  },
});
