import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { getIncomingMarriageRegistrations } from "../services/api";

export default function DistrictMarriageRegistrationsScreen({ navigation }) {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setIsLoading(true);
      getIncomingMarriageRegistrations()
        .then((items) => {
          if (!active) {
            return;
          }
          setRegistrations(items);
          setLoadError("");
        })
        .catch((error) => {
          if (!active) {
            return;
          }
          setRegistrations([]);
          setLoadError(error.message);
        })
        .finally(() => {
          if (active) {
            setIsLoading(false);
          }
        });
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>Marriage Registrations</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Registrations sent by marriage registrars.</Text>
        {isLoading ? <Text style={styles.empty}>Loading registrations...</Text> : null}
        {loadError ? <Text style={styles.empty}>{loadError}</Text> : null}
        {!isLoading && !loadError && registrations.length === 0 ? (
          <Text style={styles.empty}>No marriage registrations have been received yet.</Text>
        ) : null}
        {registrations.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.id}>{item.registrationReference}</Text>
            <Text style={styles.couple}>{item.couple}</Text>
            <Text style={styles.meta}>
              {item.marriageDate} · {item.submittedBy}
            </Text>
            <View style={styles.status}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            <Pressable
              style={styles.viewButton}
              onPress={() => navigation.navigate("MarriageRegistrationDetail", { registration: item })}
              accessibilityRole="button"
            >
              <Text style={styles.viewText}>View details</Text>
            </Pressable>
          </View>
        ))}
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
  headerTitle: { flex: 1, textAlign: "center", color: COLORS.WHITE, fontSize: 16, fontWeight: "700" },
  content: { padding: 16, paddingBottom: 32 },
  intro: { color: COLORS.MUTED_TEXT, fontSize: 14, marginBottom: 12 },
  empty: { color: COLORS.MUTED_TEXT, fontSize: 14, marginBottom: 12 },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
    marginBottom: 12,
  },
  id: { color: COLORS.PRIMARY_NAVY, fontSize: 14, fontWeight: "700" },
  couple: { marginTop: 6, color: COLORS.DARK_TEXT, fontSize: 16, fontWeight: "700" },
  meta: { marginTop: 4, color: COLORS.MUTED_TEXT, fontSize: 13 },
  status: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: COLORS.ACCENT_YELLOW,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { color: COLORS.PRIMARY_NAVY, fontSize: 12, fontWeight: "700" },
  viewButton: {
    marginTop: 12,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  viewText: { color: COLORS.WHITE, fontSize: 14, fontWeight: "700" },
});
