import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import Logo from "../components/Logo";

const PAGES = [
  {
    key: "records",
    icon: "documents-outline",
    title: "Birth, Marriage and Death Records",
    body: "Access official birth, marriage, and death certificate services from one government portal.",
  },
  {
    key: "tracking",
    icon: "file-tray-full-outline",
    title: "Track Applications",
    body: "Follow certificate applications and keep every civil registration record in one place.",
  },
  {
    key: "access",
    icon: "shield-checkmark-outline",
    title: "Official Officer Access",
    body: "Continue with your government username, service number, and password on the secure login screen.",
  },
];

export default function OnboardingScreen({ navigation }) {
  const [pageIndex, setPageIndex] = useState(0);
  const page = PAGES[pageIndex];
  const isLastPage = pageIndex === PAGES.length - 1;

  function openLogin() {
    navigation.replace("Login");
  }

  function handleNext() {
    if (isLastPage) {
      openLogin();
      return;
    }
    setPageIndex(pageIndex + 1);
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.topRow}>
          <Logo size={36} />
          <Pressable onPress={openLogin} accessibilityRole="button" accessibilityLabel="Skip">
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.page}>
          <View style={styles.iconCircle}>
            <Ionicons name={page.icon} size={42} color={COLORS.PRIMARY_NAVY} />
          </View>
          <Text style={styles.title}>{page.title}</Text>
          <Text style={styles.body}>{page.body}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {PAGES.map((item, index) => (
              <View
                key={item.key}
                style={[styles.dot, index === pageIndex && styles.dotActive]}
              />
            ))}
          </View>
          <Pressable
            style={styles.button}
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel={isLastPage ? "Go to login" : "Next"}
          >
            <Text style={styles.buttonText}>{isLastPage ? "Go to Login" : "Next"}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  skip: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 28,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 32,
  },
  body: {
    marginTop: 14,
    color: COLORS.MUTED_TEXT,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.LIGHT_BORDER,
  },
  dotActive: {
    width: 22,
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  button: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "700",
  },
});
