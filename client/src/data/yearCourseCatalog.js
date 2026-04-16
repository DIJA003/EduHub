/**
 * Each academic year: 14 courses × 3 credits = 42 credit hours.
 */

const SCHEDULES = ["MWF", "TTh", "MW", "Fri", "Online"];
const TYPES = ["Core", "Core", "Core", "Elective"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function instructorFor(yearNum, i) {
  const names = [
    "Dr. Chen",
    "Prof. Miller",
    "Dr. Patel",
    "Prof. Rivera",
    "Dr. Kim",
    "Prof. Brooks",
    "Dr. Nguyen",
    "Prof. Alan T.",
    "Dr. Sarah J.",
    "Prof. Vane",
    "Dr. Rodriguez",
    "Prof. Smith",
    "Dr. Patel",
    "Prof. Lee",
  ];
  return names[i % names.length];
}

/** Catalog row for enrollment / planned curriculum (pool) */
export function catalogRow(yearPrefix, index1Based, title, code) {
  const i = index1Based - 1;
  return {
    id: `${yearPrefix}-c${pad(index1Based)}`,
    name: title,
    code,
    credits: 3,
    type: TYPES[i % TYPES.length],
    length: `${6 + (i % 6)} weeks`,
    schedule: SCHEDULES[i % SCHEDULES.length],
    instructor: instructorFor(yearPrefix, i),
  };
}

/** Enrolled course with progress fields */
export function enrolledRow(catalogFields, progress, sectionsCompleted, nextItem) {
  const { id, name, code, credits } = catalogFields;
  return {
    id,
    name,
    code,
    credits,
    progress,
    sectionsCompleted,
    nextItem,
  };
}

// —— Year 1 (14 completed) ——
const Y1_TITLES = [
  ["Introduction to Programming", "CS101"],
  ["Discrete Structures", "MA110"],
  ["Calculus I", "MA120"],
  ["Physics I", "PH101"],
  ["Academic Writing", "EN101"],
  ["Introduction to Engineering", "EG100"],
  ["Chemistry I", "CH101"],
  ["Digital Systems", "EE110"],
  ["Ethics in Technology", "HU140"],
  ["University Success", "UN101"],
  ["Data & Society", "CS120"],
  ["Physics Laboratory", "PH102"],
  ["Programming Workshop", "CS105"],
  ["First-Year Seminar", "SEM100"],
];

export const YEAR_1_ENROLLED = Y1_TITLES.map(([title, code], i) =>
  enrolledRow(
    catalogRow("y1", i + 1, title, code),
    100,
    4,
    "Course complete",
  ),
);

// —— Year 2: 4 enrolled (demo progress) + 10 in pool ——
const Y2_TITLES = [
  ["Data Structures", "CS201"],
  ["Algorithms", "CS202"],
  ["Discrete Mathematics", "MA301"],
  ["Computer Architecture", "EE205"],
  ["Systems Programming", "CS210"],
  ["Probability & Statistics", "MA250"],
  ["Software Design", "CS230"],
  ["Computer Networks I", "CS240"],
  ["Database Foundations", "CS250"],
  ["Web Development", "CS260"],
  ["Operating Systems", "CS270"],
  ["Linear Algebra Applications", "MA310"],
  ["Human–Computer Interaction", "CS280"],
  ["Technical Communication", "EN210"],
];

const y2Catalog = Y2_TITLES.map(([title, code], i) =>
  catalogRow("y2", i + 1, title, code),
);

export const YEAR_2_ENROLLED = [
  enrolledRow(y2Catalog[0], 75, 3, "Graph Algorithms"),
  enrolledRow(y2Catalog[1], 40, 1, "Dynamic Programming"),
  enrolledRow(y2Catalog[2], 15, 0, "Set Theory Quiz"),
  enrolledRow(y2Catalog[3], 90, 3, "Final Review"),
];

/** Remaining 10 courses student can still enroll in */
export const YEAR_2_AVAILABLE = y2Catalog.slice(4);

// —— Year 3 (locked preview + unlock pool): 14 courses ——
const Y3_TITLES = [
  ["Software Engineering", "SE401"],
  ["Cloud Architecture", "CL402"],
  ["AI & ML Systems", "AI403"],
  ["Technology Ethics", "ETH404"],
  ["Distributed Systems", "CS410"],
  ["Secure Coding", "SEC420"],
  ["DevOps & CI/CD", "CS430"],
  ["Mobile Applications", "CS440"],
  ["Big Data Analytics", "CS450"],
  ["Computer Vision Basics", "CS460"],
  ["NLP Fundamentals", "CS470"],
  ["Product Management for Engineers", "MG410"],
  ["Research Methods", "RS400"],
  ["Team Project Lab", "LAB401"],
];

export const YEAR_3_PLANNED = Y3_TITLES.map(([title, code], i) =>
  catalogRow("y3", i + 1, title, code),
);

export const YEAR_3_AVAILABLE = YEAR_3_PLANNED.map((c) => ({ ...c }));

// —— Year 4: 14 courses ——
const Y4_TITLES = [
  ["Capstone Project I", "CAP501"],
  ["Industry Internship", "INT502"],
  ["Senior Seminar", "SEM503"],
  ["Capstone Project II", "CAP502"],
  ["Entrepreneurship in Tech", "ENT510"],
  ["Advanced Topics Seminar", "ADV520"],
  ["Professional Practice", "PR530"],
  ["Graduate School Prep", "GR540"],
  ["Portfolio Studio", "PF550"],
  ["Leadership & Teams", "LD560"],
  ["Industry Case Studies", "CS570"],
  ["Thesis Proposal", "TH580"],
  ["Thesis Defense Prep", "TH590"],
  ["Career Launch", "CR600"],
];

export const YEAR_4_PLANNED = Y4_TITLES.map(([title, code], i) =>
  catalogRow("y4", i + 1, title, code),
);

export const YEAR_4_AVAILABLE = YEAR_4_PLANNED.map((c) => ({ ...c }));
