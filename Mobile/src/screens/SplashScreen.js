import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import Logo from "../components/Logo";

const SPLASH_DURATION_MS = 2500;

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Onboarding");
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.content}>
        <Logo size={58} />
        <Text style={styles.name}>CiviLanka</Text>
        <View style={styles.accent} />
        <Text style={styles.tagline}>Civil Registration Tracker</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  name: {
    marginTop: 16,
    color: COLORS.WHITE,
    fontSize: 28,
    fontWeight: "700",
  },
  accent: {
    width: 64,
    height: 4,
    marginTop: 16,
    borderRadius: 2,
    backgroundColor: COLORS.ACCENT_YELLOW,
  },
  tagline: {
    marginTop: 14,
    color: COLORS.ACCENT_YELLOW,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
