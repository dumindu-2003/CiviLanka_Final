import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { MARRIAGE_REGISTRATIONS } from "../constants/marriageRegistrations";

export default function MarriageCertificateListScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>Marriage Certificates</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {MARRIAGE_REGISTRATIONS.map((item) => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("MarriageRegistrationDetail", { registrationId: item.id })
            }
          >
            <Text style={styles.id}>{item.id}</Text>
            <Text style={styles.couple}>{item.couple}</Text>
            <Text style={styles.meta}>
              {item.date} · {item.status}
            </Text>
          </Pressable>
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
    padding: 14,
    marginBottom: 12,
  },
  id: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  couple: {
    marginTop: 6,
    color: COLORS.DARK_TEXT,
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    marginTop: 4,
    color: COLORS.MUTED_TEXT,
    fontSize: 13,
  },
});
