import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import {
  CERTIFICATE_VIEWS,
  VILLAGE_CERTIFICATES,
  VILLAGE_PORTAL,
} from "../constants/villageCertificates";
import { clearAuthToken } from "../services/api";
import VillageOfficerSidebar from "../components/VillageOfficerSidebar";

export default function VillageOfficerDashboard({ navigation }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function openCertificates(type) {
    navigation.navigate("VillageCertificateList", { certificateType: type });
  }

  function openNicForm() {
    navigation.navigate("NicForm");
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <VillageOfficerSidebar
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <View style={styles.portalRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.ACCENT_YELLOW} />
            <Text style={styles.portal}>{VILLAGE_PORTAL}</Text>
          </View>
          <Text style={styles.welcome}>Welcome, Village Officer</Text>
          <Text style={styles.subtitle}>View certificates and manage NIC forms</Text>

          {CERTIFICATE_VIEWS.map((item) => (
            <Pressable
              key={item.type}
              style={styles.viewButton}
              onPress={() => openCertificates(item.type)}
              accessibilityRole="button"
            >
              <Ionicons name={item.icon} size={18} color={COLORS.WHITE} />
              <Text style={styles.viewButtonText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.nicButton} onPress={openNicForm} accessibilityRole="button">
          <Ionicons name="create-outline" size={18} color={COLORS.PRIMARY_NAVY} />
          <Text style={styles.nicButtonText}>Fill NIC Form</Text>
        </Pressable>

        <Pressable
          style={styles.reportButton}
          onPress={() => navigation.navigate("DeathReport", { report: null, fresh: Date.now() })}
          accessibilityRole="button"
        >
          <Ionicons name="add-circle-outline" size={18} color={COLORS.WHITE} />
          <Text style={styles.reportButtonText}>Report a Death</Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Certificates</Text>
          <View style={styles.metaPill}>
            <Text style={styles.sectionMeta}>Showing 3 records</Text>
          </View>
        </View>

        {VILLAGE_CERTIFICATES.map((item) => (
          <Pressable
            key={item.id}
            style={styles.recordCard}
            onPress={() => navigation.navigate("VillageCertificateDetail", { certificateId: item.id })}
            accessibilityRole="button"
          >
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={16} color={COLORS.PRIMARY_NAVY} />
            </View>
            <View style={styles.recordCopy}>
              <Text style={styles.recordMeta}>
                {item.typeLabel} • {item.date}
              </Text>
              <Text style={styles.recordName}>{item.name}</Text>
              <Text style={styles.recordRef}>Ref: {item.ref}</Text>
            </View>
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
          </Pressable>
        ))}

        <View style={styles.nicCard}>
          <View style={styles.nicTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="id-card-outline" size={16} color={COLORS.PRIMARY_NAVY} />
            </View>
            <Text style={styles.nicTitle}>NIC Form</Text>
          </View>
          <Text style={styles.nicBody}>
            National Identity Card application assistance and verification for local division
            residents.
          </Text>
          <Pressable style={styles.startButton} onPress={openNicForm} accessibilityRole="button">
            <Text style={styles.startButtonText}>Start NIC Form</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.WHITE} />
          </Pressable>
        </View>
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
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  portalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  portal: {
    color: COLORS.ACCENT_YELLOW,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  welcome: {
    marginTop: 10,
    color: COLORS.WHITE,
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    color: COLORS.WHITE,
    fontSize: 14,
    opacity: 0.85,
  },
  viewButton: {
    marginTop: 10,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  viewButtonText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "700",
  },
  nicButton: {
    marginTop: 12,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.ACCENT_YELLOW,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nicButtonText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  reportButton: {
    marginTop: 12,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  reportButtonText: {
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
  recordCopy: {
    flex: 1,
  },
  recordMeta: {
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  recordName: {
    marginTop: 3,
    color: COLORS.DARK_TEXT,
    fontSize: 15,
    fontWeight: "700",
  },
  recordRef: {
    marginTop: 2,
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
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
  nicCard: {
    marginTop: 6,
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
  },
  nicTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nicTitle: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 16,
    fontWeight: "700",
  },
  nicBody: {
    marginTop: 10,
    color: COLORS.MUTED_TEXT,
    fontSize: 14,
    lineHeight: 20,
  },
  startButton: {
    marginTop: 14,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  startButtonText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "700",
  },
});
