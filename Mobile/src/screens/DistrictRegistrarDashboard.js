import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import {
  BIRTH_REGISTRATIONS,
  BIRTH_STATS,
  DEATH_REGISTRATIONS,
  DEATH_STATS,
} from "../constants/districtRegistrations";
import { clearAuthToken } from "../services/api";
import DistrictRegistrarSidebar from "../components/DistrictRegistrarSidebar";

const AREAS = {
  birth: {
    title: "Welcome, Birth Registrar",
    subtitle: "Manage birth registrations",
    stats: BIRTH_STATS,
    primaryLabel: "New Birth Registration",
    secondaryLabel: "View All Birth Certificates",
    records: BIRTH_REGISTRATIONS,
  },
  death: {
    title: "Welcome, Death Registrar",
    subtitle: "Manage death registrations",
    stats: DEATH_STATS,
    primaryLabel: "New Death Registration",
    secondaryLabel: "View All Death Certificates",
    records: DEATH_REGISTRATIONS,
  },
};

export default function DistrictRegistrarDashboard({ navigation }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [area, setArea] = useState("birth");
  const selected = AREAS[area];

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <DistrictRegistrarSidebar
        visible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(target, params) => navigation.navigate(target, params)}
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
          <Text style={styles.headerTitle}>District Registrar</Text>
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

      <View style={styles.switcherWrap}>
        <View style={styles.switcher}>
          <Pressable
            style={[styles.switchButton, area === "birth" && styles.switchButtonActive]}
            onPress={() => setArea("birth")}
            accessibilityRole="button"
            accessibilityState={{ selected: area === "birth" }}
          >
            <Text style={[styles.switchText, area === "birth" && styles.switchTextActive]}>Birth</Text>
          </Pressable>
          <Pressable
            style={[styles.switchButton, area === "death" && styles.switchButtonActive]}
            onPress={() => setArea("death")}
            accessibilityRole="button"
            accessibilityState={{ selected: area === "death" }}
          >
            <Text style={[styles.switchText, area === "death" && styles.switchTextActive]}>Death</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RegistrationSection
          title={selected.title}
          subtitle={selected.subtitle}
          stats={selected.stats}
          primaryLabel={selected.primaryLabel}
          secondaryLabel={selected.secondaryLabel}
          records={selected.records}
          onPrimary={() => navigation.navigate("NewDistrictRegistration", { kind: area })}
          onSecondary={() => navigation.navigate("DistrictCertificateList", { kind: area })}
          onView={(registrationId) =>
            navigation.navigate("DistrictRegistrationDetail", { registrationId })
          }
        />
      </ScrollView>
    </View>
  );
}

function RegistrationSection({
  title,
  subtitle,
  stats,
  primaryLabel,
  secondaryLabel,
  records,
  onPrimary,
  onSecondary,
  onView,
}) {
  return (
    <View style={styles.section}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcome}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.statsRow}>
        {stats.map((item) => (
          <View key={item.key} style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name={item.icon} size={18} color={COLORS.PRIMARY_NAVY} />
            </View>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.primaryButton} onPress={onPrimary} accessibilityRole="button">
        <Ionicons name="add" size={18} color={COLORS.WHITE} />
        <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
      </Pressable>

      <Pressable style={styles.primaryButton} onPress={onSecondary} accessibilityRole="button">
        <Ionicons name="document-text-outline" size={18} color={COLORS.WHITE} />
        <Text style={styles.primaryButtonText}>{secondaryLabel}</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Registrations</Text>
        <View style={styles.metaPill}>
          <Text style={styles.sectionMeta}>Showing 2 latest</Text>
        </View>
      </View>

      {records.map((item) => (
        <View key={item.id} style={styles.recordCard}>
          <View style={styles.recordTop}>
            <Text style={styles.recordId}>{item.id}</Text>
            <View
              style={[
                styles.status,
                item.status === "Approved" ? styles.statusApproved : styles.statusPending,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.status === "Approved" ? styles.statusTextApproved : styles.statusTextPending,
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.recordName}>{item.name}</Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.MUTED_TEXT} />
            <Text style={styles.date}>{item.date}</Text>
          </View>
          <Pressable
            style={styles.viewButton}
            onPress={() => onView(item.id)}
            accessibilityRole="button"
          >
            <Text style={styles.viewButtonText}>View</Text>
          </Pressable>
        </View>
      ))}
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
  switcherWrap: {
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  switcher: {
    flexDirection: "row",
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 4,
  },
  switchButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  switchButtonActive: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  switchText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  switchTextActive: {
    color: COLORS.WHITE,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  section: {
    marginBottom: 8,
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
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    marginTop: 8,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 26,
    fontWeight: "700",
  },
  statLabel: {
    marginTop: 2,
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  primaryButton: {
    marginTop: 12,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  primaryButtonText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "700",
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
  },
  recordTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recordId: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  status: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusApproved: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  statusPending: {
    backgroundColor: COLORS.ACCENT_YELLOW,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTextApproved: {
    color: COLORS.WHITE,
  },
  statusTextPending: {
    color: COLORS.PRIMARY_NAVY,
  },
  recordName: {
    marginTop: 10,
    color: COLORS.DARK_TEXT,
    fontSize: 16,
    fontWeight: "700",
  },
  dateRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  date: {
    color: COLORS.MUTED_TEXT,
    fontSize: 13,
  },
  viewButton: {
    marginTop: 14,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  viewButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: "700",
  },
});
