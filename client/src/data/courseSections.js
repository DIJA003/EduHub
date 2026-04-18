/**
 * Section-based outline per course. Used for learning flow + upload targeting.
 */
const DEFAULT_COUNT = 4;

function defaultSections(courseId, courseName = "Course") {
  return Array.from({ length: DEFAULT_COUNT }, (_, i) => ({
    id: `${courseId}-sec-${i + 1}`,
    title: `Section ${i + 1}`,
    summary: `Topic ${i + 1} for ${courseName}.`,
    body: `This is the content for section ${i + 1}. Read through the concepts, then use **Next** when you are ready to continue.`,
  }));
}

const OVERRIDES = {
  cs201: [
    {
      id: "cs201-s1",
      title: "Introduction & complexity",
      summary: "Big-O, recursion basics.",
      body: "Learn how to analyze algorithms and reason about time and space complexity.",
    },
    {
      id: "cs201-s2",
      title: "Lists & stacks",
      summary: "Arrays, linked lists, stacks.",
      body: "Implement and compare linear structures used across most CS problems.",
    },
    {
      id: "cs201-s3",
      title: "Trees & heaps",
      summary: "BST, heaps, priority queues.",
      body: "Traversals, balancing intuition, and heap operations.",
    },
    {
      id: "cs201-s4",
      title: "Graphs",
      summary: "BFS, DFS, shortest paths.",
      body: "Represent graphs and solve path-finding problems step by step.",
    },
  ],
  cs202: [
    {
      id: "cs202-s1",
      title: "Divide & conquer",
      summary: "Merge sort, quicksort ideas.",
      body: "Break problems into subproblems and combine results efficiently.",
    },
    {
      id: "cs202-s2",
      title: "Greedy & DP intro",
      summary: "Greedy choice, overlapping subproblems.",
      body: "Recognize when greedy works and when you need dynamic programming.",
    },
    {
      id: "cs202-s3",
      title: "Dynamic programming",
      summary: "Memoization vs tabulation.",
      body: "Build optimal solutions using recurrence relations.",
    },
    {
      id: "cs202-s4",
      title: "Graph algorithms",
      summary: "Shortest paths, MST.",
      body: "Apply classical graph algorithms to real problems.",
    },
  ],
};

export function getSectionsForCourse(courseId, courseName) {
  if (OVERRIDES[courseId]) return OVERRIDES[courseId];
  return defaultSections(courseId, courseName);
}

export function nextSectionLabel(sections, completedCount) {
  if (!sections?.length) return "Getting started";
  if (completedCount >= sections.length) return "Course complete";
  return sections[completedCount].title;
}
