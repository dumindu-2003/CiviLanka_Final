import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { getNicApplications } from "../services/api";

export default function DistrictNicApplicationsScreen({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setIsLoading(true);
      getNicApplications()
        .then((items) => {
          if (!active) {
            return;
          }
          setApplications(items);
          setLoadError("");
        })
        .catch((error) => {
          if (!active) {
            return;
          }
          setApplications([]);
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
          <Text style={styles.headerTitle}>NIC Applications</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Applications submitted by village officers.</Text>
        {isLoading ? <Text style={styles.empty}>Loading applications...</Text> : null}
        {loadError ? <Text style={styles.empty}>{loadError}</Text> : null}
        {!isLoading && !loadError && applications.length === 0 ? (
          <Text style={styles.empty}>No NIC applications are waiting for review.</Text>
        ) : null}
        {applications.map((item) => {
          const approved = item.statusCode === "approved";
          return (
          <View key={item.id} style={styles.card}>
            <Text style={styles.reference}>{item.applicationReference}</Text>
            <Text style={styles.name}>{item.fullName}</Text>
            <Text style={styles.meta}>
              {item.district} · {formatSubmitted(item.submittedAt)}
            </Text>
            <View style={[styles.status, approved && styles.statusApproved]}>
              <Text style={[styles.statusText, approved && styles.statusTextApproved]}>
                {item.status || "Pending approval"}
              </Text>
            </View>
            <Pressable
              style={styles.viewButton}
              onPress={() => navigation.navigate("NicApplicationDetail", { application: item })}
              accessibilityRole="button"
            >
              <Text style={styles.viewButtonText}>View details</Text>
            </Pressable>
          </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function formatSubmitted(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString();
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
  headerTitle: { flex: 1, textAlign: "center", color: COLORS.WHITE, fontSize: 18, fontWeight: "700" },
  content: { padding: 16, paddingBottom: 32 },
  intro: { marginBottom: 12, color: COLORS.MUTED_TEXT, fontSize: 14 },
  empty: { color: COLORS.MUTED_TEXT, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 14,
    marginBottom: 12,
  },
  reference: { color: COLORS.PRIMARY_NAVY, fontSize: 13, fontWeight: "700" },
  name: { marginTop: 6, color: COLORS.DARK_TEXT, fontSize: 16, fontWeight: "700" },
  meta: { marginTop: 4, color: COLORS.MUTED_TEXT, fontSize: 13 },
  status: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: COLORS.ACCENT_YELLOW,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { color: COLORS.PRIMARY_NAVY, fontSize: 12, fontWeight: "700" },
  statusApproved: { backgroundColor: COLORS.PRIMARY_NAVY },
  statusTextApproved: { color: COLORS.WHITE },
  viewButton: {
    marginTop: 12,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  viewButtonText: { color: COLORS.WHITE, fontSize: 14, fontWeight: "700" },
});
