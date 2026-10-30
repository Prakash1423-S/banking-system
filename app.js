/**
 * FinCore Bank — NextGen Core Banking & AI Assistant Application Controller
 * Handles dual-mode operations (REST API backend or Standalone client-side engine),
 * state synchronization, ledger transactions, loan calculations, and conversational Q&A.
 */

// ==================== DEFAULT APPLICATION STATE ====================
const INITIAL_STATE = {
  customer: {
    id: "FC-8921",
    name: "Alex Morgan",
    tier: "Premier Member",
    creditScore: 785
  },
  card: {
    number: "4532 8901 2345 4921",
    masked: "•••• •••• •••• 4921",
    cvv: "382",
    expiry: "09/29",
    isLocked: false,
    dailyLimit: 2500,
    onlinePurchases: true
  },
  accounts: [
    {
      id: "savings",
      name: "High-Yield Savings Account",
      type: "Savings",
      accountNumber: "•••• 4921",
      fullAccountNumber: "9820492188",
      routingNumber: "021000021",
      balance: 14850.75,
      interestRate: "4.25% APY",
      status: "Active",
      features: "Compounded daily, FDIC insured up to $250k"
    },
    {
      id: "checking",
      name: "Premier Checking Account",
      type: "Checking",
      accountNumber: "•••• 8104",
      fullAccountNumber: "9820810412",
      routingNumber: "021000021",
      balance: 3240.20,
      interestRate: "0.15% APY",
      status: "Active",
      features: "Unlimited debit transactions, $0 monthly fee"
    },
    {
      id: "fixed_deposit",
      name: "Term Certificate Deposit (FD)",
      type: "Fixed Deposit",
      accountNumber: "•••• 1902",
      fullAccountNumber: "9820190277",
      routingNumber: "021000021",
      balance: 10000.00,
      interestRate: "7.10% Fixed APY",
      status: "Active",
      features: "Locked tenure until Sep 2027"
    }
  ],
  transactions: [
    {
      id: "TXN-89421",
      timestamp: "2026-10-29 09:30 AM",
      description: "Payroll Direct Deposit — TechCorp Systems",
      type: "Credit",
      account: "Checking (•••• 8104)",
      amount: 3200.00,
      status: "Completed"
    },
    {
      id: "TXN-89310",
      timestamp: "2026-10-28 02:15 PM",
      description: "Atmospheric Coffee & Bakery",
      type: "Debit",
      account: "Checking (•••• 8104)",
      amount: -14.50,
      status: "Completed"
    },
    {
      id: "TXN-89205",
      timestamp: "2026-10-27 11:00 AM",
      description: "Auto Transfer to High-Yield Savings",
      type: "Transfer",
      account: "Savings (•••• 4921)",
      amount: 1000.00,
      status: "Completed"
    },
    {
      id: "TXN-89190",
      timestamp: "2026-10-26 04:45 PM",
      description: "City Electric & Gas Utility Bill",
      type: "Debit",
      account: "Checking (•••• 8104)",
      amount: -145.20,
      status: "Completed"
    },
    {
      id: "TXN-89042",
      timestamp: "2026-10-25 08:00 AM",
      description: "Monthly Interest Payout (4.25% APY)",
      type: "Credit",
      account: "Savings (•••• 4921)",
      amount: 52.45,
      status: "Completed"
    }
  ]
};

// ==================== APP CONTROLLER CLASS ====================
class BankingApp {
  constructor() {
    this.apiBaseUrl = "http://localhost:8080/api";
    this.isBackendConnected = false;
    this.state = this.loadPersistedState();
    this.cardRevealed = false;
    this.init();
  }

  loadPersistedState() {
    try {
      const saved = localStorage.getItem("fincore_bank_state");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Storage fallback to defaults", e);
    }
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  saveState() {
    try {
      localStorage.setItem("fincore_bank_state", JSON.stringify(this.state));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }

  async init() {
    this.bindEvents();
    this.setupNavigation();
    this.setupLoansCalculator();
    this.setupCardControls();
    this.setupAssistant();
    this.renderAll();
    await this.checkBackendStatus();
    // Poll backend status periodically
    setInterval(() => this.checkBackendStatus(), 10000);
  }

  // ==================== BACKEND HEALTH & REST SYNC ====================
  async checkBackendStatus() {
    const pill = document.getElementById("backendStatusPill");
    const dot = pill.querySelector(".status-dot");
    const text = document.getElementById("backendStatusText");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.apiBaseUrl}/status`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.isBackendConnected = true;
        dot.className = "status-dot connected";
        text.textContent = "Backend API: Connected (Port 8080)";
        pill.title = "Connected to local FinCore REST Server";
        await this.syncWithBackend();
        return;
      }
    } catch (e) {
      // Backend not running; fallback to standalone browser engine
    }

    this.isBackendConnected = false;
    dot.className = "status-dot standalone";
    text.textContent = "Standalone Browser Engine Active";
    pill.title = "Operating via client-side banking simulation engine (run server.ps1 / server.py for full REST API)";
  }

  async syncWithBackend() {
    try {
      const accRes = await fetch(`${this.apiBaseUrl}/accounts`);
      if (accRes.ok) {
        const data = await accRes.json();
        if (data && data.accounts) {
          this.state.accounts = data.accounts;
        }
      }
      const txRes = await fetch(`${this.apiBaseUrl}/transactions`);
      if (txRes.ok) {
        const data = await txRes.json();
        if (data && data.transactions) {
          this.state.transactions = data.transactions;
        }
      }
      this.renderAll();
    } catch (err) {
      console.warn("Backend sync failed:", err);
    }
  }

  // ==================== RENDERING METHODS ====================
  renderAll() {
    this.renderMetrics();
    this.renderDebitCard();
    this.renderTransactions();
    this.renderAccountsTab();
    this.updateTransferSourceBalances();
  }

  renderMetrics() {
    let total = 0;
    this.state.accounts.forEach(a => total += a.balance);

    document.getElementById("totalBalanceDisplay").textContent = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    let inflow = 0;
    let outflow = 0;
    this.state.transactions.forEach(t => {
      if (t.amount > 0) inflow += t.amount;
      else outflow += Math.abs(t.amount);
    });

    document.getElementById("monthlyInflowDisplay").textContent = `+$${inflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById("monthlyOutflowDisplay").textContent = `-$${outflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  renderDebitCard() {
    const numDisplay = document.getElementById("cardNumberDisplay");
    const cvvDisplay = document.getElementById("cardCvvDisplay");
    const cardEl = document.getElementById("debitCardElement");
    const statusBadge = document.getElementById("cardStatusBadge");
    const lockText = document.getElementById("lockText");
    const lockIcon = document.getElementById("lockIcon");

    if (this.cardRevealed) {
      numDisplay.textContent = this.state.card.number;
      cvvDisplay.textContent = this.state.card.cvv;
    } else {
      numDisplay.textContent = this.state.card.masked;
      cvvDisplay.textContent = "•••";
    }

    if (this.state.card.isLocked) {
      cardEl.classList.add("locked-card");
      statusBadge.textContent = "Locked";
      statusBadge.className = "card-status-badge locked";
      lockText.textContent = "Unlock Card";
      lockIcon.textContent = "🔓";
    } else {
      cardEl.classList.remove("locked-card");
      statusBadge.textContent = "Active";
      statusBadge.className = "card-status-badge";
      lockText.textContent = "Lock Card";
      lockIcon.textContent = "🔒";
    }
  }

  renderTransactions() {
    const tbody = document.getElementById("transactionTableBody");
    tbody.innerHTML = "";

    this.state.transactions.forEach(t => {
      const tr = document.createElement("tr");
      const isPositive = t.amount > 0;
      const amtClass = isPositive ? "green-text" : "red-text";
      const amtSign = isPositive ? "+" : "";

      tr.innerHTML = `
        <td><span class="tx-ref">${t.id}</span></td>
        <td>${t.timestamp}</td>
        <td><strong>${this.escapeHtml(t.description)}</strong></td>
        <td><span class="badge-tag">${t.type}</span></td>
        <td>${t.account}</td>
        <td class="${amtClass}"><strong>${amtSign}$${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
        <td><span class="tx-status-badge status-completed">${t.status}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderAccountsTab() {
    const grid = document.getElementById("accountsListGrid");
    grid.innerHTML = "";

    this.state.accounts.forEach(acc => {
      const card = document.createElement("div");
      card.className = "account-card-item";
      card.innerHTML = `
        <div class="account-header-row">
          <div>
            <div class="account-type-title">${acc.name}</div>
            <div class="account-num">${acc.accountNumber} • Routing: ${acc.routingNumber}</div>
          </div>
          <span class="badge-tag green">${acc.status}</span>
        </div>
        <div class="account-balance-large">$${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div class="account-meta-specs">
          <div><strong>Interest Yield:</strong> ${acc.interestRate}</div>
          <div><strong>Features:</strong> ${acc.features}</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="secondary-btn" style="flex: 1;" onclick="app.quickDepositFor('${acc.id}')">Deposit</button>
          <button class="primary-btn" style="flex: 1;" onclick="app.quickTransferFrom('${acc.id}')">Transfer</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  updateTransferSourceBalances() {
    const sel = document.getElementById("transferSource");
    const savings = this.state.accounts.find(a => a.id === "savings");
    const checking = this.state.accounts.find(a => a.id === "checking");

    if (sel && savings && checking) {
      sel.options[0].textContent = `Savings Account (•••• 4921) - Balance: $${savings.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      sel.options[1].textContent = `Checking Account (•••• 8104) - Balance: $${checking.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
  }

  // ==================== NAVIGATION TABS ====================
  setupNavigation() {
    const tabs = document.querySelectorAll(".nav-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        document.querySelectorAll(".tab-pane").forEach(pane => {
          pane.classList.remove("active");
        });
        const targetPane = document.getElementById(`tab-${target}`);
        if (targetPane) targetPane.classList.add("active");
      });
    });
  }

  // ==================== CARD CONTROLS ====================
  setupCardControls() {
    const toggleNumBtn = document.getElementById("toggleCardNumberBtn");
    toggleNumBtn.addEventListener("click", () => {
      this.cardRevealed = !this.cardRevealed;
      this.renderDebitCard();
      toggleNumBtn.textContent = this.cardRevealed ? "🙈" : "👁";
      this.showToast(this.cardRevealed ? "Card details revealed" : "Card details masked");
    });

    const toggleLockBtn = document.getElementById("toggleLockCardBtn");
    toggleLockBtn.addEventListener("click", () => {
      this.state.card.isLocked = !this.state.card.isLocked;
      this.saveState();
      this.renderDebitCard();
      this.showToast(
        this.state.card.isLocked ? "🔒 Debit card has been locked" : "🔓 Debit card is now active",
        this.state.card.isLocked ? "error" : "success"
      );
    });

    document.getElementById("viewCardLimitsBtn").addEventListener("click", () => {
      this.showToast(`Daily ATM/POS limit: $${this.state.card.dailyLimit} | Contactless Active`);
    });

    document.getElementById("quickDepositBtn").addEventListener("click", () => {
      this.openModal("depositModal");
    });
  }

  // ==================== LOANS & EMI CALCULATOR ====================
  setupLoansCalculator() {
    const amtSlider = document.getElementById("loanAmount");
    const amtDisplay = document.getElementById("loanAmountVal");
    const tenureSlider = document.getElementById("loanTenure");
    const tenureDisplay = document.getElementById("loanTenureVal");
    const rateInput = document.getElementById("loanRate");
    const rateDisplay = document.getElementById("loanRateVal");
    const typeSelect = document.getElementById("loanType");

    const calculate = () => {
      const P = parseFloat(amtSlider.value);
      const years = parseInt(tenureSlider.value, 10);
      const annualRate = parseFloat(rateInput.value);
      const N = years * 12; // Months
      const r = (annualRate / 100) / 12; // Monthly rate

      amtDisplay.textContent = `$${P.toLocaleString()}`;
      tenureDisplay.textContent = `${years} ${years === 1 ? 'Year' : 'Years'} (${N} Mo)`;
      rateDisplay.textContent = `${annualRate.toFixed(2)}%`;

      let emi = 0;
      if (r === 0) {
        emi = P / N;
      } else {
        emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
      }

      const totalRepay = emi * N;
      const totalInterest = totalRepay - P;

      document.getElementById("calculatedEmiDisplay").textContent = `$${emi.toFixed(2)}`;
      document.getElementById("summaryPrincipal").textContent = `$${P.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      document.getElementById("summaryInterest").textContent = `$${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      document.getElementById("summaryTotal").textContent = `$${totalRepay.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    };

    amtSlider.addEventListener("input", calculate);
    tenureSlider.addEventListener("input", calculate);
    rateInput.addEventListener("input", calculate);

    typeSelect.addEventListener("change", (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const rate = selectedOption.dataset.rate;
      if (rate) {
        rateInput.value = rate;
        calculate();
      }
    });

    document.getElementById("applyLoanBtn").addEventListener("click", () => {
      const P = amtSlider.value;
      const emi = document.getElementById("calculatedEmiDisplay").textContent;
      this.showToast(`Pre-approval application submitted for $${P} (EMI: ${emi})! Officer will contact in 24 hrs.`, "success");
    });

    calculate();
  }

  // ==================== TRANSACTION ACTIONS (DEPOSIT / WITHDRAW / TRANSFER) ====================
  bindEvents() {
    // Deposit Modal
    document.getElementById("openDepositModalBtn").addEventListener("click", () => this.openModal("depositModal"));
    document.getElementById("depositForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const accId = document.getElementById("depositAccount").value;
      const amt = parseFloat(document.getElementById("depositAmount").value);
      const src = document.getElementById("depositSource").value;
      this.executeDeposit(accId, amt, src);
      this.closeModal("depositModal");
      e.target.reset();
    });

    // Withdraw Modal
    document.getElementById("openWithdrawModalBtn").addEventListener("click", () => this.openModal("withdrawModal"));
    document.getElementById("withdrawForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const accId = document.getElementById("withdrawAccount").value;
      const amt = parseFloat(document.getElementById("withdrawAmount").value);
      const chn = document.getElementById("withdrawChannel").value;
      this.executeWithdraw(accId, amt, chn);
      this.closeModal("withdrawModal");
      e.target.reset();
    });

    // Transfer Tab / Modal
    document.getElementById("openTransferModalBtn").addEventListener("click", () => {
      const tabBtn = document.querySelector('.nav-tab[data-tab="transfer"]');
      if (tabBtn) tabBtn.click();
    });

    document.getElementById("transferForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const fromAcc = document.getElementById("transferSource").value;
      const toAcc = document.getElementById("transferDestination").value;
      const amt = parseFloat(document.getElementById("transferAmount").value);
      const method = document.getElementById("transferMethod").value;
      const note = document.getElementById("transferNote").value || "Electronic Transfer";

      this.executeTransfer(fromAcc, toAcc, amt, method, note);
      e.target.reset();
    });

    // Modal Close Buttons
    document.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.dataset.close;
        this.closeModal(modalId);
      });
    });

    document.getElementById("openNewAccountBtn").addEventListener("click", () => {
      this.showToast("Account Opening Wizard: All online documentation pre-verified via KYC.", "success");
    });

    // Mini Ask Form on Dashboard
    const miniForm = document.getElementById("miniAskForm");
    const miniInput = document.getElementById("miniQueryInput");
    const miniAnswerContainer = document.getElementById("miniAnswerContainer");
    const miniAnswerTitle = document.getElementById("miniAnswerTitle");
    const miniAnswerBody = document.getElementById("miniAnswerBody");

    miniForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const query = miniInput.value.trim();
      if (!query) return;

      const res = await this.queryAssistant(query);
      miniAnswerTitle.textContent = res.title;
      miniAnswerBody.textContent = res.answer;
      miniAnswerContainer.style.display = "block";
    });

    document.getElementById("closeMiniAnswerBtn").addEventListener("click", () => {
      miniAnswerContainer.style.display = "none";
    });

    // Quick Chips on Dashboard
    document.querySelectorAll(".chip-btn").forEach(chip => {
      chip.addEventListener("click", async () => {
        const query = chip.dataset.query;
        miniInput.value = query;
        const res = await this.queryAssistant(query);
        miniAnswerTitle.textContent = res.title;
        miniAnswerBody.textContent = res.answer;
        miniAnswerContainer.style.display = "block";
      });
    });
  }

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("active");
  }

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("active");
  }

  async executeDeposit(accId, amount, method) {
    if (amount <= 0 || isNaN(amount)) {
      this.showToast("Please enter a valid positive deposit amount", "error");
      return;
    }

    const account = this.state.accounts.find(a => a.id === accId);
    if (!account) return;

    if (this.isBackendConnected) {
      try {
        const res = await fetch(`${this.apiBaseUrl}/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "deposit",
            accountId: accId,
            amount: amount,
            description: `${method} Deposit`
          })
        });
        if (res.ok) {
          await this.syncWithBackend();
          this.showToast(`Successfully deposited $${amount.toFixed(2)} to ${account.name}`, "success");
          return;
        }
      } catch (err) {
        console.warn("Backend deposit failed, using client engine", err);
      }
    }

    // Client-side atomic update
    account.balance += amount;
    const refId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    this.state.transactions.unshift({
      id: refId,
      timestamp: formattedDate,
      description: `${method} Deposit`,
      type: "Credit",
      account: `${account.type} (${account.accountNumber})`,
      amount: amount,
      status: "Completed"
    });

    this.saveState();
    this.renderAll();
    this.showToast(`Deposited $${amount.toFixed(2)} into ${account.name}`, "success");
  }

  async executeWithdraw(accId, amount, channel) {
    if (this.state.card.isLocked && channel.includes("ATM")) {
      this.showToast("⚠️ Withdrawal declined: Your debit card is locked! Unlock it first.", "error");
      return;
    }

    if (amount <= 0 || isNaN(amount)) {
      this.showToast("Please enter a valid positive withdrawal amount", "error");
      return;
    }

    const account = this.state.accounts.find(a => a.id === accId);
    if (!account) return;

    if (account.balance < amount) {
      this.showToast(`Insufficient funds! Available balance: $${account.balance.toFixed(2)}`, "error");
      return;
    }

    if (this.isBackendConnected) {
      try {
        const res = await fetch(`${this.apiBaseUrl}/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "withdraw",
            accountId: accId,
            amount: amount,
            description: channel
          })
        });
        if (res.ok) {
          await this.syncWithBackend();
          this.showToast(`Successfully withdrew $${amount.toFixed(2)} via ${channel}`, "success");
          return;
        }
      } catch (err) {
        console.warn("Backend withdraw failed, using client engine", err);
      }
    }

    account.balance -= amount;
    const refId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    this.state.transactions.unshift({
      id: refId,
      timestamp: formattedDate,
      description: channel,
      type: "Debit",
      account: `${account.type} (${account.accountNumber})`,
      amount: -amount,
      status: "Completed"
    });

    this.saveState();
    this.renderAll();
    this.showToast(`Withdrew $${amount.toFixed(2)} from ${account.name}`, "success");
  }

  async executeTransfer(fromId, toId, amount, method, memo) {
    if (amount <= 0 || isNaN(amount)) {
      this.showToast("Please enter a valid transfer amount", "error");
      return;
    }

    const srcAccount = this.state.accounts.find(a => a.id === fromId);
    if (!srcAccount) return;

    if (srcAccount.balance < amount) {
      this.showToast(`Transfer Failed: Insufficient balance ($${srcAccount.balance.toFixed(2)})`, "error");
      return;
    }

    if (fromId === toId) {
      this.showToast("Source and destination accounts cannot be identical", "error");
      return;
    }

    if (this.isBackendConnected) {
      try {
        const res = await fetch(`${this.apiBaseUrl}/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "transfer",
            sourceAccountId: fromId,
            destinationAccountId: toId,
            amount: amount,
            description: memo,
            method: method
          })
        });
        if (res.ok) {
          await this.syncWithBackend();
          this.showToast(`Transfer of $${amount.toFixed(2)} completed successfully!`, "success");
          return;
        }
      } catch (err) {
        console.warn("Backend transfer failed, using client engine", err);
      }
    }

    // Client-side atomic transaction
    srcAccount.balance -= amount;
    const destAccount = this.state.accounts.find(a => a.id === toId);
    if (destAccount) {
      destAccount.balance += amount;
    }

    const refId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    this.state.transactions.unshift({
      id: refId,
      timestamp: formattedDate,
      description: `${memo} (${method.toUpperCase()})`,
      type: "Transfer",
      account: `${srcAccount.type} (${srcAccount.accountNumber})`,
      amount: -amount,
      status: "Completed"
    });

    this.saveState();
    this.renderAll();
    this.showToast(`Transferred $${amount.toFixed(2)} successfully! (Ref: ${refId})`, "success");
  }

  quickDepositFor(accId) {
    const sel = document.getElementById("depositAccount");
    if (sel) sel.value = accId;
    this.openModal("depositModal");
  }

  quickTransferFrom(accId) {
    const tabBtn = document.querySelector('.nav-tab[data-tab="transfer"]');
    if (tabBtn) tabBtn.click();
    const sel = document.getElementById("transferSource");
    if (sel) sel.value = accId;
  }

  // ==================== BANKING AI ASSISTANT (TAB 5) ====================
  setupAssistant() {
    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");
    const clearBtn = document.getElementById("clearChatBtn");
    const voiceBtn = document.getElementById("voiceInputBtn");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      await this.handleUserChatMessage(text);
    });

    clearBtn.addEventListener("click", () => {
      const container = document.getElementById("chatMessages");
      container.innerHTML = `
        <div class="chat-bubble bot-bubble">
          <div class="bubble-avatar">🤖</div>
          <div class="bubble-content">
            <div class="bubble-title">Chat History Cleared</div>
            <div class="bubble-text">How may I assist you with your banking needs today?</div>
          </div>
        </div>
      `;
    });

    // Voice recognition (Speech API if supported)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      voiceBtn.addEventListener("click", () => {
        if (voiceBtn.classList.contains("listening")) {
          recognition.stop();
        } else {
          recognition.start();
          voiceBtn.classList.add("listening");
        }
      });

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        voiceBtn.classList.remove("listening");
        form.dispatchEvent(new Event("submit"));
      };

      recognition.onerror = () => voiceBtn.classList.remove("listening");
      recognition.onend = () => voiceBtn.classList.remove("listening");
    } else {
      voiceBtn.style.display = "none";
    }

    // Sidebar query pills
    document.querySelectorAll(".faq-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const q = pill.dataset.query;
        this.handleUserChatMessage(q);
      });
    });
  }

  async handleUserChatMessage(userText) {
    const container = document.getElementById("chatMessages");
    const typingIndicator = document.getElementById("typingIndicator");

    // Add user bubble
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user-bubble";
    userBubble.innerHTML = `
      <div class="bubble-avatar">AM</div>
      <div class="bubble-content">
        <div class="bubble-text">${this.escapeHtml(userText)}</div>
        <div class="bubble-timestamp">Just now</div>
      </div>
    `;
    container.appendChild(userBubble);
    container.scrollTop = container.scrollHeight;

    // Show typing
    typingIndicator.style.display = "flex";
    container.scrollTop = container.scrollHeight;

    // Delay slightly for natural feel (300ms)
    await new Promise(r => setTimeout(r, 350));

    // Get response (from backend if available, or knowledge base)
    const reply = await this.queryAssistant(userText);

    typingIndicator.style.display = "none";

    // Add bot bubble
    const botBubble = document.createElement("div");
    botBubble.className = "chat-bubble bot-bubble";

    let followUpHtml = "";
    if (reply.suggestions && reply.suggestions.length > 0) {
      followUpHtml = `
        <div class="chat-followups">
          ${reply.suggestions.map(s => `<button class="followup-btn" onclick="app.handleUserChatMessage('${this.escapeHtml(s)}')">${this.escapeHtml(s)}</button>`).join('')}
        </div>
      `;
    }

    botBubble.innerHTML = `
      <div class="bubble-avatar">🤖</div>
      <div class="bubble-content">
        <div class="bubble-title">${this.escapeHtml(reply.title || "FinCore Assistant")}</div>
        <div class="bubble-text">${this.formatMarkdown(reply.answer)}</div>
        ${followUpHtml}
        <div class="bubble-timestamp">Just now</div>
      </div>
    `;
    container.appendChild(botBubble);
    container.scrollTop = container.scrollHeight;
  }

  async queryAssistant(query) {
    const savings = this.state.accounts.find(a => a.id === "savings");
    const checking = this.state.accounts.find(a => a.id === "checking");

    const context = {
      holderName: this.state.customer.name,
      savingsBalance: savings ? savings.balance : 14850.75,
      checkingBalance: checking ? checking.balance : 3240.20,
      creditScore: this.state.customer.creditScore
    };

    if (this.isBackendConnected) {
      try {
        const res = await fetch(`${this.apiBaseUrl}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query, context: context })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn("Backend Q&A fetch failed, fallback to local knowledge base");
      }
    }

    // Call local knowledge base matcher
    if (typeof queryBankAssistant === "function") {
      return queryBankAssistant(query, context);
    }

    return {
      title: "FinCore Assistant",
      answer: "I am ready to assist with your banking and financial operations.",
      suggestions: ["What is my balance?", "Loan interest rates"]
    };
  }

  // ==================== UTILITY HELPERS ====================
  formatMarkdown(text) {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/• /g, '•&nbsp;');
  }

  escapeHtml(string) {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return String(string).replace(/[&<>"']/g, s => entityMap[s]);
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Instantiate global app
let app;
window.addEventListener("DOMContentLoaded", () => {
  app = new BankingApp();
});
