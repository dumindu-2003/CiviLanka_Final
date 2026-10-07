import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@react-native-vector-icons/ionicons";
import { COLORS } from "../constants/colors";
import DistrictRegistrarDashboard from "../screens/DistrictRegistrarDashboard";
import StaffProfileScreen from "../screens/StaffProfileScreen";
import StaffUpdatesScreen from "../screens/StaffUpdatesScreen";

const DISTRICT_NEWS = [
  {
    id: "news-marriage",
    date: "7 Oct 2026",
    title: "Marriage registrations",
    body: "Marriage registrars can send completed registrations to this office for review.",
  },
  {
    id: "news-nic",
    date: "2 Oct 2026",
    title: "NIC applications",
    body: "Pending NIC applications from village officers are listed under NIC Applications.",
  },
  {
    id: "news-death",
    date: "20 Sep 2026",
    title: "Death reports",
    body: "Death reports stay editable by the village officer until this office approves them.",
  },
];

const DISTRICT_NOTIFICATIONS = [
  {
    id: "note-marriage",
    title: "New marriage registration",
    body: "Open Marriage Registrations in the sidebar to review a submitted form.",
    time: "Today",
  },
  {
    id: "note-nic",
    title: "NIC application waiting",
    body: "A village officer submitted an NIC application for approval.",
    time: "2 Oct 2026",
  },
  {
    id: "note-death",
    title: "Death report received",
    body: "A death report is waiting in Death Reports.",
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

export default function DistrictRegistrarTabs() {
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
      <Tab.Screen name="Home" component={DistrictRegistrarDashboard} />
      <Tab.Screen
        name="News"
        component={StaffUpdatesScreen}
        initialParams={{
          title: "News",
          kind: "news",
          intro: "Updates for the District Registrar.",
          items: DISTRICT_NEWS,
        }}
      />
      <Tab.Screen
        name="Notification"
        component={StaffUpdatesScreen}
        initialParams={{
          title: "Notification",
          kind: "notification",
          intro: "Tap a notification to mark it as read.",
          items: DISTRICT_NOTIFICATIONS,
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
