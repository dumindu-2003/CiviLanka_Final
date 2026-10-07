import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { certificateListTitle, certificatesByType } from "../constants/villageCertificates";
import { getBankCertificates } from "../services/api";

function sampleCard(item) {
  const name =
    item.type === "marriage" && item.spouse ? `${item.name} & ${item.spouse}` : item.name;
  return {
    id: item.id,
    source: "sample",
    type: item.type,
    typeLabel: item.typeLabel,
    name,
    ref: item.ref,
    date: item.date,
    status: item.status,
    icon: item.icon,
  };
}

export default function BankCertificateListScreen({ navigation, route }) {
  const certificateType = route?.params?.certificateType || "birth";
  const [records, setRecords] = useState([]);
  const [notice, setNotice] = useState("");

  const loadRecords = useCallback(async () => {
    const samples = certificatesByType(certificateType).map(sampleCard);
    try {
      const saved = await getBankCertificates(certificateType);
      const savedRefs = new Set(saved.map((item) => item.ref));
      const merged = [
        ...saved,
        ...samples.filter((item) => !savedRefs.has(item.ref)),
      ];
      setRecords(merged);
      setNotice("");
    } catch (error) {
      setRecords(samples);
      setNotice(error.message);
    }
  }, [certificateType]);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [loadRecords])
  );

  function openCertificate(item) {
    if (item.source === "registry") {
      navigation.navigate("BankCertificateDetail", { certificate: item });
      return;
    }
    navigation.navigate("VillageCertificateDetail", { certificateId: item.id });
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
          <Text style={styles.headerTitle}>{certificateListTitle(certificateType)}</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notice ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}
        {records.length === 0 ? (
          <Text style={styles.empty}>No certificates are available for this list.</Text>
        ) : null}
        {records.map((item) => (
          <Pressable
            key={`${item.source || "record"}-${item.id}`}
            style={styles.card}
            onPress={() => openCertificate(item)}
            accessibilityRole="button"
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name={item.type === "marriage" ? "heart-outline" : "document-text-outline"}
                size={16}
                color={COLORS.PRIMARY_NAVY}
              />
            </View>
            <View style={styles.copy}>
              <Text style={styles.meta}>
                {item.typeLabel} • {item.date}
              </Text>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.ref}>Ref: {item.ref}</Text>
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
  noticeText: { color: COLORS.PRIMARY_NAVY, fontSize: 13, fontWeight: "600" },
  empty: { color: COLORS.MUTED_TEXT, fontSize: 14 },
  card: {
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
  copy: { flex: 1 },
  meta: { color: COLORS.MUTED_TEXT, fontSize: 11, fontWeight: "700" },
  name: { marginTop: 3, color: COLORS.DARK_TEXT, fontSize: 15, fontWeight: "700" },
  ref: { marginTop: 2, color: COLORS.MUTED_TEXT, fontSize: 12 },
  status: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusApproved: { backgroundColor: COLORS.PRIMARY_NAVY },
  statusPending: { backgroundColor: COLORS.ACCENT_YELLOW },
  statusText: { fontSize: 11, fontWeight: "700" },
  statusTextApproved: { color: COLORS.WHITE },
  statusTextPending: { color: COLORS.PRIMARY_NAVY },
});
