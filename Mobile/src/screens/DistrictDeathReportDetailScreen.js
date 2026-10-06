import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { approveDeathReport } from "../services/api";

export default function DistrictDeathReportDetailScreen({ navigation, route }) {
  const [report, setReport] = useState(route.params?.report || null);
  const [isApproving, setIsApproving] = useState(false);
  const [notice, setNotice] = useState("");
  const submitted = formatSubmitted(report?.submittedAt);
  const isApproved = report?.statusCode === "approved";

  async function handleApprove() {
    if (!report?.id || isApproved || isApproving) {
      return;
    }
    setIsApproving(true);
    setNotice("");
    try {
      const updated = await approveDeathReport(report.id);
      setReport(updated);
      setNotice("Death report approved.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setIsApproving(false);
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
          <Text style={styles.headerTitle}>Death Report</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {report ? (
          <View style={styles.card}>
            <Text style={styles.reference}>{report.reportReference}</Text>
            <View style={[styles.status, isApproved && styles.statusApproved]}>
              <Text style={[styles.statusText, isApproved && styles.statusTextApproved]}>{report.status}</Text>
            </View>
            <Row label="Full name" value={report.fullName} />
            <Row label="NIC" value={report.nic || "Not provided"} />
            <Row label="Date of death" value={report.dateOfDeath} />
            <Row label="Place of death" value={report.placeOfDeath} />
            <Row label="Gender" value={report.gender} />
            <Row label="Age" value={String(report.age ?? "")} />
            <Row label="Informant" value={report.informantName} />
            <Row label="Informant NIC" value={report.informantNic} />
            <Row label="Relationship" value={report.relationship} />
            <Row label="Phone" value={report.informantPhone} />
            <Row label="Division" value={report.division} />
            <Row
              label="Village officer"
              value={
                report.officerName
                  ? `${report.officerName} (${report.officerService})`
                  : ""
              }
            />
            <Row label="Submitted" value={submitted} />
            {isApproved ? null : (
              <Pressable
                style={styles.approveButton}
                onPress={handleApprove}
                disabled={isApproving}
                accessibilityRole="button"
              >
                <Text style={styles.approveText}>{isApproving ? "Approving..." : "Approve"}</Text>
              </Pressable>
            )}
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          </View>
        ) : (
          <Text style={styles.missing}>This death report could not be found.</Text>
        )}
      </ScrollView>
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
}

function formatSubmitted(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString();
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
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 16,
  },
  reference: { color: COLORS.PRIMARY_NAVY, fontSize: 18, fontWeight: "700" },
  status: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: COLORS.ACCENT_YELLOW,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { color: COLORS.PRIMARY_NAVY, fontSize: 12, fontWeight: "700" },
  statusApproved: { backgroundColor: COLORS.PRIMARY_NAVY },
  statusTextApproved: { color: COLORS.WHITE },
  approveButton: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  approveText: { color: COLORS.WHITE, fontSize: 15, fontWeight: "700" },
  notice: { marginTop: 10, color: COLORS.PRIMARY_NAVY, fontSize: 14, fontWeight: "700" },
  row: { marginTop: 14 },
  label: { color: COLORS.MUTED_TEXT, fontSize: 12, fontWeight: "700" },
  value: { marginTop: 2, color: COLORS.DARK_TEXT, fontSize: 15, lineHeight: 21 },
  missing: { color: COLORS.MUTED_TEXT, fontSize: 15 },
});
