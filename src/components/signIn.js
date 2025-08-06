import React, { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../firebase-config'
import { Navigate, useNavigate } from 'react-router-dom'

const SignUp = () => {

  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [loginError, setLoginError] = useState("")
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
      setRegisterError("")
    } catch (error) {
      setRegisterError(error.message)
    }
  }

  const login = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      console.log(user)
      navigate("/dashboard")
      setLoginError("")
    } catch (error) {
      setLoginError(error.message)
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
    return (
      <div className="sign-up-form">
        <h4>User Logged IN:</h4>
        {user ? user.email : "Not Logged In"}
        <button onClick={logout}>Sign Out</button>
        <button onClick={() => {navigate("/dashboard")}}>Dashboard</button>
      </div>
    );
  } else {
    return (
      <div className="sign-up-form">
        <div>
          <h3>Sign Up</h3>
          <input placeholder='Email...' onChange={(e) => {setRegisterEmail(e.target.value); setRegisterError("")}}/>
          <input placeholder='Password...' onChange={(e) => {setRegisterPassword(e.target.value); setRegisterError("")}}/>
          {registerError && <p style={{color: 'red'}}>{registerError}</p>}
          <button onClick={register}>Sign Up</button>
        </div>
        <div>
          <h3>Login</h3>
          <input placeholder='Email...' onChange={(e) => {setLoginEmail(e.target.value); setLoginError("")}}/>
          <input placeholder='Password...' onChange={(e) => {setLoginPassword(e.target.value); setLoginError("")}}/>
          {loginError && <p style={{color: 'red'}}>{loginError}</p>}
          <button onClick={login}>Login</button>
        </div>
  
      </div>
    )
  }

}

export default SignUp
