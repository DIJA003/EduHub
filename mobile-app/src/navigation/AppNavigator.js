import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
const Tab   = createBottomTabNavigator();

// ── Shared tab bar style ──────────────────────────────────────────────────────
const TAB_OPTIONS = {
  tabBarActiveTintColor:   "#2563eb",
  tabBarInactiveTintColor: "#94a3b8",
  tabBarStyle: {
    backgroundColor: "#ffffff",
    borderTopColor:  "#e2e8f0",
    borderTopWidth:  1,
    height:          60,
    paddingBottom:   8,
    paddingTop:      4,
  },
  tabBarLabelStyle: {
    fontSize:   11,
    fontWeight: "600",
  },
  headerStyle: {
    backgroundColor: "#ffffff",
    borderBottomColor: "#e2e8f0",
    borderBottomWidth: 1,
  },
  headerTitleStyle: {
    fontWeight: "700",
    color: "#0f172a",
  },
};

function icon(name) {
  return ({ color, size }) => <Ionicons name={name} size={size} color={color} />;
}

// ── Auth Stack ────────────────────────────────────────────────────────────────
function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home"           component={PublicHomeScreen}    options={{ title: "EduHub" }} />
      <Stack.Screen name="Login"          component={LoginScreen}         options={{ title: "Login" }} />
      <Stack.Screen name="Register"       component={RegisterScreen}      options={{ title: "Register" }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "Forgot Password" }} />
    </Stack.Navigator>
  );
}

// ── Student Tabs ──────────────────────────────────────────────────────────────
function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTIONS}>
      <Tab.Screen name="Home"           component={StudentHomeScreen}      options={{ tabBarIcon: icon("home"),           title: "Home" }} />
      <Tab.Screen name="Academic Years" component={AcademicYearsScreen}    options={{ tabBarIcon: icon("school"),         title: "Academic Y..." }} />
      <Tab.Screen name="Courses"        component={DataScienceCoursesScreen} options={{ tabBarIcon: icon("book"),         title: "Courses" }} />
      <Tab.Screen name="Dashboard"      component={StudentDashboardScreen} options={{ tabBarIcon: icon("grid"),           title: "Dashboard" }} />
      <Tab.Screen name="Profile"        component={ProfileScreen}          options={{ tabBarIcon: icon("person-circle"), title: "Profile" }} />
    </Tab.Navigator>
  );
}

// ── Admin Tabs ────────────────────────────────────────────────────────────────
function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTIONS}>
      <Tab.Screen name="Overview"  component={AdminDashboardScreen} options={{ tabBarIcon: icon("stats-chart"),     title: "Overview" }} />
      <Tab.Screen name="Academics" component={AdminAcademicsScreen} options={{ tabBarIcon: icon("school"),          title: "Academics" }} />
      <Tab.Screen name="Courses"   component={AdminCoursesScreen}   options={{ tabBarIcon: icon("book"),            title: "Courses" }} />
      <Tab.Screen name="Materials" component={AdminMaterialsScreen} options={{ tabBarIcon: icon("document-text"),   title: "Materials" }} />
      <Tab.Screen name="Users"     component={AdminUsersScreen}     options={{ tabBarIcon: icon("people"),          title: "Users" }} />
      <Tab.Screen name="Profile"   component={ProfileScreen}        options={{ tabBarIcon: icon("person-circle"),   title: "Profile" }} />
    </Tab.Navigator>
  );
}

// ── Mentor Tabs ───────────────────────────────────────────────────────────────
function MentorTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTIONS}>
      <Tab.Screen name="Reviews"  component={MentorDashboardScreen} options={{ tabBarIcon: icon("checkmark-circle"), title: "Reviews" }} />
      <Tab.Screen name="Upload"   component={MentorUploadScreen}    options={{ tabBarIcon: icon("cloud-upload"),     title: "Upload" }} />
      <Tab.Screen name="Students" component={MentorStudentsScreen}  options={{ tabBarIcon: icon("people"),           title: "Students" }} />
      <Tab.Screen name="Profile"  component={MentorProfileScreen}   options={{ tabBarIcon: icon("person-circle"),    title: "Profile" }} />
    </Tab.Navigator>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { loading, user, dbUser } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
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