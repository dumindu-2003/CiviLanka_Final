import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { getIncomingDeathReports } from "../services/api";
import { buildDeathCertificateHtml } from "../services/deathCertificatePdf";

const FILTERS = [
  { key: "open", label: "Open" },
  { key: "approved", label: "Approved" },
];

export default function DistrictDeathReportsScreen({ navigation, route }) {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState(route.params?.status || "open");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [downloadingId, setDownloadingId] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const approvedOnly = route.params?.approvedOnly === true;

  useEffect(() => {
    if (approvedOnly) {
      setStatusFilter("approved");
    } else if (FILTERS.some((filter) => filter.key === route.params?.status)) {
      setStatusFilter(route.params.status);
    }
  }, [approvedOnly, route.params?.status]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setIsLoading(true);
      getIncomingDeathReports()
        .then((items) => {
          if (!active) {
            return;
          }
          setReports(items);
          setLoadError("");
        })
        .catch((error) => {
          if (!active) {
            return;
          }
          setReports([]);
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
    }, [])
  );

  const filteredReports = reports.filter((item) =>
    item.statusCode === (approvedOnly ? "approved" : statusFilter)
  );

  async function downloadCertificate(report) {
    if (report.statusCode !== "approved" || downloadingId) {
      return;
    }
    setDownloadingId(report.id);
    setDownloadError("");
    try {
      if (!(await Sharing.isAvailableAsync())) {
        setDownloadError("PDF sharing is not available on this device.");
        return;
      }
      const pdf = await Print.printToFileAsync({
        html: buildDeathCertificateHtml(report),
        width: 595,
        height: 842,
      });
      await Sharing.shareAsync(pdf.uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: `Download death certificate ${report.reportReference}`,
      });
    } catch (error) {
      if (!/cancel/i.test(String(error?.message || ""))) {
        setDownloadError(error.message || "Could not create the death certificate PDF.");
      }
    } finally {
      setDownloadingId("");
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
          <Text style={styles.headerTitle}>
            {approvedOnly ? "Approved Death Certificates" : "Death Applications"}
          </Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      {!approvedOnly ? (
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
                {reports.filter((item) => item.statusCode === filter.key).length}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          {approvedOnly
            ? "Only approved death applications can be downloaded as certificates."
            : "Review applications submitted by village officers and update their details or status."}
        </Text>
        {isLoading ? <Text style={styles.empty}>Loading reports...</Text> : null}
        {loadError ? <Text style={styles.empty}>{loadError}</Text> : null}
        {downloadError ? <Text style={styles.error}>{downloadError}</Text> : null}
        {!isLoading && !loadError && filteredReports.length === 0 ? (
          <Text style={styles.empty}>
            {approvedOnly ? "No approved death applications are available." : `No ${statusFilter} death applications found.`}
          </Text>
        ) : null}
        {filteredReports.map((item) => {
          const approved = item.statusCode === "approved";
          return (
          <View key={item.id} style={styles.card}>
            <Text style={styles.reference}>{item.reportReference}</Text>
            <Text style={styles.name}>{item.fullName}</Text>
            <Text style={styles.meta}>
              {item.dateOfDeath} · {item.division}
            </Text>
            <View style={[styles.status, approved && styles.statusApproved]}>
              <Text style={[styles.statusText, approved && styles.statusTextApproved]}>{item.status}</Text>
            </View>
            <Pressable
              style={styles.viewButton}
              onPress={() => navigation.navigate("DistrictDeathReportDetail", { report: item })}
              accessibilityRole="button"
            >
              <Text style={styles.viewButtonText}>View and update</Text>
            </Pressable>
            {approved ? (
              <Pressable
                style={styles.downloadButton}
                onPress={() => downloadCertificate(item)}
                disabled={Boolean(downloadingId)}
                accessibilityRole="button"
              >
                <Ionicons name="download-outline" size={17} color={COLORS.PRIMARY_NAVY} />
                <Text style={styles.downloadButtonText}>
                  {downloadingId === item.id ? "Preparing PDF..." : "Download certificate"}
                </Text>
              </Pressable>
            ) : null}
          </View>
          );
        })}
      </ScrollView>
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
  headerAccent: { height: 4, backgroundColor: COLORS.ACCENT_YELLOW },
  backButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: COLORS.WHITE, fontSize: 18, fontWeight: "700" },
  content: { padding: 16, paddingBottom: 32 },
  intro: { marginBottom: 12, color: COLORS.MUTED_TEXT, fontSize: 14 },
  empty: { color: COLORS.MUTED_TEXT, fontSize: 14, lineHeight: 20 },
  error: { marginBottom: 12, color: COLORS.PRIMARY_NAVY, fontSize: 14 },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    backgroundColor: COLORS.WHITE,
  },
  filterButtonActive: { backgroundColor: COLORS.PRIMARY_NAVY, borderColor: COLORS.PRIMARY_NAVY },
  filterText: { color: COLORS.PRIMARY_NAVY, fontSize: 13, fontWeight: "700" },
  filterCount: { color: COLORS.MUTED_TEXT, fontSize: 12, fontWeight: "700" },
  filterTextActive: { color: COLORS.WHITE },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 14,
    marginBottom: 12,
  },
  reference: { color: COLORS.PRIMARY_NAVY, fontSize: 13, fontWeight: "700" },
  name: { marginTop: 6, color: COLORS.DARK_TEXT, fontSize: 16, fontWeight: "700" },
  meta: { marginTop: 4, color: COLORS.MUTED_TEXT, fontSize: 13 },
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
  viewButton: {
    marginTop: 12,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  viewButtonText: { color: COLORS.WHITE, fontSize: 14, fontWeight: "700" },
  downloadButton: {
    marginTop: 8,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  downloadButtonText: { color: COLORS.PRIMARY_NAVY, fontSize: 14, fontWeight: "700" },
});
