import React, {useEffect, useState} from "react";
import { auth, db } from "../firebase-config";
import { collection, doc, setDoc } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Link } from "react-router-dom";

function roundToTwo(number) {
  return Math.round(number * 100) / 100;
}

const Entries = ({ leagueId, season, week, actualWeek }) => {
  const user = auth.currentUser;

  const entriesCollection = collection(db, "leagues", leagueId, "seasons", season, "weeks", week, "entries");
  const [entries] = useCollectionData(entriesCollection, { idField: "id" });

  const membersCollection = collection(db, "leagues", leagueId, "members");
  const [members] = useCollectionData(membersCollection, { idField: "id" });

  const memberLabel = (email) => {
    const member = members?.find((member) => member.email === email);
    return (
      member?.displayName ||
      member?.email ||
      member?.uid ||
      email
    );
  };

  const membersWithEntries = new Set(entries?.map((entry) => entry.name));
  const unplayedMembers = members?.filter((member) => !membersWithEntries.has(member.email));

  const hasEntry = !!entries?.some((entry) => entry.name === user?.email);

  const currentMember = members?.find((member) => member.uid === user?.uid);
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

  const projectedTotal = (entry) =>
    (entry.lineUp?.RB?.points ?? 0) + (entry.lineUp?.WR?.points ?? 0);

  const calculateScores = async () => {
    if (!entries) return;
    const rbUrl = `https://api.sleeper.com/stats/nfl/${season}/${week}?season_type=regular&position=RB&order_by=pts_ppr`;
    const wrUrl = `https://api.sleeper.com/stats/nfl/${season}/${week}?season_type=regular&position=WR&order_by=pts_ppr`;
    const rbResponse = await fetch(rbUrl);
    const wrResponse = await fetch(wrUrl);
    const rbJson = await rbResponse.json();
    const wrJson = await wrResponse.json();
    const finalStats = [...rbJson, ...wrJson];

    // Set PPR scores on the entries
    // Doing this mutably isn't great, but I don't understand the code well enough to refactor more
    entries.forEach((entry) => {
      const rbId = entry.lineUp?.RB?.playerId;
      const wrId = entry.lineUp?.WR?.playerId;
      const rb = finalStats.find((player) => player.player_id === rbId);
      const wr = finalStats.find((player) => player.player_id === wrId);
      entry.lineUp.RB.pprScore = rb && rb.stats.pts_ppr ? rb.stats.pts_ppr : 0.0;
      entry.lineUp.WR.pprScore = wr && wr.stats.pts_ppr ? wr.stats.pts_ppr : 0.0;
      let finalScore = entry.lineUp.RB.pprScore + entry.lineUp.WR.pprScore;
      entry.lineUp.finalScore = finalScore;
      entry.finalScore = finalScore;
    });

    for (const entry of entries) {
      let memberUid = members?.find((member) => member.email === entry.name)?.uid;
      const docRef = doc(db, "leagues", leagueId, "seasons", season, "weeks", week, "entries", memberUid);

      await setDoc(docRef, {
        name: entry.name || entry.id,
        lineUp: entry.lineUp,
        finalScore: entry.finalScore,
      });
    }
  };

  //This isn't perfect - ideally we do this on a timer in the background, or only update once every 5 minutes, or something like that.
  //Also, the deps argument is empty because it results in an equivalent to "run this on page load" - see https://stackoverflow.com/q/63193114
    useEffect(() => {
      console.log("DEBUG ONLY!");
      calculateScores();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border border-[#3a465b]">
            <thead className="bg-[#3a465b]">
            <tr>
              <th className="p-2 border-b border-[#3a465b]">Member</th>
              <th className="p-2 border-b border-[#3a465b]">RB</th>
              <th className="p-2 border-b border-[#3a465b]">RB Projection</th>
              <th className="p-2 border-b border-[#3a465b]">WR</th>
              <th className="p-2 border-b border-[#3a465b]">WR Projection</th>
              <th className="p-2 border-b border-[#3a465b]">Projected Total</th>
              <th className="p-2 border-b border-[#3a465b]">{actualWeek > parseInt(week) ? ("Final Score") : ("Current Score")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry) => (
              <tr key={entry.name} className="odd:bg-[#3a465b]/20">
                <td className="p-2 border-b border-[#3a465b]">{memberLabel(entry.name)}</td>
                <td className="p-2 border-b border-[#3a465b]">{entry.lineUp?.RB?.name ?? ""}</td>
                <td className="p-2 border-b border-[#3a465b]">{roundToTwo(entry.lineUp?.RB?.points) ?? 0}</td>
                <td className="p-2 border-b border-[#3a465b]">{entry.lineUp?.WR?.name ?? ""}</td>
                <td className="p-2 border-b border-[#3a465b]">{roundToTwo(entry.lineUp?.WR?.points) ?? 0}</td>
                <td className="p-2 border-b border-[#3a465b]">{roundToTwo(projectedTotal(entry))}</td>
                <td className="p-2 border-b border-[#3a465b]">{entry.finalScore ? roundToTwo(entry.finalScore) : ""}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
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
        {isAdmin && unplayedMembers.length > 0 && (
          <>
            <div className="space-y-4">
              {unplayedMembers.map((member) => (
                <>
                  <input
                    type="checkbox"
                    className="mr-2"
                    // checked={selectedUids.includes(entry.name)}
                    onChange={() => toggleUid(member.email)}
                  /> {member.email}
                  <br/>
                </>
              ))}
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
            </div>
          </>
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
