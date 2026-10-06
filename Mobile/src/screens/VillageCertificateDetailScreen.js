import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { certificateById, certificateDetailRows, certificateListTitle } from "../constants/villageCertificates";

function documentTitle(type) {
  if (type === "birth") {
    return "Birth Certificate";
  }
  if (type === "death") {
    return "Death Certificate";
  }
  if (type === "marriage") {
    return "Married Certificate";
  }
  return "Certificate";
}

function escapeHtml(value) {
  return String(value || "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function certificateHtml(certificate, rows) {
  const title = documentTitle(certificate.type);
  const details = rows
    .map(
      ([label, value]) =>
        `<tr><td class="label">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: sans-serif; color: #1E1E1E; margin: 0; }
      .banner { background: #0A1F44; color: #FFFFFF; padding: 28px 32px 22px; }
      .accent { height: 6px; background: #F4C430; }
      .banner p { margin: 0; color: #F4C430; font-size: 12px; letter-spacing: 1px; font-weight: 700; }
      h1 { margin: 8px 0 0; font-size: 28px; }
      .sheet { padding: 28px 32px; }
      .ref { color: #0A1F44; font-size: 18px; font-weight: 700; }
      .status { display: inline-block; margin-top: 10px; background: #0A1F44; color: #FFFFFF; border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 700; }
      table { width: 100%; border-collapse: collapse; margin-top: 18px; }
      td { padding: 10px 0; border-bottom: 1px solid #DFE1E4; font-size: 15px; vertical-align: top; }
      .label { width: 180px; color: #6B7280; font-size: 12px; font-weight: 700; }
      .foot { margin-top: 28px; color: #6B7280; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="banner">
      <p>CIVILANKA</p>
      <h1>${escapeHtml(title)}</h1>
    </div>
    <div class="accent"></div>
    <div class="sheet">
      <div class="ref">${escapeHtml(certificate.ref)}</div>
      <div class="status">Approved</div>
      <table>${details}</table>
      <p class="foot">Issued for the Grama Niladhari division. This copy can be saved or printed.</p>
    </div>
  </body>
</html>`;
}

export default function VillageCertificateDetailScreen({ navigation, route }) {
  const certificate = certificateById(route.params?.certificateId);
  const rows = certificateDetailRows(certificate);
  const isApproved = certificate?.status === "Approved";
  const [isWorking, setIsWorking] = useState(false);
  const [notice, setNotice] = useState("");

  async function createPdf() {
    const html = certificateHtml(certificate, rows);
    return Print.printToFileAsync({ html });
  }

  async function handleDownload() {
    if (!isApproved || isWorking) {
      return;
    }
    setIsWorking(true);
    setNotice("");
    try {
      const file = await createPdf();
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        setNotice("Download is not available on this device.");
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: `Download ${certificate.ref}`,
      });
    } catch (error) {
      if (!/cancel/i.test(String(error?.message || ""))) {
        setNotice("Could not download this certificate.");
      }
    } finally {
      setIsWorking(false);
    }
  }

  async function handlePrint() {
    if (!isApproved || isWorking) {
      return;
    }
    setIsWorking(true);
    setNotice("");
    try {
      await Print.printAsync({ html: certificateHtml(certificate, rows) });
    } catch (error) {
      if (!/cancel/i.test(String(error?.message || ""))) {
        setNotice("Could not open the print dialog.");
      }
    } finally {
      setIsWorking(false);
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
          <Text style={styles.headerTitle}>
            {certificate ? certificateListTitle(certificate.type) : "Certificate"}
          </Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {certificate ? (
          <View style={styles.card}>
            <Text style={styles.reference}>{certificate.ref}</Text>
            <View
              style={[
                styles.status,
                certificate.status === "Approved" ? styles.statusApproved : styles.statusPending,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  certificate.status === "Approved" ? styles.statusTextApproved : styles.statusTextPending,
                ]}
              >
                {certificate.status}
              </Text>
            </View>
            {rows.map(([label, value]) => (
              <View key={label} style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value || "—"}</Text>
              </View>
            ))}
            {isApproved ? (
              <View style={styles.actions}>
                <Pressable
                  style={styles.downloadButton}
                  onPress={handleDownload}
                  disabled={isWorking}
                  accessibilityRole="button"
                >
                  <Ionicons name="download-outline" size={16} color={COLORS.PRIMARY_NAVY} />
                  <Text style={styles.downloadText}>{isWorking ? "Please wait..." : "Download"}</Text>
                </Pressable>
                <Pressable
                  style={styles.printButton}
                  onPress={handlePrint}
                  disabled={isWorking}
                  accessibilityRole="button"
                >
                  <Ionicons name="print-outline" size={16} color={COLORS.WHITE} />
                  <Text style={styles.printText}>Print</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.locked}>
                Download and print are available after this certificate is approved.
              </Text>
            )}
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          </View>
        ) : (
          <Text style={styles.missing}>This certificate could not be found.</Text>
        )}
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
  actions: {
    marginTop: 18,
    gap: 10,
  },
  downloadButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.ACCENT_YELLOW,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  downloadText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  printButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  printText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "700",
  },
  locked: {
    marginTop: 18,
    color: COLORS.MUTED_TEXT,
    fontSize: 14,
    lineHeight: 20,
  },
  notice: {
    marginTop: 10,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 13,
    fontWeight: "600",
  },
  missing: {
    color: COLORS.MUTED_TEXT,
    fontSize: 15,
  },
});
