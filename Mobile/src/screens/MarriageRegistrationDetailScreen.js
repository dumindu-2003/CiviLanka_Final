import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { MARRIAGE_REGISTRATIONS } from "../constants/marriageRegistrations";

export default function MarriageRegistrationDetailScreen({ navigation, route }) {
  const registration = MARRIAGE_REGISTRATIONS.find(
    (item) => item.id === route.params?.registrationId
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>{registration?.id || "Registration"}</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
      </View>
      <View style={styles.content}>
        {registration ? (
          <View style={styles.card}>
            <Text style={styles.label}>Couple</Text>
            <Text style={styles.value}>{registration.couple}</Text>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{registration.date}</Text>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{registration.status}</Text>
          </View>
        ) : (
          <Text style={styles.missing}>This registration could not be found.</Text>
        )}
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
    padding: 16,
  },
  label: {
    marginTop: 12,
    color: COLORS.MUTED_TEXT,
    fontSize: 13,
    fontWeight: "700",
  },
  value: {
    marginTop: 4,
    color: COLORS.DARK_TEXT,
    fontSize: 16,
    fontWeight: "600",
  },
  missing: {
    color: COLORS.DARK_TEXT,
    fontSize: 15,
  },
});
