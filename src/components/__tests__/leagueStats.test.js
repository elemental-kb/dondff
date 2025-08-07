const { calculateStats } = require('../statsUtil');

describe('calculateStats', () => {
  test('computes wins and highest lineup', () => {
    const week1 = [
      { id: 'user1', finalScore: 10, lineUp: {} },
      { id: 'user2', finalScore: 20, lineUp: {} },
    ];
    const week2 = [
      { id: 'user1', finalScore: 30, lineUp: {} },
      { id: 'user2', finalScore: 25, lineUp: {} },
    ];
    const { winsMap, highEntry } = calculateStats([week1, week2]);
    expect(winsMap).toEqual({ user2: 1, user1: 1 });
    expect(highEntry.id).toBe('user1');
    expect(highEntry.finalScore).toBe(30);
  });
});
