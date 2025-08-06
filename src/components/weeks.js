import React, { useEffect, useState } from "react";
import { db } from "../firebase-config";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import Accordion from "./accordion";

const Weeks = ({ leagueId, season }) => {
  const [week, setWeek] = useState("1");
  const [actualNFLWeek, setActualNFLWeek] = useState(null);
  const [weekIsActive, setWeekIsActive] = useState(false);

  const leagueCollection = collection(
    db,
    "leagues",
    leagueId,
    "seasons",
    season,
    "weeks"
  );
  const [docs, loading, error] = useCollectionData(leagueCollection);

  const getActualWeek = async () => {
    try {
      const url = "https://api.sleeper.app/v1/state/nfl";
      const response = await fetch(url);
      const json = await response.json();
      const actualWeek = json.week;
      setActualNFLWeek(actualWeek);
    } catch (error) {
      console.log(error);
    }
  };

  const addWeek = async (e) => {
    try {
      await setWeek(e.target.value);
      const docRef = doc(db, "leagues", leagueId, "seasons", season, "weeks", week);
      await setDoc(docRef, {
        week: week,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getActualWeek();
  }, []);

  return (
    <div className="week-container">
      {loading && "Loading..."}
      <div className="accordion">
        {docs?.map((doc) => (
          <Accordion
            key={doc.week}
            doc={doc}
            leagueId={leagueId}
            season={season}
            actualWeek={actualNFLWeek}
          />
        ))}
      </div>
      <div className="add-week-form">
        <label>
          select NFL week:
          <select value={week} onChange={(e) => setWeek(e.target.value)}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="15">15</option>
            <option value="16">16</option>
            <option value="17">17</option>
            <option value="18">18</option>
          </select>
        </label>
        <button onClick={addWeek}>Add Week</button>
      </div>
      <div>Current NFL Week: {actualNFLWeek}</div>
    </div>
  );
};

export default Weeks;
