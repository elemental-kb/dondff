import React, { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './components/home';
import SignUp from './components/signIn';
import Error from './components/error';
import Dashboard from './components/dashboard';
import League from './components/league';
import Game from './components/game';



function App() {
  
  

  return (
    <div className="App">
      <Router>
        <h3>Deal or No Deal!</h3>
        <h4>Fantasy Football Edition</h4>
        <hr />
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/login" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/league/:leagueId" element={<League />} />
          <Route path="/game/:type" element={<Game />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
