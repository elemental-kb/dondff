import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Seasons from "./seasons";

const League = () => {

  let { leagueId } = useParams()

  const [user, setUser] = useState({})
  const [league, setLeague] = useState({})
  

  
  const leagueRef = doc(db, "leagues", leagueId )

  

  
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const unsub = onSnapshot(leagueRef, (doc) => {
      setLeague(doc.data())
    }, 
    (error) => {
      console.log(error)
    })

    return () => {
      unsub()
    }
    
  }, [])




  return (
    <div className="league-panel">
    <h2>{league.name}</h2>
    
    <h4>Seasons:</h4>
    <Seasons league={league} leagueId={leagueId} leagueRef={leagueRef} />
    </div>
  )
}

export default League