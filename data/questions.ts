export type Question =
  | {
      id: string;
      text: string;
      type: "mcq";
      options: string[];
      correctAnswer: string;
    }
  | {
      id: string;
      text: string;
      type: "text";
    };

export const questions: Question[] = [
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
