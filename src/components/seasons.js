import React, { useEffect, useState } from "react"
import { auth, db } from "../firebase-config";
import { addDoc, arrayUnion, collection, deleteDoc, doc, getDocs, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import Weeks from "./weeks";

const Seasons = ({league, leagueId, leagueRef}) => {
  
  const [year, setYear] = useState("")
  const [isActive, setIsActive] = useState(false);

  
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
        {docs?.map((doc) => (
          <div className="accordion-item" key={Math.random()} >
            <div className="accordion-title" onClick={() => setIsActive(!isActive)}>
              <div>{doc.season}</div>
              <div>{isActive ? '-' : '+'}</div>
            </div>
            {isActive && <div className="accordion-content">
              <Weeks leagueId={leagueId} season={doc.season}/>
            </div>}
          </div>
        ))}
      </div>
      
       <button onClick={()=>{addSeason("2023")}}>Add 2023 Season</button>
    </div>
  )
}

export default Seasons