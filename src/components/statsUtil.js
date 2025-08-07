export const calculateStats = (weeks) => {
  const winsMap = {};
  let highEntry = null;
  weeks.forEach((entries) => {
    if (!entries || entries.length === 0) return;
    const sorted = [...entries].sort(
      (a, b) => (b.finalScore || 0) - (a.finalScore || 0)
    );
    const winner = sorted[0];
    if (winner) {
      winsMap[winner.id] = (winsMap[winner.id] || 0) + 1;
    }
    sorted.forEach((entry) => {
      if (
        !highEntry ||
        (entry.finalScore || 0) > (highEntry.finalScore || 0)
      ) {
        highEntry = entry;
      }
    });
  });
  return { winsMap, highEntry };
};

export default calculateStats;
