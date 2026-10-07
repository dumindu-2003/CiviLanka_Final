import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import BankOfficerDashboard from "../screens/BankOfficerDashboard";
import VillageNewsScreen from "../screens/VillageNewsScreen";
import StaffProfileScreen from "../screens/StaffProfileScreen";
import StaffUpdatesScreen from "../screens/StaffUpdatesScreen";

const BANK_NOTIFICATIONS = [
  {
    id: "note-verify",
    title: "Identity check completed",
    body: "Saman Perera (NIC 199012345678) matched the national registry.",
    time: "Today",
  },
  {
    id: "note-branch",
    title: "Branch 042 access is active",
    body: "You can verify NIC numbers and certificate numbers from this dashboard.",
    time: "01 Sep 2026",
  },
  {
    id: "note-record",
    title: "Death record on file",
    body: "Certificate DR-2026-1029 is a death record. It should not be treated as a living NIC.",
    time: "28 Aug 2026",
  },
];

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: { active: "home", inactive: "home-outline" },
  News: { active: "newspaper", inactive: "newspaper-outline" },
  Notification: { active: "notifications", inactive: "notifications-outline" },
  Profile: { active: "person", inactive: "person-outline" },
};

export default function BankOfficerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.PRIMARY_NAVY,
        tabBarInactiveTintColor: COLORS.MUTED_TEXT,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => {
          const iconSet = TAB_ICONS[route.name];
          return (
            <Ionicons
              name={focused ? iconSet.active : iconSet.inactive}
              size={22}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={BankOfficerDashboard} />
      <Tab.Screen name="News" component={VillageNewsScreen} />
      <Tab.Screen
        name="Notification"
        component={StaffUpdatesScreen}
        initialParams={{
          title: "Notification",
          kind: "notification",
          intro: "Tap a notification to mark it as read.",
          items: BANK_NOTIFICATIONS,
        }}
      />
      <Tab.Screen name="Profile" component={StaffProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.WHITE,
    borderTopColor: COLORS.ACCENT_YELLOW,
    borderTopWidth: 3,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
