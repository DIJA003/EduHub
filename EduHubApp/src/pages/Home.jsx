import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Screen, Card, SectionLabel, Tag, Pill, ProgressBar,
  Divider, ErrorBox, EmptyState, safeArray, useColors,
} from "../components/UI";

export default function StudentHome() {
  const { dbUser } = useAuth();
  const c = useColors();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users/enrollments")
      .then((r) => { setEnrollments(safeArray(r)); setError(""); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const firstName    = dbUser?.name?.split(" ")[0] || "Student";
  const inProgress   = enrollments.filter((e) => e.progress > 0 && e.progress < 100);
  const completed    = enrollments.filter((e) => e.progress >= 100);
  const totalCredits = completed.reduce((s, e) => s + (e.credits || 0), 0);

  return (
    <Screen>
      <Card bg={c.blueBg} style={{ borderColor: c.blueBorder }}>
        <Tag label="WELCOME BACK" />
        <Text style={{ fontSize: 22, fontWeight: "800", color: c.text, marginTop: 6 }}>
          Hello, {firstName}! 👋
        </Text>
        <Text style={{ color: c.textSub, fontSize: 13, marginTop: 4 }}>
          {dbUser?.college && dbUser.college !== "—" ? dbUser.college + " • " : ""}
          <Text style={{ fontWeight: "700", color: c.blue, textTransform: "capitalize" }}>
            {dbUser?.role || "Student"}
          </Text>
        </Text>
        <Divider />
        <View style={{ flexDirection: "row", marginTop: 4 }}>
          <Pill label="Enrolled"    value={enrollments.length} color={c.blue}    />
          <Pill label="In Progress" value={inProgress.length}  color={c.amber}   />
          <Pill label="Completed"   value={completed.length}   color={c.emerald} />
          <Pill label="Credits"     value={totalCredits}       color={c.blue}    />
        </View>
      </Card>

      <ErrorBox message={error} />

      {loading ? (
        <Card><Text style={{ color: c.textSub, textAlign: "center" }}>Loading…</Text></Card>
      ) : (
        <>
          {inProgress.length > 0 && (
            <Card>
              <SectionLabel>Continue Learning</SectionLabel>
              {inProgress.slice(0, 3).map((course, i) => (
                <View key={course.courseId || i} style={{ marginTop: i > 0 ? 12 : 4 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={{ fontWeight: "700", color: c.text, flex: 1, marginRight: 8, fontSize: 14 }} numberOfLines={1}>
                      {course.name}
                    </Text>
                    <Text style={{ fontWeight: "700", color: c.blue, fontSize: 12 }}>{course.progress}%</Text>
                  </View>
                  <ProgressBar value={course.progress} />
                  <Text style={{ fontSize: 11, color: c.textSub, marginTop: 3 }}>Next: {course.nextItem}</Text>
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
                    <Text style={{ fontWeight: "600", color: c.text, fontSize: 13 }} numberOfLines={1}>{e.name}</Text>
                    <Text style={{ fontSize: 11, color: c.textSub }}>{e.code} · {e.credits || 0} credits</Text>
                  </View>
                  <Tag label="✓ Done" color={c.emerald} bg={c.emeraldBg} />
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