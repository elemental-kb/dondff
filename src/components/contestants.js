import React, { useEffect, useState, useRef } from "react"
import { auth, db } from "../firebase-config";
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDocs, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Link } from "react-router-dom";


const Contestants = ({leagueId, season, week, actualWeek}) => {
  
  const [contestant, setContestant] = useState({})
  const [contestants, setContestants] = useState({})
  const [contestantsSet, setContestantsSet] = useState(false)
  const memberRef = useRef(null)

  const leagueCollection = collection(db, "leagues", leagueId, "seasons", season, "weeks", week, "contestants")
  const [docs, loading, error] = useCollectionData(leagueCollection)
  
  const addContestant = async () => {
    
    try{
      const docRef = doc(db, "leagues", leagueId, "seasons", season, "weeks", week, "contestants", contestant)
        await setDoc(docRef, {
            name: contestant,
            lineUp: {
              RB: {name: "awaiting game..."},
              WR: {name: "awaiting game..."},
              finalScore: null 
            }
      })
      memberRef.current.value = ""
    } catch (error) {
      console.log(error)
    }
  }

  const setContestantsForGame = () => {
    let contestantList = []
    docs.forEach((doc) => {
      contestantList.push(
        doc
      )
    })
    setContestants(contestantList)
    setContestantsSet(true)
  }

  const getFinalScores = async () => {
    //build super array containing every RB and WR for the week
    const rbUrl = `https://api.sleeper.com/stats/nfl/${season}/${week}?season_type=regular&position=RB&order_by=pts_ppr`
    const wrUrl = `https://api.sleeper.com/stats/nfl/${season}/${week}?season_type=regular&position=WR&order_by=pts_ppr`
    const rbResponse = await fetch(rbUrl)
    const wrResponse = await fetch(wrUrl)
    const rbJson = await rbResponse.json()
    const wrJson = await wrResponse.json()
    const finalStats = [...rbJson, ...wrJson]
    //pluck out player ids from the contestant lineups
    let playerIds = []
    for(let i = 0; i < docs.length; i++) {
      playerIds.push(docs[i].lineUp.RB.playerId, docs[i].lineUp.WR.playerId)
    }
    console.log(playerIds)
    //use player ids to search the super array for the stats
    let contestantList = []
    docs.forEach((doc) => {
      contestantList.push(
        doc
      )
    })
    for(let i = 0; i < playerIds.length; i++) {
      let player = finalStats.find(player => player.player_id === playerIds[i])
      let pprScore = 0.0
      if(player) {
        if(player.stats.pts_ppr){
          pprScore = player.stats.pts_ppr
        }
      } 
      
      //push the players ppr score into the temp contestantlist
      contestantList.map(x => (x.lineUp.RB.playerId === playerIds[i] ? x.lineUp.RB.pprScore = pprScore  : x))
      contestantList.map(x => (x.lineUp.WR.playerId === playerIds[i] ? x.lineUp.WR.pprScore = pprScore  : x))
      
    }
    //calculate the total RB + WR Score inside the array
    contestantList.map(x => x.lineUp.finalScore = Number((x.lineUp.RB.pprScore + x.lineUp.WR.pprScore).toFixed(2)))
    console.log(contestantList)
    //push the temp list back to DB
    for(const contestant of contestantList) {
      const docRef = doc(db, "leagues", leagueId, "seasons", season, "weeks", week, "contestants", contestant.name)
      await setDoc(docRef, {
        name: contestant.name,
        lineUp: contestant.lineUp
    })
    }
  }
  
  return (
    <div className="contestant-container">
      {loading && "Loading..."}
      
      <div className="contestant-flexbox">
        {docs?.map((doc) => (
          <div key={Math.random()} className="contestant-card">
            <p>{doc.name}</p>
            <p><b>RB:</b> {doc.lineUp.RB.name} {doc.lineUp.finalScore && <>{doc.lineUp.RB.pprScore}</>}</p>
            <p><b>WR:</b> {doc.lineUp.WR.name} {doc.lineUp.finalScore && <>{doc.lineUp.WR.pprScore}</>}</p>
            {doc.lineUp.finalScore && <p>Final Score {doc.lineUp.finalScore}</p>}
          </div>
        ))}
      </div>
      <div className="single-form">
        <input ref={memberRef} placeholder="Enter Contestant Name..." onChange={(e) => {setContestant(e.target.value)}} />
        <button onClick={addContestant}>Add Contestant</button>
        <button onClick={setContestantsForGame}>Set Contestants</button>
        {contestantsSet && <Link to="/game/setting-lineups"
          state={{
            contestants: contestants,
            leagueId: leagueId,
            season: season,
            week: week
          }}
        ><button>Play Game</button></Link>}
        {actualWeek > parseInt(week)? <button onClick={getFinalScores}>Get Final Scores</button> : null}
      </div>
    </div>
  )
}

export default Contestants