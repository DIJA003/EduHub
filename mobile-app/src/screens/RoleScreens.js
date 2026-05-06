import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Text, View, Image } from "react-native";
import {
  Button,
  Card,
  ConfirmModal,
  DataTable,
  Field,
  FormModal,
  GhostButton,
  Row,
  Screen,
  Subtitle,
  Title,
} from "../components/ui";
import { api, endpoints } from "../services/api";
import { useAuth } from "../context/AuthContext";

// ── helpers ───────────────────────────────────────────────────────────────────
function safeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <Card>
      <Text style={{ color: "#dc2626", fontWeight: "600" }}>⚠️ {message}</Text>
    </Card>
  );
}

function EmptyBox({ message }) {
  return (
    <Card>
      <Text style={{ color: "#64748b" }}>{message}</Text>
    </Card>
  );
}

// ── Generic CRUD screen (admin panels) ───────────────────────────────────────
function CrudScreen({ title, load, columns, makePayload }) {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  const fields = useMemo(
    () =>
      columns.filter(
        (c) => !["id", "_id", "createdAt", "updatedAt"].includes(c),
      ),
    [columns],
  );

  const fetchRows = async () => {
    try {
      const data = await load.getAll();
      setRows(safeArray(data));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  return (
    <Screen>
      <Row>
        <Title>{title}</Title>
        <Button
          label="Add New"
          onPress={() => {
            setEditing(null);
            setForm({});
            setModal(true);
          }}
        />
      </Row>
      <ErrorBox message={error} />
      <DataTable
        columns={columns}
        rows={rows}
        actions={(row) => (
          <Row>
            <GhostButton
              label="Edit"
              onPress={() => {
                setEditing(row);
                setForm(row);
                setModal(true);
              }}
            />
            <GhostButton
              label="Delete"
              onPress={() => {
                setDeleting(row);
                setConfirmOpen(true);
              }}
            />
          </Row>
        )}
      />
      <FormModal
        visible={modal}
        title={editing ? "Edit Record" : "Create Record"}
        onCancel={() => setModal(false)}
        onSave={async () => {
          try {
            const payload = makePayload ? makePayload(form) : form;
            if (editing?._id) await load.update(editing._id, payload);
            else await load.create(payload);
            setModal(false);
            fetchRows();
          } catch (e) {
            Alert.alert("Save failed", e.message);
          }
        }}
      >
        {fields.map((f) => (
          <View key={f} style={{ marginBottom: 10 }}>
            <Field
              label={f}
              value={form[f] === undefined ? "" : String(form[f])}
              onChangeText={(value) => setForm((p) => ({ ...p, [f]: value }))}
              placeholder={`Enter ${f}`}
            />
          </View>
        ))}
      </FormModal>
      <ConfirmModal
        visible={confirmOpen}
        title="Delete record?"
        description="This action cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          try {
            await load.remove(deleting._id);
            setConfirmOpen(false);
            fetchRows();
          } catch (e) {
            Alert.alert("Delete failed", e.message);
          }
        }}
      />
    </Screen>
  );
}

// ── Public Home ───────────────────────────────────────────────────────────────
export function PublicHomeScreen({ navigation }) {
  return (
    <Screen>
      <Card>
        <Image
          source={{
            uri: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
          }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 14,
            marginBottom: 12,
          }}
          resizeMode="cover"
        />
        <Text style={{ color: "#2563EB", fontWeight: "700", fontSize: 12 }}>
          CONNECTING MINDS
        </Text>
        <Title>Empowering Students & Mentors</Title>
        <Subtitle>
          A unified platform for collaboration and academic growth.
        </Subtitle>
        <Row>
          <Button label="Login" onPress={() => navigation.navigate("Login")} />
          <GhostButton
            label="Register"
            onPress={() => navigation.navigate("Register")}
          />
        </Row>
      </Card>
    </Screen>
  );
}

// ── Student Home ──────────────────────────────────────────────────────────────
export function StudentHomeScreen() {
  const { dbUser } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [years, setYears] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/users/enrollments"), api.get("/academic-years")])
      .then(([enrRes, yrRes]) => {
        setEnrollments(safeArray(enrRes));
        setYears(safeArray(yrRes));
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const inProgress = enrollments.filter(
    (e) => e.progress > 0 && e.progress < 100,
  );
  const completed = enrollments.filter((e) => e.progress >= 100);
  const firstName = dbUser?.name?.split(" ")[0] || "Student";

  return (
    <Screen>
      <Title>Welcome back, {firstName}! 👋</Title>
      <ErrorBox message={error} />
      {loading ? (
        <Card>
          <Text>Loading your data…</Text>
        </Card>
      ) : (
        <>
          {/* Academic Path Overview */}
          <Card>
            <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 12 }}>
              Your Academic Path
            </Text>
            <Text style={{ color: "#475569", marginBottom: 8 }}>
              Track your progress through academic years
            </Text>
            <Text style={{ fontSize: 14, marginBottom: 4 }}>
              Years Available: {years.length} | Total Credits:{" "}
              {completed.reduce((sum, c) => sum + (c.credits || 0), 0)}
            </Text>
          </Card>

          {/* Quick Stats */}
          <Card>
            <Text style={{ fontWeight: "800", fontSize: 16 }}>Quick Stats</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <View>
                <Text style={{ color: "#059669", fontWeight: "700" }}>
                  {enrollments.length}
                </Text>
                <Text style={{ fontSize: 12, color: "#475569" }}>Enrolled</Text>
              </View>
              <View>
                <Text style={{ color: "#059669", fontWeight: "700" }}>
                  {inProgress.length}
                </Text>
                <Text style={{ fontSize: 12, color: "#475569" }}>
                  In Progress
                </Text>
              </View>
              <View>
                <Text style={{ color: "#059669", fontWeight: "700" }}>
                  {completed.length}
                </Text>
                <Text style={{ fontSize: 12, color: "#475569" }}>
                  Completed
                </Text>
              </View>
            </View>
          </Card>

          {/* Continue Learning */}
          {inProgress.length > 0 && (
            <Card>
              <Text style={{ fontWeight: "800", fontSize: 16 }}>
                Continue Learning
              </Text>
              <Text style={{ color: "#475569", marginBottom: 8 }}>
                Pick up where you left off
              </Text>
              {inProgress.slice(0, 3).map((course, i) => (
                <View key={course.courseId || i} style={{ marginTop: 10 }}>
                  <Text style={{ fontWeight: "600" }}>{course.name}</Text>
                  <Text style={{ color: "#64748b", fontSize: 12 }}>
                    {course.code} · Year {course.yearId}
                  </Text>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: "#e2e8f0",
                      borderRadius: 3,
                      marginTop: 4,
                    }}
                  >
                    <View
                      style={{
                        height: 6,
                        backgroundColor: "#2563EB",
                        borderRadius: 3,
                        width: `${course.progress || 0}%`,
                      }}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}
                  >
                    {course.progress}% · Next: {course.nextItem}
                  </Text>
                </View>
              ))}
            </Card>
          )}

          {enrollments.length === 0 && (
            <EmptyBox message="No courses enrolled yet. Go to Courses tab to enroll." />
          )}
        </>
      )}
    </Screen>
  );
}

// ── Academic Years ────────────────────────────────────────────────────────────
export function AcademicYearsScreen() {
  const [years, setYears] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [yearCourses, setYearCourses] = useState([]);
  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/academic-years"), api.get("/users/enrollments")])
      .then(([yrRes, enrRes]) => {
        setYears(safeArray(yrRes));
        setEnrollments(safeArray(enrRes));
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingYears(false));
  }, []);

  // Calculate total earned credits across all years
  const totalEarnedCredits = enrollments.reduce((total, e) => {
    return total + (e.progress >= 100 ? e.credits || 0 : 0);
  }, 0);

  const creditRequirements = {
    1: 0,
    2: 39,
    3: 78,
    4: 117,
  };

  const selectYear = async (y) => {
    setSelectedYear(y);
    setLoadingCourses(true);
    setYearCourses([]);
    try {
      const r = await api.get(`/courses/year/${y.year}`);
      setYearCourses(safeArray(r));
    } catch (e) {
      Alert.alert("Error loading courses", e.message);
    } finally {
      setLoadingCourses(false);
    }
  };

  const enrolledIds = new Set(enrollments.map((e) => String(e.courseId)));

  const handleEnroll = async (course) => {
    try {
      await api.post(`/users/enrollments/${course._id}`);
      setEnrollments((prev) => [
        ...prev,
        {
          courseId: String(course._id),
          name: course.title,
          code: course.code,
          yearId: String(course.yearId),
          progress: 0,
          nextItem: "Getting Started",
        },
      ]);
      Alert.alert("Enrolled!", `You joined ${course.title}`);
    } catch (e) {
      Alert.alert("Enroll failed", e.message);
    }
  };

  return (
    <Screen>
      <Title>Academic Years</Title>
      <Subtitle>Track your progress through academic years</Subtitle>
      <ErrorBox message={error} />

      {loadingYears ? (
        <Card>
          <Text>Loading years…</Text>
        </Card>
      ) : years.length === 0 ? (
        <EmptyBox message="No academic years found. Run: seed script on the server." />
      ) : (
        <>
          {/* Credits Overview */}
          <Card>
            <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 12 }}>
              Credits Overview
            </Text>
            <Text style={{ color: "#475569", marginBottom: 8 }}>
              Total Earned: {totalEarnedCredits} credits
            </Text>
            <Text style={{ fontSize: 14, marginBottom: 4 }}>
              Years unlock as you earn credits
            </Text>
          </Card>

          {/* Year Cards */}
          {years
            .sort((a, b) => a.year - b.year)
            .map((y) => {
              const yearEnrollments = enrollments.filter(
                (e) => String(e.yearId) === String(y.year),
              );
              const completedCourses = yearEnrollments.filter(
                (e) => e.progress >= 100,
              );
              const isUnlocked =
                totalEarnedCredits >= (creditRequirements[y.year] || 0);
              const status =
                completedCourses.length > 0
                  ? "Completed"
                  : yearEnrollments.length > 0
                    ? "In Progress"
                    : isUnlocked
                      ? "Available"
                      : "Locked";

              return (
                <Card key={y._id}>
                  <Row>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "700", fontSize: 15 }}>
                        {y.name || `Year ${y.year}`}
                      </Text>
                      <Text
                        style={{
                          color: isUnlocked ? "#059669" : "#dc2626",
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
                        {status}
                      </Text>
                      {!isUnlocked && (
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            marginTop: 2,
                          }}
                        >
                          Requires {creditRequirements[y.year]} credits to
                          unlock
                        </Text>
                      )}
                    </View>
                    <GhostButton
                      label={isUnlocked ? "View Courses →" : "Locked"}
                      onPress={() => isUnlocked && selectYear(y)}
                    />
                  </Row>
                </Card>
              );
            })}
        </>
      )}
      {selectedYear && (
        <Card>
          <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 8 }}>
            {selectedYear.name || `Year ${selectedYear.year}`}
          </Text>
          {loadingCourses ? (
            <Text style={{ color: "#64748b" }}>Loading courses…</Text>
          ) : yearCourses.length === 0 ? (
            <Text style={{ color: "#64748b" }}>
              No published courses for this year Yet.
            </Text>
          ) : (
            yearCourses.map((c) => {
              const enrolled = enrolledIds.has(String(c._id));
              const enrollment = enrollments.find(
                (e) => String(e.courseId) === String(c._id),
              );
              return (
                <View
                  key={c._id}
                  style={{
                    marginBottom: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f1f5f9",
                    paddingBottom: 10,
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>{c.title}</Text>
                  <Text style={{ fontSize: 12, color: "#64748b" }}>
                    {c.code} · {c.creditHours} cr · {c.instructor || "TBA"}
                  </Text>
                  {enrolled && enrollment && (
                    <View style={{ marginTop: 4 }}>
                      <View
                        style={{
                          height: 4,
                          backgroundColor: "#e2e8f0",
                          borderRadius: 2,
                        }}
                      >
                        <View
                          style={{
                            height: 4,
                            backgroundColor: "#2563EB",
                            borderRadius: 2,
                            width: `${enrollment.progress || 0}%`,
                          }}
                        />
                      </View>
                      <Text
                        style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}
                      >
                        {enrollment.progress}% · Next: {enrollment.nextItem}
                      </Text>
                    </View>
                  )}
                  {enrolled ? (
                    <Text
                      style={{
                        color: "#16a34a",
                        fontSize: 12,
                        marginTop: 4,
                        fontWeight: "600",
                      }}
                    >
                      ✓ Enrolled
                    </Text>
                  ) : (
                    <Button label="Enroll" onPress={() => handleEnroll(c)} />
                  )}
                </View>
              );
            })
          )}
        </Card>
      )}
    </Screen>
  );
}

// ── Student Dashboard ─────────────────────────────────────────────────────────
export function StudentDashboardScreen() {
  const [enrollments, setEnrollments] = useState([]);
  const [myMaterials, setMyMaterials] = useState([]);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/users/enrollments"), api.get("/users/materials")])
      .then(([enrRes, matRes]) => {
        setEnrollments(safeArray(enrRes));
        setMyMaterials(safeArray(matRes));
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const inProgress = enrollments.filter(
    (e) => e.progress > 0 && e.progress < 100,
  );
  const completed = enrollments.filter((e) => e.progress >= 100);
  const tabs = ["dashboard", "my-courses", "materials"];

  return (
    <Screen>
      <Title>Student Dashboard</Title>
      <ErrorBox message={error} />
      <Card>
        <Row>
          {tabs.map((tab) => (
            <GhostButton
              key={tab}
              label={tab}
              onPress={() => setSelectedTab(tab)}
            />
          ))}
        </Row>
      </Card>

      {loading && (
        <Card>
          <Text>Loading…</Text>
        </Card>
      )}

      {!loading && selectedTab === "dashboard" && (
        <Card>
          <Text style={{ fontWeight: "800", fontSize: 16 }}>Overview</Text>
          <Text style={{ marginTop: 8 }}>Enrolled: {enrollments.length}</Text>
          <Text>In Progress: {inProgress.length}</Text>
          <Text>Completed: {completed.length}</Text>
          <Text>Materials Uploaded: {myMaterials.length}</Text>
        </Card>
      )}

      {!loading &&
        selectedTab === "my-courses" &&
        (enrollments.length === 0 ? (
          <EmptyBox message="No courses enrolled. Go to Academic Years to enroll." />
        ) : (
          enrollments.map((e, i) => (
            <Card key={e.courseId || i}>
              <Text style={{ fontWeight: "600" }}>{e.name}</Text>
              <Text style={{ fontSize: 12, color: "#64748b" }}>
                {e.code} · Year {e.yearId}
              </Text>
              <View
                style={{
                  height: 6,
                  backgroundColor: "#e2e8f0",
                  borderRadius: 3,
                  marginTop: 6,
                }}
              >
                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: e.progress >= 100 ? "#16a34a" : "#2563EB",
                    width: `${e.progress || 0}%`,
                  }}
                />
              </View>
              <Text style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                {e.progress}% ·{" "}
                {e.progress >= 100 ? "Completed ✓" : `Next: ${e.nextItem}`}
              </Text>
            </Card>
          ))
        ))}

      {!loading &&
        selectedTab === "materials" &&
        (myMaterials.length === 0 ? (
          <EmptyBox message="No materials uploaded yet." />
        ) : (
          <DataTable
            columns={["title", "course", "type", "status"]}
            rows={myMaterials.slice(0, 20)}
          />
        ))}
    </Screen>
  );
}

// ── Courses screen — real DB courses with year filter ─────────────────────────
export function DataScienceCoursesScreen() {
  const [allCourses, setAllCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState("1");

  useEffect(() => {
    Promise.all([
      api.get("/users/enrollments"),
      api.get("/courses/year/1"),
      api.get("/courses/year/2"),
      api.get("/courses/year/3"),
      api.get("/courses/year/4"),
    ])
      .then(([enrRes, c1, c2, c3, c4]) => {
        setEnrollments(safeArray(enrRes));
        setAllCourses([
          ...safeArray(c1).map((c) => ({ ...c, yearId: "1" })),
          ...safeArray(c2).map((c) => ({ ...c, yearId: "2" })),
          ...safeArray(c3).map((c) => ({ ...c, yearId: "3" })),
          ...safeArray(c4).map((c) => ({ ...c, yearId: "4" })),
        ]);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const enrolledIds = new Set(enrollments.map((e) => String(e.courseId)));
  const yearCourses = allCourses.filter(
    (c) => String(c.yearId) === selectedYear,
  );

  const handleEnroll = async (course) => {
    try {
      await api.post(`/users/enrollments/${course._id}`);
      setEnrollments((prev) => [
        ...prev,
        {
          courseId: String(course._id),
          name: course.title,
          code: course.code,
          yearId: String(course.yearId),
          progress: 0,
          nextItem: "Getting Started",
        },
      ]);
      Alert.alert("Enrolled!", `You joined ${course.title}`);
    } catch (e) {
      Alert.alert("Enroll failed", e.message);
    }
  };

  const handleUnenroll = async (course) => {
    try {
      await api.delete(`/users/enrollments/${course._id}`);
      setEnrollments((prev) =>
        prev.filter((e) => String(e.courseId) !== String(course._id)),
      );
      Alert.alert("Unenrolled", `Removed from ${course.title}`);
    } catch (e) {
      Alert.alert("Failed", e.message);
    }
  };

  return (
    <Screen>
      <Title>Courses</Title>
      <ErrorBox message={error} />

      <Card>
        <Row>
          {["1", "2", "3", "4"].map((y) => (
            <GhostButton
              key={y}
              label={`Year ${y}`}
              onPress={() => setSelectedYear(y)}
            />
          ))}
        </Row>
      </Card>

      {loading ? (
        <Card>
          <Text>Loading courses…</Text>
        </Card>
      ) : yearCourses.length === 0 ? (
        <EmptyBox
          message={`No published courses for Year ${selectedYear} yet.`}
        />
      ) : (
        yearCourses.map((course) => {
          const enrolled = enrolledIds.has(String(course._id));
          const enrollment = enrollments.find(
            (e) => String(e.courseId) === String(course._id),
          );
          return (
            <Card key={course._id}>
              <Text style={{ fontWeight: "700", fontSize: 15 }}>
                {course.title}
              </Text>
              <Text style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                {course.code} · {course.creditHours} credits
              </Text>
              {course.instructor ? (
                <Text style={{ color: "#64748b", fontSize: 12 }}>
                  Instructor: {course.instructor}
                </Text>
              ) : null}
              {enrolled && enrollment && (
                <View style={{ marginTop: 6 }}>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: "#e2e8f0",
                      borderRadius: 3,
                    }}
                  >
                    <View
                      style={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor:
                          (enrollment.progress || 0) >= 100
                            ? "#16a34a"
                            : "#2563EB",
                        width: `${enrollment.progress || 0}%`,
                      }}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}
                  >
                    {enrollment.progress}% ·{" "}
                    {(enrollment.progress || 0) >= 100
                      ? "Completed ✓"
                      : `Next: ${enrollment.nextItem}`}
                  </Text>
                </View>
              )}
              <View style={{ marginTop: 8 }}>
                {enrolled ? (
                  <GhostButton
                    label="Unenroll"
                    onPress={() => handleUnenroll(course)}
                  />
                ) : (
                  <Button label="Enroll" onPress={() => handleEnroll(course)} />
                )}
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

// ── Admin screens ─────────────────────────────────────────────────────────────
export function AdminDashboardScreen() {
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      endpoints.admin.dashboardStats(),
      endpoints.admin.dashboardActivity(),
    ])
      .then(([sRes, aRes]) => {
        setStats(sRes.data || sRes || {});
        setActivity(safeArray(aRes));
        setError("");
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <Screen>
      <Title>Admin Overview</Title>
      <ErrorBox message={error} />
      <Card>
        <Text style={{ fontWeight: "700" }}>
          Total Students: {stats.totalStudents ?? "-"}
        </Text>
        <Text style={{ fontWeight: "700" }}>
          Total Mentors: {stats.totalMentors ?? "-"}
        </Text>
        <Text style={{ fontWeight: "700" }}>
          Active Courses: {stats.activeCourses ?? "-"}
        </Text>
        <Text style={{ fontWeight: "700" }}>
          Pending Approvals: {stats.pendingApprovals ?? "-"}
        </Text>
      </Card>
      <Card>
        <Text style={{ fontWeight: "800", fontSize: 16 }}>Recent Activity</Text>
        {activity.length === 0 ? (
          <Text style={{ marginTop: 8, color: "#64748b" }}>
            No recent activity.
          </Text>
        ) : (
          activity.slice(0, 8).map((a, i) => (
            <Text key={a.id || i} style={{ marginTop: 6 }}>
              - {a.user || "User"} {a.action || "performed an action"}
            </Text>
          ))
        )}
      </Card>
    </Screen>
  );
}

export const AdminAcademicsScreen = () => (
  <CrudScreen
    title="Academic Management"
    load={endpoints.admin.colleges}
    columns={["name", "years", "semesters", "programs", "status"]}
  />
);
export const AdminCoursesScreen = () => (
  <CrudScreen
    title="Course Management"
    load={endpoints.admin.courses}
    columns={["code", "title", "college", "instructor", "students", "status"]}
  />
);
export const AdminMaterialsScreen = () => (
  <CrudScreen
    title="Materials Management"
    load={endpoints.admin.materials}
    columns={["title", "course", "type", "size", "uploader", "status"]}
  />
);
export const AdminUsersScreen = () => (
  <CrudScreen
    title="Users Management"
    load={endpoints.admin.users}
    columns={["name", "email", "role", "college", "status"]}
  />
);

// ── Mentor screens ────────────────────────────────────────────────────────────
export function MentorDashboardScreen() {
  const [pending, setPending] = useState([]);
  const [mine, setMine] = useState([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [action, setAction] = useState("approve");
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      endpoints.mentor.pendingMaterials(),
      endpoints.mentor.myMaterials(),
    ])
      .then(([pRes, mRes]) => {
        setPending(safeArray(pRes));
        setMine(safeArray(mRes));
        setError("");
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <Screen>
      <Title>Mentor Dashboard</Title>
      <ErrorBox message={error} />
      <Card>
        <Text style={{ fontWeight: "700" }}>
          Pending Reviews: {pending.length}
        </Text>
        <Text style={{ fontWeight: "700" }}>My Materials: {mine.length}</Text>
      </Card>
      {pending.length === 0 ? (
        <EmptyBox message="No pending materials to review." />
      ) : (
        <DataTable
          columns={["title", "course", "uploader", "status"]}
          rows={pending}
          actions={(row) => (
            <Row>
              <GhostButton
                label="Approve"
                onPress={() => {
                  setSelected(row);
                  setAction("approve");
                  setFeedback("");
                  setFeedbackOpen(true);
                }}
              />
              <GhostButton
                label="Reject"
                onPress={() => {
                  setSelected(row);
                  setAction("reject");
                  setFeedback("");
                  setFeedbackOpen(true);
                }}
              />
            </Row>
          )}
        />
      )}
      <FormModal
        visible={feedbackOpen}
        title={action === "approve" ? "Approve Material" : "Reject Material"}
        onCancel={() => setFeedbackOpen(false)}
        onSave={async () => {
          try {
            if (!selected?._id) return;
            if (action === "approve")
              await endpoints.mentor.approveMaterial(selected._id, {
                feedback,
              });
            else await endpoints.mentor.rejectMaterial(selected._id);
            setPending((prev) => prev.filter((m) => m._id !== selected._id));
            setFeedbackOpen(false);
          } catch (e) {
            Alert.alert("Failed", e.message);
          }
        }}
      >
        <Field
          label="Feedback"
          value={feedback}
          onChangeText={setFeedback}
          placeholder={
            action === "approve" ? "Great work..." : "Please revise..."
          }
        />
      </FormModal>
    </Screen>
  );
}

export function MentorUploadScreen() {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [type, setType] = useState("PDF");
  const [uploaded, setUploaded] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    endpoints.mentor
      .myMaterials()
      .then((r) => setUploaded(safeArray(r)))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <Screen>
      <Title>Upload Material</Title>
      <ErrorBox message={error} />
      <Card>
        <Field
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Week 4 lecture notes"
        />
        <Field
          label="Course"
          value={course}
          onChangeText={setCourse}
          placeholder="Data Structures"
        />
        <Field
          label="Type"
          value={type}
          onChangeText={setType}
          placeholder="PDF / Video / Slides"
        />
        <Button
          label="Upload"
          onPress={async () => {
            try {
              await endpoints.mentor.uploadMaterial({
                title,
                course,
                type,
                status: "Draft",
              });
              const r = await endpoints.mentor.myMaterials();
              setUploaded(safeArray(r));
              setTitle("");
              setCourse("");
            } catch (e) {
              Alert.alert("Upload failed", e.message);
            }
          }}
        />
      </Card>
      <DataTable
        columns={["title", "course", "type", "status"]}
        rows={uploaded}
        actions={(row) => (
          <Row>
            <GhostButton
              label="Delete"
              onPress={async () => {
                try {
                  await endpoints.mentor.deleteMaterial(row._id);
                  setUploaded((prev) => prev.filter((m) => m._id !== row._id));
                } catch (e) {
                  Alert.alert("Delete failed", e.message);
                }
              }}
            />
          </Row>
        )}
      />
    </Screen>
  );
}

export function MentorStudentsScreen() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    endpoints.admin.users
      .getAll()
      .then((r) => setUsers(safeArray(r)))
      .catch((e) => setError(e.message));
  }, []);

  const filtered = users
    .filter((u) => (u.role || "").toLowerCase() === "student")
    .filter(
      (s) =>
        (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <Screen>
      <Title>Students</Title>
      <ErrorBox message={error} />
      <Field
        label="Search"
        value={search}
        onChangeText={setSearch}
        placeholder="Name or email…"
      />
      {filtered.length === 0 ? (
        <EmptyBox message="No students found." />
      ) : (
        <DataTable
          columns={["name", "email", "college", "status"]}
          rows={filtered}
        />
      )}
    </Screen>
  );
}

export function MentorProfileScreen() {
  const { dbUser } = useAuth();
  const [profile, setProfile] = useState({
    name: dbUser?.name || "",
    email: dbUser?.email || "",
    college: dbUser?.college || "",
    bio: dbUser?.bio || "",
  });

  return (
    <Screen>
      <Title>My Profile</Title>
      <Card>
        <Text style={{ fontWeight: "700", fontSize: 18 }}>
          {profile.name || "Mentor"}
        </Text>
        <Text>{profile.email}</Text>
        <Text>{profile.college}</Text>
      </Card>
      <Card>
        <Field
          label="Name"
          value={profile.name}
          onChangeText={(v) => setProfile((p) => ({ ...p, name: v }))}
          placeholder="Full name"
        />
        <Field
          label="College"
          value={profile.college}
          onChangeText={(v) => setProfile((p) => ({ ...p, college: v }))}
          placeholder="College"
        />
        <Field
          label="Bio"
          value={profile.bio}
          onChangeText={(v) => setProfile((p) => ({ ...p, bio: v }))}
          placeholder="Bio"
        />
        <Button
          label="Save Changes"
          onPress={async () => {
            try {
              await api.put("/users/profile", {
                name: profile.name,
                college: profile.college,
              });
              Alert.alert("Saved!", "Profile updated.");
            } catch (e) {
              Alert.alert("Save failed", e.message);
            }
          }}
        />
      </Card>
    </Screen>
  );
}

export function ProfileScreen() {
  const { dbUser, logout } = useAuth();
  const [profile, setProfile] = useState({
    name: dbUser?.name || "",
    email: dbUser?.email || "",
    college: dbUser?.college || "",
    bio: dbUser?.bio || "",
    phone: dbUser?.phone || "",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/users/profile", profile);
      Alert.alert("Success", "Profile updated successfully!");
      setEditMode(false);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Title>Profile</Title>
      <Card>
        <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 12 }}>
          Personal Information
        </Text>

        <Field
          label="Full Name"
          value={profile.name}
          onChangeText={(value) => setProfile((p) => ({ ...p, name: value }))}
          placeholder="Enter your full name"
        />

        <Field
          label="Email"
          value={profile.email}
          onChangeText={(value) => setProfile((p) => ({ ...p, email: value }))}
          placeholder="Enter your email"
        />

        <Field
          label="College"
          value={profile.college}
          onChangeText={(value) =>
            setProfile((p) => ({ ...p, college: value }))
          }
          placeholder="Enter your college name"
        />

        <Field
          label="Phone"
          value={profile.phone}
          onChangeText={(value) => setProfile((p) => ({ ...p, phone: value }))}
          placeholder="Enter your phone number"
        />

        <Field
          label="Bio"
          value={profile.bio}
          onChangeText={(value) => setProfile((p) => ({ ...p, bio: value }))}
          placeholder="Tell us about yourself"
          multiline
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <GhostButton
            label={editMode ? "Cancel" : "Edit"}
            onPress={() => setEditMode(!editMode)}
          />
          {editMode ? (
            <Button
              label={loading ? "Saving..." : "Save Profile"}
              onPress={handleSave}
            />
          ) : null}
        </View>
      </Card>

      <Button label="Logout" onPress={logout} />
    </Screen>
  );
}