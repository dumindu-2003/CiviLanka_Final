import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";

export default function NewMarriageRegistrationScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>New Registration</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
      </View>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>New Marriage Registration</Text>
          <Text style={styles.body}>
            The registration form will be added in the next development stage.
            You can return to the Marriage Registrar dashboard to review current
            records.
          </Text>
        </View>
      </View>
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
    padding: 16,
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
  title: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 18,
    fontWeight: "700",
  },
  body: {
    marginTop: 8,
    color: COLORS.DARK_TEXT,
    fontSize: 15,
    lineHeight: 22,
  },
});
