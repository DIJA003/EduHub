import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Screen, Card, SectionLabel, Tag, Pill, ProgressBar,
  Divider, ErrorBox, EmptyState, safeArray, C,
} from "../components/UI";

export default function StudentHome() {
  const { dbUser } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users/enrollments")
      .then((r) => { setEnrollments(safeArray(r)); setError(""); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const firstName  = dbUser?.name?.split(" ")[0] || "Student";
  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100);
  const completed  = enrollments.filter((e) => e.progress >= 100);
  const totalCredits = completed.reduce((s, c) => s + (c.credits || 0), 0);

  return (
    <Screen>
      <Card bg={C.blueBg} style={{ borderColor: C.blueBorder }}>
        <Tag label="WELCOME BACK" />
        <Text style={{ fontSize: 22, fontWeight: "800", color: C.slate900, marginTop: 6 }}>
          Hello, {firstName}! 👋
        </Text>
        <Text style={{ color: C.slate600, fontSize: 13, marginTop: 4 }}>
          {dbUser?.college && dbUser.college !== "—" ? dbUser.college + " • " : ""}
          <Text style={{ fontWeight: "700", color: C.blue, textTransform: "capitalize" }}>
            {dbUser?.role || "Student"}
          </Text>
        </Text>
        <Divider />
        <View style={{ flexDirection: "row", marginTop: 4 }}>
          <Pill label="Enrolled"    value={enrollments.length}  color={C.blue}    />
          <Pill label="In Progress" value={inProgress.length}   color={C.amber}   />
          <Pill label="Completed"   value={completed.length}    color={C.emerald} />
          <Pill label="Credits"     value={totalCredits}        color={C.blue}    />
        </View>
      </Card>

      <ErrorBox message={error} />

      {loading ? (
        <Card><Text style={{ color: C.slate500, textAlign: "center" }}>Loading…</Text></Card>
      ) : (
        <>
          {inProgress.length > 0 && (
            <Card>
              <SectionLabel>Continue Learning</SectionLabel>
              {inProgress.slice(0, 3).map((course, i) => (
                <View key={course.courseId || i} style={{ marginTop: i > 0 ? 12 : 4 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={{ fontWeight: "700", color: C.slate900, flex: 1, marginRight: 8, fontSize: 14 }} numberOfLines={1}>
                      {course.name}
                    </Text>
                    <Text style={{ fontWeight: "700", color: C.blue, fontSize: 12 }}>{course.progress}%</Text>
                  </View>
                  <ProgressBar value={course.progress} />
                  <Text style={{ fontSize: 11, color: C.slate500, marginTop: 3 }}>Next: {course.nextItem}</Text>
                </View>
              ))}
            </Card>
          )}

          {completed.length > 0 && (
            <Card>
              <SectionLabel>Completed Courses</SectionLabel>
              {completed.slice(0, 4).map((e, i) => (
                <View key={e.courseId || i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: i > 0 ? 8 : 4 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", color: C.slate900, fontSize: 13 }} numberOfLines={1}>{e.name}</Text>
                    <Text style={{ fontSize: 11, color: C.slate500 }}>{e.code} · {e.credits || 0} credits</Text>
                  </View>
                  <Tag label="✓ Done" color={C.emerald} bg={C.emeraldBg} />
                </View>
              ))}
            </Card>
          )}

          {enrollments.length === 0 && (
            <EmptyState icon="📚" title="No courses yet" subtitle="Go to Academic Years tab to enroll." />
          )}
        </>
      )}
    </Screen>
  );
}