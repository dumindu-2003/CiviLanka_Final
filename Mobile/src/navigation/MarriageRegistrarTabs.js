import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import MarriageRegistrarDashboard from "../screens/MarriageRegistrarDashboard";
import StaffProfileScreen from "../screens/StaffProfileScreen";
import StaffUpdatesScreen from "../screens/StaffUpdatesScreen";
import VillageNewsScreen from "../screens/VillageNewsScreen";

const MARRIAGE_NOTIFICATIONS = [
  {
    id: "note-sent",
    title: "Registration sent for review",
    body: "A submitted marriage registration is waiting with the District Registrar.",
    time: "Today",
  },
  {
    id: "note-pending",
    title: "Pending marriage record",
    body: "M002 for Sahan Fernando and Dilini Jayawardena is still pending.",
    time: "30 Aug 2026",
  },
  {
    id: "note-approved",
    title: "Marriage certificate approved",
    body: "M001 for Kasun Perera and Amaya Silva has been approved.",
    time: "25 Aug 2026",
  },
];

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: { active: "home", inactive: "home-outline" },
  News: { active: "newspaper", inactive: "newspaper-outline" },
  Notification: { active: "notifications", inactive: "notifications-outline" },
  Profile: { active: "person", inactive: "person-outline" },
};

export default function MarriageRegistrarTabs() {
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
      <Tab.Screen name="Home" component={MarriageRegistrarDashboard} />
      <Tab.Screen name="News" component={VillageNewsScreen} />
      <Tab.Screen
        name="Notification"
        component={StaffUpdatesScreen}
        initialParams={{
          title: "Notification",
          kind: "notification",
          intro: "Tap a notification to mark it as read.",
          items: MARRIAGE_NOTIFICATIONS,
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
