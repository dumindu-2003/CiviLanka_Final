import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";

function DetailRow({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function BankVerificationDetailScreen({ navigation, route }) {
  const record = route.params?.record;

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
          <Text style={styles.headerTitle}>Verification</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!record ? (
          <View style={styles.card}>
            <Text style={styles.empty}>This verification could not be opened.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.PRIMARY_NAVY} />
              </View>
              <View style={styles.titleCopy}>
                <Text style={styles.name}>{record.fullName}</Text>
                <Text style={styles.meta}>{record.documentType}</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{record.statusLabel || "Valid"}</Text>
              </View>
            </View>

            <DetailRow label="NIC / CERTIFICATE" value={record.nic} />
            <DetailRow label="DATE OF BIRTH" value={record.dateOfBirth} />
            <DetailRow label="GENDER" value={record.gender} />
            <DetailRow label="DOCUMENT TYPE" value={record.documentType} />
            <DetailRow label="CHECKED ON" value={record.date} />
            <DetailRow label="QUERY HASH" value={record.hash} />
            {record.note ? <Text style={styles.note}>{record.note}</Text> : null}
          </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  headerAccent: {
    height: 4,
    backgroundColor: COLORS.ACCENT_YELLOW,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
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
    padding: 14,
  },
  titleRow: {
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
  titleCopy: {
    flex: 1,
  },
  name: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    marginTop: 3,
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
  },
  pill: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: "700",
  },
  row: {
    marginTop: 14,
  },
  label: {
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  value: {
    marginTop: 4,
    color: COLORS.DARK_TEXT,
    fontSize: 15,
    fontWeight: "700",
  },
  note: {
    marginTop: 16,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "600",
  },
  empty: {
    color: COLORS.MUTED_TEXT,
    fontSize: 14,
  },
});
