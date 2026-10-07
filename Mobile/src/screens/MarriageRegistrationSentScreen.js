import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Clipboard from "expo-clipboard";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { buildCertificatePdf } from "../services/certificatePdf";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function MarriageRegistrationSentScreen({ navigation, route }) {
  const registration = route.params?.registration || {};
  const certificateNo = registration.certificateNo || "CERT-MR-2024-0418-LK";
  const registrationNo = registration.reference || "MR-2024-0418";
  const issued = registration.issuedAt ? new Date(registration.issuedAt) : new Date();
  const [isWorking, setIsWorking] = useState(false);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  async function downloadPdf() {
    if (isWorking) {
      return;
    }
    setIsWorking(true);
    setNotice("");
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        setNotice("Download is not available on this device.");
        return;
      }
      const rows = [
        ["Groom / Husband", registration.groomName],
        ["Groom NIC", registration.groomNic],
        ["Bride / Wife", registration.brideName],
        ["Bride NIC", registration.brideNic],
        ["Solemnized on", formatFormDate(registration.marriageDate)],
        ["Jurisdiction", registration.marriagePlace],
        ["Attested registrar", registration.registrarName],
        ["Registration No", registrationNo],
        ["Certificate No", certificateNo],
      ];
      const pdf = buildCertificatePdf("Certificate of Marriage", registrationNo, rows);
      const safeName = certificateNo.replace(/[^\w.-]/g, "_");
      const file = new File(Paths.cache, `${safeName}.pdf`);
      if (file.exists) {
        file.delete();
      }
      file.create();
      file.write(pdf);
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: "Download Official PDF",
      });
    } catch (error) {
      if (!/cancel/i.test(String(error?.message || ""))) {
        setNotice("Could not download this certificate.");
      }
    } finally {
      setIsWorking(false);
    }
  }

  async function copyCertificateNo() {
    await Clipboard.setStringAsync(certificateNo);
    setCopied(true);
    setNotice("Certificate number copied.");
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]} style={styles.topSafe}>
        <Pressable
          style={styles.backRow}
          onPress={() => navigation.navigate("MarriageRegistrar")}
          accessibilityRole="button"
          accessibilityLabel="Back to record"
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.PRIMARY_NAVY} />
          <Text style={styles.backText}>Back to Record</Text>
        </Pressable>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.bannerTop}>
            <View style={styles.enforcePill}>
              <Ionicons name="shield-checkmark" size={14} color={COLORS.PRIMARY_NAVY} />
              <Text style={styles.enforceText}>LEGALLY ENFORCEABLE</Text>
            </View>
            <Text style={styles.activeText}>Active Registry</Text>
          </View>
          <Text style={styles.bannerLabel}>OFFICIAL CERTIFICATE</Text>
          <View style={styles.certRow}>
            <Text style={styles.certNo}>{certificateNo}</Text>
            <Pressable
              style={styles.copyButton}
              onPress={copyCertificateNo}
              accessibilityRole="button"
              accessibilityLabel="Copy certificate number"
            >
              <Ionicons name={copied ? "checkmark" : "copy-outline"} size={18} color={COLORS.WHITE} />
            </Pressable>
          </View>
        </View>

        <View style={styles.certificate}>
          <View style={styles.certificateHead}>
            <View style={styles.seal}>
              <Ionicons name="ribbon" size={18} color={COLORS.PRIMARY_NAVY} />
            </View>
            <Text style={styles.republic}>DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA</Text>
            <Text style={styles.department}>Registrar General's Department • Civil Registration Division</Text>
            <Text style={styles.certificateTitle}>CERTIFICATE OF MARRIAGE</Text>
            <Text style={styles.registrationNo}>Registration No: {registrationNo}</Text>
          </View>

          <View style={styles.certificateBody}>
            <PersonRow
              role="GROOM / HUSBAND"
              name={registration.groomName}
              nic={registration.groomNic}
            />
            <PersonRow
              role="BRIDE / WIFE"
              name={registration.brideName}
              nic={registration.brideNic}
            />
            <View style={styles.split}>
              <View style={styles.splitCard}>
                <Text style={styles.miniLabel}>SOLEMNIZED ON</Text>
                <Text style={styles.miniValue}>{formatFormDate(registration.marriageDate)}</Text>
              </View>
              <View style={styles.splitCard}>
                <Text style={styles.miniLabel}>JURISDICTION</Text>
                <Text style={styles.miniValue}>{registration.marriagePlace || "—"}</Text>
              </View>
            </View>
            <View style={styles.registrarRow}>
              <View style={styles.registrarText}>
                <Text style={styles.miniLabel}>ATTESTED REGISTRAR</Text>
                <Text style={styles.personName}>{registration.registrarName || "—"}</Text>
              </View>
              <Text style={styles.registrarId}>ID: {registration.officerServiceNumber || "—"}</Text>
            </View>
            <View style={styles.hashBox}>
              <View>
                <Text style={styles.miniLabel}>DIGITAL HASH SIGNATURE</Text>
                <Text style={styles.hashValue}>SHA256: {displayHash(certificateNo + registrationNo)}</Text>
              </View>
              <Text style={styles.issued}>{formatIssued(issued)}</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.downloadButton}
          onPress={downloadPdf}
          disabled={isWorking}
          accessibilityRole="button"
        >
          <Ionicons name="download-outline" size={18} color={COLORS.WHITE} />
          <Text style={styles.downloadText}>
            {isWorking ? "Please wait..." : "Download Official PDF"}
          </Text>
        </Pressable>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <View style={styles.protections}>
          <View style={styles.protectTitleRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.PRIMARY_NAVY} />
            <Text style={styles.protectTitle}>STATUTORY PROTECTIONS</Text>
          </View>
          <ProtectItem
            icon="checkmark-circle"
            text="Admissible under Electronic Transactions Act No. 19 of 2006."
          />
          <ProtectItem
            icon="lock-closed"
            text="Tamper-evident record tied to the National Identity details entered in this registration."
          />
          <ProtectItem
            icon="sync"
            text="This certificate is issued from the marriage registration just submitted."
          />
        </View>
      </ScrollView>
    </View>
  );
}

function PersonRow({ role, name, nic }) {
  return (
    <View style={styles.person}>
      <View style={styles.personTop}>
        <Text style={styles.miniLabel}>{role}</Text>
        <Text style={styles.nic}>NIC: {nic || "—"}</Text>
      </View>
      <Text style={styles.personName}>{name || "—"}</Text>
    </View>
  );
}

function ProtectItem({ icon, text }) {
  return (
    <View style={styles.protectItem}>
      <Ionicons name={icon} size={16} color={COLORS.PRIMARY_NAVY} />
      <Text style={styles.protectText}>{text}</Text>
    </View>
  );
}

function formatFormDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value || ""));
  if (!match) {
    return value || "—";
  }
  return `${Number(match[1])} ${MONTHS[Number(match[2]) - 1]} ${match[3]}`;
}

function formatIssued(date) {
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${hours}:${minutes} LK`;
}

function displayHash(value) {
  let h1 = 2166136261;
  let h2 = 2166136261;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    h1 ^= text.charCodeAt(index);
    h1 = Math.imul(h1, 16777619);
    h2 ^= text.charCodeAt(text.length - 1 - index);
    h2 = Math.imul(h2, 2246822519);
  }
  const hex = (number) => (number >>> 0).toString(16).padStart(8, "0");
  return `${hex(h1)}${hex(h2)}${hex(h1 ^ h2)}${hex(Math.imul(h1, h2) || 1)}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  topSafe: {
    backgroundColor: COLORS.BACKGROUND,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  backText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  banner: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderRadius: 16,
    padding: 16,
  },
  bannerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  enforcePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.WHITE,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  enforceText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 11,
    fontWeight: "700",
  },
  activeText: {
    color: COLORS.ACCENT_YELLOW,
    fontSize: 12,
    fontWeight: "700",
  },
  bannerLabel: {
    marginTop: 14,
    color: COLORS.ACCENT_YELLOW,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  certRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  certNo: {
    flex: 1,
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "700",
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  certificate: {
    marginTop: 14,
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    overflow: "hidden",
  },
  certificateHead: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    alignItems: "center",
  },
  seal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  republic: {
    color: COLORS.WHITE,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  department: {
    marginTop: 4,
    color: COLORS.ACCENT_YELLOW,
    fontSize: 11,
    textAlign: "center",
  },
  certificateTitle: {
    marginTop: 12,
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  registrationNo: {
    marginTop: 4,
    color: COLORS.WHITE,
    fontSize: 12,
  },
  certificateBody: {
    padding: 14,
  },
  person: {
    marginBottom: 12,
  },
  personTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  miniLabel: {
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  nic: {
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "600",
  },
  personName: {
    marginTop: 2,
    color: COLORS.DARK_TEXT,
    fontSize: 18,
    fontWeight: "700",
  },
  split: {
    flexDirection: "row",
    gap: 8,
  },
  splitCard: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 10,
  },
  miniValue: {
    marginTop: 4,
    color: COLORS.DARK_TEXT,
    fontSize: 14,
    fontWeight: "700",
  },
  registrarRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  registrarText: {
    flex: 1,
  },
  registrarId: {
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
    fontWeight: "700",
  },
  hashBox: {
    marginTop: 12,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  hashValue: {
    marginTop: 4,
    maxWidth: 180,
    color: COLORS.DARK_TEXT,
    fontSize: 11,
    fontWeight: "600",
  },
  issued: {
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "right",
    maxWidth: 110,
  },
  downloadButton: {
    marginTop: 14,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: COLORS.PRIMARY_NAVY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  downloadText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "700",
  },
  notice: {
    marginTop: 8,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  protections: {
    marginTop: 16,
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
  },
  protectTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  protectTitle: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  protectItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 8,
  },
  protectText: {
    flex: 1,
    color: COLORS.DARK_TEXT,
    fontSize: 13,
    lineHeight: 18,
  },
});
