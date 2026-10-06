import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/colors";
import { roleLabel } from "../constants/roles";
import AppHeader from "../components/AppHeader";
import { API_BASE_URL, checkBackendHealth } from "../services/api";

export default function HomeScreen({ route }) {
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState(
    "Tap the button to test the connection to the CiviLanka API."
  );

  async function handleCheckBackend() {
    setStatus("loading");
    setStatusMessage("Checking the backend...");

    try {
      const result = await checkBackendHealth();
      setStatus("success");
      setStatusMessage(result.message);
    } catch (error) {
      setStatus("error");
      setStatusMessage(error.message);
    }
  }

  const statusLabel = {
    idle: "Not checked",
    loading: "Checking",
    success: "Connected",
    error: "Unavailable",
  }[status];

  return (
    <View style={styles.screen}>
      <AppHeader title="CiviLanka" subtitle="Digital Citizen Certificate Services" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcome}>Welcome to CiviLanka</Text>
        <Text style={styles.serviceLine}>Digital Citizen Certificate Services</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Role</Text>
          <Text style={styles.cardValue}>{roleLabel(route?.params?.role)}</Text>
          <Text style={styles.cardNote}>
            Certificate services will be added in a later development stage.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <Text style={styles.cardLabel}>Backend Status</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{statusLabel}</Text>
            </View>
          </View>
          <Text style={styles.statusMessage}>{statusMessage}</Text>
          <Text style={styles.apiAddress}>{API_BASE_URL}</Text>
          <Pressable
            style={[styles.button, status === "loading" && styles.buttonBusy]}
            onPress={handleCheckBackend}
            disabled={status === "loading"}
            accessibilityRole="button"
            accessibilityLabel="Check backend status"
          >
            <Text style={styles.buttonText}>
              {status === "loading" ? "Checking..." : "Check Backend Status"}
            </Text>
          </Pressable>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  welcome: {
    color: COLORS.DARK_TEXT,
    fontSize: 26,
    fontWeight: "700",
  },
  serviceLine: {
    marginTop: 8,
    color: COLORS.MUTED_TEXT,
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    marginTop: 16,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 16,
  },
  cardLabel: {
    color: COLORS.MUTED_TEXT,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cardValue: {
    marginTop: 6,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 22,
    fontWeight: "700",
  },
  cardNote: {
    marginTop: 8,
    color: COLORS.DARK_TEXT,
    fontSize: 14,
    lineHeight: 20,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  statusPill: {
    backgroundColor: COLORS.ACCENT_YELLOW,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 12,
    fontWeight: "700",
  },
  statusMessage: {
    marginTop: 12,
    color: COLORS.DARK_TEXT,
    fontSize: 15,
    lineHeight: 22,
  },
  apiAddress: {
    marginTop: 8,
    color: COLORS.MUTED_TEXT,
    fontSize: 13,
  },
  button: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonBusy: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "700",
  },
});
