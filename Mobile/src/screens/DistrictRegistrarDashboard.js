import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import {
  DEATH_REGISTRATIONS,
  DEATH_STATS,
} from "../constants/districtRegistrations";
import { useFocusEffect } from "@react-navigation/native";
import {
  clearAuthToken,
  getBirthApplications,
  getNicApplications,
} from "../services/api";
import DistrictRegistrarSidebar from "../components/DistrictRegistrarSidebar";
import { ApplicationCard } from "./DistrictBirthApplicationsScreen";

const AREAS = {
  death: {
    title: "Welcome, Death Registrar",
    subtitle: "Manage death registrations",
    stats: DEATH_STATS,
    primaryLabel: "New Death Registration",
    secondaryLabel: "View All Death Certificates",
    records: DEATH_REGISTRATIONS,
  },
};

export default function DistrictRegistrarDashboard({ navigation, route }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [area, setArea] = useState(route.params?.area || "birth");
  const [applications, setApplications] = useState([]);
  const [birthApplications, setBirthApplications] = useState([]);
  const [birthStatus, setBirthStatus] = useState("open");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const selected = AREAS[area];

  useEffect(() => {
    if (route.params?.area) {
      setArea(route.params.area);
    }
  }, [route.params?.area]);

  useFocusEffect(
    useCallback(() => {
      if (area !== "nic" && area !== "birth") {
        return undefined;
      }

      let active = true;
      setIsLoading(true);
      const loadApplications =
        area === "birth" ? getBirthApplications : getNicApplications;
      loadApplications()
        .then((items) => {
          if (!active) {
            return;
          }
          if (area === "birth") {
            setBirthApplications(items);
          } else {
            setApplications(items);
          }
          setLoadError("");
        })
        .catch((error) => {
          if (!active) {
            return;
          }
          if (area === "birth") {
            setBirthApplications([]);
          } else {
            setApplications([]);
          }
          setLoadError(error.message);
        })
        .finally(() => {
          if (active) {
            setIsLoading(false);
          }
        });

      return () => {
        active = false;
      };
    }, [area])
  );

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
          <Pressable
            style={[styles.switchButton, area === "nic" && styles.switchButtonActive]}
            onPress={() => setArea("nic")}
            accessibilityRole="button"
            accessibilityState={{ selected: area === "nic" }}
          >
            <Text style={[styles.switchText, area === "nic" && styles.switchTextActive]}>NIC</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {area === "nic" ? (
          <NicApplications
            applications={applications}
            isLoading={isLoading}
            loadError={loadError}
            onView={(application) => navigation.navigate("NicApplicationDetail", { application })}
          />
        ) : area === "birth" ? (
          <BirthApplications
            applications={birthApplications}
            status={birthStatus}
            onStatusChange={setBirthStatus}
            isLoading={isLoading}
            loadError={loadError}
            onCreate={() => navigation.navigate("NewBirthApplication")}
            onViewAll={() => navigation.navigate("DistrictBirthApplications", { status: birthStatus })}
            onView={(application) =>
              navigation.navigate("DistrictBirthApplicationDetail", { application })
            }
          />
        ) : (
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
        )}
      </ScrollView>
    </View>
  );
}

function BirthApplications({
  applications,
  status,
  onStatusChange,
  isLoading,
  loadError,
  onCreate,
  onViewAll,
  onView,
}) {
  const statusOptions = [
    { key: "open", label: "Open" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];
  const filtered = applications.filter((item) => item.statusCode === status).slice(0, 5);

  return (
    <View style={styles.section}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcome}>Birth Applications</Text>
        <Text style={styles.subtitle}>Create and manage birth registrations</Text>
      </View>

      <View style={styles.statsRow}>
        {statusOptions.map((option) => (
          <View key={option.key} style={styles.statCard}>
            <Text style={styles.statValue}>
              {applications.filter((item) => item.statusCode === option.key).length}
            </Text>
            <Text style={styles.statLabel}>{option.label}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.primaryButton} onPress={onCreate} accessibilityRole="button">
        <Ionicons name="add" size={18} color={COLORS.WHITE} />
        <Text style={styles.primaryButtonText}>New Birth Application</Text>
      </Pressable>
      <Pressable style={styles.secondaryAction} onPress={onViewAll} accessibilityRole="button">
        <Ionicons name="list-outline" size={18} color={COLORS.PRIMARY_NAVY} />
        <Text style={styles.secondaryActionText}>View All Applications</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Latest Applications</Text>
        <View style={styles.metaPill}>
          <Text style={styles.sectionMeta}>Latest 5</Text>
        </View>
      </View>
      <View style={styles.birthStatusTabs}>
        {statusOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[styles.birthStatusTab, status === option.key && styles.birthStatusTabActive]}
            onPress={() => onStatusChange(option.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: status === option.key }}
          >
            <Text
              style={[
                styles.birthStatusText,
                status === option.key && styles.birthStatusTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? <Text style={styles.emptyText}>Loading birth applications...</Text> : null}
      {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}
      {!isLoading && !loadError && filtered.length === 0 ? (
        <Text style={styles.emptyText}>No {status} birth applications found.</Text>
      ) : null}
      {filtered.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          onView={() => onView(application)}
        />
      ))}
    </View>
  );
}

function NicApplications({ applications, isLoading, loadError, onView }) {
  return (
    <View style={styles.section}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcome}>NIC Applications</Text>
        <Text style={styles.subtitle}>Submitted by village officers for review</Text>
      </View>

      {isLoading ? <Text style={styles.emptyText}>Loading applications...</Text> : null}
      {loadError ? <Text style={styles.emptyText}>{loadError}</Text> : null}
      {!isLoading && !loadError && applications.length === 0 ? (
        <Text style={styles.emptyText}>No NIC applications are waiting for review.</Text>
      ) : null}

      {applications.map((item) => {
        const approved = item.statusCode === "approved";
        return (
        <View key={item.id} style={styles.recordCard}>
          <View style={styles.recordTop}>
            <Text style={styles.recordId}>{item.applicationReference}</Text>
            <View style={[styles.status, approved ? styles.statusApproved : styles.statusPending]}>
              <Text
                style={[
                  styles.statusText,
                  approved ? styles.statusTextApproved : styles.statusTextPending,
                ]}
              >
                {approved ? "Approved" : "Pending"}
              </Text>
            </View>
          </View>
          <Text style={styles.recordName}>{item.fullName}</Text>
          <View style={styles.dateRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.MUTED_TEXT} />
            <Text style={styles.date}>{item.district}</Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.MUTED_TEXT} />
            <Text style={styles.date}>{formatSubmitted(item.submittedAt)}</Text>
          </View>
          <Pressable
            style={styles.viewButton}
            onPress={() => onView(item)}
            accessibilityRole="button"
          >
            <Text style={styles.viewButtonText}>View</Text>
          </Pressable>
        </View>
        );
      })}
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
  emptyText: {
    marginTop: 16,
    color: COLORS.MUTED_TEXT,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    marginTop: 16,
    color: "#B42318",
    fontSize: 14,
    lineHeight: 20,
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
  secondaryAction: {
    marginTop: 8,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryActionText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  birthStatusTabs: {
    flexDirection: "row",
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  birthStatusTab: {
    flex: 1,
    minHeight: 38,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  birthStatusTabActive: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  birthStatusText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 12,
    fontWeight: "700",
  },
  birthStatusTextActive: {
    color: COLORS.WHITE,
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
