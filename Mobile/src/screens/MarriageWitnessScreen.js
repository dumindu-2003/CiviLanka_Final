import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import {
  MARRIAGE_RELATIONSHIPS,
  patchMarriageForm,
  validateMarriageForm,
} from "../constants/marriageRegistrationForm";
import { getCurrentUser, submitMarriageRegistration } from "../services/api";
import {
  clearMarriageDraft,
  readMarriageDraft,
  saveMarriageDraft,
} from "../services/marriageRegistrationDraft";
import MarriageFormLayout, {
  FieldError,
  FormInput,
  FormSection,
  OptionField,
  PrimaryButton,
  SecondaryButton,
} from "../components/MarriageFormLayout";

const DECLARATION =
  "We solemnly declare that our notice was published under the Marriage Registration Ordinance of Sri Lanka, and all statements, particulars, and entries in this form are true to the best of our knowledge.";

export default function MarriageWitnessScreen({ navigation }) {
  const [form, setForm] = useState(readMarriageDraft);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const current = readMarriageDraft();
      setForm(current);
      if (!current.officerName || !current.officerServiceNumber) {
        getCurrentUser()
          .then((user) => {
            if (!active || !user) {
              return;
            }
            setForm((previous) => {
              const next = {
                ...previous,
                officerName: previous.officerName || user.name || "",
                officerServiceNumber: previous.officerServiceNumber || user.serviceNumber || "",
              };
              saveMarriageDraft(next);
              return next;
            });
          })
          .catch(() => {});
      }
      return () => {
        active = false;
      };
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

  function saveDraft() {
    saveMarriageDraft(form);
    setNotice("Draft saved.");
  }

  async function submit() {
    if (isSaving) {
      return;
    }
    const nextErrors = validateMarriageForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setNotice("Check the highlighted fields. Earlier steps are included.");
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setIsSaving(true);
    try {
      const saved = await submitMarriageRegistration(form);
      clearMarriageDraft();
      navigation.replace("MarriageRegistrationSent", { registration: saved });
    } catch (error) {
      if (error.fields) {
        setErrors(error.fields);
      }
      setNotice(error.message || "Could not send the marriage registration.");
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <MarriageFormLayout
      title="Witness & Sign-Off"
      step={3}
      stepLabel="Step 3 of 3: Witness & Sign-Off"
      notice={notice}
      onBack={() => {
        saveMarriageDraft(form);
        navigation.goBack();
      }}
      scrollRef={scrollRef}
      footer={
        <>
          <PrimaryButton
            label={isSaving ? "Sending..." : "Submit Application (Requires Officer Credentials)"}
            onPress={submit}
          />
          <SecondaryButton
            label="Back to Bride's Details"
            onPress={() => {
              saveMarriageDraft(form);
              navigation.goBack();
            }}
          />
          <SecondaryButton label="Save as Draft" onPress={saveDraft} />
        </>
      }
    >
      <WitnessFields
        title="Female Side Witness"
        name={form.femaleWitnessName}
        nic={form.femaleWitnessNic}
        relationship={form.femaleWitnessRelationship}
        address={form.femaleWitnessAddress}
        phone={form.femaleWitnessPhone}
        errors={errors}
        nameKey="femaleWitnessName"
        nicKey="femaleWitnessNic"
        relationshipKey="femaleWitnessRelationship"
        addressKey="femaleWitnessAddress"
        phoneKey="femaleWitnessPhone"
        namePlaceholder="Priyanthi Senanayake"
        nicPlaceholder="196511802384"
        addressPlaceholder="No. 42/B, Temple Road, Kesbewa North"
        phonePlaceholder="+94 77 412 8892"
        onChange={updateField}
      />
      <WitnessFields
        title="Male Side Witness"
        name={form.maleWitnessName}
        nic={form.maleWitnessNic}
        relationship={form.maleWitnessRelationship}
        address={form.maleWitnessAddress}
        phone={form.maleWitnessPhone}
        errors={errors}
        nameKey="maleWitnessName"
        nicKey="maleWitnessNic"
        relationshipKey="maleWitnessRelationship"
        addressKey="maleWitnessAddress"
        phoneKey="maleWitnessPhone"
        namePlaceholder="Asanka Ruwan Jayatilaka"
        nicPlaceholder="198012450512"
        addressPlaceholder="No. 16, Station Road, Dehiwala"
        phonePlaceholder="+94 71 880 0123"
        onChange={updateField}
      />

      <FormSection icon="document-text-outline" title="Legal Declaration">
        <Text style={styles.declaration}>{DECLARATION}</Text>
        <Pressable
          style={styles.checkRow}
          onPress={() => updateField("declarationAccepted", !form.declarationAccepted)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: form.declarationAccepted }}
        >
          <Ionicons
            name={form.declarationAccepted ? "checkbox" : "square-outline"}
            size={22}
            color={COLORS.PRIMARY_NAVY}
          />
          <Text style={styles.checkText}>We accept this declaration.</Text>
        </Pressable>
        <FieldError message={errors.declarationAccepted} />
      </FormSection>

      <FormSection icon="lock-closed-outline" title="Officer Authentication & Sign-Off" badge="PIN">
        <FormInput
          label="Data Entry Officer"
          value={form.officerName}
          onChangeText={(value) => updateField("officerName", value)}
          error={errors.officerName}
          placeholder="Officer name"
        />
        <FormInput
          label="Officer Service No."
          value={form.officerServiceNumber}
          onChangeText={(value) => updateField("officerServiceNumber", value)}
          error={errors.officerServiceNumber}
          placeholder="MR-220145"
        />
        <FormInput
          label="Authorization PIN"
          value={form.officerPin}
          onChangeText={(value) => updateField("officerPin", value.replace(/\D/g, "").slice(0, 6))}
          error={errors.officerPin}
          placeholder="Enter PIN"
          keyboardType="number-pad"
          secureTextEntry
        />
      </FormSection>
    </MarriageFormLayout>
  );
}

function WitnessFields({
  title,
  name,
  nic,
  relationship,
  address,
  phone,
  errors,
  nameKey,
  nicKey,
  relationshipKey,
  addressKey,
  phoneKey,
  namePlaceholder,
  nicPlaceholder,
  addressPlaceholder,
  phonePlaceholder,
  onChange,
}) {
  return (
    <FormSection icon="people-outline" title={title} badge="WITNESS">
      <FormInput
        label="Full Name"
        value={name}
        onChangeText={(value) => onChange(nameKey, value)}
        error={errors[nameKey]}
        placeholder={namePlaceholder}
      />
      <FormInput
        label="NIC Number"
        value={nic}
        onChangeText={(value) => onChange(nicKey, value)}
        error={errors[nicKey]}
        placeholder={nicPlaceholder}
      />
      <OptionField
        label="Relationship"
        value={relationship}
        options={MARRIAGE_RELATIONSHIPS}
        error={errors[relationshipKey]}
        onChange={(value) => onChange(relationshipKey, value)}
        placeholder="Select relationship"
      />
      <FormInput
        label="Address"
        value={address}
        onChangeText={(value) => onChange(addressKey, value)}
        error={errors[addressKey]}
        placeholder={addressPlaceholder}
      />
      <FormInput
        label="Contact Number"
        value={phone}
        onChangeText={(value) => onChange(phoneKey, value)}
        error={errors[phoneKey]}
        placeholder={phonePlaceholder}
        keyboardType="phone-pad"
      />
    </FormSection>
  );
}

const styles = StyleSheet.create({
  declaration: {
    marginTop: 10,
    color: COLORS.DARK_TEXT,
    fontSize: 14,
    lineHeight: 20,
  },
  checkRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkText: {
    flex: 1,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
});
