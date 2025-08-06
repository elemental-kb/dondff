jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('../../firebase-config', () => ({
  auth: { currentUser: { uid: 'admin1' } },
  db: {},
}));

jest.mock('react-firebase-hooks/firestore', () => ({
  useCollectionData: jest.fn(),
}));

const { render, screen, waitFor } = require('@testing-library/react');
const userEvent = require('@testing-library/user-event').default;
const { MemoryRouter } = require('react-router-dom');
const { setDoc, doc } = require('firebase/firestore');
const { useCollectionData } = require('react-firebase-hooks/firestore');
const Entries = require('../entries').default;

test('calculateScores sums player scores and persists finalScore', async () => {
  const dummyEntries = [
    {
      id: 'entry1',
      name: 'Entry One',
      lineUp: {
        RB: { playerId: 'rb1', pprScore: 0, name: 'RB1' },
        WR: { playerId: 'wr1', pprScore: 0, name: 'WR1' },
      },
    },
    {
      id: 'entry2',
      name: 'Entry Two',
      lineUp: {
        RB: { playerId: 'rb1', pprScore: 0, name: 'RB1' },
        WR: { playerId: 'wr1', pprScore: 0, name: 'WR1' },
      },
    },
  ];
  const members = [{ id: 'admin1', role: 'admin', uid: 'admin1' }];

  useCollectionData
    .mockReturnValueOnce([dummyEntries])
    .mockReturnValueOnce([members]);

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({
      json: async () => [{ player_id: 'rb1', stats: { pts_ppr: 10 } }],
    })
    .mockResolvedValueOnce({
      json: async () => [{ player_id: 'wr1', stats: { pts_ppr: 20 } }],
    });

  doc.mockImplementation(
    (db, l, leagueId, s, season, w, week, e, entryId) => entryId
  );
  setDoc.mockResolvedValue();

  render(
    <MemoryRouter>
      <Entries leagueId="league1" season="2023" week="1" actualWeek={2} />
    </MemoryRouter>
  );

  await userEvent.click(screen.getByText('Calculate Scores'));

  await waitFor(() => expect(setDoc).toHaveBeenCalledTimes(dummyEntries.length));

  dummyEntries.forEach((entry, index) => {
    expect(entry.finalScore).toBe(30);
    expect(setDoc.mock.calls[index][1]).toEqual({
      name: entry.name,
      lineUp: entry.lineUp,
      finalScore: entry.finalScore,
    });
  });
});
