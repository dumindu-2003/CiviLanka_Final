import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";

export default function SettingsScreen({ navigation }) {
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
            <Ionicons name="arrow-back" size={22} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="language-outline" size={16} color={COLORS.PRIMARY_NAVY} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>Language</Text>
              <Text style={styles.rowValue}>English</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications-outline" size={16} color={COLORS.PRIMARY_NAVY} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>Registration alerts</Text>
              <Text style={styles.rowValue}>Not available yet</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Security</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="time-outline" size={16} color={COLORS.PRIMARY_NAVY} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>Signed-in session</Text>
              <Text style={styles.rowValue}>Your login stays active for 7 days</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Legal</Text>
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate("PrivacyPolicy")}
          accessibilityRole="button"
        >
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.PRIMARY_NAVY} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>Privacy & Policy</Text>
              <Text style={styles.rowValue}>How CiviLanka handles staff information</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.MUTED_TEXT} />
          </View>
        </Pressable>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionLabel: {
    marginBottom: 8,
    marginTop: 6,
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    marginBottom: 16,
    paddingHorizontal: 14,
  },
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.LIGHT_BORDER,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
  },
  rowTitle: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  rowValue: {
    marginTop: 3,
    color: COLORS.MUTED_TEXT,
    fontSize: 13,
  },
});
