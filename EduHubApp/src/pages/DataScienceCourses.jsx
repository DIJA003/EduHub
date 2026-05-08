/**
 * src/pages/DataScienceCourses.jsx
 *
 * Mobile port of web DataScienceCourses.jsx — exact same logic:
 *  - Shows 6 open Data Science courses
 *  - Filters out already-enrolled courses
 *  - Credit cap check before enrolling
 *  - Uses CourseContext.enrollCourse() exactly like the web
 */
import React, { useState } from "react";
import { Text, View } from "react-native";
import { useCourses, sumEnrolledCredits } from "../context/CourseContext";
import {
  Screen, Card, SectionLabel, Tag, ConfirmModal,
  Btn, EmptyState, C, s,
} from "../components/UI";

// ─── Same hardcoded list as web ───────────────────────────────────────────────
const OPEN_COURSES = [
  { id: "foundations-analysis",  name: "Foundations of Data Analysis",        level: "Beginner",     duration: "8 weeks",  instructor: "Dr. Sarah Chen"    },
  { id: "ml-specialization",     name: "Machine Learning Specialization",      level: "Intermediate", duration: "12 weeks", instructor: "Marcus Vane"       },
  { id: "predictive-business",   name: "Predictive Analytics for Business",   level: "Advanced",     duration: "4 weeks",  instructor: "Elena Rodriguez"   },
  { id: "big-data-spark",        name: "Big Data Engineering with Spark",      level: "Intermediate", duration: "10 weeks", instructor: "Julian Chen"       },
  { id: "viz-tableau",           name: "Data Visualization with Tableau",      level: "Beginner",     duration: "6 weeks",  instructor: "Maya Patel"        },
  { id: "deep-learning",         name: "Deep Learning & Neural Networks",      level: "Advanced",     duration: "10 weeks", instructor: "Dr. Robert Smith"  },
];

const LEVEL_COLOR = {
  Beginner:     { color: C.emerald, bg: C.emeraldBg },
  Intermediate: { color: C.amber,   bg: C.amberBg   },
  Advanced:     { color: C.rose,    bg: "#FFF1F2"   },
};

export default function DataScienceCourses({ onBack }) {
  const { enrollCourse, years, currentYearId } = useCourses();
  const [limitDialog, setLimitDialog] = useState(false);

  const activeYear  = years[currentYearId];
  const enrolledIds = new Set((activeYear?.enrolled || []).map((c) => c.id));
  const visible     = OPEN_COURSES.filter((c) => !enrolledIds.has(c.id));

  const handleEnroll = (course) => {
    const credits = 3;
    const planned = sumEnrolledCredits(activeYear?.enrolled || []);
    const cap     = activeYear?.meta?.totalCredits ?? 42;
    if (planned + credits > cap) { setLimitDialog(true); return; }

    enrollCourse(currentYearId, {
      id:      course.id,
      name:    course.name,
      code:    "DS" + Math.floor(Math.random() * 900 + 100),
      credits,
    });

    if (onBack) onBack();
  };

  return (
    <Screen>
      <ConfirmModal
        visible={limitDialog}
        title="Credit limit reached"
        message={`You cannot enroll in more courses — your planned credits would exceed the ${activeYear?.meta?.totalCredits ?? 42}-credit limit for this year.`}
        confirmLabel="OK"
        onConfirm={() => setLimitDialog(false)}
        onCancel={() => setLimitDialog(false)}
      />

      {onBack && (
        <Btn label="← Back to Year" variant="ghost" small onPress={onBack} />
      )}

      <View>
        <SectionLabel>Courses / Data Science Enrollment</SectionLabel>
        <Text style={s.pageTitle}>Open Courses</Text>
        <Text style={{ fontSize: 13, color: C.slate600, marginTop: 4 }}>
          Select a course specialization to finalize your enrollment.
        </Text>
      </View>

      <Text style={{ fontSize: 12, color: C.slate500 }}>
        Showing {visible.length} open courses in Data Science.
      </Text>

      {visible.length === 0 ? (
        <EmptyState icon="🎓" title="All enrolled!" subtitle="You are enrolled in all available Data Science courses." />
      ) : (
        visible.map((course) => {
          const lvl = LEVEL_COLOR[course.level] || { color: C.blue, bg: C.blueBg };
          return (
            <Card key={course.id}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <Tag label={course.level.toUpperCase()} color={lvl.color} bg={lvl.bg} />
                <Text style={{ fontSize: 11, color: C.slate400 }}>{course.duration}</Text>
              </View>

              <Text style={{ fontWeight: "700", fontSize: 15, color: C.slate900 }}>{course.name}</Text>

              <Text style={{ fontSize: 12, color: C.slate500, marginTop: 4 }}>
                Instructor: <Text style={{ fontWeight: "600", color: C.slate700 }}>{course.instructor}</Text>
              </Text>

              <View style={{ marginTop: 14 }}>
                <Btn label="Confirm Enrollment" onPress={() => handleEnroll(course)} />
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}