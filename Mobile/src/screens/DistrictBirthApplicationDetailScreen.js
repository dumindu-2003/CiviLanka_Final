import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { updateBirthApplicationStatus } from "../services/api";
import { StatusPill } from "./DistrictBirthApplicationsScreen";

const STATUS_OPTIONS = [
  { key: "open", label: "Open", icon: "hourglass-outline" },
  { key: "approved", label: "Approve", icon: "checkmark-circle-outline" },
  { key: "rejected", label: "Reject", icon: "close-circle-outline" },
];

export default function DistrictBirthApplicationDetailScreen({ navigation, route }) {
  const [application, setApplication] = useState(route.params?.application || null);
  const [updatingStatus, setUpdatingStatus] = useState("");
  const [notice, setNotice] = useState("");

  async function handleStatusChange(status) {
    if (!application || application.statusCode === status || updatingStatus) {
      return;
    }
    setUpdatingStatus(status);
    setNotice("");
    try {
      const updated = await updateBirthApplicationStatus(application.id, status);
      setApplication(updated);
      setNotice(`Application status updated to ${status}.`);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setUpdatingStatus("");
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
          <Text style={styles.headerTitle}>Birth Application</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {application ? (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.reference}>{application.applicationReference}</Text>
              <Text style={styles.childName}>{application.birthName}</Text>
              <StatusPill status={application.statusCode || application.status} />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Parent and address details</Text>
              <Detail label="Father's name" value={application.fatherName} />
              <Detail label="Mother's name" value={application.motherName} />
              <Detail label="Address" value={application.address} />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Birth details</Text>
              <Detail label="Birth name" value={application.birthName} />
              <Detail label="Gender" value={application.gender} />
              <Detail label="Date of birth" value={application.birthDate} />
              <Detail label="Time of birth" value={application.birthTime} />
              <Detail label="Hospital" value={application.hospitalName} />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Update application status</Text>
              {notice ? <Text style={styles.notice}>{notice}</Text> : null}
              <View style={styles.statusActions}>
                {STATUS_OPTIONS.map((option) => {
                  const active = (application.statusCode || application.status) === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      style={[
                        styles.statusButton,
                        active && styles.statusButtonActive,
                        updatingStatus && styles.disabledButton,
                      ]}
                      onPress={() => handleStatusChange(option.key)}
                      disabled={Boolean(updatingStatus)}
                      accessibilityRole="button"
                    >
                      <Ionicons
                        name={option.icon}
                        size={17}
                        color={active ? COLORS.WHITE : COLORS.PRIMARY_NAVY}
                      />
                      <Text style={[styles.statusButtonText, active && styles.statusButtonTextActive]}>
                        {updatingStatus === option.key ? "Updating..." : option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.notice}>This birth application could not be found.</Text>
        )}
      </ScrollView>
    </View>
  );
}

function Detail({ label, value }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
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
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "700",
  },
  content: { padding: 16, paddingBottom: 30 },
  summaryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 16,
    marginBottom: 12,
  },
  reference: { color: COLORS.MUTED_TEXT, fontSize: 12, fontWeight: "700" },
  childName: { marginVertical: 9, color: COLORS.PRIMARY_NAVY, fontSize: 21, fontWeight: "700" },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { marginBottom: 3, color: COLORS.PRIMARY_NAVY, fontSize: 15, fontWeight: "700" },
  detail: { marginTop: 12 },
  label: { color: COLORS.MUTED_TEXT, fontSize: 12, fontWeight: "600" },
  value: { marginTop: 4, color: COLORS.DARK_TEXT, fontSize: 15, lineHeight: 21 },
  notice: { marginTop: 10, color: COLORS.PRIMARY_NAVY, fontSize: 13 },
  statusActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  statusButton: {
    flexGrow: 1,
    minWidth: "30%",
    minHeight: 44,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 9,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  statusButtonActive: { backgroundColor: COLORS.PRIMARY_NAVY, borderColor: COLORS.PRIMARY_NAVY },
  statusButtonText: { color: COLORS.PRIMARY_NAVY, fontSize: 12, fontWeight: "700" },
  statusButtonTextActive: { color: COLORS.WHITE },
  disabledButton: { opacity: 0.65 },
});
