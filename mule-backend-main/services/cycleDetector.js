module.exports = function detectCycles(graph) {
  const { adj, edgeTx } = graph;

  const MAX_DEPTH = 5;
  const MIN_DEPTH = 3;
  const MAX_DEGREE = 40;

  const uniqueCycles = new Set();
  const results = [];

  // 🔥 financial validation (KEY FIX)
  function isFinancialCycle(cycle) {
    let minTime = Infinity;
    let maxTime = -Infinity;
    let minAmount = Infinity;
    let maxAmount = -Infinity;

    for (let i = 0; i < cycle.length; i++) {
      const s = cycle[i];
      const r = cycle[(i + 1) % cycle.length];

      const tx = edgeTx.get(`${s}->${r}`);
      if (!tx) return false;

      if (tx.timestampMs < minTime) minTime = tx.timestampMs;
      if (tx.timestampMs > maxTime) maxTime = tx.timestampMs;
      if (tx.amountNum < minAmount) minAmount = tx.amountNum;
      if (tx.amountNum > maxAmount) maxAmount = tx.amountNum;
    }

    const hours = (maxTime - minTime) / (1000 * 3600);
    if (hours > 72) return false;

    if (minAmount <= 0) return false;
    if (maxAmount / minAmount > 3) return false;

    return true;
  }

  function degree(node) {
    return adj.get(node)?.size || 0;
  }

  function dfs(start, current, path, visited, depth) {
    if (depth > MAX_DEPTH) return;
    if (!adj.has(current)) return;

    for (const neighbor of adj.get(current)) {
      if (degree(neighbor) > MAX_DEGREE) continue;
      if (neighbor !== start && neighbor < start) continue;

      if (neighbor === start && path.length >= MIN_DEPTH) {
        if (isFinancialCycle(path)) {
          const key = path.join("->");
          if (!uniqueCycles.has(key)) {
            uniqueCycles.add(key);
            results.push([...path]);
          }
        }
        continue;
      }

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        path.push(neighbor);
        dfs(start, neighbor, path, visited, depth + 1);
        path.pop();
        visited.delete(neighbor);
      }
    }
  }

  for (const node of adj.keys()) {
    if (degree(node) > MAX_DEGREE) continue;
    dfs(node, node, [node], new Set([node]), 1);
  }

  return results;
};
