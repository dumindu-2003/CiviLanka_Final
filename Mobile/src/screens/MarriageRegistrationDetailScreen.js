import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { MARRIAGE_REGISTRATIONS } from "../constants/marriageRegistrations";

export default function MarriageRegistrationDetailScreen({ navigation, route }) {
  const saved = route.params?.registration;
  const sample = MARRIAGE_REGISTRATIONS.find((item) => item.id === route.params?.registrationId);
  const registration = saved || sample;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {registration?.registrationReference || registration?.id || "Registration"}
          </Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {registration?.groomName ? (
          <View style={styles.card}>
            <Text style={styles.reference}>{registration.certificateNo || registration.registrationReference}</Text>
            <View style={styles.status}>
              <Text style={styles.statusText}>{registration.status || "Sent to District Registrar"}</Text>
            </View>
            <Section title="Applicant" rows={applicantRows(registration)} />
            <Section title="Groom" rows={groomRows(registration)} />
            <Section title="Bride" rows={brideRows(registration)} />
            <Section title="Solemnization" rows={solemnRows(registration)} />
            <Section title="Female witness" rows={witnessRows(registration, "female")} />
            <Section title="Male witness" rows={witnessRows(registration, "male")} />
            <Section title="Officer" rows={officerRows(registration)} />
          </View>
        ) : registration ? (
          <View style={styles.card}>
            <Row label="Couple" value={registration.couple} />
            <Row label="Date" value={registration.date} />
            <Row label="Status" value={registration.status} />
          </View>
        ) : (
          <Text style={styles.missing}>This registration could not be found.</Text>
        )}
      </ScrollView>
    </View>
  );
}

function Section({ title, rows }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rows.map(([label, value]) => (
        <Row key={label} label={label} value={value} />
      ))}
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

function applicantRows(item) {
  return [
    ["Applicant is the groom", item.applicantIsGroom ? "Yes" : "No"],
    ["Name", item.applicantName],
    ["NIC", item.applicantNic],
    ["Mobile", item.applicantMobile],
    ["Address", item.applicantAddress],
    ["Date of birth", item.applicantDob],
  ];
}

function groomRows(item) {
  return [
    ["Name", item.groomName],
    ["NIC", item.groomNic],
    ["Date of birth", item.groomDob],
    ["Age", item.groomAge ? `${item.groomAge} yrs` : ""],
    ["Occupation", item.groomOccupation],
    ["Address", item.groomAddress],
    ["Religion", item.groomReligion],
    ["Nationality", item.groomNationality],
    ["Marital status", item.groomMaritalStatus],
  ];
}

function brideRows(item) {
  return [
    ["Name", item.brideName],
    ["NIC", item.brideNic],
    ["Date of birth", item.brideDob],
    ["Age", item.brideAge ? `${item.brideAge} yrs` : ""],
    ["Mobile", item.brideMobile],
    ["Occupation", item.brideOccupation],
    ["Address", item.brideAddress],
    ["Religion", item.brideReligion],
    ["Nationality", item.brideNationality],
    ["Marital status", item.brideMaritalStatus],
  ];
}

function solemnRows(item) {
  return [
    ["Date of marriage", item.marriageDate],
    ["Place", item.marriagePlace],
    ["Registrar", item.registrarName],
    ["Registration number", item.registrationNumber],
  ];
}

function witnessRows(item, side) {
  const prefix = side === "female" ? "femaleWitness" : "maleWitness";
  return [
    ["Name", item[`${prefix}Name`]],
    ["NIC", item[`${prefix}Nic`]],
    ["Relationship", item[`${prefix}Relationship`]],
    ["Address", item[`${prefix}Address`]],
    ["Phone", item[`${prefix}Phone`]],
  ];
}

function officerRows(item) {
  return [
    ["Officer", item.officerName],
    ["Service number", item.officerServiceNumber],
    ["Declaration", item.declarationAccepted ? "Accepted" : "Not accepted"],
    ["Submitted by", item.submittedBy],
  ];
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
  headerTitle: { flex: 1, textAlign: "center", color: COLORS.WHITE, fontSize: 16, fontWeight: "700" },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 16,
  },
  reference: { color: COLORS.PRIMARY_NAVY, fontSize: 16, fontWeight: "700" },
  status: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: COLORS.ACCENT_YELLOW,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { color: COLORS.PRIMARY_NAVY, fontSize: 12, fontWeight: "700" },
  section: { marginTop: 16 },
  sectionTitle: { color: COLORS.PRIMARY_NAVY, fontSize: 15, fontWeight: "700" },
  row: { marginTop: 10 },
  label: { color: COLORS.MUTED_TEXT, fontSize: 12, fontWeight: "700" },
  value: { marginTop: 2, color: COLORS.DARK_TEXT, fontSize: 15, lineHeight: 21 },
  missing: { color: COLORS.MUTED_TEXT, fontSize: 15 },
});
