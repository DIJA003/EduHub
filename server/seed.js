/**
 * EduHub Database Seeder
 * Run with:  node server/seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const User         = require("./models/User");
const College      = require("./models/College");
const AcademicYear = require("./models/AcademicYear");
const Course       = require("./models/Course");
const Enrollment   = require("./models/Enrollment");
const Material     = require("./models/Material");
const Section      = require("./models/Section");

const COLLEGE_NAME = "Faculty of Computer Science & Engineering";

const USERS = [
  { role: "admin",   name: "Admin User",         email: "admin@eduhub.com",    firebaseUid: "MQFDr17nEIfRyAs8KUFLOhZxrZG2" },
  { role: "mentor",  name: "Dr. Ahmed Salem",    email: "mentor1@eduhub.com",  firebaseUid: "fEJaxyGju6Pv1EEqZfrG7NU4OmP2" },
  { role: "mentor",  name: "Prof. Sara Nour",    email: "mentor2@eduhub.com",  firebaseUid: "0rl4OseE5jQeSvd6gNHzbM1EWBc2" },
  { role: "mentor",  name: "Dr. Omar Farouk",    email: "mentor3@eduhub.com",  firebaseUid: "2B0uQNP8RMbDDWNzaaCAAButEpm2" },
  { role: "mentor",  name: "Prof. Layla Hassan", email: "mentor4@eduhub.com",  firebaseUid: "pcr7tkwgX4OvwRnYyd10Pp9AVz52" },
  { role: "student", name: "Fady Atef",          email: "fady23374@gmail.com", firebaseUid: "ZwYbv30rWXcNIgOeQP5JR9IH8gJ2" },
  { role: "student", name: "Nour Ahmed",         email: "nour@eduhub.com",     firebaseUid: "yRhwaJ2LMoew8DcIHkmkt4y7qXh2" },
  { role: "student", name: "Omar Khalil",        email: "omar@eduhub.com",     firebaseUid: "ksushXLA6QRFQX4yNrgaa6kxyKa2" },
  { role: "student", name: "Sara Mohamed",       email: "sara@eduhub.com",     firebaseUid: "UZ7hq6p0oeV8RiNAesedPUJMi2S2" },
];

const COURSES_DATA = [
  // Year 1
  { yearId: "1", code: "CS101",  title: "Introduction to Programming",     creditHours: 3, mentorIndex: 1 },
  { yearId: "1", code: "MA110",  title: "Discrete Structures",             creditHours: 3, mentorIndex: 1 },
  { yearId: "1", code: "MA120",  title: "Calculus I",                      creditHours: 3, mentorIndex: 1 },
  { yearId: "1", code: "PH101",  title: "Physics I",                       creditHours: 3, mentorIndex: 2 },
  { yearId: "1", code: "EN101",  title: "Academic Writing",                creditHours: 3, mentorIndex: 2 },
  { yearId: "1", code: "EG100",  title: "Introduction to Engineering",     creditHours: 3, mentorIndex: 1 },
  { yearId: "1", code: "CH101",  title: "Chemistry I",                     creditHours: 3, mentorIndex: 2 },
  { yearId: "1", code: "EE110",  title: "Digital Systems",                 creditHours: 3, mentorIndex: 3 },
  { yearId: "1", code: "HU140",  title: "Ethics in Technology",            creditHours: 3, mentorIndex: 3 },
  { yearId: "1", code: "UN101",  title: "University Success",              creditHours: 3, mentorIndex: 4 },
  { yearId: "1", code: "CS120",  title: "Data & Society",                  creditHours: 3, mentorIndex: 1 },
  { yearId: "1", code: "PH102",  title: "Physics Laboratory",              creditHours: 3, mentorIndex: 2 },
  { yearId: "1", code: "CS105",  title: "Programming Workshop",            creditHours: 3, mentorIndex: 1 },
  { yearId: "1", code: "SEM100", title: "First-Year Seminar",              creditHours: 3, mentorIndex: 4 },
  // Year 2
  { yearId: "2", code: "CS201",  title: "Data Structures",                 creditHours: 3, mentorIndex: 2 },
  { yearId: "2", code: "CS202",  title: "Algorithms",                      creditHours: 3, mentorIndex: 2 },
  { yearId: "2", code: "MA301",  title: "Discrete Mathematics",            creditHours: 3, mentorIndex: 1 },
  { yearId: "2", code: "EE205",  title: "Computer Architecture",           creditHours: 3, mentorIndex: 3 },
  { yearId: "2", code: "CS210",  title: "Systems Programming",             creditHours: 3, mentorIndex: 1 },
  { yearId: "2", code: "MA250",  title: "Probability & Statistics",        creditHours: 3, mentorIndex: 1 },
  { yearId: "2", code: "CS230",  title: "Software Design",                 creditHours: 3, mentorIndex: 2 },
  { yearId: "2", code: "CS240",  title: "Computer Networks I",             creditHours: 3, mentorIndex: 2 },
  { yearId: "2", code: "CS250",  title: "Database Foundations",            creditHours: 3, mentorIndex: 3 },
  { yearId: "2", code: "CS260",  title: "Web Development",                 creditHours: 3, mentorIndex: 4 },
  { yearId: "2", code: "CS270",  title: "Operating Systems",               creditHours: 3, mentorIndex: 3 },
  { yearId: "2", code: "MA310",  title: "Linear Algebra Applications",     creditHours: 3, mentorIndex: 1 },
  { yearId: "2", code: "CS280",  title: "Human-Computer Interaction",      creditHours: 3, mentorIndex: 4 },
  { yearId: "2", code: "EN210",  title: "Technical Communication",         creditHours: 3, mentorIndex: 4 },
  // Year 3
  { yearId: "3", code: "SE401",  title: "Software Engineering",            creditHours: 3, mentorIndex: 3 },
  { yearId: "3", code: "CL402",  title: "Cloud Architecture",              creditHours: 3, mentorIndex: 3 },
  { yearId: "3", code: "AI403",  title: "AI & Machine Learning Systems",   creditHours: 3, mentorIndex: 3 },
  { yearId: "3", code: "ETH404", title: "Technology Ethics",               creditHours: 3, mentorIndex: 4 },
  { yearId: "3", code: "CS410",  title: "Distributed Systems",             creditHours: 3, mentorIndex: 3 },
  { yearId: "3", code: "SEC420", title: "Secure Coding",                   creditHours: 3, mentorIndex: 3 },
  { yearId: "3", code: "CS430",  title: "DevOps & CI/CD",                  creditHours: 3, mentorIndex: 4 },
  { yearId: "3", code: "CS440",  title: "Mobile Applications",             creditHours: 3, mentorIndex: 4 },
  { yearId: "3", code: "CS450",  title: "Big Data Analytics",              creditHours: 3, mentorIndex: 2 },
  { yearId: "3", code: "CS460",  title: "Computer Vision Basics",          creditHours: 3, mentorIndex: 3 },
  { yearId: "3", code: "CS470",  title: "NLP Fundamentals",                creditHours: 3, mentorIndex: 3 },
  { yearId: "3", code: "MG410",  title: "Product Management for Engineers",creditHours: 3, mentorIndex: 4 },
  { yearId: "3", code: "RS400",  title: "Research Methods",                creditHours: 3, mentorIndex: 2 },
  { yearId: "3", code: "LAB401", title: "Team Project Lab",                creditHours: 3, mentorIndex: 1 },
  // Year 4
  { yearId: "4", code: "CAP501", title: "Capstone Project I",              creditHours: 3, mentorIndex: 4 },
  { yearId: "4", code: "INT502", title: "Industry Internship",             creditHours: 3, mentorIndex: 4 },
  { yearId: "4", code: "SEM503", title: "Senior Seminar",                  creditHours: 3, mentorIndex: 4 },
  { yearId: "4", code: "CAP502", title: "Capstone Project II",             creditHours: 3, mentorIndex: 4 },
  { yearId: "4", code: "ENT510", title: "Entrepreneurship in Tech",        creditHours: 3, mentorIndex: 3 },
  { yearId: "4", code: "ADV520", title: "Advanced Topics Seminar",         creditHours: 3, mentorIndex: 3 },
  { yearId: "4", code: "PR530",  title: "Professional Practice",           creditHours: 3, mentorIndex: 2 },
  { yearId: "4", code: "GR540",  title: "Graduate School Prep",            creditHours: 3, mentorIndex: 2 },
  { yearId: "4", code: "PF550",  title: "Portfolio Studio",                creditHours: 3, mentorIndex: 1 },
  { yearId: "4", code: "LD560",  title: "Leadership & Teams",              creditHours: 3, mentorIndex: 1 },
  { yearId: "4", code: "CS570",  title: "Industry Case Studies",           creditHours: 3, mentorIndex: 2 },
  { yearId: "4", code: "TH580",  title: "Thesis Proposal",                creditHours: 3, mentorIndex: 3 },
  { yearId: "4", code: "TH590",  title: "Thesis Defense Prep",            creditHours: 3, mentorIndex: 4 },
  { yearId: "4", code: "CR600",  title: "Career Launch",                  creditHours: 3, mentorIndex: 1 },
];

function buildSections(course) {
  return [
    {
      courseRef: course._id,
      order:     0,
      title:     `${course.title} — Introduction`,
      summary:   `Overview and goals of ${course.title}.`,
      body:      `Welcome to ${course.title}. In this section you will get an overview of the course structure, learning objectives, and what you will achieve by the end. Read through this carefully before proceeding to the next section.`,
      isDeleted: false,
    },
    {
      courseRef: course._id,
      order:     1,
      title:     `${course.title} — Core Concepts`,
      summary:   `Fundamental theory and key ideas of ${course.title}.`,
      body:      `This section covers the core theoretical concepts of ${course.title}. Study each concept carefully. Take notes and make sure you fully understand the fundamentals before moving on to the practical application section.`,
      isDeleted: false,
    },
    {
      courseRef: course._id,
      order:     2,
      title:     `${course.title} — Practical Application`,
      summary:   `Hands-on exercises and real-world examples.`,
      body:      `Now that you understand the theory, this section walks you through practical applications of ${course.title}. Work through each example step by step. Attempt every exercise on your own before checking the solutions.`,
      isDeleted: false,
    },
    {
      courseRef: course._id,
      order:     3,
      title:     `${course.title} — Review & Assessment`,
      summary:   `Final review, self-assessment, and course completion.`,
      body:      `This final section reviews everything covered in ${course.title}. Go through the summary points, complete the self-assessment, and make sure you are confident in all the material. Once you finish this section the course will be marked complete.`,
      isDeleted: false,
    },
  ];
}

// Each student enrolled ONLY in their current year — other years are locked
const STUDENT_YEAR_MAP = {
  "fady23374@gmail.com": "1",
  "nour@eduhub.com":     "2",
  "omar@eduhub.com":     "3",
  "sara@eduhub.com":     "1",
};

async function seed() {
  const uri = process.env.MONGO_URL || process.env.MONGO_URI;
  if (!uri) { console.error("❌  MONGO_URL / MONGO_URI not set in .env"); process.exit(1); }

  console.log("🔌  Connecting to MongoDB…");
  await mongoose.connect(uri);
  console.log(`✅  Connected: ${mongoose.connection.name}`);

  console.log("\n🗑️   Clearing existing collections…");
  await Promise.all([
    Section.deleteMany({}),
    Material.deleteMany({}),
    Enrollment.deleteMany({}),
    Course.deleteMany({}),
    AcademicYear.deleteMany({}),
    College.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log("   ✓ All collections cleared");

  console.log("\n👤  Creating users…");
  const createdUsers = [];
  for (const u of USERS) {
    const user = await User.create({
      name: u.name, email: u.email, role: u.role,
      firebaseUid: u.firebaseUid, college: COLLEGE_NAME, status: "Active",
    });
    createdUsers.push(user);
    console.log(`   ✓ ${u.role.padEnd(7)} — ${u.name} (${u.email})`);
  }

  const adminUser = createdUsers.find((u) => u.role === "admin");
  const mentors   = createdUsers.filter((u) => u.role === "mentor");
  const students  = createdUsers.filter((u) => u.role === "student");

  console.log("\n🏫  Creating college…");
  await College.create({ name: COLLEGE_NAME, years: 4, semesters: 2, programs: 3, status: "Active", createdBy: adminUser._id });
  console.log(`   ✓ ${COLLEGE_NAME}`);

  console.log("\n📅  Creating academic years…");
  const AY = [
    { year: 1, name: "Year One — Foundations" },
    { year: 2, name: "Year Two — Core Specializations" },
    { year: 3, name: "Year Three — Advanced Applications" },
    { year: 4, name: "Year Four — Research & Thesis" },
  ];
  for (const y of AY) {
    await AcademicYear.create({ year: y.year, name: y.name, createdBy: adminUser._id });
    console.log(`   ✓ Year ${y.year}: ${y.name}`);
  }

  console.log("\n📚  Creating 56 courses (14 per year)…");
  const createdCourses = [];
  for (const c of COURSES_DATA) {
    const mentor = mentors[c.mentorIndex - 1];
    const course = await Course.create({
      code: c.code, title: c.title, college: COLLEGE_NAME,
      instructor: mentor.name, instructorRef: mentor._id,
      creditHours: c.creditHours, yearId: c.yearId,
      status: "Published", students: 0, createdBy: adminUser._id,
    });
    createdCourses.push(course);
    console.log(`   ✓ [Year ${c.yearId}] ${c.code} — ${c.title}`);
  }

  console.log("\n📖  Creating 4 sections per course (224 total)…");
  for (const course of createdCourses) {
    await Section.insertMany(buildSections(course));
    console.log(`   ✓ 4 sections → ${course.code} — ${course.title}`);
  }

  console.log("\n📝  Creating enrollments…");
  for (const student of students) {
    const yearId      = STUDENT_YEAR_MAP[student.email] || "1";
    const yearCourses = createdCourses.filter((c) => c.yearId === yearId);
    for (const course of yearCourses) {
      await Enrollment.create({
        student: student._id, course: course._id, enrolledBy: adminUser._id,
        status: "active", progress: 0, sectionsCompleted: 0, nextItem: "Getting Started",
      });
      await Course.findByIdAndUpdate(course._id, { $inc: { students: 1 } });
    }
    console.log(`   ✓ ${student.name} → Year ${yearId} (${yearCourses.length} courses)`);
  }

  console.log("\n════════════════════════════════════════════════");
  console.log("✅  SEED COMPLETE");
  console.log("════════════════════════════════════════════════");
  console.log(`   Users:       ${createdUsers.length}  (1 admin · 4 mentors · 4 students)`);
  console.log(`   Courses:     ${createdCourses.length}  (14 per year × 4 years)`);
  console.log(`   Sections:    ${createdCourses.length * 4}  (4 per course — Section model)`);
  console.log(`   Enrollments: ${students.length * 14}  (14 courses per student)`);
  console.log("");
  console.log("📌  Student year assignments (other years are LOCKED):");
  console.log("    fady23374@gmail.com → Year 1  (Years 2,3,4 locked)");
  console.log("    nour@eduhub.com     → Year 2  (Years 3,4 locked)");
  console.log("    omar@eduhub.com     → Year 3  (Year 4 locked)");
  console.log("    sara@eduhub.com     → Year 1  (Years 2,3,4 locked)");
  console.log("\n⚠️   If login fails: check firebaseUid values in MongoDB match");
  console.log("    Firebase Console → Authentication → each user's UID");
  console.log("════════════════════════════════════════════════\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  mongoose.disconnect();
  process.exit(1);
});