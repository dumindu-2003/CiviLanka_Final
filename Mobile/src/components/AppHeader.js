import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import Logo from "./Logo";

export default function AppHeader({ title, subtitle }) {
  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.row}>
          <Logo size={48} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
      </SafeAreaView>
      <View style={styles.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  safeArea: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: COLORS.ACCENT_YELLOW,
    fontSize: 13,
    marginTop: 2,
    fontWeight: "600",
  },
  accent: {
    height: 4,
    backgroundColor: COLORS.ACCENT_YELLOW,
  },
});
