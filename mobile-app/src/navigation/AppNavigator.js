import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, SafeAreaView } from "react-native";
import { useAuth } from "../context/AuthContext";
import { ForgotPasswordScreen, LoginScreen, RegisterScreen } from "../screens/AuthScreens";
import {
  AcademicYearsScreen,
  AdminAcademicsScreen,
  AdminCoursesScreen,
  AdminDashboardScreen,
  AdminMaterialsScreen,
  AdminUsersScreen,
  DataScienceCoursesScreen,
  MentorDashboardScreen,
  MentorProfileScreen,
  MentorStudentsScreen,
  MentorUploadScreen,
  ProfileScreen,
  PublicHomeScreen,
  StudentDashboardScreen,
  StudentHomeScreen,
} from "../screens/RoleScreens";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={PublicHomeScreen} options={{ title: "EduHub" }} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function StudentTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={StudentHomeScreen} />
      <Tab.Screen name="Academic Years" component={AcademicYearsScreen} />
      <Tab.Screen name="Courses" component={DataScienceCoursesScreen} />
      <Tab.Screen name="Dashboard" component={StudentDashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Overview" component={AdminDashboardScreen} />
      <Tab.Screen name="Academics" component={AdminAcademicsScreen} />
      <Tab.Screen name="Courses" component={AdminCoursesScreen} />
      <Tab.Screen name="Materials" component={AdminMaterialsScreen} />
      <Tab.Screen name="Users" component={AdminUsersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MentorTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Reviews" component={MentorDashboardScreen} />
      <Tab.Screen name="Upload" component={MentorUploadScreen} />
      <Tab.Screen name="Students" component={MentorStudentsScreen} />
      <Tab.Screen name="Profile" component={MentorProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { loading, user, dbUser } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : dbUser?.role === "admin" ? (
        <AdminTabs />
      ) : dbUser?.role === "mentor" ? (
        <MentorTabs />
      ) : (
        <StudentTabs />
      )}
    </NavigationContainer>
  );
}
