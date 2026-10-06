import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import Logo from "./Logo";

const MENU_ITEMS = [
  { key: "home", label: "Dashboard", icon: "home-outline", target: "Home" },
  {
    key: "new-birth",
    label: "New Birth Registration",
    icon: "add-circle-outline",
    target: "NewDistrictRegistration",
    params: { kind: "birth" },
  },
  {
    key: "birth",
    label: "Birth Certificates",
    icon: "document-text-outline",
    target: "DistrictCertificateList",
    params: { kind: "birth" },
  },
  {
    key: "new-death",
    label: "New Death Registration",
    icon: "add-circle-outline",
    target: "NewDistrictRegistration",
    params: { kind: "death" },
  },
  {
    key: "death",
    label: "Death Certificates",
    icon: "document-text-outline",
    target: "DistrictCertificateList",
    params: { kind: "death" },
  },
  {
    key: "nic",
    label: "NIC Applications",
    icon: "card-outline",
    target: "DistrictNicApplications",
  },
  {
    key: "death-reports",
    label: "Death Reports",
    icon: "list-outline",
    target: "DistrictDeathReports",
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

export default function DistrictRegistrarSidebar({ visible, onClose, onNavigate, onLogout }) {
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(width * 0.78, 320);
  const translateX = useRef(new Animated.Value(-panelWidth)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    translateX.setValue(-panelWidth);
    backdrop.setValue(0);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, panelWidth, translateX, backdrop]);

  function animateClose(afterClose) {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -panelWidth,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        afterClose();
      }
    });
  }

  function openItem(item) {
    animateClose(() => {
      onClose();
      if (item.target !== "Home") {
        onNavigate(item.target, item.params);
      }
    });
  }

  function handleLogout() {
    animateClose(() => {
      onClose();
      onLogout();
    });
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => animateClose(onClose)}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.panel, { width: panelWidth, transform: [{ translateX }] }]}>
          <SafeAreaView style={styles.panelSafe} edges={["top", "bottom"]}>
            <View style={styles.brand}>
              <View style={styles.brandRow}>
                <Logo size={36} />
                <Pressable
                  onPress={() => animateClose(onClose)}
                  style={styles.closeButton}
                  accessibilityLabel="Close sidebar"
                >
                  <Ionicons name="close" size={22} color={COLORS.WHITE} />
                </Pressable>
              </View>
              <Text style={styles.brandTitle}>District Registrar</Text>
              <Text style={styles.brandSubtitle}>CiviLanka</Text>
            </View>
            <View style={styles.accent} />

            <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
              {MENU_ITEMS.map((item) => (
                <Pressable
                  key={item.key}
                  style={styles.menuItem}
                  onPress={() => openItem(item)}
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
        </Animated.View>
        <Pressable style={styles.backdropHit} onPress={() => animateClose(onClose)} accessibilityLabel="Close menu">
          <Animated.View
            style={[
              styles.backdropFill,
              {
                opacity: backdrop.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}
          />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  panel: {
    height: "100%",
    backgroundColor: COLORS.WHITE,
  },
  panelSafe: {
    flex: 1,
  },
  backdropHit: {
    flex: 1,
  },
  backdropFill: {
    flex: 1,
    backgroundColor: "rgba(10, 31, 68, 0.45)",
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
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
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
    fontSize: 14,
    fontWeight: "700",
  },
  logoutButton: {
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
