const fs = require("fs");

// ================= CONFIG =================
const TOTAL_ACCOUNTS = 600;
const TOTAL_TRANSACTIONS = 10000;

const CYCLE_RINGS = 4;
const SMURF_GROUPS = 4;
const SHELL_CHAINS = 4;

const OUTPUT_FILE = "transactions.csv";

// ================= UTIL =================
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAmount(min = 50, max = 5000) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

function randomTimestamp(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function formatTimestamp(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}

// ================= DATA =================
let transactions = [];
let txCounter = 1;

const startDate = new Date("2025-01-01");
const endDate = new Date("2025-03-01");

// Generate account IDs
const accounts = Array.from(
  { length: TOTAL_ACCOUNTS },
  (_, i) => `ACC_${String(i + 1).padStart(5, "0")}`
);

// ================= ADD TX =================
function addTx(sender, receiver, amount, timestamp) {
  transactions.push({
    transaction_id: `TX_${String(txCounter++).padStart(6, "0")}`,
    sender_id: sender,
    receiver_id: receiver,
    amount,
    timestamp: formatTimestamp(timestamp),
  });
}

// ==================================================
// 🟢 NORMAL TRAFFIC (80%)
// ==================================================
function generateNormalTraffic(count) {
  for (let i = 0; i < count; i++) {
    const sender = accounts[randomInt(0, accounts.length - 1)];
    let receiver = accounts[randomInt(0, accounts.length - 1)];

    if (sender === receiver) continue;

    addTx(
      sender,
      receiver,
      randomAmount(),
      randomTimestamp(startDate, endDate)
    );
  }
}

// ==================================================
// 🔴 CYCLE RINGS (length 3–5)
 function generateCycleRings() {
  for (let r = 0; r < CYCLE_RINGS; r++) {
    const length = randomInt(3, 5);
    const ringAccounts = [];

    for (let i = 0; i < length; i++) {
      ringAccounts.push(
        accounts[randomInt(0, accounts.length - 1)]
      );
    }

    const baseTime = randomTimestamp(startDate, endDate);

    for (let i = 0; i < length; i++) {
      const sender = ringAccounts[i];
      const receiver = ringAccounts[(i + 1) % length];

      addTx(
        sender,
        receiver,
        randomAmount(500, 2000),
        new Date(baseTime.getTime() + i * 3600 * 1000)
      );
    }
  }
}

// ==================================================
// 🟠 SMURFING (fan-in + fan-out within 72h)
// ==================================================
function generateSmurfing() {
  for (let g = 0; g < SMURF_GROUPS; g++) {
    const aggregator =
      accounts[randomInt(0, accounts.length - 1)];

    const baseTime = randomTimestamp(startDate, endDate);

    // Fan-in
    const senders = new Set();
    while (senders.size < randomInt(10, 15)) {
      senders.add(accounts[randomInt(0, accounts.length - 1)]);
    }

    for (const s of senders) {
      if (s === aggregator) continue;
      addTx(
        s,
        aggregator,
        randomAmount(100, 900),
        new Date(baseTime.getTime() + randomInt(0, 48) * 3600 * 1000)
      );
    }

    // Fan-out
    const receivers = new Set();
    while (receivers.size < randomInt(10, 15)) {
      receivers.add(accounts[randomInt(0, accounts.length - 1)]);
    }

    for (const rcv of receivers) {
      if (rcv === aggregator) continue;
      addTx(
        aggregator,
        rcv,
        randomAmount(100, 900),
        new Date(baseTime.getTime() + randomInt(24, 72) * 3600 * 1000)
      );
    }
  }
}

// ==================================================
// 🟡 SHELL CHAINS
// ==================================================
function generateShellChains() {
  for (let c = 0; c < SHELL_CHAINS; c++) {
    const chainLength = randomInt(3, 5);
    const chain = [];

    for (let i = 0; i < chainLength; i++) {
      chain.push(accounts[randomInt(0, accounts.length - 1)]);
    }

    const baseTime = randomTimestamp(startDate, endDate);

    for (let i = 0; i < chainLength - 1; i++) {
      addTx(
        chain[i],
        chain[i + 1],
        randomAmount(300, 1500),
        new Date(baseTime.getTime() + i * 7200 * 1000)
      );
    }
  }
}

// ==================================================
// 🚀 GENERATE ALL
// ==================================================
function generateDataset() {
  const normalCount = Math.floor(TOTAL_TRANSACTIONS * 0.8);

  generateNormalTraffic(normalCount);
  generateCycleRings();
  generateSmurfing();
  generateShellChains();

  // Shuffle transactions
  transactions = transactions.sort(() => Math.random() - 0.5);

  // Write CSV
  const header =
    "transaction_id,sender_id,receiver_id,amount,timestamp\n";

  const rows = transactions
    .map(
      (t) =>
        `${t.transaction_id},${t.sender_id},${t.receiver_id},${t.amount},${t.timestamp}`
    )
    .join("\n");

  fs.writeFileSync(OUTPUT_FILE, header + rows);

  console.log("✅ Dataset generated:", OUTPUT_FILE);
  console.log("Total transactions:", transactions.length);
}

generateDataset();

