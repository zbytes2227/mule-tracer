module.exports = function scoreAccounts(
  graph,
  cycles,
  smurf,
  shell,
  transactions,
  startTime
) {
  const { adj, reverseAdj, txByAccount } = graph;

  const accountScores = new Map();
  const accountPatterns = new Map();
  const accountRing = new Map();
  const rings = [];

  let ringCounter = 1;

  // ================= DEGREE =================
  function degree(node) {
    return (adj.get(node)?.size || 0) +
           (reverseAdj.get(node)?.size || 0);
  }

  // ================= HELPER =================
  function addScore(acc, value, pattern) {
    accountScores.set(acc, (accountScores.get(acc) || 0) + value);

    if (!accountPatterns.has(acc)) {
      accountPatterns.set(acc, new Set());
    }
    accountPatterns.get(acc).add(pattern);
  }

  // ================= CYCLE SCORING =================
// ================= CYCLE SCORING =================
for (const cycle of cycles) {
  const ringId = `RING_${String(ringCounter++).padStart(3, "0")}`;

  let baseScore = 40;

  if (cycle.length === 3) baseScore = 45;
  else if (cycle.length === 4) baseScore = 42;
  else if (cycle.length === 5) baseScore = 40;

  for (const acc of cycle) {
    addScore(acc, baseScore, `cycle_length_${cycle.length}`);
    accountRing.set(acc, ringId);
  }

  rings.push({
    ring_id: ringId,
    member_accounts: cycle,
    pattern_type: "cycle",
    risk_score: 90,
  });
}

  // ================= SMURF SCORING =================
  for (const [acc, info] of smurf.entries()) {
    addScore(acc, 25, info.type);
  }

  // ================= SHELL SCORING =================
  for (const acc of shell) {
    addScore(acc, 30, "shell_chain");
  }

  // ================= FALSE POSITIVE GUARD =================
  const suspicious_accounts = [];

  for (const [acc, rawScore] of accountScores.entries()) {
    const deg = degree(acc);

    // 🔥 merchant/payroll protection
    if (deg > 50 && !accountRing.has(acc)) continue;

    // 🔥 normalize
    const score = Math.min(100, rawScore);

    // 🔥 threshold (VERY IMPORTANT)
    if (score < 35) continue;

    suspicious_accounts.push({
      account_id: acc,
      suspicion_score: score,
      detected_patterns: Array.from(accountPatterns.get(acc) || []),
      ring_id: accountRing.get(acc) || "NA",
    });
  }

  // ================= SORT =================
  suspicious_accounts.sort(
    (a, b) => b.suspicion_score - a.suspicion_score
  );

  const processing_time_seconds =
    (Date.now() - startTime) / 1000;

return {
  suspicious_accounts,
  fraud_rings: rings,

  // ⭐ ADD THIS BLOCK
  graph_edges: transactions.map((t) => ({
    source: t.sender_id,
    target: t.receiver_id,
    amount: parseFloat(t.amount),
    timestamp: t.timestamp,
  })),

  summary: {
    total_accounts_analyzed: graph.txByAccount.size,
    suspicious_accounts_flagged: suspicious_accounts.length,
    fraud_rings_detected: rings.length,
    processing_time_seconds,
  },
};
};
