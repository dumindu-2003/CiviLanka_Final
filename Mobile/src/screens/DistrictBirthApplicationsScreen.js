import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { getBirthApplications } from "../services/api";

const FILTERS = [
  { key: "open", label: "Open" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function DistrictBirthApplicationsScreen({ navigation, route }) {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState(route.params?.status || "open");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (FILTERS.some((filter) => filter.key === route.params?.status)) {
      setStatusFilter(route.params.status);
    }
  }, [route.params?.status]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setIsLoading(true);
      getBirthApplications()
        .then((items) => {
          if (active) {
            setApplications(items);
            setLoadError("");
          }
        })
        .catch((error) => {
          if (active) {
            setLoadError(error.message);
          }
        })
        .finally(() => {
          if (active) {
            setIsLoading(false);
          }
        });
      return () => {
        active = false;
      };
    }, [])
  );

  const filtered = applications.filter((application) => application.statusCode === statusFilter);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>Birth Applications</Text>
          <Pressable
            onPress={() => navigation.navigate("NewBirthApplication")}
            style={styles.addButton}
            accessibilityLabel="Create birth application"
          >
            <Ionicons name="add" size={25} color={COLORS.WHITE} />
          </Pressable>
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <View style={styles.filterWrap}>
        <View style={styles.filterRow}>
          {FILTERS.map((filter) => (
            <Pressable
              key={filter.key}
              style={[styles.filterButton, statusFilter === filter.key && styles.filterButtonActive]}
              onPress={() => setStatusFilter(filter.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: statusFilter === filter.key }}
            >
              <Text style={[styles.filterText, statusFilter === filter.key && styles.filterTextActive]}>
                {filter.label}
              </Text>
              <Text style={[styles.filterCount, statusFilter === filter.key && styles.filterTextActive]}>
                {applications.filter((item) => item.statusCode === filter.key).length}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? <Text style={styles.message}>Loading birth applications...</Text> : null}
        {loadError ? <Text style={styles.error}>{loadError}</Text> : null}
        {!isLoading && !loadError && filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={30} color={COLORS.MUTED_TEXT} />
            <Text style={styles.emptyTitle}>No {statusFilter} applications</Text>
            <Text style={styles.emptyText}>Birth applications with this status will appear here.</Text>
          </View>
        ) : null}
        {filtered.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            onView={() => navigation.navigate("DistrictBirthApplicationDetail", { application })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export function ApplicationCard({ application, onView }) {
  const status = application.statusCode || application.status;
  return (
    <View style={styles.applicationCard}>
      <View style={styles.cardTop}>
        <Text style={styles.reference}>{application.applicationReference}</Text>
        <StatusPill status={status} />
      </View>
      <Text style={styles.childName}>{application.birthName}</Text>
      <Text style={styles.parentNames}>
        {application.fatherName} & {application.motherName}
      </Text>
      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={15} color={COLORS.MUTED_TEXT} />
        <Text style={styles.meta}>{application.birthDate}</Text>
      </View>
      <Pressable style={styles.viewButton} onPress={onView} accessibilityRole="button">
        <Text style={styles.viewButtonText}>View application</Text>
        <Ionicons name="arrow-forward" size={16} color={COLORS.WHITE} />
      </Pressable>
    </View>
  );
}

export function StatusPill({ status }) {
  const normalizedStatus = ["open", "approved", "rejected"].includes(status) ? status : "open";
  const labels = { open: "Open", approved: "Approved", rejected: "Rejected" };
  return (
    <View style={[styles.statusPill, styles[`status_${normalizedStatus}`]]}>
      <Text style={[styles.statusText, styles[`statusText_${normalizedStatus}`]]}>
        {labels[normalizedStatus]}
      </Text>
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
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  headerAccent: { height: 4, backgroundColor: COLORS.ACCENT_YELLOW },
  backButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  addButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: COLORS.WHITE, fontSize: 18, fontWeight: "700" },
  filterWrap: { paddingHorizontal: 16, paddingTop: 14 },
  filterRow: {
    flexDirection: "row",
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 12,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  filterButtonActive: { backgroundColor: COLORS.PRIMARY_NAVY },
  filterText: { color: COLORS.PRIMARY_NAVY, fontSize: 12, fontWeight: "700" },
  filterTextActive: { color: COLORS.WHITE },
  filterCount: { color: COLORS.MUTED_TEXT, fontSize: 11, fontWeight: "700" },
  content: { padding: 16, paddingBottom: 30 },
  message: { marginTop: 18, color: COLORS.MUTED_TEXT, fontSize: 14 },
  error: { marginTop: 18, color: "#B42318", fontSize: 14 },
  emptyCard: {
    marginTop: 8,
    padding: 22,
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 14,
  },
  emptyTitle: { marginTop: 10, color: COLORS.PRIMARY_NAVY, fontSize: 16, fontWeight: "700" },
  emptyText: { marginTop: 5, color: COLORS.MUTED_TEXT, fontSize: 13, textAlign: "center" },
  applicationCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
    marginBottom: 12,
  },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reference: { color: COLORS.PRIMARY_NAVY, fontSize: 12, fontWeight: "700" },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  status_open: { backgroundColor: "#FFF4D6" },
  status_approved: { backgroundColor: "#E7F5EC" },
  status_rejected: { backgroundColor: "#FDECEC" },
  statusText: { fontSize: 11, fontWeight: "700" },
  statusText_open: { color: "#8A5A00" },
  statusText_approved: { color: "#18703A" },
  statusText_rejected: { color: "#B42318" },
  childName: { marginTop: 11, color: COLORS.DARK_TEXT, fontSize: 17, fontWeight: "700" },
  parentNames: { marginTop: 4, color: COLORS.MUTED_TEXT, fontSize: 13 },
  metaRow: { marginTop: 9, flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { color: COLORS.MUTED_TEXT, fontSize: 12 },
  viewButton: {
    marginTop: 13,
    minHeight: 40,
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  viewButtonText: { color: COLORS.WHITE, fontSize: 13, fontWeight: "700" },
});
