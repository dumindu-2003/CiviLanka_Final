import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { approveNicApplication } from "../services/api";

export default function NicApplicationDetailScreen({ navigation, route }) {
  const [application, setApplication] = useState(route.params?.application || null);
  const [isApproving, setIsApproving] = useState(false);
  const [notice, setNotice] = useState("");
  const submitted = formatSubmitted(application?.submittedAt);
  const isApproved = application?.statusCode === "approved" || application?.status === "Approved";

  async function handleApprove() {
    if (!application?.id || isApproved || isApproving) {
      return;
    }
    setIsApproving(true);
    setNotice("");
    try {
      const updated = await approveNicApplication(application.id);
      setApplication(updated);
      setNotice("NIC application approved.");
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
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>NIC Application</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {application ? (
          <View style={styles.card}>
            <Text style={styles.reference}>{application.applicationReference}</Text>
            <View style={[styles.status, isApproved && styles.statusApproved]}>
              <Text style={[styles.statusText, isApproved && styles.statusTextApproved]}>
                {application.status || "Pending approval"}
              </Text>
            </View>
            <Row label="Full name" value={application.fullName} />
            <Row label="Date of birth" value={application.dateOfBirth} />
            <Row label="Gender" value={application.gender} />
            <Row label="Place of birth" value={application.placeOfBirth} />
            <Row label="District" value={application.district} />
            <Row label="Religion" value={application.religion} />
            <Row label="Occupation" value={application.occupation} />
            <Row label="Permanent address" value={application.permanentAddress} />
            <Row label="Current address" value={application.currentAddress} />
            <Row label="Phone" value={application.phone} />
            <Row label="Email" value={application.email || "Not provided"} />
            <Row label="Father's name" value={application.fatherFullName} />
            <Row label="Father's NIC" value={application.fatherNic} />
            <Row label="Mother's name" value={application.motherFullName} />
            <Row label="Mother's NIC" value={application.motherNic} />
            <Row label="Marital status" value={application.maritalStatus} />
            <Row label="Birth certificate" value={application.birthCertificateName} />
            <Row label="Proof of address" value={application.proofOfAddressName} />
            <Row label="Passport photo" value={application.passportPhotoName} />
            <Row label="Previous NIC" value={application.previousNicName || "Not provided"} />
            <Row
              label="Authorizing officer"
              value={
                application.authorizingOfficerName
                  ? `${application.authorizingOfficerName} (${application.authorizingOfficerService})`
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
          <Text style={styles.missing}>This application could not be found.</Text>
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
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
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
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 16,
  },
  reference: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 18,
    fontWeight: "700",
  },
  status: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: COLORS.ACCENT_YELLOW,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 12,
    fontWeight: "700",
  },
  statusApproved: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  statusTextApproved: {
    color: COLORS.WHITE,
  },
  approveButton: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  approveText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "700",
  },
  notice: {
    marginTop: 10,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  row: {
    marginTop: 14,
  },
  label: {
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
    fontWeight: "700",
  },
  value: {
    marginTop: 2,
    color: COLORS.DARK_TEXT,
    fontSize: 15,
    lineHeight: 21,
  },
  missing: {
    color: COLORS.MUTED_TEXT,
    fontSize: 15,
  },
});
