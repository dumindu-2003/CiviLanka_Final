import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";

export default function BankCertificateDetailScreen({ navigation, route }) {
  const certificate = route.params?.certificate;
  const rows = certificate?.rows || [];

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
          <Text style={styles.headerTitle}>Certificate</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!certificate ? (
          <Text style={styles.empty}>This certificate could not be opened.</Text>
        ) : (
          <View style={styles.card}>
            <Text style={styles.kicker}>{certificate.typeLabel}</Text>
            <Text style={styles.name}>{certificate.name}</Text>
            <Text style={styles.ref}>{certificate.ref}</Text>
            {rows.map((item) => (
              <View key={item.label} style={styles.row}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.value}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}
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
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 16,
  },
  kicker: { color: COLORS.MUTED_TEXT, fontSize: 12, fontWeight: "700", letterSpacing: 0.4 },
  name: { marginTop: 6, color: COLORS.PRIMARY_NAVY, fontSize: 20, fontWeight: "700" },
  ref: { marginTop: 4, color: COLORS.MUTED_TEXT, fontSize: 13 },
  row: { marginTop: 14 },
  label: { color: COLORS.MUTED_TEXT, fontSize: 11, fontWeight: "700" },
  value: { marginTop: 4, color: COLORS.DARK_TEXT, fontSize: 15, fontWeight: "700" },
  empty: { color: COLORS.MUTED_TEXT, fontSize: 14 },
});
