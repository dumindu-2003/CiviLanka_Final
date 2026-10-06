import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import Logo from "./Logo";

const MENU_ITEMS = [
  { key: "home", label: "Dashboard", icon: "home-outline", target: "Home" },
  {
    key: "new",
    label: "New Marriage Registration",
    icon: "add-circle-outline",
    target: "NewMarriageRegistration",
  },
  {
    key: "certificates",
    label: "Marriage Certificates",
    icon: "document-text-outline",
    target: "MarriageCertificateList",
  },
  { key: "news", label: "News", icon: "newspaper-outline", target: "News" },
  {
    key: "notification",
    label: "Notification",
    icon: "notifications-outline",
    target: "Notification",
  },
  { key: "profile", label: "Profile", icon: "person-outline", target: "Profile" },
  { key: "settings", label: "Settings", icon: "settings-outline", target: "Settings" },
  { key: "privacy", label: "Privacy & Policy", icon: "shield-checkmark-outline", target: "PrivacyPolicy" },
];

export default function RegistrarSidebar({ visible, onClose, onNavigate, onLogout }) {
  function openItem(target) {
    onClose();
    if (target !== "Home") {
      onNavigate(target);
    }
  }

  function handleLogout() {
    onClose();
    onLogout();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.panel} edges={["top", "bottom"]}>
          <View style={styles.brand}>
            <View style={styles.brandRow}>
              <Logo size={36} />
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel="Close sidebar"
              >
                <Ionicons name="close" size={22} color={COLORS.WHITE} />
              </Pressable>
            </View>
            <Text style={styles.brandTitle}>Marriage Registrar</Text>
            <Text style={styles.brandSubtitle}>CiviLanka</Text>
          </View>
          <View style={styles.accent} />

          <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.key}
                style={styles.menuItem}
                onPress={() => openItem(item.target)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={18} color={COLORS.PRIMARY_NAVY} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Logout"
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.PRIMARY_NAVY} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </SafeAreaView>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(10, 31, 68, 0.45)",
  },
  panel: {
    width: "78%",
    maxWidth: 320,
    height: "100%",
    backgroundColor: COLORS.WHITE,
  },
  backdrop: {
    flex: 1,
  },
  brand: {
    backgroundColor: COLORS.PRIMARY_NAVY,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    marginTop: 14,
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "700",
  },
  brandSubtitle: {
    marginTop: 4,
    color: COLORS.ACCENT_YELLOW,
    fontSize: 13,
    fontWeight: "600",
  },
  accent: {
    height: 4,
    backgroundColor: COLORS.ACCENT_YELLOW,
  },
  menu: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.ACCENT_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    color: COLORS.PRIMARY_NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  logoutButton: {
    marginTop: "auto",
    marginHorizontal: 16,
    marginBottom: 8,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BORDER,
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
