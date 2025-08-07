import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import { calculateStats } from "./statsUtil";

const LeagueStats = ({ leagueId, league }) => {
  const [leagueWins, setLeagueWins] = useState([]);
  const [seasonWins, setSeasonWins] = useState([]);
  const [leagueHigh, setLeagueHigh] = useState(null);
  const [seasonHigh, setSeasonHigh] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!leagueId) return;
      const membersSnap = await getDocs(
        collection(db, "leagues", leagueId, "members")
      );
      const memberMap = {};
      membersSnap.forEach((d) => {
        const data = d.data();
        memberMap[d.id] =
          data.displayName || data.email || data.uid || d.id;
      });

      const seasonsSnap = await getDocs(
        collection(db, "leagues", leagueId, "seasons")
      );
      let allWeeks = [];
      let currentSeasonWeeks = [];
      for (const seasonDoc of seasonsSnap.docs) {
        const seasonId = seasonDoc.id;
        const weeksSnap = await getDocs(
          collection(db, "leagues", leagueId, "seasons", seasonId, "weeks")
        );
        for (const weekDoc of weeksSnap.docs) {
          const entriesSnap = await getDocs(
            collection(
              db,
              "leagues",
              leagueId,
              "seasons",
              seasonId,
              "weeks",
              weekDoc.id,
              "entries"
            )
          );
          const entries = entriesSnap.docs.map((e) => ({
            id: e.id,
            ...e.data(),
          }));
          if (entries.length > 0) {
            allWeeks.push(entries);
            if (seasonId === league.currentSeason) {
              currentSeasonWeeks.push(entries);
            }
          }
        }
      }
      const leagueStats = calculateStats(allWeeks);
      const seasonStats = calculateStats(currentSeasonWeeks);

      const leagueWinsArr = Object.entries(leagueStats.winsMap)
        .map(([id, wins]) => ({ id, wins, label: memberMap[id] || id }))
        .sort((a, b) => b.wins - a.wins);
      const seasonWinsArr = Object.entries(seasonStats.winsMap)
        .map(([id, wins]) => ({ id, wins, label: memberMap[id] || id }))
        .sort((a, b) => b.wins - a.wins);

      if (leagueStats.highEntry) {
        leagueStats.highEntry.label =
          memberMap[leagueStats.highEntry.id] || leagueStats.highEntry.id;
      }
      if (seasonStats.highEntry) {
        seasonStats.highEntry.label =
          memberMap[seasonStats.highEntry.id] || seasonStats.highEntry.id;
      }

      setLeagueWins(leagueWinsArr);
      setSeasonWins(seasonWinsArr);
      setLeagueHigh(leagueStats.highEntry);
      setSeasonHigh(seasonStats.highEntry);
    };
    fetchStats();
  }, [leagueId, league.currentSeason]);

  const renderWins = (wins) => (
    <ul className="list-disc list-inside">
      {wins.map((w) => (
        <li key={w.id}>
          {w.label}: {w.wins}
        </li>
      ))}
    </ul>
  );

  const renderHigh = (entry) => (
    <div>
      <div className="font-semibold">{entry.label} - {entry.finalScore} pts</div>
      <div>
        RB: {entry.lineUp?.RB?.name} ({entry.lineUp?.RB?.points} proj / {""}
        {entry.lineUp?.RB?.pprScore || 0} actual)
      </div>
      <div>
        WR: {entry.lineUp?.WR?.name} ({entry.lineUp?.WR?.points} proj / {""}
        {entry.lineUp?.WR?.pprScore || 0} actual)
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">League Stats</h4>
      <div>
        <h5 className="font-semibold">Win Totals</h5>
        {renderWins(leagueWins)}
      </div>
      {leagueHigh && (
        <div>
          <h5 className="font-semibold">Highest Scoring Lineup</h5>
          {renderHigh(leagueHigh)}
        </div>
      )}
      {league.currentSeason && (
        <div className="space-y-2">
          <h4 className="text-lg font-semibold">Current Season Stats</h4>
          <div>
            <h5 className="font-semibold">Win Totals</h5>
            {renderWins(seasonWins)}
          </div>
          {seasonHigh && (
            <div>
              <h5 className="font-semibold">Highest Scoring Lineup</h5>
              {renderHigh(seasonHigh)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeagueStats;
