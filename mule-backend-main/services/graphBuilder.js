module.exports = function buildGraph(transactions) {
  const adj = new Map();
  const reverseAdj = new Map();
  const txByAccount = new Map();
  const incomingByAccount = new Map();
  const outgoingByAccount = new Map();
  const edgeTx = new Map();

  for (const tx of transactions) {
    const s = tx.sender_id;
    const r = tx.receiver_id;
    const timestampMs = new Date(tx.timestamp).getTime();
    const amountNum = parseFloat(tx.amount);
    const normalizedTx = {
      ...tx,
      timestampMs,
      amountNum,
    };

    if (!adj.has(s)) adj.set(s, new Set());
    adj.get(s).add(r);

    if (!reverseAdj.has(r)) reverseAdj.set(r, new Set());
    reverseAdj.get(r).add(s);

    if (!txByAccount.has(s)) txByAccount.set(s, []);
    if (!txByAccount.has(r)) txByAccount.set(r, []);
    if (!incomingByAccount.has(r)) incomingByAccount.set(r, []);
    if (!outgoingByAccount.has(s)) outgoingByAccount.set(s, []);

    txByAccount.get(s).push(normalizedTx);
    txByAccount.get(r).push(normalizedTx);
    incomingByAccount.get(r).push(normalizedTx);
    outgoingByAccount.get(s).push(normalizedTx);

    const edgeKey = `${s}->${r}`;
    if (!edgeTx.has(edgeKey)) {
      edgeTx.set(edgeKey, normalizedTx);
    }
  }

  for (const txs of incomingByAccount.values()) {
    txs.sort((a, b) => a.timestampMs - b.timestampMs);
  }

  for (const txs of outgoingByAccount.values()) {
    txs.sort((a, b) => a.timestampMs - b.timestampMs);
  }

  return {
    adj,
    reverseAdj,
    txByAccount,
    incomingByAccount,
    outgoingByAccount,
    edgeTx,
  };
};
