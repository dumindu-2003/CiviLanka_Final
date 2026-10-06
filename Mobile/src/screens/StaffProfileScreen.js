import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { roleLabel } from "../constants/roles";
import { clearAuthToken, getCurrentUser } from "../services/api";

const ROLE_DETAILS = {
  village_officer: {
    office: "Grama Niladhari Portal",
    duty: "View certificates and manage NIC forms",
  },
  district_registrar: {
    office: "District Registrar",
    duty: "Manage birth and death registrations",
  },
  marriage_registrar: {
    office: "Marriage Registrar",
    duty: "Manage marriage registrations",
  },
  bank_manager: {
    office: "Branch 042",
    duty: "Verify customer identity against national registry",
  },
  admin: {
    office: "CiviLanka Admin",
    duty: "Add and manage staff accounts",
  },
};

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function StaffProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const account = await getCurrentUser();
      setUser(account);
    } catch (loadError) {
      setUser(null);
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  async function handleLogout() {
    await clearAuthToken();
    const rootNavigation = navigation.getParent() ?? navigation;
    rootNavigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }

  const details = ROLE_DETAILS[user?.role] || {
    office: "CiviLanka",
    duty: "Civil registration services",
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerSafe}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable
            onPress={() => navigation.navigate("Home")}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back to dashboard"
          >
            <Ionicons name="chevron-back" size={28} color={COLORS.WHITE} />
          </Pressable>
        </View>
        <View style={styles.headerAccent} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>Loading profile...</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadProfile} accessibilityRole="button">
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : null}

        {user ? (
          <>
            <View style={styles.identityCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(user.name)}</Text>
              </View>
              <Text style={styles.name}>{user.name}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{roleLabel(user.role)}</Text>
              </View>
              <Text style={styles.duty}>{details.duty}</Text>
            </View>

            <View style={styles.card}>
              <DetailRow icon="business-outline" label="OFFICE" value={details.office} />
              <DetailRow icon="mail-outline" label="EMAIL" value={user.email} />
              <DetailRow icon="person-outline" label="USERNAME" value={user.username} />
              <DetailRow icon="id-card-outline" label="SERVICE NO" value={user.serviceNumber} />
            </View>

            <Pressable
              style={styles.linkCard}
              onPress={() => navigation.navigate("Settings")}
              accessibilityRole="button"
            >
              <View style={styles.iconCircle}>
                <Ionicons name="settings-outline" size={16} color={COLORS.PRIMARY_NAVY} />
              </View>
              <Text style={styles.linkText}>Settings</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.MUTED_TEXT} />
            </Pressable>

            <Pressable
              style={styles.linkCard}
              onPress={() => navigation.navigate("PrivacyPolicy")}
              accessibilityRole="button"
            >
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.PRIMARY_NAVY} />
              </View>
              <Text style={styles.linkText}>Privacy & Policy</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.MUTED_TEXT} />
            </Pressable>

            <Pressable style={styles.logoutButton} onPress={handleLogout} accessibilityRole="button">
              <Ionicons name="log-out-outline" size={20} color={COLORS.PRIMARY_NAVY} />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={16} color={COLORS.PRIMARY_NAVY} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
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
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 16,
    bottom: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.DARK_TEXT,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAccent: {
    height: 4,
    backgroundColor: COLORS.ACCENT_YELLOW,
  },
  headerTitle: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  noticeCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    padding: 16,
  },
  noticeText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "600",
  },
  retryButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_NAVY,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: "700",
  },
  identityCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 24,
    fontWeight: "700",
  },
  name: {
    marginTop: 12,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  rolePill: {
    marginTop: 8,
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  roleText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: "700",
  },
  duty: {
    marginTop: 10,
    color: COLORS.MUTED_TEXT,
    fontSize: 14,
    textAlign: "center",
  },
  card: {
    marginTop: 14,
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  detailCopy: {
    flex: 1,
  },
  detailLabel: {
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  detailValue: {
    marginTop: 3,
    color: COLORS.DARK_TEXT,
    fontSize: 15,
    fontWeight: "700",
  },
  linkCard: {
    marginTop: 12,
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    backgroundColor: COLORS.WHITE,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
  },
  linkText: {
    flex: 1,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  logoutButton: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    backgroundColor: COLORS.WHITE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
});
