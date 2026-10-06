import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";

export default function NicFormReceiptScreen({ navigation, route }) {
  const receipt = route.params?.receipt || {};
  const submittedLabel = formatSubmitted(receipt.submittedAt);

  async function printReceipt() {
    const message = [
      "CiviLanka NIC Application Receipt",
      `Reference: ${receipt.reference || ""}`,
      `Applicant: ${receipt.applicantName || ""}`,
      `Authorizing Officer: GN Officer ${receipt.officerService || ""}`,
      `Destination: ${receipt.destination || ""}`,
      `Status: ${receipt.status || "PENDING APPROVAL"}`,
      `Submitted: ${submittedLabel}`,
    ].join("\n");
    await Share.share({ message });
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <View style={styles.headerBack} />
          <Text style={styles.headerTitle}>Application Receipt</Text>
          <View style={styles.headerBack} />
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="checkmark" size={28} color={COLORS.PRIMARY_NAVY} />
          </View>
          <Text style={styles.heroTitle}>Application Submitted to District Registrar</Text>
          <Text style={styles.heroBody}>
            The NIC Application has been successfully authorized and queued in the District
            Registrar's Pending Review list.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>APPLICATION REFERENCE</Text>
          <Text style={styles.reference}>{receipt.reference}</Text>
          <Detail label="Applicant" value={receipt.applicantName} />
          <Detail label="Authorizing Officer" value={`GN Officer ${receipt.officerService || ""}`} />
          <Detail label="Routed Destination" value={receipt.destination} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Status</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{receipt.status || "PENDING APPROVAL"}</Text>
            </View>
          </View>
          <Detail label="Submission" value={submittedLabel} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>VERIFICATION MILESTONES</Text>
          <Milestone
            done
            title="Step 1: Submission & Officer Sign-off"
            detail="Completed & validated by Grama Niladhari"
          />
          <Milestone
            active
            title="Step 2: Registrar Document Review"
            detail="Under queue for official identity clearance"
          />
          <Milestone
            title="Step 3: Biometrics & Production"
            detail="Awaiting Step 2 authorization"
          />
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate("DistrictRegistrar", {
              screen: "Home",
              params: { area: "nic" },
            })
          }
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>VIEW DISTRICT REGISTRAR DASHBOARD</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.WHITE} />
        </Pressable>
        <Pressable style={styles.yellowButton} onPress={printReceipt} accessibilityRole="button">
          <Ionicons name="print-outline" size={16} color={COLORS.PRIMARY_NAVY} />
          <Text style={styles.yellowButtonText}>PRINT APPLICATION RECEIPT</Text>
        </Pressable>
        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            navigation.reset({
              index: 1,
              routes: [
                { name: "VillageOfficer" },
                { name: "NicForm", params: { fresh: Date.now() } },
              ],
            })
          }
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>Start New Application</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function formatSubmitted(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }
  const pad = (part) => String(part).padStart(2, "0");
  const hours = date.getHours();
  const shownHours = hours % 12 || 12;
  const suffix = hours >= 12 ? "PM" : "AM";
  const stamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(shownHours)}:${pad(date.getMinutes())} ${suffix}`;
  return `Just now • ${stamp}`;
}

function Detail({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function Milestone({ title, detail, done, active }) {
  return (
    <View style={styles.milestone}>
      <View style={[styles.milestoneDot, (done || active) && styles.milestoneDotOn]}>
        {done ? <Ionicons name="checkmark" size={12} color={COLORS.WHITE} /> : null}
      </View>
      <View style={styles.milestoneCopy}>
        <Text style={styles.milestoneTitle}>{title}</Text>
        <Text style={styles.milestoneDetail}>{detail}</Text>
      </View>
      {active ? (
        <View style={styles.activePill}>
          <Text style={styles.activeText}>Active</Text>
        </View>
      ) : null}
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
  headerBack: { width: 44, height: 44 },
  headerTitle: { flex: 1, textAlign: "center", color: COLORS.WHITE, fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  hero: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    marginTop: 12,
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  heroBody: {
    marginTop: 8,
    color: COLORS.WHITE,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  card: {
    marginTop: 14,
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
  },
  cardLabel: { color: COLORS.MUTED_TEXT, fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  reference: { marginTop: 4, color: COLORS.PRIMARY_NAVY, fontSize: 20, fontWeight: "700" },
  sectionTitle: { color: COLORS.PRIMARY_NAVY, fontSize: 13, fontWeight: "700", letterSpacing: 0.3 },
  detailRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  detailLabel: { color: COLORS.MUTED_TEXT, fontSize: 13 },
  detailValue: { flex: 1, textAlign: "right", color: COLORS.DARK_TEXT, fontSize: 13, fontWeight: "700" },
  statusPill: {
    backgroundColor: COLORS.ACCENT_YELLOW,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { color: COLORS.PRIMARY_NAVY, fontSize: 11, fontWeight: "700" },
  milestone: { marginTop: 14, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  milestoneDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneDotOn: { backgroundColor: COLORS.PRIMARY_NAVY, borderColor: COLORS.PRIMARY_NAVY },
  milestoneCopy: { flex: 1 },
  milestoneTitle: { color: COLORS.DARK_TEXT, fontSize: 14, fontWeight: "700" },
  milestoneDetail: { marginTop: 2, color: COLORS.MUTED_TEXT, fontSize: 12 },
  activePill: {
    backgroundColor: COLORS.ACCENT_YELLOW,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeText: { color: COLORS.PRIMARY_NAVY, fontSize: 11, fontWeight: "700" },
  primaryButton: {
    marginTop: 12,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: { color: COLORS.WHITE, fontSize: 13, fontWeight: "700" },
  yellowButton: {
    marginTop: 10,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.ACCENT_YELLOW,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  yellowButtonText: { color: COLORS.PRIMARY_NAVY, fontSize: 13, fontWeight: "700" },
});
