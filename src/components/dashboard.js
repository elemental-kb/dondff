import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, setDoc, query, where, collectionGroup, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

const Dashboard = () => {

  const [user, setUser] = useState({})
  const [leagues, setLeagues] = useState([])
  const [newLeague, setNewLeague] = useState("")
  const [joinCode, setJoinCode] = useState("")

  const navigate = useNavigate()
  const leaguesRef = collection(db, "leagues")


  const addLeague = async () => {
    try {
      const accessCode = uuidv4(); // Generate a unique access code
      const newLeagueRef = await addDoc(leaguesRef, {
        name: newLeague,
        uid: user.uid,
        accessCode: accessCode, // Store the access code
      });

      const memberRef = doc(db, "leagues", newLeagueRef.id, "members", user.uid);
      await setDoc(memberRef, { uid: user.uid, role: "admin" });

      // After creating the league, navigate to its management page
      navigate(`/league/${newLeagueRef.id}`);
    } catch (error) {
      console.log(error.message);
    }
  };

  const joinLeague = async () => {
    try {
      const q = query(leaguesRef, where("accessCode", "==", joinCode));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const leagueDoc = querySnapshot.docs[0];
        const memberRef = doc(db, "leagues", leagueDoc.id, "members", user.uid);
        await setDoc(memberRef, { uid: user.uid, role: "player" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const deleteLeague = async (id) => {
    const leagueDoc = doc(db, "leagues", id)
    await deleteDoc(leagueDoc)
  }

  useEffect(() => {
    const authUnsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => authUnsub();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const membersQuery = query(collectionGroup(db, "members"), where("uid", "==", user.uid));
    const unsub = onSnapshot(membersQuery, async (snapShot) => {
      const leaguePromises = snapShot.docs.map(async (memberDoc) => {
        const leagueRef = memberDoc.ref.parent.parent;
        const leagueSnap = await getDoc(leagueRef);
        return { id: leagueSnap.id, ...leagueSnap.data() };
      });
      const leagueList = await Promise.all(leaguePromises);
      setLeagues(leagueList);
    },
    (error) => {
      console.log(error);
    });

    return () => unsub();
  }, [user]);

  const logout = async () => {
    try {
      await signOut(auth)
      navigate("/")
    } catch (error) {
      console.log(error.message)
    }
  }


    return (
      <div className="dashboard">
        <h2>Welcome to Your Dashboard</h2>
        <h3>{user.email}</h3>
        <button onClick={logout}>Sign Out</button>
        <h4>Leagues:</h4>
        {leagues.map((league) => {
          return (
            <div>
              <p>{league.name}</p>
              <button onClick={() => {navigate(`/league/${league.id}` )}}>Manage</button>
              <button onClick={() => {deleteLeague(league.id)}}>Delete</button>
            </div>

          )
        })}
        <div className="single-form">
          <input placeholder="Enter Access Code..." onChange={(e) => {setJoinCode(e.target.value)}} />
          <button onClick={joinLeague}>Join League</button>
        </div>
        <div className="single-form">
          <input placeholder="Enter League Name..." onChange={(e) => {setNewLeague(e.target.value)}} />
          <button onClick={addLeague}>Create League</button>
        </div>
      </div>
    )

 
}

export default Dashboard