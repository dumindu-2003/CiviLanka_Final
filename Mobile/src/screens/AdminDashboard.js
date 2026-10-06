import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import { roleLabel, STAFF_ROLES } from "../constants/roles";
import { clearAuthToken, createUser, getUsers } from "../services/api";
import AdminSidebar from "../components/AdminSidebar";

const EMPTY_FORM = {
  name: "",
  email: "",
  username: "",
  serviceNumber: "",
  password: "",
  role: "village_officer",
};

export default function AdminDashboard({ navigation }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const adminCount = users.filter((account) => account.role === "admin").length;
  const officerCount = users.length - adminCount;
  const stats = [
    { key: "staff", icon: "people-outline", value: String(users.length), label: "Staff" },
    { key: "officers", icon: "id-card-outline", value: String(officerCount), label: "Officers" },
    { key: "admins", icon: "shield-checkmark-outline", value: String(adminCount), label: "Admins" },
  ];

  const loadUsers = useCallback(async () => {
    try {
      const accounts = await getUsers();
      setUsers(accounts);
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setMessage("");
  }

  async function handleAddUser() {
    const name = form.name.trim();
    const email = form.email.trim();
    const username = form.username.trim();
    const serviceNumber = form.serviceNumber.trim().toUpperCase();
    const password = form.password.trim();

    if (!name || !email || !username || !serviceNumber || !password) {
      setError("Fill in name, email, username, service number, and password.");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      await createUser({
        name,
        email,
        username,
        serviceNumber,
        password,
        role: form.role,
      });
      setForm(EMPTY_FORM);
      setMessage("User added.");
      await loadUsers();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await clearAuthToken();
    const rootNavigation = navigation.getParent() ?? navigation;
    rootNavigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <AdminSidebar
        visible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(target) => navigation.navigate(target)}
        onLogout={handleLogout}
      />
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Pressable
            accessibilityLabel="Open sidebar"
            style={styles.headerIcon}
            onPress={() => setIsSidebarOpen(true)}
          >
            <Ionicons name="menu" size={24} color={COLORS.WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>Admin</Text>
          <Pressable
            accessibilityLabel="Profile"
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons name="person-outline" size={18} color={COLORS.WHITE} />
          </Pressable>
        </SafeAreaView>
        <View style={styles.headerAccent} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeCard}>
            <Text style={styles.welcome}>Welcome, Admin</Text>
            <Text style={styles.subtitle}>Add and manage staff accounts</Text>
          </View>

          <View style={styles.statsRow}>
            {stats.map((item) => (
              <View key={item.key} style={styles.statCard}>
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon} size={18} color={COLORS.PRIMARY_NAVY} />
                </View>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-add-outline" size={16} color={COLORS.PRIMARY_NAVY} />
              </View>
              <Text style={styles.cardTitle}>Add user</Text>
            </View>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={form.name}
              onChangeText={(value) => updateField("name", value)}
              placeholder="Full name"
              placeholderTextColor={COLORS.MUTED_TEXT}
              style={styles.input}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={form.email}
              onChangeText={(value) => updateField("email", value)}
              placeholder="name@civilanka.lk"
              placeholderTextColor={COLORS.MUTED_TEXT}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <Text style={styles.label}>Government Username</Text>
            <TextInput
              value={form.username}
              onChangeText={(value) => updateField("username", value)}
              placeholder="j.perera"
              placeholderTextColor={COLORS.MUTED_TEXT}
              autoCapitalize="none"
              style={styles.input}
            />
            <Text style={styles.label}>Service No</Text>
            <TextInput
              value={form.serviceNumber}
              onChangeText={(value) => updateField("serviceNumber", value)}
              placeholder="VO-100200"
              placeholderTextColor={COLORS.MUTED_TEXT}
              autoCapitalize="characters"
              style={styles.input}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={form.password}
              onChangeText={(value) => updateField("password", value)}
              placeholder="At least 6 characters"
              placeholderTextColor={COLORS.MUTED_TEXT}
              secureTextEntry
              style={styles.input}
            />
            <Text style={styles.label}>Role</Text>
            <View style={styles.roles}>
              {STAFF_ROLES.map((role) => {
                const selected = form.role === role.value;
                return (
                  <Pressable
                    key={role.value}
                    style={[styles.roleChip, selected && styles.roleChipSelected]}
                    onPress={() => updateField("role", role.value)}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.roleText, selected && styles.roleTextSelected]}>
                      {role.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {message ? <Text style={styles.success}>{message}</Text> : null}
            <Pressable
              style={[styles.button, isSaving && styles.buttonBusy]}
              onPress={handleAddUser}
              disabled={isSaving}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>{isSaving ? "Adding..." : "Add user"}</Text>
            </Pressable>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Staff accounts</Text>
            <View style={styles.metaPill}>
              <Text style={styles.sectionMeta}>
                {users.length === 1 ? "1 account" : `${users.length} accounts`}
              </Text>
            </View>
          </View>

          {users.map((account) => (
            <View key={account.id} style={styles.userCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-outline" size={16} color={COLORS.PRIMARY_NAVY} />
              </View>
              <View style={styles.userCopy}>
                <Text style={styles.userName}>{account.name}</Text>
                <Text style={styles.userMeta}>
                  {account.username} · {account.serviceNumber}
                </Text>
                <View style={styles.rolePill}>
                  <Text style={styles.rolePillText}>{roleLabel(account.role)}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.PRIMARY_NAVY,
  },
  headerSafe: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  headerAccent: {
    height: 4,
    backgroundColor: COLORS.ACCENT_YELLOW,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ACCENT_YELLOW,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  welcome: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    color: COLORS.MUTED_TEXT,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    marginTop: 8,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 26,
    fontWeight: "700",
  },
  statLabel: {
    marginTop: 2,
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    marginTop: 14,
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 16,
    fontWeight: "700",
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    color: COLORS.MUTED_TEXT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: COLORS.DARK_TEXT,
    backgroundColor: COLORS.BACKGROUND,
    fontSize: 15,
  },
  roles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleChip: {
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.WHITE,
  },
  roleChipSelected: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderColor: COLORS.PRIMARY_NAVY,
  },
  roleText: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 13,
    fontWeight: "700",
  },
  roleTextSelected: {
    color: COLORS.WHITE,
  },
  error: {
    marginTop: 12,
    color: COLORS.DARK_TEXT,
    fontSize: 14,
    fontWeight: "600",
  },
  success: {
    marginTop: 12,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  button: {
    marginTop: 16,
    minHeight: 50,
    borderRadius: 12,
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
  sectionHeader: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: COLORS.PRIMARY_NAVY,
    fontSize: 17,
    fontWeight: "700",
  },
  metaPill: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sectionMeta: {
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
    fontWeight: "600",
  },
  userCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  userCopy: {
    flex: 1,
  },
  userName: {
    color: COLORS.DARK_TEXT,
    fontSize: 15,
    fontWeight: "700",
  },
  userMeta: {
    marginTop: 2,
    color: COLORS.MUTED_TEXT,
    fontSize: 12,
  },
  rolePill: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: COLORS.PRIMARY_NAVY,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rolePillText: {
    color: COLORS.WHITE,
    fontSize: 11,
    fontWeight: "700",
  },
});
