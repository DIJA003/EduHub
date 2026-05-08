import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { colors } from "../utils/theme";

// ── Auth pages ────────────────────────────────────────────────────────────────
import LoginScreen          from "../pages/auth/Login";
import RegisterScreen       from "../pages/auth/Register";
import ForgotPasswordScreen from "../pages/auth/ForgotPassword";

// ── Student pages ─────────────────────────────────────────────────────────────
import HomeScreen       from "../pages/Home";
import AcademicYear     from "../pages/AcademicYear";
import StudentDashboard from "../pages/StudentDashboard";
import StudentProfile   from "../pages/StudentProfile";

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminDashboardHome  from "../pages/admin/DashboardHome";
import AcademicManagement  from "../pages/admin/AcademicManagement";
import CourseManagement    from "../pages/admin/CourseManagement";
import MaterialsManagement from "../pages/admin/MaterialsManagement";
import UsersManagement     from "../pages/admin/UsersManagement";
import EnrollManagement    from "../pages/admin/EnrollManagement";
import HistoryLogs         from "../pages/admin/HistoryLogs";

// ── Mentor pages ──────────────────────────────────────────────────────────────
import MentorDashboardHome from "../pages/mentor/DashboardHome";
import VideoReviews        from "../pages/mentor/VideoReviews";
import Students            from "../pages/mentor/Students";
import EnrollStudents      from "../pages/mentor/EnrollStudents";
import UploadMaterial      from "../pages/mentor/UploadMaterial";
import MentorHistory       from "../pages/mentor/MentorHistory";
import MentorProfile       from "../pages/mentor/MentorProfile";

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const HEADER_OPTS = {
  headerStyle:         { backgroundColor: colors.bgSurface },
  headerTintColor:     colors.textPrimary,
  headerTitleStyle:    { color: colors.textPrimary, fontWeight: "700" },
  headerShadowVisible: false,
};

const TAB_OPTS = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: colors.bgSurface,
    borderTopColor:  colors.border,
    borderTopWidth:  1,
    height:          60,
    paddingBottom:   8,
    paddingTop:      6,
  },
  tabBarActiveTintColor:   colors.accentLight,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
};

function icon(emoji) {
  return ({ focused }) => (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>
  );
}

// ── Auth Stack ────────────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTS}>
      <Stack.Screen name="Login"          component={LoginScreen}          options={{ title: "EduHub — Login" }} />
      <Stack.Screen name="Register"       component={RegisterScreen}       options={{ title: "Create Account" }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "Reset Password" }} />
    </Stack.Navigator>
  );
}

// ── Student Tabs ──────────────────────────────────────────────────────────────
function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTS}>
      <Tab.Screen name="Home"      component={HomeScreen}       options={{ tabBarIcon: icon("🏠"), title: "Home" }} />
      <Tab.Screen name="Academic"  component={AcademicYear}     options={{ tabBarIcon: icon("🎓"), title: "Academic" }} />
      <Tab.Screen name="Dashboard" component={StudentDashboard} options={{ tabBarIcon: icon("📊"), title: "Dashboard" }} />
      <Tab.Screen name="Profile"   component={StudentProfile}   options={{ tabBarIcon: icon("👤"), title: "Profile" }} />
    </Tab.Navigator>
  );
}

// ── Admin Tabs ────────────────────────────────────────────────────────────────
function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTS}>
      <Tab.Screen name="Overview"    component={AdminDashboardHome}  options={{ tabBarIcon: icon("🏠"),  title: "Overview" }} />
      <Tab.Screen name="Academics"   component={AcademicManagement}  options={{ tabBarIcon: icon("🏛️"), title: "Academics" }} />
      <Tab.Screen name="Courses"     component={CourseManagement}    options={{ tabBarIcon: icon("📚"), title: "Courses" }} />
      <Tab.Screen name="Materials"   component={MaterialsManagement} options={{ tabBarIcon: icon("📁"), title: "Materials" }} />
      <Tab.Screen name="Users"       component={UsersManagement}     options={{ tabBarIcon: icon("👥"), title: "Users" }} />
      <Tab.Screen name="Enrollments" component={EnrollManagement}    options={{ tabBarIcon: icon("➕"), title: "Enroll" }} />
      <Tab.Screen name="Logs"        component={HistoryLogs}         options={{ tabBarIcon: icon("📋"), title: "Logs" }} />
    </Tab.Navigator>
  );
}

// ── Mentor Tabs ───────────────────────────────────────────────────────────────
function MentorTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTS}>
      <Tab.Screen name="Dashboard" component={MentorDashboardHome} options={{ tabBarIcon: icon("🏠"),  title: "Home" }} />
      <Tab.Screen name="Reviews"   component={VideoReviews}        options={{ tabBarIcon: icon("🎬"),  title: "Reviews" }} />
      <Tab.Screen name="Students"  component={Students}            options={{ tabBarIcon: icon("👥"),  title: "Students" }} />
      <Tab.Screen name="Enroll"    component={EnrollStudents}      options={{ tabBarIcon: icon("➕"),  title: "Enroll" }} />
      <Tab.Screen name="Upload"    component={UploadMaterial}      options={{ tabBarIcon: icon("📤"), title: "Upload" }} />
      <Tab.Screen name="History"   component={MentorHistory}       options={{ tabBarIcon: icon("📋"), title: "History" }} />
      <Tab.Screen name="Profile"   component={MentorProfile}       options={{ tabBarIcon: icon("👤"), title: "Profile" }} />
    </Tab.Navigator>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { loading, user, dbUser } = useAuth();

  if (loading || user === undefined) {
    return (
      <SafeAreaView style={st.splash}>
        <Text style={st.logo}>
          Edu<Text style={{ color: colors.accentLight }}>Hub</Text>
        </Text>
        <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: 24 }} />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth"    component={AuthStack} />
        ) : dbUser?.role === "admin" ? (
          <Stack.Screen name="Admin"   component={AdminTabs} />
        ) : dbUser?.role === "mentor" ? (
          <Stack.Screen name="Mentor"  component={MentorTabs} />
        ) : (
          <Stack.Screen name="Student" component={StudentTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const st = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.bgBase, alignItems: "center", justifyContent: "center" },
  logo:   { fontSize: 42, fontWeight: "700", color: colors.textPrimary, letterSpacing: -1.5 },
});