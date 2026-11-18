import {
  CourseworkTask,
  RoutineTemplate,
  RoutineTemplateId,
  TimeBlock,
} from '../types/schedule';

export const ROUTINE_TEMPLATES: Record<RoutineTemplateId, RoutineTemplate> = {
  'default-balanced': {
    id: 'default-balanced',
    name: 'Balanced Study Day',
    subtitle: '7.5h sleep · 6.5h academics · 2h hobbies',
    description:
      'A sustainable university weekday balancing morning lectures, deep study intervals, problem sets, guitar/running, and a full 7.5-hour sleep window.',
    recommendedSleepHours: 7.5,
    recommendedHobbyHours: 1.5,
    blocks: [
      {
        title: 'Overnight Sleep (Morning Window)',
        category: 'sleep',
        startMinutes: 0, // 00:00
        endMinutes: 420, // 07:00 (7h)
        location: 'Dorm / Bedroom',
        notes: 'Core REM & deep sleep cycle',
      },
      {
        title: 'Morning Espresso, Oats & Sunlight Walk',
        category: 'meal',
        startMinutes: 435, // 07:15
        endMinutes: 480, // 08:00
        location: 'Campus Courtyard',
        notes: 'No phone during first 30 minutes',
      },
      {
        title: 'CS 301: Algorithms & Data Structures Lecture',
        category: 'lecture',
        startMinutes: 510, // 08:30
        endMinutes: 600, // 10:00
        courseTag: 'CS 301',
        location: 'Turing Hall 104',
        notes: 'Dynamic programming & graph traversal proofs',
      },
      {
        title: 'Deep Study: Graph Theory Proof Review',
        category: 'study',
        startMinutes: 615, // 10:15
        endMinutes: 720, // 12:00
        courseTag: 'CS 301',
        location: 'Science Library 3F Quiet Zone',
        notes: 'Summarize lecture notes & annotate Cormen Ch. 22',
      },
      {
        title: 'Lunch at Student Union & Outdoor Decompression',
        category: 'meal',
        startMinutes: 720, // 12:00
        endMinutes: 780, // 13:00
        location: 'Commons Dining',
      },
      {
        title: 'MATH 240: Linear Algebra Seminar',
        category: 'lecture',
        startMinutes: 780, // 13:00
        endMinutes: 870, // 14:30
        courseTag: 'MATH 240',
        location: 'Euler Building 202',
        notes: 'Eigenvalues, SVD, and orthogonal projections',
      },
      {
        title: 'Problem Set 4: Eigenvalue Decomposition Exercises',
        category: 'exercise',
        startMinutes: 900, // 15:00
        endMinutes: 1020, // 17:00
        courseTag: 'MATH 240',
        location: 'Engineering Commons',
        notes: 'Complete problems 1–6 before Friday seminar',
        linkedTaskId: 'task-1',
      },
      {
        title: '5K Trail Run & Acoustic Guitar Session',
        category: 'hobby',
        startMinutes: 1110, // 18:30
        endMinutes: 1185, // 19:45
        location: 'Arboretum Trail / Studio',
        notes: 'Cardio reset + fingerstyle practice',
      },
      {
        title: 'Home-Cooked Dinner & Kitchen Catch-up',
        category: 'meal',
        startMinutes: 1185, // 19:45
        endMinutes: 1230, // 20:30
        location: 'Apartment Kitchen',
      },
      {
        title: 'COG 110: Cognitive Psychology Reading & Flashcards',
        category: 'study',
        startMinutes: 1230, // 20:30
        endMinutes: 1290, // 21:30
        courseTag: 'COG 110',
        location: 'Desk',
        notes: 'Working memory consolidation models',
      },
      {
        title: 'Sketching & Fiction Reading (Screen-Free Wind Down)',
        category: 'hobby',
        startMinutes: 1290, // 21:30
        endMinutes: 1365, // 22:45
        location: 'Reading Chair',
        notes: 'Analog sketchbook + sci-fi novel',
      },
      {
        title: 'Night Wind-Down & Early Sleep Window',
        category: 'sleep',
        startMinutes: 1380, // 23:00
        endMinutes: 1440, // 24:00 (1h -> total 8h sleep)
        location: 'Dorm / Bedroom',
        notes: 'Lights out at 23:00 for 8h total sleep cycle',
      },
    ],
  },

  'lecture-heavy': {
    id: 'lecture-heavy',
    name: 'Lecture-Heavy Day',
    subtitle: '4 core classes · short review sprints · protected rest',
    description:
      'Designed for back-to-back seminar and lab days. Prioritizes energy recovery between classes, compact assignment triage, and an evening hobby buffer.',
    recommendedSleepHours: 7.5,
    recommendedHobbyHours: 1.5,
    blocks: [
      {
        title: 'Overnight Sleep (Morning Window)',
        category: 'sleep',
        startMinutes: 0, // 00:00
        endMinutes: 405, // 06:45
        location: 'Bedroom',
      },
      {
        title: 'Breakfast & Campus Commute',
        category: 'meal',
        startMinutes: 420, // 07:00
        endMinutes: 465, // 07:45
        location: 'Home / Bike Path',
      },
      {
        title: 'CS 301: Algorithms Lecture',
        category: 'lecture',
        startMinutes: 480, // 08:00
        endMinutes: 570, // 09:30
        courseTag: 'CS 301',
        location: 'Turing Hall 104',
      },
      {
        title: 'PHYS 212: Electromagnetism Lecture',
        category: 'lecture',
        startMinutes: 585, // 09:45
        endMinutes: 675, // 11:15
        courseTag: 'PHYS 212',
        location: 'Maxwell Auditorium',
      },
      {
        title: 'Quick Note Consolidation & Flashcard Triage',
        category: 'study',
        startMinutes: 690, // 11:30
        endMinutes: 735, // 12:15
        courseTag: 'PHYS 212',
        location: 'Physics Atrium',
      },
      {
        title: 'Lunch Break with Lab Partners',
        category: 'meal',
        startMinutes: 735, // 12:15
        endMinutes: 795, // 13:15
        location: 'Terrace Cafe',
      },
      {
        title: 'PHYS 212: Experimental Optics Lab',
        category: 'lecture',
        startMinutes: 810, // 13:30
        endMinutes: 960, // 16:00
        courseTag: 'PHYS 212',
        location: 'Science Annex B12',
      },
      {
        title: 'MATH 240: Recitation & Problem Workshop',
        category: 'lecture',
        startMinutes: 975, // 16:15
        endMinutes: 1035, // 17:15
        courseTag: 'MATH 240',
        location: 'Euler 108',
      },
      {
        title: 'Bouldering Gym Session & Mobility',
        category: 'hobby',
        startMinutes: 1050, // 17:30
        endMinutes: 1140, // 19:00
        location: 'Campus Climbing Wall',
        notes: 'Decompress after 6.5 hours of classes',
      },
      {
        title: 'Dinner & Rest',
        category: 'meal',
        startMinutes: 1140, // 19:00
        endMinutes: 1200, // 20:00
      },
      {
        title: 'Lab Report Data Plots & Pre-Lecture Exercises',
        category: 'exercise',
        startMinutes: 1200, // 20:00
        endMinutes: 1290, // 21:30
        courseTag: 'PHYS 212',
        location: 'Home Desk',
      },
      {
        title: 'Lo-Fi Vinyl Listening & Journaling',
        category: 'hobby',
        startMinutes: 1290, // 21:30
        endMinutes: 1335, // 22:15
      },
      {
        title: 'Night Sleep Window',
        category: 'sleep',
        startMinutes: 1350, // 22:30
        endMinutes: 1440, // 24:00 (total 8h 15m sleep)
      },
    ],
  },

  'exam-crunch': {
    id: 'exam-crunch',
    name: 'Exam Crunch Day',
    subtitle: 'High-focus 50/10 blocks · timed practice exams · anti-burnout breaks',
    description:
      'High-output exam preparation structured around 90-minute cognitive blocks and mandatory recovery walks so you retain material without sacrificing sleep.',
    recommendedSleepHours: 7.5,
    recommendedHobbyHours: 1.25,
    blocks: [
      {
        title: 'Overnight Sleep (Morning Window)',
        category: 'sleep',
        startMinutes: 0, // 00:00
        endMinutes: 390, // 06:30
        location: 'Bedroom',
      },
      {
        title: 'High-Protein Breakfast & Hydration',
        category: 'meal',
        startMinutes: 405, // 06:45
        endMinutes: 450, // 07:30
      },
      {
        title: 'Deep Study Block I: CS 301 Dynamic Programming Proofs',
        category: 'study',
        startMinutes: 465, // 07:45
        endMinutes: 600, // 10:00
        courseTag: 'CS 301',
        location: 'Library Carrel 14',
        notes: 'Closed-book active recall on Bellman-Ford & Floyd-Warshall',
      },
      {
        title: 'Timed Practice Midterm #1 (Under Exam Conditions)',
        category: 'exercise',
        startMinutes: 615, // 10:15
        endMinutes: 735, // 12:15
        courseTag: 'CS 301',
        location: 'Library Carrel 14',
        notes: 'Strict 120m timer, no reference sheets',
      },
      {
        title: 'Lunch + 25m Daylight Walk (Cognitive Reset)',
        category: 'meal',
        startMinutes: 735, // 12:15
        endMinutes: 810, // 13:30
      },
      {
        title: 'Deep Study Block II: MATH 240 Theorem Synthesis',
        category: 'study',
        startMinutes: 810, // 13:30
        endMinutes: 945, // 15:45
        courseTag: 'MATH 240',
        location: 'Math Reading Room',
      },
      {
        title: 'Past Exam Problem Set & Error Log Correction',
        category: 'exercise',
        startMinutes: 960, // 16:00
        endMinutes: 1080, // 18:00
        courseTag: 'MATH 240',
        location: 'Math Reading Room',
      },
      {
        title: 'Evening Swim & Sauna Decompression',
        category: 'hobby',
        startMinutes: 1095, // 18:15
        endMinutes: 1170, // 19:30
        location: 'Aquatic Center',
        notes: 'Release shoulder tension from desk work',
      },
      {
        title: 'Nourishing Dinner & Tea',
        category: 'meal',
        startMinutes: 1170, // 19:30
        endMinutes: 1230, // 20:30
      },
      {
        title: 'Light Spaced-Repetition Deck & Formula Sheet Check',
        category: 'study',
        startMinutes: 1230, // 20:30
        endMinutes: 1320, // 22:00
        courseTag: 'CS 301',
        notes: 'Low-stress review before sleep consolidation',
      },
      {
        title: 'Pre-Exam Sleep Window',
        category: 'sleep',
        startMinutes: 1350, // 22:30
        endMinutes: 1440, // 24:00 (total 8.0h sleep)
      },
    ],
  },

  'balanced-weekend': {
    id: 'balanced-weekend',
    name: 'Balanced Weekend',
    subtitle: '8.5h sleep · 3.5h passion projects · light weekly prep',
    description:
      'Restores creative energy on Saturday or Sunday with unhurried morning sleep, extended time for personal passions, and a focused afternoon block to stay ahead of next week.',
    recommendedSleepHours: 8.0,
    recommendedHobbyHours: 3.0,
    blocks: [
      {
        title: 'Overnight Sleep (Weekend Recovery)',
        category: 'sleep',
        startMinutes: 0, // 00:00
        endMinutes: 480, // 08:00
        location: 'Bedroom',
      },
      {
        title: 'Slow Pour-Over Coffee & Farmers Market Brunch',
        category: 'meal',
        startMinutes: 495, // 08:15
        endMinutes: 570, // 09:30
        location: 'Town Square Market',
      },
      {
        title: 'Personal Passion Project: Indie Game Shader Coding & Music',
        category: 'hobby',
        startMinutes: 585, // 09:45
        endMinutes: 735, // 12:15
        location: 'Home Studio',
        notes: 'Pure creative exploration with zero grades attached',
      },
      {
        title: 'Picnic Lunch & Park Hammock Break',
        category: 'meal',
        startMinutes: 750, // 12:30
        endMinutes: 825, // 13:45
      },
      {
        title: 'Next Week Preview & Reading Annotation',
        category: 'study',
        startMinutes: 840, // 14:00
        endMinutes: 945, // 15:45
        courseTag: 'COG 110',
        location: 'Botanical Cafe',
      },
      {
        title: 'Weekly Coding Assignment Setup & Unit Tests',
        category: 'exercise',
        startMinutes: 960, // 16:00
        endMinutes: 1050, // 17:30
        courseTag: 'CS 301',
        location: 'Botanical Cafe',
      },
      {
        title: 'Photography Golden Hour Walk & Analog Film Editing',
        category: 'hobby',
        startMinutes: 1080, // 18:00
        endMinutes: 1170, // 19:30
        location: 'Riverfront District',
      },
      {
        title: 'Shared Dinner & Board Games with Friends',
        category: 'meal',
        startMinutes: 1170, // 19:30
        endMinutes: 1290, // 21:30
        location: 'Common Room',
      },
      {
        title: 'Night Sleep Window',
        category: 'sleep',
        startMinutes: 1380, // 23:00
        endMinutes: 1440, // 24:00 (total 9.0h sleep)
      },
    ],
  },
};

export function createInitialBlocks(
  templateId: RoutineTemplateId = 'default-balanced'
): TimeBlock[] {
  const template =
    ROUTINE_TEMPLATES[templateId] ?? ROUTINE_TEMPLATES['default-balanced'];
  return template.blocks.map((b, idx) => ({
    ...b,
    id: `block-${templateId}-${idx + 1}`,
  }));
}

export const INITIAL_COURSEWORK_TASKS: CourseworkTask[] = [
  {
    id: 'task-1',
    title: 'Problem Set 4: Eigenvalue Decomposition Exercises',
    course: 'MATH 240',
    priority: 'high',
    estimatedMinutes: 120,
    dueLabel: 'Due Tomorrow · 17:00',
    completed: false,
    scheduledBlockId: 'block-default-balanced-7',
    category: 'exercise',
  },
  {
    id: 'task-2',
    title: 'Implement Dijkstra Priority Queue Lab in TypeScript',
    course: 'CS 301',
    priority: 'high',
    estimatedMinutes: 90,
    dueLabel: 'Due Thu · 23:59',
    completed: false,
    category: 'exercise',
  },
  {
    id: 'task-3',
    title: 'Synthesize Baddeley Working Memory Model Paper',
    course: 'COG 110',
    priority: 'medium',
    estimatedMinutes: 60,
    dueLabel: 'Due Fri · 14:00',
    completed: false,
    category: 'study',
  },
  {
    id: 'task-4',
    title: 'Pre-Lab Circuit Simulation & Error Propagation Worksheet',
    course: 'PHYS 212',
    priority: 'medium',
    estimatedMinutes: 45,
    dueLabel: 'Due Fri · 09:00',
    completed: false,
    category: 'exercise',
  },
  {
    id: 'task-5',
    title: 'Review Red-Black Tree Rotation Invariants',
    course: 'CS 301',
    priority: 'low',
    estimatedMinutes: 45,
    dueLabel: 'Next Mon',
    completed: true,
    category: 'study',
  },
];
