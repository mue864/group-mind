export interface MCQQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

export const SUBJECT_MCQS: Record<string, MCQQuestion[]> = {
  // Sciences & Technology
  computer_science: [
    {
      text: "Which data structure provides O(1) average-time lookup?",
      options: ["Array", "Linked List", "Hash Table", "Binary Search Tree"],
      correctIndex: 2,
    },
    {
      text: "Which sorting algorithm is O(n log n) in average and worst case?",
      options: ["Quick Sort", "Merge Sort", "Insertion Sort", "Bubble Sort"],
      correctIndex: 1,
    },
    {
      text: "Threads in the same process typically:",
      options: [
        "Have separate address spaces",
        "Share a process's address space",
        "Can't run in parallel",
        "Can't be preempted",
      ],
      correctIndex: 1,
    },
    {
      text: "Database normalization primarily reduces:",
      options: ["Index size", "Redundancy", "CPU usage", "Network latency"],
      correctIndex: 1,
    },
    {
      text: "Time complexity of binary search on a sorted array:",
      options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
      correctIndex: 1,
    },
  ],
  software_engineering: [
    {
      text: "Which is NOT part of SOLID?",
      options: [
        "Single Responsibility",
        "Open/Closed",
        "Dependency Inversion",
        "Distributed Responsibility",
      ],
      correctIndex: 3,
    },
    {
      text: "CI/CD primarily aims to:",
      options: [
        "Increase manual testing",
        "Automate build, test, deploy",
        "Remove code reviews",
        "Replace source control",
      ],
      correctIndex: 1,
    },
    {
      text: "What does code review NOT typically check?",
      options: [
        "Code style",
        "Security concerns",
        "Runtime memory layout at assembly level",
        "Maintainability",
      ],
      correctIndex: 2,
    },
    {
      text: "Which testing pyramid layer is the smallest in quantity?",
      options: [
        "Unit tests",
        "Integration tests",
        "End-to-end/UI tests",
        "Static analysis",
      ],
      correctIndex: 2,
    },
    {
      text: "Which process mitigates scope creep?",
      options: [
        "Ad-hoc requests",
        "Change control and prioritization",
        "Skipping backlog refinement",
        "Ignoring stakeholders",
      ],
      correctIndex: 1,
    },
  ],

  // Data Science (mapped to data_science if added later)
  data_science: [
    {
      text: "Regularization (L2) primarily helps with:",
      options: [
        "Underfitting",
        "Overfitting",
        "Data leakage",
        "Class imbalance",
      ],
      correctIndex: 1,
    },
    {
      text: "Which metric is best for imbalanced binary classes?",
      options: ["Accuracy", "Precision-Recall AUC", "R²", "MSE"],
      correctIndex: 1,
    },
    {
      text: "Cross-validation helps to:",
      options: [
        "Reduce dataset size",
        "Better estimate generalization error",
        "Increase training speed",
        "Eliminate bias entirely",
      ],
      correctIndex: 1,
    },
    {
      text: "One-hot encoding is used for:",
      options: [
        "Scaling numerical features",
        "Encoding categorical variables",
        "Handling missing values",
        "Dimensionality reduction",
      ],
      correctIndex: 1,
    },
    {
      text: "In linear regression, multicollinearity often causes:",
      options: [
        "Lower variance",
        "Unstable coefficient estimates",
        "More observations",
        "Lower dimensionality",
      ],
      correctIndex: 1,
    },
  ],

  // Mathematics
  mathematics: [
    {
      text: "Derivative of f(x)=x³ is:",
      options: ["3x²", "x²", "3x", "x³"],
      correctIndex: 0,
    },
    {
      text: "Sum of arithmetic series (first term a, difference d, n terms):",
      options: ["n(a+d)", "n(a+(n−1)d)/2", "a·d·n", "a+(n−1)d"],
      correctIndex: 1,
    },
    {
      text: "Matrix A(m×n) × B(n×p) yields:",
      options: ["m×p", "n×m", "p×n", "m×n"],
      correctIndex: 0,
    },
    {
      text: "If P(A)=0.4, P(B)=0.5, independent, P(A∩B)=",
      options: ["0.45", "0.2", "0.1", "0.9"],
      correctIndex: 1,
    },
    {
      text: "lim(x→0) sin(x)/x =",
      options: ["0", "1", "∞", "Does not exist"],
      correctIndex: 1,
    },
  ],

  // Accounting & Economics
  accounting: [
    {
      text: "The accounting equation is:",
      options: [
        "Assets = Liabilities + Equity",
        "Assets = Revenue − Expenses",
        "Cash = Revenue − Liabilities",
        "Assets = Equity − Liabilities",
      ],
      correctIndex: 0,
    },
    {
      text: "Depreciation allocates:",
      options: [
        "Asset cost over its useful life",
        "Revenue over periods",
        "Liabilities to assets",
        "Cash to investments",
      ],
      correctIndex: 0,
    },
    {
      text: "Accrual accounting recognizes revenue:",
      options: [
        "When cash is received",
        "When earned, regardless of cash",
        "At year-end only",
        "When invoices are printed",
      ],
      correctIndex: 1,
    },
    {
      text: "Which is a contra-asset?",
      options: [
        "Accounts Receivable",
        "Accumulated Depreciation",
        "Inventory",
        "Prepaid Expense",
      ],
      correctIndex: 1,
    },
    {
      text: "Matching principle pairs:",
      options: [
        "Assets with liabilities",
        "Expenses with revenues they help generate",
        "Cash with cash equivalents",
        "Equity with dividends",
      ],
      correctIndex: 1,
    },
  ],
  economics: [
    {
      text: "Law of demand states that, ceteris paribus:",
      options: [
        "Price↑ → Quantity Demanded↑",
        "Price↑ → Quantity Demanded↓",
        "Income↑ → Demand↓",
        "Substitute price↑ → Demand↓",
      ],
      correctIndex: 1,
    },
    {
      text: "Price elasticity of demand measures:",
      options: [
        "Sensitivity of demand to income",
        "Sensitivity of demand to price",
        "Sensitivity of supply to price",
        "Market equilibrium",
      ],
      correctIndex: 1,
    },
    {
      text: "In perfect competition, firms are:",
      options: ["Price makers", "Price takers", "Monopolists", "Oligopolists"],
      correctIndex: 1,
    },
    {
      text: "GDP excludes:",
      options: [
        "Government spending",
        "Net exports",
        "Intermediate goods",
        "Consumption",
      ],
      correctIndex: 2,
    },
    {
      text: "A positive externality implies:",
      options: [
        "Social benefit < private benefit",
        "Social benefit > private benefit",
        "Social cost > private cost",
        "No market failure",
      ],
      correctIndex: 1,
    },
  ],
  business_studies: [
    {
      text: "Primary purpose of a business plan is to:",
      options: [
        "Describe daily operations",
        "Secure funding and guide strategy",
        "File taxes",
        "Document employment contracts",
      ],
      correctIndex: 1,
    },
    {
      text: "Which is a key function of management?",
      options: ["Forecasting", "Controlling", "Auditing", "Bookkeeping"],
      correctIndex: 1,
    },
    {
      text: "Marketing mix traditionally includes:",
      options: [
        "Product, Price, Place, Promotion",
        "Plan, People, Profit, Process",
        "Portfolio, Position, Policy, Payroll",
        "Pitch, Prospect, Pipeline, Post-sale",
      ],
      correctIndex: 0,
    },
    {
      text: "Break-even point occurs when:",
      options: [
        "Fixed costs = Variable costs",
        "Total revenue = Total costs",
        "Price = Average cost",
        "Marginal revenue = 0",
      ],
      correctIndex: 1,
    },
    {
      text: "A SWOT analysis assesses:",
      options: [
        "Sales, Wages, Output, Tax",
        "Strengths, Weaknesses, Opportunities, Threats",
        "Strategy, Workflows, Operations, Tactics",
        "Stock, Warehousing, Outsourcing, Turnover",
      ],
      correctIndex: 1,
    },
  ],
};

export const MCQ_PASS_THRESHOLD = 3; // out of 5
