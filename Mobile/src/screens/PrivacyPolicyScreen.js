import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";

const SECTIONS = [
  {
    title: "Information we keep",
    body: "CiviLanka keeps the staff details needed to sign you in: your name, email, government username, service number, and role. Your password is stored only as a secure hash.",
  },
  {
    title: "How it is used",
    body: "This information is used to confirm your login and open the dashboard for your role. An admin can add staff accounts. Other roles cannot create accounts.",
  },
  {
    title: "Records on dashboards",
    body: "Birth, death, marriage, and identity records shown in the dashboards are sample records for this stage. They are not a live national registry.",
  },
  {
    title: "Your session",
    body: "After you sign in, your login stays active for 7 days on this device. Use Logout when you finish, and do not share your service number or password.",
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
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
          <Text style={styles.headerTitle}>Privacy & Policy</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>CiviLanka</Text>
          <Text style={styles.introBody}>
            This policy explains how the CiviLanka civil registration app handles staff account
            information.
          </Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardBody}>{section.body}</Text>
          </View>
        ))}
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
  introCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 16,
    marginBottom: 12,
  },
  introTitle: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 18,
    fontWeight: "700",
  },
  introBody: {
    marginTop: 6,
    color: COLORS.MUTED_TEXT,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 16,
    fontWeight: "700",
  },
  cardBody: {
    marginTop: 6,
    color: COLORS.DARK_TEXT,
    fontSize: 14,
    lineHeight: 21,
  },
});
