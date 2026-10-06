import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { BANK_BRANCH, BANK_VERIFICATIONS } from "../constants/bankVerifications";
import { clearAuthToken } from "../services/api";
import BankOfficerSidebar from "../components/BankOfficerSidebar";

const DEFAULT_RECORD = BANK_VERIFICATIONS[0];

export default function BankOfficerDashboard({ navigation }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [nic, setNic] = useState(DEFAULT_RECORD.nic);
  const [result, setResult] = useState(DEFAULT_RECORD);
  const [lookupMessage, setLookupMessage] = useState("");

  function handleVerify() {
    const value = nic.trim();
    if (value === "") {
      setResult(null);
      setLookupMessage("Enter an NIC or certificate number.");
      return;
    }

    const match = BANK_VERIFICATIONS.find((item) => item.nic === value);
    if (!match) {
      setResult(null);
      setLookupMessage("No official Sri Lanka registry match for this number.");
      return;
    }

    setLookupMessage("");
    setResult(match);
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <BankOfficerSidebar
        visible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(target) => navigation.navigate(target)}
        onLogout={async () => {
          await clearAuthToken();
          const rootNavigation = navigation.getParent()?.getParent() ?? navigation.getParent();
          rootNavigation?.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        }}
      />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Pressable
            accessibilityLabel="Open sidebar"
            style={styles.headerIcon}
            onPress={() => setIsSidebarOpen(true)}
          >
            <Ionicons name="menu" size={24} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Pressable
            accessibilityLabel="Profile"
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons name="person-outline" size={18} color={COLORS.WHITE} />
          </Pressable>
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeText}>
            <Text style={styles.welcome}>Welcome, Bank Officer</Text>
            <Text style={styles.subtitle}>Verify customer identity against national registry</Text>
          </View>
          <View style={styles.branchPill}>
            <Text style={styles.branchText}>{BANK_BRANCH}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="search-outline" size={16} color={COLORS.PRIMARY_NAVY} />
              </View>
              <Text style={styles.cardTitle}>Identity Verification</Text>
            </View>
            <View style={styles.apiPill}>
              <Text style={styles.apiPillText}>DIRECT API</Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>NIC / CERTIFICATE NUMBER</Text>
          <TextInput
            value={nic}
            onChangeText={setNic}
            placeholder="Enter NIC or certificate number"
            placeholderTextColor={COLORS.MUTED_TEXT}
            keyboardType="number-pad"
            style={styles.input}
            accessibilityLabel="NIC or certificate number"
          />
          <Pressable style={styles.verifyButton} onPress={handleVerify} accessibilityRole="button">
            <Text style={styles.verifyButtonText}>VERIFY</Text>
          </Pressable>
        </View>

        {result ? (
          <View style={styles.card}>
            <View style={styles.resultTop}>
              <View style={styles.resultTitleRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.PRIMARY_NAVY} />
                </View>
                <View style={styles.resultCopy}>
                  <Text style={styles.cardTitle}>Identity Verified Successfully</Text>
                  <Text style={styles.resultMeta}>Verified • Official Sri Lanka Registry Match</Text>
                </View>
              </View>
              <View style={styles.validPill}>
                <Text style={styles.validText}>Valid</Text>
              </View>
            </View>

            <View style={styles.detailGrid}>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>FULL NAME</Text>
                <Text style={styles.detailValue}>{result.fullName}</Text>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>NIC NUMBER</Text>
                <Text style={styles.detailValue}>{result.nic}</Text>
              </View>
              {result.dateOfBirth ? (
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>DATE OF BIRTH</Text>
                  <Text style={styles.detailValue}>{result.dateOfBirth}</Text>
                </View>
              ) : null}
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>DOCUMENT TYPE</Text>
                <Text style={styles.detailValue}>{result.documentType}</Text>
              </View>
            </View>

            <View style={styles.resultFooter}>
              {result.hash ? (
                <View style={styles.footerItem}>
                  <Ionicons name="lock-closed-outline" size={14} color={COLORS.MUTED_TEXT} />
                  <Text style={styles.footerText}>Encrypted Query Hash {result.hash}</Text>
                </View>
              ) : (
                <View style={styles.footerItem} />
              )}
              <Text style={styles.footerText}>{result.verifiedAt}</Text>
            </View>
          </View>
        ) : null}

        {lookupMessage !== "" ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>{lookupMessage}</Text>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Verifications</Text>
          <View style={styles.metaPill}>
            <Text style={styles.sectionMeta}>Showing 2 records</Text>
          </View>
        </View>

        {BANK_VERIFICATIONS.map((item) => (
          <View key={item.nic} style={styles.recordCard}>
            <View style={styles.recordLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-outline" size={16} color={COLORS.PRIMARY_NAVY} />
              </View>
              <View>
                <Text style={styles.recordName}>{item.fullName}</Text>
                <Text style={styles.recordNic}>NIC: {item.nic}</Text>
              </View>
            </View>
            <View style={styles.recordRight}>
              <View style={styles.verifiedPill}>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
              <Text style={styles.recordDate}>{item.date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  headerAccent: {
    height: 4,
    backgroundColor: COLORS.ACCENT_YELLOW,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  welcomeText: {
    flex: 1,
  },
  welcome: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    color: COLORS.MUTED_TEXT,
    fontSize: 14,
  },
  branchPill: {
    backgroundColor: COLORS.ACCENT_YELLOW,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  branchText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 12,
    fontWeight: "700",
  },
  card: {
    marginTop: 14,
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  apiPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  apiPillText: {
    color: COLORS.MUTED_TEXT,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  fieldLabel: {
    marginTop: 16,
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  input: {
    marginTop: 8,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 14,
    color: COLORS.DARK_TEXT,
    fontSize: 16,
  },
  verifyButton: {
    marginTop: 12,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButtonText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  resultTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  resultTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  resultCopy: {
    flex: 1,
  },
  resultMeta: {
    marginTop: 3,
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
  },
  validPill: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  validText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: "700",
  },
  detailGrid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 14,
  },
  detailCell: {
    width: "50%",
    paddingRight: 8,
  },
  detailLabel: {
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  detailValue: {
    marginTop: 4,
    color: COLORS.DARK_TEXT,
    fontSize: 14,
    fontWeight: "700",
  },
  resultFooter: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_BORDER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  footerItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
  },
  noticeCard: {
    marginTop: 14,
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  noticeText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "600",
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 17,
    fontWeight: "700",
  },
  metaPill: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sectionMeta: {
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
    fontWeight: "600",
  },
  recordCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  recordLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  recordName: {
    color: COLORS.DARK_TEXT,
    fontSize: 15,
    fontWeight: "700",
  },
  recordNic: {
    marginTop: 2,
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
  },
  recordRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  verifiedPill: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verifiedText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: "700",
  },
  recordDate: {
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
  },
});
