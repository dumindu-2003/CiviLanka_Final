import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/colors";
import AppHeader from "../components/AppHeader";

export default function PlaceholderScreen({ route }) {
  const title = route?.params?.title ?? "CiviLanka";
  const message =
    route?.params?.message ??
    "This section will be implemented in a later development stage.";

  return (
    <View style={styles.screen}>
      <AppHeader title={title} subtitle="CiviLanka" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.heading}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 16,
  },
  heading: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 22,
    fontWeight: "700",
  },
  message: {
    marginTop: 8,
    color: COLORS.DARK_TEXT,
    fontSize: 15,
    lineHeight: 22,
  },
});
