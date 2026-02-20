module.exports = function detectSmurfing(graph) {
  const { txByAccount, incomingByAccount, outgoingByAccount } = graph;

  const suspicious = new Map();
  const WINDOW_HOURS = 72;
  const MIN_UNIQUE = 10;
  const WINDOW_MS = WINDOW_HOURS * 60 * 60 * 1000;

  // ================= HELPER =================
  function addFlag(acc, type, count) {
    suspicious.set(acc, {
      type,
      count,
    });
  }

  function hasAtLeastUniqueWithinWindow(txs, idField) {
    const counts = new Map();
    let left = 0;
    let unique = 0;

    for (let right = 0; right < txs.length; right++) {
      const id = txs[right][idField];
      const prev = counts.get(id) || 0;
      if (prev === 0) unique++;
      counts.set(id, prev + 1);

      while (txs[right].timestampMs - txs[left].timestampMs > WINDOW_MS) {
        const leftId = txs[left][idField];
        const nextCount = counts.get(leftId) - 1;
        if (nextCount === 0) {
          counts.delete(leftId);
          unique--;
        } else {
          counts.set(leftId, nextCount);
        }
        left++;
      }

      if (unique >= MIN_UNIQUE) {
        return unique;
      }
    }

    return 0;
  }

  // ================= PROCESS =================
  for (const [account, txs] of txByAccount.entries()) {
    if (txs.length < MIN_UNIQUE) continue;

    const incoming = incomingByAccount.get(account) || [];
    const outgoing = outgoingByAccount.get(account) || [];

    const fanInUnique = hasAtLeastUniqueWithinWindow(
      incoming,
      "sender_id"
    );
    if (fanInUnique >= MIN_UNIQUE) {
      addFlag(account, "fan_in", fanInUnique);
    }

    const fanOutUnique = hasAtLeastUniqueWithinWindow(
      outgoing,
      "receiver_id"
    );
    if (fanOutUnique >= MIN_UNIQUE) {
      addFlag(account, "fan_out", fanOutUnique);
    }
  }

  return suspicious;
};
