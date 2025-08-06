jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('../../firebase-config', () => ({
  auth: { currentUser: { uid: 'uid-123' } },
  db: {},
}));

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ state: { leagueId: 'league1', season: '2023', week: '1' } }),
  useNavigate: () => jest.fn(),
}));

jest.mock('../util', () => ({
  getPlayers: jest.fn(),
  generateCases: jest.fn(),
}));

const { render, screen } = require('@testing-library/react');
const userEvent = require('@testing-library/user-event').default;
const React = require('react');
const { doc, setDoc } = require('firebase/firestore');

const useStateSpy = jest.spyOn(React, 'useState');
const Game = require('../game').default;

afterEach(() => {
  useStateSpy.mockReset();
});

afterAll(() => {
  useStateSpy.mockRestore();
});

test('submits lineup with current user uid', async () => {
  const dummyLineUp = {
    RB: { name: 'rb-player' },
    WR: { name: 'wr-player' },
  };

  doc.mockClear();
  setDoc.mockClear();
  doc.mockReturnValue('docRef');
  setDoc.mockResolvedValue();

  let call = 0;
  useStateSpy.mockImplementation((initial) => {
    call++;
    if (call === 11) return [true, jest.fn()]; // finished
    if (call === 12) return [true, jest.fn()]; // midway
    if (call === 16) return [dummyLineUp, jest.fn()]; // lineUp
    return [initial, jest.fn()];
  });

  render(<Game />);

  await userEvent.click(screen.getAllByText('Submit Lineup')[0]);

  expect(setDoc).toHaveBeenCalledWith('docRef', {
    name: 'uid-123',
    lineUp: dummyLineUp,
  });

});

test('submits lineup with provided uid', async () => {
  const dummyLineUp = {
    RB: { name: 'rb-player' },
    WR: { name: 'wr-player' },
  };

  doc.mockClear();
  setDoc.mockClear();
  doc.mockReturnValue('docRef');
  setDoc.mockResolvedValue();

  let call = 0;
  useStateSpy.mockImplementation((initial) => {
    call++;
    if (call === 11) return [true, jest.fn()]; // finished
    if (call === 12) return [true, jest.fn()]; // midway
    if (call === 16) return [dummyLineUp, jest.fn()]; // lineUp
    return [initial, jest.fn()];
  });

  render(<Game uid="custom-uid" />);

  await userEvent.click(screen.getAllByText('Submit Lineup')[0]);

  expect(setDoc).toHaveBeenCalledWith('docRef', {
    name: 'custom-uid',
    lineUp: dummyLineUp,
  });

});

