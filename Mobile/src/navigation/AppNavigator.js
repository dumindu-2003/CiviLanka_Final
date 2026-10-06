import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import MainTabs from "./MainTabs";
import MarriageRegistrarTabs from "./MarriageRegistrarTabs";
import BankOfficerTabs from "./BankOfficerTabs";
import VillageOfficerTabs from "./VillageOfficerTabs";
import DistrictRegistrarTabs from "./DistrictRegistrarTabs";
import DistrictCertificateListScreen from "../screens/DistrictCertificateListScreen";
import DistrictRegistrationDetailScreen from "../screens/DistrictRegistrationDetailScreen";
import NewDistrictRegistrationScreen from "../screens/NewDistrictRegistrationScreen";
import VillageCertificateListScreen from "../screens/VillageCertificateListScreen";
import NicFormScreen from "../screens/NicFormScreen";
import MarriageCertificateListScreen from "../screens/MarriageCertificateListScreen";
import MarriageRegistrationDetailScreen from "../screens/MarriageRegistrationDetailScreen";
import NewMarriageRegistrationScreen from "../screens/NewMarriageRegistrationScreen";
import AdminTabs from "./AdminTabs";
import SettingsScreen from "../screens/SettingsScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="MarriageRegistrar" component={MarriageRegistrarTabs} />
      <Stack.Screen name="BankOfficer" component={BankOfficerTabs} />
      <Stack.Screen name="VillageOfficer" component={VillageOfficerTabs} />
      <Stack.Screen name="DistrictRegistrar" component={DistrictRegistrarTabs} />
      <Stack.Screen name="DistrictCertificateList" component={DistrictCertificateListScreen} />
      <Stack.Screen name="DistrictRegistrationDetail" component={DistrictRegistrationDetailScreen} />
      <Stack.Screen name="NewDistrictRegistration" component={NewDistrictRegistrationScreen} />
      <Stack.Screen name="VillageCertificateList" component={VillageCertificateListScreen} />
      <Stack.Screen name="NicForm" component={NicFormScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminTabs} />
      <Stack.Screen name="MarriageCertificateList" component={MarriageCertificateListScreen} />
      <Stack.Screen
        name="MarriageRegistrationDetail"
        component={MarriageRegistrationDetailScreen}
      />
      <Stack.Screen name="NewMarriageRegistration" component={NewMarriageRegistrationScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}
