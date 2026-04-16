import type { Question, QuizStatus } from "@/lib/types";

export interface SeedQuiz {
  title: string;
  description: string;
  category?: string;
  status: QuizStatus;
  questions: Question[];
}

// ─── Quiz 1: NOGICD Act 2010 ──────────────────────────────────────────────────

const nogicdQuestions: Question[] = [
  {
    id: "q1",
    text: "What is the primary objective of the NOGICD Act, 2010?",
    type: "mcq",
    options: [
      "To increase foreign investment in Nigeria",
      "To regulate international oil pricing",
      "To promote Nigerian participation and value retention in the oil and gas industry",
      "To privatize oil assets",
    ],
    correctAnswer:
      "To promote Nigerian participation and value retention in the oil and gas industry",
  },
  {
    id: "q2",
    text: "Which body is responsible for implementing and monitoring compliance with the NOGICD Act?",
    type: "mcq",
    options: [
      "Nigerian National Petroleum Company Limited (NNPC Ltd)",
      "Federal Ministry of Finance",
      "Nigerian Content Development and Monitoring Board (NCDMB)",
      "Central Bank of Nigeria",
    ],
    correctAnswer:
      "Nigerian Content Development and Monitoring Board (NCDMB)",
  },
  {
    id: "q3",
    text: 'What does "Nigerian Content" primarily refer to under the Act?',
    type: "mcq",
    options: [
      "Only employment of Nigerians",
      "Use of Nigerian crude oil",
      "Importation of goods through Nigerian ports",
      "Utilization of Nigerian human, material, and economic resources",
    ],
    correctAnswer:
      "Utilization of Nigerian human, material, and economic resources",
  },
  {
    id: "q4",
    text: "Which of the following is a key requirement before project approval under the NOGICD Act?",
    type: "mcq",
    options: [
      "Environmental Impact Assessment only",
      "Tax clearance certificate",
      "Submission of a Nigerian Content Plan",
      "Approval from international regulators",
    ],
    correctAnswer: "Submission of a Nigerian Content Plan",
  },
  {
    id: "q5",
    text: "What is the purpose of the Nigerian Content Equipment Certificate (NCEC)?",
    type: "mcq",
    options: [
      "To certify oil reserves",
      "To approve expatriate quotas",
      "To verify ownership and Nigerian content status of equipment",
      "To regulate offshore drilling",
    ],
    correctAnswer:
      "To verify ownership and Nigerian content status of equipment",
  },
  {
    id: "q6",
    text: "Under the NOGICD Act, what is the main goal of the Expatriate Quota policy?",
    type: "mcq",
    options: [
      "To increase foreign workforce participation",
      "To eliminate Nigerian workers",
      "To ensure knowledge transfer and succession to Nigerians",
      "To reduce salaries",
    ],
    correctAnswer: "To ensure knowledge transfer and succession to Nigerians",
  },
  {
    id: "q7",
    text: "Which fund was established under the Act to support Nigerian companies?",
    type: "mcq",
    options: [
      "Sovereign Wealth Fund",
      "Petroleum Equalization Fund",
      "Nigerian Content Development Fund (NCDF)",
      "Excess Crude Account",
    ],
    correctAnswer: "Nigerian Content Development Fund (NCDF)",
  },
  {
    id: "q8",
    text: "What percentage of contract value is typically contributed to the Nigerian Content Development Fund (NCDF)?",
    type: "mcq",
    options: ["0.5%", "2%", "1%", "5%"],
    correctAnswer: "1%",
  },
  {
    id: "q9",
    text: "What is the role of Human Capacity Development and Training (HCDT) under NCDMB guidelines?",
    type: "mcq",
    options: [
      "To train only expatriates",
      "To fund international travel",
      "To develop skills and competencies of Nigerian workforce",
      "To outsource jobs",
    ],
    correctAnswer: "To develop skills and competencies of Nigerian workforce",
  },
  {
    id: "q10",
    text: "What is a key enforcement mechanism used by NCDMB to ensure compliance?",
    type: "mcq",
    options: [
      "Tax audits",
      "Import restrictions",
      "Project approvals, compliance monitoring, and audits",
      "Bank guarantees",
    ],
    correctAnswer: "Project approvals, compliance monitoring, and audits",
  },
];

// ─── Quiz 2: NCEC MOC ─────────────────────────────────────────────────────────

const ncecMocQuestions: Question[] = [
  {
    id: "q1",
    text: "What areas do the NCEC categories typically cover?",
    type: "mcq",
    options: [
      "Only financial performance of contractors",
      "OEMs, Equipment Ownership, Leasing, Services & Support, and other value-chain segments",
      "Environmental compliance only",
      "Government policy documentation",
    ],
    correctAnswer:
      "OEMs, Equipment Ownership, Leasing, Services & Support, and other value-chain segments",
  },
  {
    id: "q2",
    text: "How do the NCEC categories function within the Nigerian Content framework?",
    type: "mcq",
    options: [
      "They operate independently without interaction",
      "They are only applicable to foreign companies",
      "They work together to ensure all contributors—from equipment supply to operations and maintenance—are evaluated for Nigerian Content",
      "They are only used during project close-out",
    ],
    correctAnswer:
      "They work together to ensure all contributors—from equipment supply to operations and maintenance—are evaluated for Nigerian Content",
  },
  {
    id: "q3",
    text: "How are NCEC categories applied in a typical project?",
    type: "mcq",
    options: [
      "Only one category is used per project",
      "Categories are randomly assigned",
      "A single project may involve multiple NCEC categories depending on company roles",
      "Categories are only used for offshore projects",
    ],
    correctAnswer:
      "A single project may involve multiple NCEC categories depending on company roles",
  },
  {
    id: "q4",
    text: "What is the relationship between the Nigerian Content Equipment Certificate (NCEC) and the Nigerian Content Marine Vessel Certificate (NCMVC), and when do they apply?",
    type: "mcq",
    options: [
      "NCEC and NCMVC serve the same purpose and are applied only after project completion",
      "NCEC applies to marine vessels only, while NCMVC applies to equipment during project planning",
      "NCEC certifies equipment Nigerian Content before or at deployment, while NCMVC verifies compliance of marine vessels during project execution; both complement each other in ensuring overall compliance",
      "NCMVC replaces NCEC during offshore operations",
    ],
    correctAnswer:
      "NCEC certifies equipment Nigerian Content before or at deployment, while NCMVC verifies compliance of marine vessels during project execution; both complement each other in ensuring overall compliance",
  },
  {
    id: "q5",
    text: "What role does an MOA play in relation to NCEC?",
    type: "mcq",
    options: [
      "It eliminates the need for NCEC",
      "It serves as a tax document",
      "It supports NCEC claims by defining roles and Nigerian Content contributions between collaborating companies",
      "It replaces NCMVC",
    ],
    correctAnswer:
      "It supports NCEC claims by defining roles and Nigerian Content contributions between collaborating companies",
  },
];

// ─── Seed export ──────────────────────────────────────────────────────────────

export const SEED_QUIZZES: SeedQuiz[] = [
  {
    title: "NOGICD Act 2010 & NCDMB Operations",
    description:
      "Test your knowledge of the Nigerian Oil and Gas Industry Content Development Act and NCDMB compliance operations.",
    category: "Oil & Gas Regulation",
    status: "published",
    questions: nogicdQuestions,
  },
  {
    title: "NCEC MOC Assessment",
    description:
      "Mock assessment covering NCEC categories, the NCMVC relationship, and MOA roles within the Nigerian Content framework.",
    category: "NCEC & Certification",
    status: "draft",
    questions: ncecMocQuestions,
  },
];
