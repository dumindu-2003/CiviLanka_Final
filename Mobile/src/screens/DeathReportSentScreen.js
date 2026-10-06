import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";

export default function DeathReportSentScreen({ navigation, route }) {
  const report = route.params?.report || {};

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Text style={styles.headerTitle}>Death Report</Text>
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="checkmark" size={28} color={COLORS.PRIMARY_NAVY} />
          </View>
          <Text style={styles.heroTitle}>Sent to District Registrar</Text>
          <Text style={styles.heroBody}>
            The death details were saved. The District Registrar will review this report and
            generate the death certificate.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.reference}>{report.reportReference}</Text>
          <View style={styles.status}>
            <Text style={styles.statusText}>{report.status || "Sent to District Registrar"}</Text>
          </View>
          <Row label="Deceased" value={report.fullName} />
          <Row label="Date of death" value={report.dateOfDeath} />
          <Row label="Place" value={report.placeOfDeath} />
          <Row label="Informant" value={report.informantName} />
          <Row label="Division" value={report.division} />
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate("DeathReportList")}
          accessibilityRole="button"
        >
          <Text style={styles.primaryText}>View death reports</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("VillageOfficer")}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryText}>Back to dashboard</Text>
        </Pressable>
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
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 14,
    minHeight: 52,
  },
  headerAccent: {
    height: 4,
    backgroundColor: COLORS.ACCENT_YELLOW,
  },
  headerTitle: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 16,
    alignItems: "center",
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    marginTop: 12,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  heroBody: {
    marginTop: 6,
    color: COLORS.MUTED_TEXT,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  card: {
    marginTop: 14,
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
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
  },
  primaryButton: {
    marginTop: 16,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 10,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
});
