import React from "react";
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
    return member?.uid || id;
  };

  const hasEntry = entries?.some((entry) => entry.id === user?.uid);

  const getFinalScores = async () => {
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
      playerIds.push(entries[i].lineUp.RB.playerId, entries[i].lineUp.WR.playerId);
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

    entryList.map(
      (x) =>
        (x.lineUp.finalScore = Number(
          (x.lineUp.RB.pprScore + x.lineUp.WR.pprScore).toFixed(2)
        ))
    );

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
      });
    }
  };

  return (
    <div className="contestant-container">
      <div className="contestant-flexbox">
        {entries?.map((entry) => (
          <div key={entry.id} className="contestant-card">
            <p>{memberLabel(entry.id)}</p>
            <p>
              <b>RB:</b> {entry.lineUp.RB.name} {entry.lineUp.finalScore && <>{entry.lineUp.RB.pprScore}</>}
            </p>
            <p>
              <b>WR:</b> {entry.lineUp.WR.name} {entry.lineUp.finalScore && <>{entry.lineUp.WR.pprScore}</>}
            </p>
            {entry.lineUp.finalScore && <p>Final Score {entry.lineUp.finalScore}</p>}
          </div>
        ))}
      </div>
      {!hasEntry && user && (
        <Link
          to="/game/setting-lineups"
          state={{
            leagueId: leagueId,
            season: season,
            week: week,
          }}
        >
          <button>Play Game</button>
        </Link>
      )}
      {actualWeek > parseInt(week) ? (
        <button onClick={getFinalScores}>Get Final Scores</button>
      ) : null}
    </div>
  );
};

export default Entries;
