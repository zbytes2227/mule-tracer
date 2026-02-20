module.exports = function detectShell(graph) {
  const { adj, txByAccount } = graph;
  const shellAccounts = new Set();

  for (const [node, neighbors] of adj.entries()) {
    for (const next of neighbors) {
      const txCount = txByAccount.get(next)?.length || 0;

      if (txCount >= 2 && txCount <= 3) {
        shellAccounts.add(next);
      }
    }
  }

  return shellAccounts;
};
