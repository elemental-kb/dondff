import React, { useState } from "react";
import { auth, db } from "../firebase-config";
import { collection, doc, setDoc } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Link } from "react-router-dom";

const Entries = ({ leagueId, season, week, actualWeek }) => {
  const user = auth.currentUser;

  const entriesCollection = collection(
    db,
    "leagues",
    leagueId,
    "seasons",
    season,
    "weeks",
    week,
    "entries"
  );
  const [entries] = useCollectionData(entriesCollection, { idField: "id" });

  const membersCollection = collection(db, "leagues", leagueId, "members");
  const [members] = useCollectionData(membersCollection, { idField: "id" });

  const memberLabel = (id) => {
    const member = members?.find((m) => m.id === id);
    return (
      member?.displayName ||
      member?.email ||
      member?.uid ||
      id
    );
  };

  const hasEntry = !!entries?.some((entry) => entry.id === user?.uid);

  const currentMember = members?.find((m) => m.id === user?.uid);
  const isAdmin = currentMember?.role === "admin";
  const [selectedUids, setSelectedUids] = useState([]);

  const toggleUid = (uid) => {
    setSelectedUids((prev) =>
      prev.includes(uid)
        ? prev.filter((id) => id !== uid)
        : [...prev, uid]
    );
  };

  const sortedEntries = entries
    ? [...entries].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
    : [];

  const calculateScores = async () => {
    if (!entries) return;
    const rbUrl = `https://api.sleeper.com/stats/nfl/${season}/${week}?season_type=regular&position=RB&order_by=pts_ppr`;
    const wrUrl = `https://api.sleeper.com/stats/nfl/${season}/${week}?season_type=regular&position=WR&order_by=pts_ppr`;
    const rbResponse = await fetch(rbUrl);
    const wrResponse = await fetch(wrUrl);
    const rbJson = await rbResponse.json();
    const wrJson = await wrResponse.json();
    const finalStats = [...rbJson, ...wrJson];

    let playerIds = [];
    for (let i = 0; i < entries.length; i++) {
      const rbId = entries[i].lineUp?.RB?.playerId;
      const wrId = entries[i].lineUp?.WR?.playerId;
      if (rbId) playerIds.push(rbId);
      if (wrId) playerIds.push(wrId);
    }

    let entryList = [];
    entries.forEach((doc) => {
      entryList.push(doc);
    });

    for (let i = 0; i < playerIds.length; i++) {
      let player = finalStats.find((p) => p.player_id === playerIds[i]);
      let pprScore = 0.0;
      if (player && player.stats.pts_ppr) {
        pprScore = player.stats.pts_ppr;
      }
      entryList.map((x) =>
        x.lineUp.RB.playerId === playerIds[i]
          ? (x.lineUp.RB.pprScore = pprScore)
          : x
      );
      entryList.map((x) =>
        x.lineUp.WR.playerId === playerIds[i]
          ? (x.lineUp.WR.pprScore = pprScore)
          : x
      );
    }

    entryList.map((x) => {
      const total = Number(
        (x.lineUp.RB.pprScore + x.lineUp.WR.pprScore).toFixed(2)
      );
      x.lineUp.finalScore = total;
      x.finalScore = total;
      return x;
    });

    for (const entry of entryList) {
      const docRef = doc(
        db,
        "leagues",
        leagueId,
        "seasons",
        season,
        "weeks",
        week,
        "entries",
        entry.id
      );
      await setDoc(docRef, {
        name: entry.name || entry.id,
        lineUp: entry.lineUp,
        finalScore: entry.finalScore,
      });
    }
  };

  return (
    <div className="space-y-4">
      <table className="w-full text-left border border-[#3a465b]">
        <thead className="bg-[#3a465b]">
          <tr>
            <th className="p-2 border-b border-[#3a465b]">Member</th>
            <th className="p-2 border-b border-[#3a465b]">RB</th>
            <th className="p-2 border-b border-[#3a465b]">WR</th>
            <th className="p-2 border-b border-[#3a465b]">Final Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.map((entry) => (
            <tr key={entry.id} className="odd:bg-[#3a465b]/20">
              <td className="p-2 border-b border-[#3a465b]">
                {isAdmin && (
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedUids.includes(entry.id)}
                    onChange={() => toggleUid(entry.id)}
                  />
                )}
                {memberLabel(entry.id)}
              </td>
              <td className="p-2 border-b border-[#3a465b]">{entry.lineUp?.RB?.name ?? ""}</td>
              <td className="p-2 border-b border-[#3a465b]">{entry.lineUp?.WR?.name ?? ""}</td>
              <td className="p-2 border-b border-[#3a465b]">{entry.finalScore ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {entries && !hasEntry && user && (
        <Link
          to="/game/setting-lineups"
          state={{
            leagueId: leagueId,
            season: season,
            week: week,
          }}
        >
          <button className="px-4 py-2 font-bold text-[#102131] bg-[#00ceb8] rounded hover:bg-[#00ceb8]/80">
            Play Game
          </button>
        </Link>
      )}
      {isAdmin && (
        <Link
          to="/game/group"
          state={{
            leagueId: leagueId,
            season: season,
            week: week,
            participants: selectedUids,
          }}
        >
          <button
            className="px-4 py-2 font-bold text-[#102131] bg-[#00ceb8] rounded hover:bg-[#00ceb8]/80 disabled:opacity-50"
            disabled={selectedUids.length === 0}
          >
            Start Group Game
          </button>
        </Link>
      )}
      {actualWeek > parseInt(week) && isAdmin && (
        <button
          className="px-4 py-2 font-bold text-[#102131] bg-[#00ceb8] rounded hover:bg-[#00ceb8]/80"
          onClick={calculateScores}
        >
          Calculate Scores
        </button>
      )}
    </div>
  );
};

export default Entries;
