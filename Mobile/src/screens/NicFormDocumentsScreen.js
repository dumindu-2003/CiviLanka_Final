import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { validateDocuments } from "../constants/nicFormOptions";
import { saveNicForm } from "../services/api";

const FILE_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

export default function NicFormDocumentsScreen({ navigation, route }) {
  const personal = route.params?.personal;
  const contact = route.params?.contact;
  const nicFormId = route.params?.nicFormId || "";
  const [files, setFiles] = useState({
    birthCertificate: null,
    proofOfAddress: null,
    passportPhoto: null,
    previousNic: null,
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");

  function setFile(key, file) {
    setFiles((current) => ({ ...current, [key]: file }));
    setErrors((current) => ({ ...current, [`${key}Name`]: "" }));
    setNotice("");
  }

  async function pickDocument(key) {
    const result = await DocumentPicker.getDocumentAsync({
      type: FILE_TYPES,
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.[0]) {
      return;
    }
    const asset = result.assets[0];
    setFile(key, {
      name: asset.name || "document",
      mimeType: asset.mimeType || mimeFromName(asset.name),
      size: asset.size || 0,
    });
  }

  async function pickPhoto(useCamera) {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setNotice("Allow photo access to add the passport size photo.");
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) {
      return;
    }
    const asset = result.assets[0];
    const name = asset.fileName || asset.uri.split("/").pop() || "passport-photo.jpg";
    setFile("passportPhoto", {
      name,
      mimeType: asset.mimeType || mimeFromName(name),
      size: asset.fileSize || 0,
    });
  }

  function choosePhoto() {
    Alert.alert("Passport size photo", "Take a photo or upload one from your device.", [
      { text: "Take Photo", onPress: () => pickPhoto(true) },
      { text: "Upload", onPress: () => pickPhoto(false) },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  async function handleReview() {
    const nextErrors = validateDocuments(files);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    if (!personal || !contact || !nicFormId) {
      setNotice("Go back and complete the earlier steps.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveNicForm({
        id: nicFormId,
        ...personal,
        ...contact,
        includeContact: true,
        includeDocuments: true,
        birthCertificateName: files.birthCertificate.name,
        birthCertificateMime: files.birthCertificate.mimeType,
        birthCertificateSize: files.birthCertificate.size,
        proofOfAddressName: files.proofOfAddress.name,
        proofOfAddressMime: files.proofOfAddress.mimeType,
        proofOfAddressSize: files.proofOfAddress.size,
        passportPhotoName: files.passportPhoto.name,
        passportPhotoMime: files.passportPhoto.mimeType,
        passportPhotoSize: files.passportPhoto.size,
        previousNicName: files.previousNic?.name || "",
        previousNicMime: files.previousNic?.mimeType || "",
        previousNicSize: files.previousNic?.size || 0,
      });
      navigation.navigate("NicFormDeclaration", { form: saved });
    } catch (error) {
      if (error.fields) {
        setErrors(error.fields);
      }
      setNotice(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.headerBack}
            accessibilityLabel="Back to contact details"
          >
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>Biometrics And Photo Upload</Text>
          <View style={styles.headerBack} />
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>STEP 3 OF 4: SUPPORTING DOCUMENTS</Text>
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, styles.progressOn]} />
          <View style={[styles.progressBar, styles.progressOn]} />
          <View style={[styles.progressBar, styles.progressOn]} />
          <View style={styles.progressBar} />
        </View>

        {notice ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>3. Attach Supporting Documents</Text>
          <Ionicons name="documents-outline" size={18} color={COLORS.PRIMARY_NAVY} />
        </View>

        <DocumentCard
          icon="document-text-outline"
          title="Birth Certificate Copy"
          detail="Original scan or certified copy, PDF/JPG up to 5MB"
          required
          fileName={files.birthCertificate?.name}
          error={errors.birthCertificateName}
          actionLabel="Upload File"
          onPress={() => pickDocument("birthCertificate")}
        />
        <DocumentCard
          icon="home-outline"
          title="Proof of Address"
          detail="Utility bill or Grama Niladhari certificate (< 3 months)"
          required
          fileName={files.proofOfAddress?.name}
          error={errors.proofOfAddressName}
          actionLabel="Upload File"
          onPress={() => pickDocument("proofOfAddress")}
        />
        <DocumentCard
          icon="person-outline"
          title="Passport Size Photo"
          detail={"ICAO standard, 35×45mm white background\nDimensions: 35 × 45 mm\nClear frontal view, neutral face, eyes open"}
          required
          fileName={files.passportPhoto?.name}
          error={errors.passportPhotoName}
          actionLabel="Take Photo / Upload"
          onPress={choosePhoto}
        />
        <DocumentCard
          icon="card-outline"
          title="Previous NIC Copy"
          detail="Required if renewal or re-issue"
          fileName={files.previousNic?.name}
          error={errors.previousNicName}
          actionLabel="Upload File"
          onPress={() => pickDocument("previousNic")}
        />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.PRIMARY_NAVY} />
          <Text style={styles.infoText}>
            All physical documents must be presented during biometric enrollment.
          </Text>
        </View>

        <Pressable
          style={[styles.primaryButton, isSaving && styles.buttonBusy]}
          onPress={handleReview}
          disabled={isSaving}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>{isSaving ? "SAVING..." : "Review & Verify"}</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.WHITE} />
        </Pressable>
        <Pressable style={styles.backLink} onPress={() => navigation.goBack()} accessibilityRole="button">
          <Ionicons name="chevron-back" size={16} color={COLORS.PRIMARY_NAVY} />
          <Text style={styles.backLinkText}>Back to Contact Details</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function mimeFromName(name) {
  const lower = String(name || "").toLowerCase();
  if (lower.endsWith(".pdf")) {
    return "application/pdf";
  }
  if (lower.endsWith(".png")) {
    return "image/png";
  }
  return "image/jpeg";
}

function DocumentCard({ icon, title, detail, required, fileName, error, actionLabel, onPress }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={16} color={COLORS.PRIMARY_NAVY} />
        </View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDetail}>{detail}</Text>
          {fileName ? <Text style={styles.fileName}>{fileName}</Text> : null}
        </View>
        <View style={[styles.badge, !required && styles.badgeOptional]}>
          <Text style={[styles.badgeText, !required && styles.badgeTextOptional]}>
            {required ? "Required" : "Optional"}
          </Text>
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.uploadButton} onPress={onPress} accessibilityRole="button">
        <Ionicons name="cloud-upload-outline" size={16} color={COLORS.WHITE} />
        <Text style={styles.uploadText}>{actionLabel}</Text>
      </Pressable>
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
  headerBack: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  stepLabel: {
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.LIGHT_BORDER,
  },
  progressOn: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  notice: {
    marginBottom: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 12,
  },
  noticeText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 18,
    fontWeight: "700",
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  cardDetail: {
    marginTop: 4,
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
    lineHeight: 17,
  },
  fileName: {
    marginTop: 6,
    color: COLORS.DARK_TEXT,
    fontSize: 13,
    fontWeight: "700",
  },
  badge: {
    borderRadius: 999,
    backgroundColor: COLORS.ACCENT_YELLOW,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeOptional: {
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
  },
  badgeText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 10,
    fontWeight: "700",
  },
  badgeTextOptional: {
    color: COLORS.MUTED_TEXT,
  },
  error: {
    marginTop: 8,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 12,
    fontWeight: "600",
  },
  uploadButton: {
    marginTop: 12,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_NAVY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: "700",
  },
  infoBox: {
    marginTop: 4,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    backgroundColor: COLORS.WHITE,
    padding: 12,
    flexDirection: "row",
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
    lineHeight: 17,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_NAVY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonBusy: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "700",
  },
  backLink: {
    marginTop: 8,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    backgroundColor: COLORS.WHITE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  backLinkText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
});
