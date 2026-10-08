import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { getMyDeathReports } from "../services/api";

export default function DeathReportListScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setIsLoading(true);
      getMyDeathReports()
        .then((items) => {
          if (!active) {
            return;
          }
          setReports(items);
          setLoadError("");
        })
        .catch((error) => {
          if (!active) {
            return;
          }
          setReports([]);
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
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>My Death Applications</Text>
          <View style={styles.backButton} />
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? <Text style={styles.empty}>Loading reports...</Text> : null}
        {loadError ? <Text style={styles.empty}>{loadError}</Text> : null}
        {!isLoading && !loadError && reports.length === 0 ? (
          <Text style={styles.empty}>No death applications have been created yet.</Text>
        ) : null}
        {reports.map((item) => {
          const approved = item.statusCode === "approved";
          return (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() => navigation.navigate("DeathReport", { report: item })}
            accessibilityRole="button"
          >
            <Text style={styles.reference}>{item.reportReference}</Text>
            <Text style={styles.name}>{item.fullName}</Text>
            <Text style={styles.meta}>
              {item.dateOfDeath} · {item.placeOfDeath}
            </Text>
            <View style={[styles.status, approved && styles.statusApproved]}>
              <Text style={[styles.statusText, approved && styles.statusTextApproved]}>{item.status}</Text>
            </View>
            <Text style={styles.action}>View application</Text>
          </Pressable>
          );
        })}
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
    padding: 16,
    paddingBottom: 32,
  },
  empty: {
    color: COLORS.MUTED_TEXT,
    fontSize: 14,
    lineHeight: 20,
  },
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
  reference: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 13,
    fontWeight: "700",
  },
  name: {
    marginTop: 6,
    color: COLORS.DARK_TEXT,
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    marginTop: 4,
    color: COLORS.MUTED_TEXT,
    fontSize: 13,
  },
  status: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: COLORS.ACCENT_YELLOW,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 12,
    fontWeight: "700",
  },
  statusApproved: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  statusTextApproved: {
    color: COLORS.WHITE,
  },
  action: {
    marginTop: 10,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 13,
    fontWeight: "700",
  },
});
