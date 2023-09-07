import React, { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../firebase-config'
import { Navigate, useNavigate } from 'react-router-dom'

const SignUp = () => {

  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [user, setUser] = useState({})

  const navigate = useNavigate()

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
  }, [])

  const register = async () => {
    try {
      const user = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword)
      console.log(user)
      navigate("/dashboard")
    } catch (error) {
      console.log(error.message)
    }
  }

  const login = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      console.log(user)
      navigate("/dashboard")
    } catch (error) {
      console.log(error.message)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.log(error.message)
    }
  }

  if (user) {
    return <Navigate replace to="/dashboard" />
  } else {
    return (
      <div className="sign-up-form">
        <div>
          <h3>Sign Up</h3>
          <input placeholder='Email...' onChange={(e) => {setRegisterEmail(e.target.value)}}/>
          <input placeholder='Password...' onChange={(e) => {setRegisterPassword(e.target.value)}}/>
          <button onClick={register}>Sign Up</button>
        </div>
        <div>
          <h3>Login</h3>
          <input placeholder='Email...' onChange={(e) => {setLoginEmail(e.target.value)}}/>
          <input placeholder='Password...' onChange={(e) => {setLoginPassword(e.target.value)}}/>
          <button onClick={login}>Login</button>
        </div>
  
        <h4>User Logged IN:</h4>
          {user ? user.email : "Not Logged In"}
        <button onClick={logout}>Sign Out</button>
      </div>
    )
  }

}

export default SignUp