/**
 * Bank Knowledge Base & Intelligent Q&A Matcher
 * Comprehensive financial terminology, banking services, compliance, and automated intent resolution.
 */

const BANK_KNOWLEDGE_BASE = [
  {
    category: "Account Types & Management",
    intents: ["savings_account", "checking_account", "current_account", "account_types"],
    keywords: ["savings", "checking", "current", "account type", "types of accounts", "difference between savings and checking", "open account"],
    title: "Savings vs Checking/Current Accounts",
    answer: "A **Savings Account** is designed to accumulate interest on your deposited funds with limited monthly withdrawals (ideal for personal savings and emergency funds). A **Checking (or Current) Account** is tailored for frequent daily transactions, debit card purchases, bill payments, and payroll with zero withdrawal limits and checkbook facilities. Interest rates on Savings typically range from 2.5% to 5.0% APY, while Checking accounts offer minimal to 0% interest.",
    followUp: ["What documents are required to open an account?", "What is the minimum balance requirement?", "How do I check my account balance?"]
  },
  {
    category: "Account Balances & Inquiry",
    intents: ["balance_inquiry", "check_balance", "my_balance"],
    keywords: ["balance", "how much money", "account balance", "current balance", "funds available", "check balance"],
    title: "Checking Account Balance",
    dynamicAction: "CHECK_BALANCE",
    answer: "Your current balances across active accounts are displayed on your live dashboard. You can also view available credit and ledger balances in real time under the **Accounts** tab.",
    followUp: ["Show my recent transactions", "Transfer money", "Download account statement"]
  },
  {
    category: "Transactions & Transfers",
    intents: ["money_transfer", "send_money", "wire_transfer", "neft_rtgs_imps", "ach"],
    keywords: ["transfer", "send money", "wire", "ach", "neft", "rtgs", "imps", "swift", "routing number", "ifsc", "how to transfer"],
    title: "Funds Transfer Options & Routing",
    answer: "We support multiple instant and scheduled transfer methods:\n- **Internal Transfer**: Instant transfer between accounts within FinCore Bank (Zero fee).\n- **ACH / Electronic Transfer**: Standard 1-2 business day settlement for domestic transfers.\n- **Wire / RTGS / IMPS**: Instant real-time gross settlement for high-priority or emergency transfers.\n- **International Wire (SWIFT)**: 2-4 business days requiring the recipient's SWIFT/BIC code and IBAN/Account number.",
    followUp: ["What are the daily transfer limits?", "What is a SWIFT code?", "How do I make a transfer right now?"]
  },
  {
    category: "Loans & Mortgages",
    intents: ["loans", "interest_rate", "home_loan", "personal_loan", "mortgage", "car_loan", "emi"],
    keywords: ["loan", "borrow", "mortgage", "personal loan", "home loan", "auto loan", "interest rate", "emi", "rates", "apr"],
    title: "Loans, Mortgages & Interest Rates",
    answer: "FinCore Bank offers competitive lending rates tailored to credit scores (700+):\n- **Personal Loans**: Fixed rates from 8.99% to 14.5% APR (12 - 60 month terms).\n- **Home Loans / Mortgages**: Fixed rates starting at 6.45% APR (15 - 30 year terms).\n- **Auto Loans**: Rates starting at 5.25% APR for new vehicles.\n- **EMI Calculation**: Monthly EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]. You can use our built-in Loan Calculator tab to compute exact repayments.",
    followUp: ["What is the minimum credit score for a loan?", "Calculate loan EMI", "Apply for a pre-approved loan"]
  },
  {
    category: "Fixed & Recurring Deposits",
    intents: ["fixed_deposit", "fd", "rd", "term_deposit", "certificate_of_deposit"],
    keywords: ["fixed deposit", "recurring deposit", "fd", "rd", "cd", "term deposit", "certificate of deposit"],
    title: "Fixed Deposits (FD) vs Recurring Deposits (RD)",
    answer: "A **Fixed Deposit (FD)** or Certificate of Deposit (CD) allows you to invest a lump sum for a fixed tenure (7 days to 10 years) at a guaranteed interest rate (currently up to 7.10% p.a.). A **Recurring Deposit (RD)** allows you to deposit a fixed installment every month, instilling a regular savings habit while earning the same fixed-deposit interest rates.",
    followUp: ["Can I break my FD before maturity?", "What is the tax on FD interest?", "How do I open an FD?"]
  },
  {
    category: "Security & Fraud Prevention",
    intents: ["card_lost", "fraud", "stolen_card", "security", "block_card", "phishing", "scam"],
    keywords: ["lost card", "stolen", "block card", "fraud", "unauthorized", "phishing", "scam", "compromised", "lock card", "hacked"],
    title: "Emergency Security & Card Blocking",
    answer: "🚨 **Immediate Action Required for Compromised Cards**:\n1. Use the **Lock Card** button on your dashboard to instantly freeze all transactions.\n2. Report unauthorized charges immediately through this portal or call our 24/7 Fraud Line at **1-800-FIN-CORE**.\n3. Remember: FinCore Bank will **NEVER** ask for your Password, PIN, or OTP over phone, email, or chat.",
    followUp: ["How to reset net banking password?", "What is 2FA two factor authentication?", "How to dispute an unauthorized charge?"]
  },
  {
    category: "Compliance & KYC",
    intents: ["kyc_documents", "aml", "compliance", "verification"],
    keywords: ["kyc", "documents", "identity", "passport", "proof of address", "pan card", "ssn", "verify account", "aml"],
    title: "KYC (Know Your Customer) Guidelines",
    answer: "Under global banking regulations (AML & FATCA), all account holders must complete KYC verification. Required documents include:\n1. **Proof of Identity (POI)**: Valid Passport, Driver's License, National ID, or PAN Card.\n2. **Proof of Address (POA)**: Utility bill (<3 months old), Bank statement, or Government registration.\n3. **Tax Identification**: SSN, TIN, or National Tax ID.\nDigital e-KYC can be verified in minutes via biometric or video verification.",
    followUp: ["Why is KYC mandatory?", "How often does KYC need updating?", "Is my personal data encrypted?"]
  },
  {
    category: "Banking Codes & Routing",
    intents: ["ifsc_swift_routing", "routing_number", "iban", "swift_code"],
    keywords: ["ifsc", "swift", "routing number", "iban", "bic", "bank code", "sort code"],
    title: "Banking Codes: Routing, SWIFT, IFSC & IBAN",
    answer: "- **Routing Number (ABA)**: A 9-digit code identifying financial institutions in the United States.\n- **IFSC Code**: An 11-character alphanumeric code used for electronic fund transfers (NEFT/RTGS/IMPS) in India.\n- **SWIFT / BIC**: An 8 or 11 character code identifying specific banks globally for international wire transfers.\n- **IBAN**: International Bank Account Number used across Europe and globally to standardize cross-border transfers.",
    followUp: ["Where can I find my routing number?", "What is FinCore Bank's SWIFT code?", "How do I receive international funds?"]
  },
  {
    category: "Credit Scores & History",
    intents: ["credit_score", "cibil", "fico", "credit_report"],
    keywords: ["credit score", "fico", "cibil", "credit rating", "improve credit", "bad credit"],
    title: "Understanding Credit Scores (FICO / CIBIL)",
    answer: "Credit scores range from **300 to 850**:\n- **800 - 850**: Exceptional (instant approvals, lowest interest rates)\n- **740 - 799**: Very Good\n- **670 - 739**: Good (standard approvals)\n- **580 - 669**: Fair\n- **Below 580**: Poor\nFactors influencing your score: Payment History (35%), Credit Utilization (30%), Length of History (15%), Credit Mix (10%), New Inquiries (10%).",
    followUp: ["How to improve my credit score?", "Does checking my score hurt it?", "Can I get a loan with 650 score?"]
  },
  {
    category: "Fees & Charges",
    intents: ["fees", "atm_charges", "maintenance_fee", "overdraft_fee"],
    keywords: ["fee", "charges", "cost", "maintenance fee", "atm fee", "overdraft fee", "penalty", "hidden charges"],
    title: "Banking Fees & Transparent Pricing",
    answer: "FinCore Bank maintains transparent, zero-surprise banking:\n- **Monthly Account Maintenance**: $0 (with active direct deposit or $500 min balance).\n- **In-Network ATM Withdrawals**: 100% Free at over 55,000 Allpoint ATMs.\n- **Out-of-Network ATM**: $2.50 per withdrawal.\n- **Overdraft Protection**: Optional grace buffer up to $100 with zero penalty.\n- **Domestic Wire Transfer**: $15 outgoing, $0 incoming.",
    followUp: ["How to waive monthly maintenance fee?", "Where are free ATMs located?", "How does overdraft protection work?"]
  },
  {
    category: "Digital Banking & Features",
    intents: ["mobile_banking", "net_banking", "upi", "features"],
    keywords: ["mobile banking", "net banking", "online banking", "features", "app", "upi", "qr code", "contactless"],
    title: "FinCore Digital Banking Suite",
    answer: "Our modern digital banking suite includes:\n- **Biometric Login**: FaceID and Fingerprint authentication.\n- **Virtual Cards**: Instant single-use virtual debit cards for secure online shopping.\n- **Instant P2P Payments**: Send money instantly with phone number or email.\n- **Budgeting & Analytics**: Automatic categorization of spending with monthly breakdown.\n- **AI Assistant**: 24/7 intelligent answering for all banking queries.",
    followUp: ["How do I generate a virtual card?", "How to set spending limits?", "Can I schedule recurring bill payments?"]
  }
];

/**
 * Intelligent NLP & Intent Matching Algorithm
 * Evaluates semantic tokens, keyword frequency, and conversational intent.
 */
function queryBankAssistant(userQuery, accountContext = {}) {
  const cleanQuery = userQuery.toLowerCase().trim();
  
  if (!cleanQuery) {
    return {
      success: false,
      title: "Need Assistance?",
      answer: "Please type a question regarding your account, balance, transfers, loans, interest rates, or banking policies.",
      suggestions: ["What is my balance?", "Current loan interest rates", "How to transfer money", "What is an IFSC code?"]
    };
  }

  // Check Greetings
  const greetings = ["hi", "hello", "hey", "good morning", "good evening", "namaste", "greetings"];
  if (greetings.includes(cleanQuery) || greetings.some(g => cleanQuery.startsWith(g + " "))) {
    const userName = accountContext.holderName || "Valued Customer";
    return {
      success: true,
      category: "Greeting",
      title: `Welcome to FinCore AI, ${userName}!`,
      answer: `Hello! I am your 24/7 FinCore Banking Assistant. I can help you check balances, transfer funds, explain loan interest rates, calculate EMIs, guide you through KYC, or answer any banking question. How may I assist you today?`,
      suggestions: [
        "What is my current balance?",
        "What are your loan interest rates?",
        "Difference between Savings and Checking?",
        "How do I block a lost card?"
      ]
    };
  }

  // Dynamic Action: Check Balance
  if (cleanQuery.includes("balance") || cleanQuery.includes("how much") || cleanQuery.includes("my funds") || cleanQuery.includes("account summary")) {
    const savings = accountContext.savingsBalance !== undefined ? accountContext.savingsBalance : 14850.75;
    const checking = accountContext.checkingBalance !== undefined ? accountContext.checkingBalance : 3240.20;
    const total = (savings + checking).toFixed(2);
    
    return {
      success: true,
      category: "Account Inquiry",
      title: "Real-time Account Balances",
      answer: `Here is your current financial summary:\n\n` +
              `💰 **Savings Account (•••• 4921)**: $${Number(savings).toLocaleString('en-US', {minimumFractionDigits: 2})}\n` +
              `💳 **Checking Account (•••• 8104)**: $${Number(checking).toLocaleString('en-US', {minimumFractionDigits: 2})}\n` +
              `📊 **Total Liquid Net Worth**: **$${Number(total).toLocaleString('en-US', {minimumFractionDigits: 2})}**\n\n` +
              `All funds are FDIC insured up to $250,000.`,
      suggestions: ["Transfer money between accounts", "View recent transaction history", "Deposit funds"]
    };
  }

  // Dynamic Action: Transfer Help / Command
  if (cleanQuery.includes("transfer") || cleanQuery.includes("send money") || cleanQuery.includes("pay")) {
    // Check if user specified an amount (e.g., "transfer 500 to alice")
    const match = cleanQuery.match(/transfer\s+\$?(\d+(\.\d{1,2})?)\s+(to\s+)?([a-zA-Z0-9_\s]+)?/i);
    if (match && match[1]) {
      const amount = match[1];
      const target = match[4] ? match[4].trim() : "Beneficiary";
      return {
        success: true,
        category: "Transfer Assist",
        title: "Initiate Funds Transfer",
        answer: `I detected a transfer request for **$${amount}** to **${target}**.\n\nYou can complete this safely using the **Quick Transfer** form on your dashboard. Simply click 'Transfer Money' in the main navigation or select the source account to confirm with two-factor authentication.`,
        suggestions: ["Confirm Transfer in UI", "What are the transfer fees?", "Transfer limits"]
      };
    }
  }

  // Score match against knowledge base
  let bestMatch = null;
  let highestScore = 0;

  for (const item of BANK_KNOWLEDGE_BASE) {
    let score = 0;
    
    // Check keyword matches
    for (const kw of item.keywords) {
      if (cleanQuery === kw) {
        score += 10;
      } else if (cleanQuery.includes(kw)) {
        score += 5 + (kw.length / 5);
      }
    }

    // Check intent matches
    for (const intent of item.intents) {
      const formattedIntent = intent.replace(/_/g, " ");
      if (cleanQuery.includes(formattedIntent)) {
        score += 8;
      }
    }

    // Check query tokens
    const queryTokens = cleanQuery.split(/\s+/);
    for (const token of queryTokens) {
      if (token.length > 3 && item.keywords.some(k => k.includes(token))) {
        score += 2;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore >= 4) {
    return {
      success: true,
      category: bestMatch.category,
      title: bestMatch.title,
      answer: bestMatch.answer,
      suggestions: bestMatch.followUp || ["Tell me more", "Back to dashboard", "Contact live agent"]
    };
  }

  // Fallback intelligent response for unrecognized queries
  return {
    success: true,
    category: "Banking Advisory",
    title: "FinCore Banking Intelligence",
    answer: `Regarding your query "${userQuery}": In general banking operations, this relates to customer account management, electronic clearance, or regulatory compliance.\n\n` +
            `Here are some topics I can answer immediately:\n` +
            `• **Account Inquiries**: Balances, statements, transaction limits\n` +
            `• **Transfers & Routing**: ACH, Wire, SWIFT, IFSC, routing numbers\n` +
            `• **Loans & Credit**: Personal loans, Mortgages, EMI calculation, Credit scores\n` +
            `• **Security & KYC**: Card blocking, OTP safety, fraud disputes, KYC documents\n\n` +
            `Would you like information on one of these specific areas?`,
    suggestions: [
      "What are the interest rates?",
      "How to calculate EMI for loans?",
      "What documents are needed for KYC?",
      "Check my current balance"
    ]
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BANK_KNOWLEDGE_BASE, queryBankAssistant };
}
