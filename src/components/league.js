import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Seasons from "./seasons";

const League = () => {

  let { leagueId } = useParams()

  const [user, setUser] = useState(null)
  const [league, setLeague] = useState({})
  const [member, setMember] = useState(null)

  const leagueRef = doc(db, "leagues", leagueId)

  useEffect(() => {
    const authUnsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    const leagueUnsub = onSnapshot(
      leagueRef,
      (doc) => {
        setLeague(doc.data())
      },
      (error) => {
        console.log(error)
      }
    )

    return () => {
      authUnsub()
      leagueUnsub()
    }
  }, [leagueRef])

  useEffect(() => {
    if (!user?.uid) return
    const memberRef = doc(db, "leagues", leagueId, "members", user.uid)
    const unsub = onSnapshot(
      memberRef,
      (doc) => {
        setMember(doc.data())
      },
      (error) => {
        console.log(error)
      }
    )
    return () => unsub()
  }, [user, leagueId])

  return (
    <div className="league-panel">
      <h2>{league.name}</h2>

      {member?.role === "admin" && (
        <div>
          <p>Access Code: {league.accessCode}</p>
          <p>URL: /league/{leagueId}</p>
          <h4>Seasons:</h4>
          <Seasons league={league} leagueId={leagueId} leagueRef={leagueRef} />
        </div>
      )}

      {member?.role === "player" && (
        <div>
          <p>Access Code: {league.accessCode}</p>
          <p>Lineup Status: {member.lineupStatus || "Not set"}</p>
          {league.currentSeason && league.currentWeek && (
            <Link
              to="/game/setting-lineups"
              state={{
                leagueId: leagueId,
                season: league.currentSeason,
                week: league.currentWeek,
              }}
            >
              <button>Go To Weekly Game</button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

  export default League
