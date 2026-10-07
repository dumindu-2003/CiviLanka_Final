import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  MARRIAGE_NATIONALITIES,
  MARRIAGE_RELIGIONS,
  patchMarriageForm,
  setApplicantIsGroom,
  validateGroomStep,
} from "../constants/marriageRegistrationForm";
import { readMarriageDraft, saveMarriageDraft } from "../services/marriageRegistrationDraft";
import MarriageFormLayout, {
  DateField,
  FormInput,
  FormSection,
  GroomToggle,
  OptionField,
  PrimaryButton,
  ReadOnlyValue,
  SecondaryButton,
  StatusChoices,
} from "../components/MarriageFormLayout";

export default function MarriageGroomParticularsScreen({ navigation }) {
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
    const nextErrors = validateGroomStep(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setNotice("Check the highlighted fields.");
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    saveMarriageDraft(form);
    navigation.navigate("MarriageBrideSolemnization");
  }

  function saveDraft() {
    saveMarriageDraft(form);
    setNotice("Draft saved.");
  }

  return (
    <MarriageFormLayout
      title="Groom Particulars"
      step={2}
      stepLabel="Step 2 of 4: Groom Particulars"
      notice={notice}
      onBack={() => {
        saveMarriageDraft(form);
        navigation.goBack();
      }}
      scrollRef={scrollRef}
      footer={
        <>
          <PrimaryButton label="Next: Bride & Solemnization Details" onPress={goNext} />
          <SecondaryButton label="Save as Draft" onPress={saveDraft} />
        </>
      }
    >
      <FormSection icon="person-outline" title="Applicant's Personal Details">
        <GroomToggle
          value={form.applicantIsGroom}
          onChange={(value) => {
            setForm((current) => {
              const next = setApplicantIsGroom(current, value);
              saveMarriageDraft(next);
              return next;
            });
            setNotice("");
          }}
        />
        <FormInput
          label="Full Name"
          value={form.applicantName}
          onChangeText={(value) => updateField("applicantName", value)}
          error={errors.applicantName}
          placeholder="Kavinda Ravishan Jayasuriya"
        />
        <FormInput
          label="NIC Number / National Identity Card"
          value={form.applicantNic}
          onChangeText={(value) => updateField("applicantNic", value)}
          error={errors.applicantNic}
          placeholder="199012401924"
        />
        <DateField
          label="Applicant Date of Birth"
          value={form.applicantDob}
          error={errors.applicantDob}
          onChange={(value) => updateField("applicantDob", value)}
        />
      </FormSection>

      <FormSection icon="shield-checkmark-outline" title="Groom's Particulars" badge="VERIFY">
        <FormInput
          label="Full Legal Name"
          value={form.groomName}
          onChangeText={(value) => updateField("groomName", value)}
          error={errors.groomName}
          placeholder="Kavinda Ravishan Jayasuriya"
        />
        <FormInput
          label="Male NIC Number / National Identity Card"
          value={form.groomNic}
          onChangeText={(value) => updateField("groomNic", value)}
          error={errors.groomNic}
          placeholder="199012401924"
        />
        <DateField
          label="Date of Birth"
          value={form.groomDob}
          error={errors.groomDob}
          onChange={(value) => updateField("groomDob", value)}
        />
        <ReadOnlyValue label="Age (Completed Years)" value={form.groomAge ? `${form.groomAge} yrs` : ""} />
        <FormInput
          label="Occupation / Profession"
          value={form.groomOccupation}
          onChangeText={(value) => updateField("groomOccupation", value)}
          error={errors.groomOccupation}
          placeholder="Software Architect"
        />
        <FormInput
          label="Permanent Address"
          value={form.groomAddress}
          onChangeText={(value) => updateField("groomAddress", value)}
          error={errors.groomAddress}
          placeholder="No. 18/B, Circular Road, Nawala, Rajagiriya"
        />
        <OptionField
          label="Religion / Faith"
          value={form.groomReligion}
          options={MARRIAGE_RELIGIONS}
          error={errors.groomReligion}
          onChange={(value) => updateField("groomReligion", value)}
          placeholder="Select religion"
        />
        <OptionField
          label="Nationality"
          value={form.groomNationality}
          options={MARRIAGE_NATIONALITIES}
          error={errors.groomNationality}
          onChange={(value) => updateField("groomNationality", value)}
          placeholder="Select nationality"
        />
        <StatusChoices
          value={form.groomStatus}
          error={errors.groomStatus}
          onChange={(value) => updateField("groomStatus", value)}
        />
      </FormSection>
    </MarriageFormLayout>
  );
}
