import React, { useEffect, useState } from "react"
import { auth, db } from "../firebase-config";
import { addDoc, arrayUnion, collection, deleteDoc, doc, getDocs, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import Weeks from "./weeks";

const Seasons = ({league, leagueId, leagueRef}) => {
  
  const [year, setYear] = useState("")
  const [activeSeasons, setActiveSeasons] = useState({});

  
  const leagueCollection = collection(db, "leagues", leagueId, "seasons")
  const [docs, loading, error] = useCollectionData(leagueCollection)

  const addSeason = async (year) => {
    setYear(year)
    
    try{
        const docRef = doc(db, "leagues", leagueId, "seasons", year)
        await setDoc(docRef, {
          season: year
      })
    } catch (error) {
      console.log(error)
    }
  }

 


  
  return (
    <div className="season-container">
      {loading && "Loading..."}
      <div className="accordion">
        {docs?.map((doc) => {
          const isActive = !!activeSeasons[doc.season];
          return (
            <div className="accordion-item" key={doc.season} >
              <div
                className="accordion-title"
                onClick={() =>
                  setActiveSeasons(prev => ({ ...prev, [doc.season]: !prev[doc.season] }))
                }
              >
                <div>{doc.season}</div>
                <div>{isActive ? '-' : '+'}</div>
              </div>
              {isActive && (
                <div className="accordion-content">
                  <Weeks leagueId={leagueId} season={doc.season} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <button onClick={() => {addSeason("2025")}}>Add 2025 Season</button>
    </div>
  )
}

export default Seasons
