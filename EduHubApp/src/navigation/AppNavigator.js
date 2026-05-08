import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { darkColors, lightColors } from "../utils/theme";

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
import AdminDashboard   from "../pages/admin/DashboardHome";
import AdminAcademics   from "../pages/admin/AcademicManagement";
import AdminCourses     from "../pages/admin/CourseManagement";
import AdminMaterials   from "../pages/admin/MaterialsManagement";
import AdminUsers       from "../pages/admin/UsersManagement";
import EnrollManagement from "../pages/admin/EnrollManagement";
import HistoryLogs      from "../pages/admin/HistoryLogs";

// ── Mentor pages ──────────────────────────────────────────────────────────────
import MentorDashboard from "../pages/mentor/DashboardHome";
import MentorUpload    from "../pages/mentor/UploadMaterial";
import MentorStudents  from "../pages/mentor/Students";
import VideoReviews    from "../pages/mentor/VideoReviews";
import EnrollStudents  from "../pages/mentor/EnrollStudents";
import MentorHistory   from "../pages/mentor/MentorHistory";
import MentorProfile   from "../pages/mentor/MentorProfile";

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function icon(emoji) {
  return ({ focused }) => (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>
  );
}

function AuthStack({ colors }) {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle:         { backgroundColor: colors.bgSurface },
      headerTintColor:     colors.textPrimary,
      headerTitleStyle:    { color: colors.textPrimary, fontWeight: "700" },
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="Login"          component={LoginScreen}          options={{ title: "EduHub — Login" }} />
      <Stack.Screen name="Register"       component={RegisterScreen}       options={{ title: "Create Account" }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "Reset Password" }} />
    </Stack.Navigator>
  );
}

function makeTabOpts(colors) {
  return {
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
}

function StudentTabs({ colors }) {
  const TAB_OPTS = makeTabOpts(colors);
  return (
    <Tab.Navigator screenOptions={TAB_OPTS}>
      <Tab.Screen name="Home"      component={StudentHome}      options={{ tabBarIcon: icon("🏠"), title: "Home"      }} />
      <Tab.Screen name="Academic"  component={AcademicYear}     options={{ tabBarIcon: icon("🎓"), title: "Academic"  }} />
      <Tab.Screen name="Dashboard" component={StudentDashboard} options={{ tabBarIcon: icon("📊"), title: "Dashboard" }} />
      <Tab.Screen name="Profile"   component={Profile}          options={{ tabBarIcon: icon("👤"), title: "Profile"   }} />
    </Tab.Navigator>
  );
}

function AdminTabs({ colors }) {
  const TAB_OPTS = makeTabOpts(colors);
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

function MentorTabs({ colors }) {
  const TAB_OPTS = makeTabOpts(colors);
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
  const { isDark } = useTheme();
  const colors = isDark ? darkColors : lightColors;

  if (loading || user === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgBase, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 42, fontWeight: "700", color: colors.textPrimary, letterSpacing: -1.5 }}>
          Edu<Text style={{ color: colors.accentLight }}>Hub</Text>
        </Text>
        <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth">
            {() => <AuthStack colors={colors} />}
          </Stack.Screen>
        ) : dbUser?.role === "admin" ? (
          <Stack.Screen name="Admin">
            {() => <AdminTabs colors={colors} />}
          </Stack.Screen>
        ) : dbUser?.role === "mentor" ? (
          <Stack.Screen name="Mentor">
            {() => <MentorTabs colors={colors} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Student">
            {() => <StudentTabs colors={colors} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}