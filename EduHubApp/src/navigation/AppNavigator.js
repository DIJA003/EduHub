import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";

const BG_BASE    = "#0d1117";
const BG_SURFACE = "#161b22";
const ACCENT     = "#2563EB";
const ACCENT_LT  = "#60A5FA";
const BORDER     = "#30363d";
const TEXT       = "#e6edf3";
const TEXT_MUTED = "#8b949e";

// ── Auth pages ────────────────────────────────────────────────────────────────
import LoginScreen          from "../pages/auth/Login";
import RegisterScreen       from "../pages/auth/Register";
import ForgotPasswordScreen from "../pages/auth/ForgotPassword";

// ── Student pages ─────────────────────────────────────────────────────────────
import StudentHome      from "../pages/Home";
import AcademicYear     from "../pages/AcademicYear";
import StudentDashboard from "../pages/StudentDashboard";
import Profile          from "../pages/StudentProfile";

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminDashboard    from "../pages/admin/DashboardHome";      // ← correct filename
import AdminAcademics    from "../pages/admin/AcademicManagement"; // ← correct filename
import AdminCourses      from "../pages/admin/CourseManagement";   // ← correct filename
import AdminMaterials    from "../pages/admin/MaterialsManagement";// ← correct filename
import AdminUsers        from "../pages/admin/UsersManagement";    // ← correct filename
import EnrollManagement  from "../pages/admin/EnrollManagement";
import HistoryLogs       from "../pages/admin/HistoryLogs";

// ── Mentor pages ──────────────────────────────────────────────────────────────
import MentorDashboard from "../pages/mentor/DashboardHome";   // ← correct filename
import MentorUpload    from "../pages/mentor/UploadMaterial";  // ← correct filename
import MentorStudents  from "../pages/mentor/Students";
import VideoReviews    from "../pages/mentor/VideoReviews";
import EnrollStudents  from "../pages/mentor/EnrollStudents";
import MentorHistory   from "../pages/mentor/MentorHistory";
import MentorProfile   from "../pages/mentor/MentorProfile";

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TAB_OPTS = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: BG_SURFACE,
    borderTopColor:  BORDER,
    borderTopWidth:  1,
    height:          60,
    paddingBottom:   8,
    paddingTop:      6,
  },
  tabBarActiveTintColor:   ACCENT_LT,
  tabBarInactiveTintColor: TEXT_MUTED,
  tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
};

function icon(emoji) {
  return ({ focused }) => (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle:         { backgroundColor: BG_SURFACE },
      headerTintColor:     TEXT,
      headerTitleStyle:    { color: TEXT, fontWeight: "700" },
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="Login"          component={LoginScreen}          options={{ title: "EduHub — Login" }} />
      <Stack.Screen name="Register"       component={RegisterScreen}       options={{ title: "Create Account" }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "Reset Password" }} />
    </Stack.Navigator>
  );
}

function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTS}>
      <Tab.Screen name="Home"      component={StudentHome}      options={{ tabBarIcon: icon("🏠"), title: "Home"      }} />
      <Tab.Screen name="Academic"  component={AcademicYear}     options={{ tabBarIcon: icon("🎓"), title: "Academic"  }} />
      <Tab.Screen name="Dashboard" component={StudentDashboard} options={{ tabBarIcon: icon("📊"), title: "Dashboard" }} />
      <Tab.Screen name="Profile"   component={Profile}          options={{ tabBarIcon: icon("👤"), title: "Profile"   }} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTS}>
      <Tab.Screen name="Overview"    component={AdminDashboard}   options={{ tabBarIcon: icon("🏠"),  title: "Overview"  }} />
      <Tab.Screen name="Academics"   component={AdminAcademics}   options={{ tabBarIcon: icon("🏛️"), title: "Academics" }} />
      <Tab.Screen name="Courses"     component={AdminCourses}     options={{ tabBarIcon: icon("📚"), title: "Courses"   }} />
      <Tab.Screen name="Materials"   component={AdminMaterials}   options={{ tabBarIcon: icon("📁"), title: "Materials" }} />
      <Tab.Screen name="Users"       component={AdminUsers}       options={{ tabBarIcon: icon("👥"), title: "Users"     }} />
      <Tab.Screen name="Enrollments" component={EnrollManagement} options={{ tabBarIcon: icon("➕"), title: "Enroll"    }} />
      <Tab.Screen name="Logs"        component={HistoryLogs}      options={{ tabBarIcon: icon("📋"), title: "Logs"      }} />
    </Tab.Navigator>
  );
}

function MentorTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTS}>
      <Tab.Screen name="Dashboard" component={MentorDashboard} options={{ tabBarIcon: icon("🏠"),  title: "Home"     }} />
      <Tab.Screen name="Reviews"   component={VideoReviews}    options={{ tabBarIcon: icon("🎬"),  title: "Reviews"  }} />
      <Tab.Screen name="Students"  component={MentorStudents}  options={{ tabBarIcon: icon("👥"),  title: "Students" }} />
      <Tab.Screen name="Enroll"    component={EnrollStudents}  options={{ tabBarIcon: icon("➕"),  title: "Enroll"   }} />
      <Tab.Screen name="Upload"    component={MentorUpload}    options={{ tabBarIcon: icon("📤"), title: "Upload"   }} />
      <Tab.Screen name="History"   component={MentorHistory}   options={{ tabBarIcon: icon("📋"), title: "History"  }} />
      <Tab.Screen name="Profile"   component={MentorProfile}   options={{ tabBarIcon: icon("👤"), title: "Profile"  }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { loading, user, dbUser } = useAuth();

  if (loading || user === undefined) {
    return (
      <View style={st.splash}>
        <Text style={st.logo}>
          Edu<Text style={{ color: ACCENT_LT }}>Hub</Text>
        </Text>
        <ActivityIndicator color={ACCENT} size="large" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth"    component={AuthStack}   />
        ) : dbUser?.role === "admin" ? (
          <Stack.Screen name="Admin"   component={AdminTabs}   />
        ) : dbUser?.role === "mentor" ? (
          <Stack.Screen name="Mentor"  component={MentorTabs}  />
        ) : (
          <Stack.Screen name="Student" component={StudentTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const st = StyleSheet.create({
  splash: { flex: 1, backgroundColor: BG_BASE, alignItems: "center", justifyContent: "center" },
  logo:   { fontSize: 42, fontWeight: "700", color: TEXT, letterSpacing: -1.5 },
});