import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";

const DEFAULT_STEPS = ["Applicant & Groom", "Bride & Solemnization", "Witness & Sign Off"];

export default function MarriageFormLayout({
  title,
  step,
  stepLabel,
  notice,
  onBack,
  scrollRef,
  children,
  footer,
  total = 3,
  steps = DEFAULT_STEPS,
}) {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Pressable onPress={onBack} style={styles.backButton} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.kicker}>MARRIAGE REGISTRATION</Text>
          <Text style={styles.stepTitle}>{stepLabel}</Text>
          <Text style={styles.stepMeta}>
            Step {step} of {total} · {Math.round((step / total) * 100)}% completed
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(step / total) * 100}%` }]} />
          </View>
          <View style={styles.stepRow}>
            {steps.map((label, index) => {
              const active = index + 1 === step;
              const done = index + 1 < step;
              return (
                <Text
                  key={label}
                  style={[styles.stepChip, (active || done) && styles.stepChipOn]}
                >
                  {index + 1} {label}
                </Text>
              );
            })}
          </View>
          {notice ? (
            <View style={styles.notice}>
              <Ionicons name="alert-circle-outline" size={18} color={COLORS.PRIMARY_NAVY} />
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}
          {children}
          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export function FormSection({ icon, title, badge, hint, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={styles.sectionIcon}>
          <Ionicons name={icon} size={16} color={COLORS.PRIMARY_NAVY} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {badge ? (
          <View style={[styles.badge, badge === "LOCKED" ? styles.badgeYellow : styles.badgeNavy]}>
            <Text style={[styles.badgeText, badge === "LOCKED" ? styles.badgeTextNavy : styles.badgeTextWhite]}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

export function FormInput({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize = "words",
  editable = true,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.MUTED_TEXT}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        autoCapitalize={autoCapitalize}
        style={[styles.input, error && styles.inputError, !editable && styles.inputLocked]}
      />
      <FieldError message={error} />
    </View>
  );
}

export function ReadOnlyValue({ label, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.input, styles.inputLocked]}>
        <Text style={value ? styles.readValue : styles.readPlaceholder}>{value || "—"}</Text>
      </View>
    </View>
  );
}

export function DateField({ label, value, error, onChange }) {
  const [open, setOpen] = useState(false);

  function onDateChange(event, selected) {
    if (Platform.OS !== "ios") {
      setOpen(false);
    }
    if (event?.type === "dismissed" || !selected) {
      return;
    }
    const day = String(selected.getDate()).padStart(2, "0");
    const month = String(selected.getMonth() + 1).padStart(2, "0");
    onChange(`${day}/${month}/${selected.getFullYear()}`);
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.input, styles.inputRow, error && styles.inputError]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
      >
        <Text style={value ? styles.readValue : styles.readPlaceholder}>{value || "DD/MM/YYYY"}</Text>
        <Ionicons name="calendar-outline" size={18} color={COLORS.MUTED_TEXT} />
      </Pressable>
      {open ? (
        <View>
          <DateTimePicker
            value={dateFromForm(value)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            onChange={onDateChange}
          />
          {Platform.OS === "ios" ? (
            <Pressable onPress={() => setOpen(false)} style={styles.dateDone}>
              <Text style={styles.dateDoneText}>Done</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <FieldError message={error} />
    </View>
  );
}

export function OptionField({ label, value, options, error, onChange, placeholder }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.input, styles.inputRow, error && styles.inputError]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
      >
        <Text style={value ? styles.readValue : styles.readPlaceholder}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={18} color={COLORS.MUTED_TEXT} />
      </Pressable>
      <FieldError message={error} />
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{label}</Text>
            {options.map((option) => (
              <Pressable
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
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

export function MaritalStatusField({
  value,
  error,
  onChange,
  label = "Marital Status (Prior to this event)",
  options = ["Bachelor", "Widowed", "Divorced"],
}) {
  return (
    <View style={styles.field}>
      <View style={styles.maritalHeader}>
        <Text style={styles.maritalHeaderText}>{label}</Text>
      </View>
      {options.map((option) => {
        const selected = value === option;
        return (
          <Pressable
            key={option}
            style={[styles.statusButton, styles.statusButtonOn, selected && styles.maritalSelected]}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <View style={styles.maritalChoice}>
              <Text style={[styles.statusTextOn, selected && styles.maritalSelectedText]}>{option}</Text>
              {selected ? (
                <Ionicons name="checkmark" size={18} color={COLORS.PRIMARY_NAVY} />
              ) : null}
            </View>
          </Pressable>
        );
      })}
      <FieldError message={error} />
    </View>
  );
}

export function StatusChoices({ value, error, onChange }) {
  const options = ["Solemnized", "Witnessed", "Discussed"];
  return (
    <View style={styles.field}>
      {options.map((option) => {
        const selected = value === option;
        return (
          <Pressable
            key={option}
            style={[styles.statusButton, selected && styles.statusButtonOn]}
            onPress={() => onChange(option)}
            accessibilityRole="button"
          >
            <Text style={[styles.statusText, selected && styles.statusTextOn]}>{option}</Text>
          </Pressable>
        );
      })}
      <FieldError message={error} />
    </View>
  );
}

export function GroomToggle({ value, onChange }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>Applicant is the Groom</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.LIGHT_BORDER, true: COLORS.ACCENT_YELLOW }}
        thumbColor={COLORS.WHITE}
      />
    </View>
  );
}

export function FieldError({ message }) {
  if (!message) {
    return null;
  }
  return <Text style={styles.error}>{message}</Text>;
}

export function PrimaryButton({ label, onPress }) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress} accessibilityRole="button">
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }) {
  return (
    <Pressable style={styles.secondaryButton} onPress={onPress} accessibilityRole="button">
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

function dateFromForm(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value || "");
  if (!match) {
    return new Date(1990, 0, 1);
  }
  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return Number.isNaN(date.getTime()) ? new Date(1990, 0, 1) : date;
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
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  kicker: {
    color: COLORS.ACCENT_YELLOW,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  stepTitle: {
    marginTop: 10,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 20,
    fontWeight: "700",
  },
  stepMeta: {
    marginTop: 4,
    color: COLORS.MUTED_TEXT,
    fontSize: 13,
    fontWeight: "600",
  },
  progressTrack: {
    marginTop: 10,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.LIGHT_BORDER,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  stepRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  stepChip: {
    color: COLORS.MUTED_TEXT,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "700",
  },
  stepChipOn: {
    color: COLORS.WHITE,
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderColor: COLORS.PRIMARY_NAVY,
  },
  notice: {
    marginTop: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  noticeText: {
    flex: 1,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    marginTop: 14,
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    flex: 1,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeYellow: {
    backgroundColor: COLORS.ACCENT_YELLOW,
  },
  badgeNavy: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  badgeTextNavy: {
    color: COLORS.PRIMARY_NAVY,
  },
  badgeTextWhite: {
    color: COLORS.WHITE,
  },
  hint: {
    marginTop: 6,
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
    lineHeight: 17,
  },
  field: {
    marginTop: 12,
  },
  label: {
    marginBottom: 6,
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 12,
    color: COLORS.DARK_TEXT,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputError: {
    borderColor: COLORS.PRIMARY_NAVY,
  },
  inputLocked: {
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: "center",
  },
  readValue: {
    flex: 1,
    color: COLORS.DARK_TEXT,
    fontSize: 15,
  },
  readPlaceholder: {
    flex: 1,
    color: COLORS.MUTED_TEXT,
    fontSize: 15,
  },
  error: {
    marginTop: 4,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 12,
    fontWeight: "600",
  },
  toggleRow: {
    marginTop: 12,
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    flex: 1,
    marginRight: 8,
    color: COLORS.DARK_TEXT,
    fontSize: 14,
    fontWeight: "600",
  },
  statusButton: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statusButtonOn: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  statusText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  statusTextOn: {
    color: COLORS.WHITE,
  },
  maritalHeader: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  maritalHeaderText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: "700",
  },
  maritalSelected: {
    backgroundColor: COLORS.ACCENT_YELLOW,
    borderColor: COLORS.ACCENT_YELLOW,
  },
  maritalSelectedText: {
    color: COLORS.PRIMARY_NAVY,
  },
  maritalChoice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  primaryButton: {
    marginTop: 14,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  primaryText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryButton: {
    marginTop: 10,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_NAVY,
    backgroundColor: COLORS.WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  dateDone: {
    alignSelf: "flex-end",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dateDoneText: {
    color: COLORS.PRIMARY_NAVY,
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_BORDER,
  },
  modalOptionText: {
    color: COLORS.DARK_TEXT,
    fontSize: 15,
  },
});
