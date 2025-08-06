import React, { useState } from "react";
import { db } from "../firebase-config";
import { collection, doc, setDoc } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Link } from "react-router-dom";

const Seasons = ({ leagueId }) => {
  const [year, setYear] = useState("");

  const leagueCollection = collection(db, "leagues", leagueId, "seasons");
  const [docs, loading] = useCollectionData(leagueCollection);

  const addSeason = async (year) => {
    setYear(year);
    try {
      const docRef = doc(db, "leagues", leagueId, "seasons", year);
      await setDoc(docRef, {
        season: year,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="season-container">
      {loading && "Loading..."}
      <div className="season-tabs">
        {docs?.map((doc) => (
          <Link
            key={doc.season}
            to={`/league/${leagueId}/season/${doc.season}`}
            className="season-tab"
          >
            {doc.season}
          </Link>
        ))}
      </div>

      <button onClick={() => addSeason("2025")}>Add 2025 Season</button>
    </div>
  );
};

export default Seasons;
