import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import MainTabs from "./MainTabs";
import MarriageRegistrarTabs from "./MarriageRegistrarTabs";
import BankOfficerTabs from "./BankOfficerTabs";
import BankVerificationDetailScreen from "../screens/BankVerificationDetailScreen";
import BankCertificateListScreen from "../screens/BankCertificateListScreen";
import BankCertificateDetailScreen from "../screens/BankCertificateDetailScreen";
import VillageOfficerTabs from "./VillageOfficerTabs";
import DistrictRegistrarTabs from "./DistrictRegistrarTabs";
import DistrictCertificateListScreen from "../screens/DistrictCertificateListScreen";
import DistrictRegistrationDetailScreen from "../screens/DistrictRegistrationDetailScreen";
import NicApplicationDetailScreen from "../screens/NicApplicationDetailScreen";
import DistrictNicApplicationsScreen from "../screens/DistrictNicApplicationsScreen";
import DistrictDeathReportsScreen from "../screens/DistrictDeathReportsScreen";
import DistrictDeathReportDetailScreen from "../screens/DistrictDeathReportDetailScreen";
import NewDistrictRegistrationScreen from "../screens/NewDistrictRegistrationScreen";
import VillageCertificateListScreen from "../screens/VillageCertificateListScreen";
import VillageCertificateDetailScreen from "../screens/VillageCertificateDetailScreen";
import DeathReportScreen from "../screens/DeathReportScreen";
import DeathReportSentScreen from "../screens/DeathReportSentScreen";
import DeathReportListScreen from "../screens/DeathReportListScreen";
import NicFormScreen from "../screens/NicFormScreen";
import NicFormContactScreen from "../screens/NicFormContactScreen";
import NicFormDocumentsScreen from "../screens/NicFormDocumentsScreen";
import NicFormDeclarationScreen from "../screens/NicFormDeclarationScreen";
import NicFormReceiptScreen from "../screens/NicFormReceiptScreen";
import MarriageCertificateListScreen from "../screens/MarriageCertificateListScreen";
import MarriageRegistrationDetailScreen from "../screens/MarriageRegistrationDetailScreen";
import NewMarriageRegistrationScreen from "../screens/NewMarriageRegistrationScreen";
import DistrictMarriageRegistrationsScreen from "../screens/DistrictMarriageRegistrationsScreen";
import MarriageGroomParticularsScreen from "../screens/MarriageGroomParticularsScreen";
import MarriageBrideScreen from "../screens/MarriageBrideScreen";
import MarriageWitnessScreen from "../screens/MarriageWitnessScreen";
import MarriageRegistrationSentScreen from "../screens/MarriageRegistrationSentScreen";
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
      <Stack.Screen name="BankVerificationDetail" component={BankVerificationDetailScreen} />
      <Stack.Screen name="BankCertificateList" component={BankCertificateListScreen} />
      <Stack.Screen name="BankCertificateDetail" component={BankCertificateDetailScreen} />
      <Stack.Screen name="VillageOfficer" component={VillageOfficerTabs} />
      <Stack.Screen name="DistrictRegistrar" component={DistrictRegistrarTabs} />
      <Stack.Screen name="DistrictCertificateList" component={DistrictCertificateListScreen} />
      <Stack.Screen name="DistrictRegistrationDetail" component={DistrictRegistrationDetailScreen} />
      <Stack.Screen name="NicApplicationDetail" component={NicApplicationDetailScreen} />
      <Stack.Screen name="DistrictNicApplications" component={DistrictNicApplicationsScreen} />
      <Stack.Screen name="DistrictDeathReports" component={DistrictDeathReportsScreen} />
      <Stack.Screen name="DistrictDeathReportDetail" component={DistrictDeathReportDetailScreen} />
      <Stack.Screen name="NewDistrictRegistration" component={NewDistrictRegistrationScreen} />
      <Stack.Screen name="VillageCertificateList" component={VillageCertificateListScreen} />
      <Stack.Screen name="VillageCertificateDetail" component={VillageCertificateDetailScreen} />
      <Stack.Screen name="DeathReport" component={DeathReportScreen} />
      <Stack.Screen name="DeathReportSent" component={DeathReportSentScreen} />
      <Stack.Screen name="DeathReportList" component={DeathReportListScreen} />
      <Stack.Screen name="NicForm" component={NicFormScreen} />
      <Stack.Screen name="NicFormContact" component={NicFormContactScreen} />
      <Stack.Screen name="NicFormDocuments" component={NicFormDocumentsScreen} />
      <Stack.Screen name="NicFormDeclaration" component={NicFormDeclarationScreen} />
      <Stack.Screen name="NicFormReceipt" component={NicFormReceiptScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminTabs} />
      <Stack.Screen name="MarriageCertificateList" component={MarriageCertificateListScreen} />
      <Stack.Screen
        name="MarriageRegistrationDetail"
        component={MarriageRegistrationDetailScreen}
      />
      <Stack.Screen name="NewMarriageRegistration" component={NewMarriageRegistrationScreen} />
      <Stack.Screen
        name="DistrictMarriageRegistrations"
        component={DistrictMarriageRegistrationsScreen}
      />
      <Stack.Screen name="MarriageGroomParticulars" component={MarriageGroomParticularsScreen} />
      <Stack.Screen name="MarriageBrideSolemnization" component={MarriageBrideScreen} />
      <Stack.Screen name="MarriageWitnessSignOff" component={MarriageWitnessScreen} />
      <Stack.Screen name="MarriageRegistrationSent" component={MarriageRegistrationSentScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}
