import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot } from "firebase/firestore";

const Dashboard = () => {

  const [user, setUser] = useState({})
  const [leagues, setLeagues] = useState([])
  const [newLeague, setNewLeague] = useState("")

  const navigate = useNavigate()
  const leaguesRef = collection(db, "leagues")


  const addLeague = async () => {
    await addDoc(leaguesRef, {
      name: newLeague,
      uid: user.uid
    })
  }

  const deleteLeague = async (id) => {
    const leagueDoc = doc(db, "leagues", id)
    await deleteDoc(leagueDoc)
  }

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
    
    const unsub = onSnapshot(leaguesRef, (snapShot) => {
      const currentUserUid = user.uid; // Assuming you have the user's UID in the state
      
      const filteredList = snapShot.docs
        .filter((doc) => doc.data().uid === currentUserUid)
        .map((doc) => ({ ...doc.data(), id: doc.id }));
      
      setLeagues(filteredList);
    },
    (error) => {
      console.log(error)
    })

    return () => {
      unsub()
    }
  }, [user])

  const logout = async () => {
    try {
      await signOut(auth)
      navigate("/")
    } catch (error) {
      console.log(error.message)
    }
  }

  if (!user) {
    return <Navigate replace to="/login" />
  } else {
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
          <input placeholder="Enter League Name..." onChange={(e) => {setNewLeague(e.target.value)}} />
          <button onClick={addLeague}>Create League</button>
        </div>
      </div>
    )
  }

 
}

export default Dashboard