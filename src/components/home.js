import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DisplayGame from './cases'
import hero from './images/DOND.jpg'



function Home() {
  
  const [week, setWeek] = useState("")
  const [type, setType] = useState("")
  const [limit, setLimit] = useState(null)
  const [pool, setPool] = useState([])
  
  const navigate = useNavigate()

  const getPlayers = async () => {
    try {
      const weekInput = week
      const typeInput = type
      const playerLimit = limit
      const url = `https://api.sleeper.com/projections/nfl/2024/${weekInput}?season_type=regular&position=${typeInput}&order_by=pts_ppr`
      const response = await fetch(url)
      const json = await response.json()
      for (let i = 0; i < playerLimit; i++) {
        let points = json[i].stats.pts_ppr
        let first = json[i].player.first_name
        let last = json[i].player.last_name
        let status = json[i].player.injury_status
        let opponent = json[i].opponent
        let team = json[i].team
        let result = {"name": `${first} ${last}`, "points": points, "status": status, "opponent": opponent, "team": team}
        setPool(pool => [...pool, result])
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if(type === "WR") {
      setLimit(95)
    }
    if(type === "RB") {
      setLimit(65)
    }
  }, [type])
  

  useEffect(() => {
    if(limit) {
      getPlayers()
    }
  }, [limit])

  const handleSubmit = (event) => {
    event.preventDefault();
  }

  const renderOptions = () => {
    return (
      <div className="game-options">
        <form onSubmit={handleSubmit}>
          <label>
            select NFL week:
            <select value={week} onChange={(e) => setWeek(e.target.value)}>            
              <option > </option>
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
          <label>
            select player group:
            <select value={type} onChange={(e) => setType(e.target.value)}>            
              <option > </option>
              <option value="WR">WR</option>
              <option value="RB">RB</option>
            </select>
          </label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    )
  }

  return (
    <>
      
      {pool.length > 0 ? <DisplayGame pool={pool} /> : 
        <>
          <div className="options">
            <div className="edge">
              <h4>Welcome to Deal or No Deal! Fantasy Football Edition</h4>
              <p>To begin select the current week of the NFL season and your position group.</p>
              {renderOptions()}
            </div>
            <div>
              <p>Or Create an Account/Login to save leagues and line-ups and keep track of weekly scores. </p>
              <button onClick={() => {navigate("/login")}}>Create/Login</button>
            </div>
          </div>
          <img src={hero} alt="Deal or No Deal Fantasy Football" className="main-image"/>
        </>}
      <hr />
      <div className="about">
        <h4>About</h4>
        <p>Deal or No Deal! Fantasy Football is a fun fantasy football mini-game. Get together with your league mates and play the game for each position group, RB and WR, until each of you have an RB and an WR. The best 2 player combined score of one WR and one RB wins!</p>

        <h4>How To Play</h4>
        <p>Once you select the week and position group you will see the game board come up with 10 "cases" and a list of the players in those cases.<br />
        The contestant (you) then selects a case and the game will begin.<br />
        Once a case is selected, 3 cases are randomly removed from the game and the bank will make you an offer.<br />
        The contestent can either accept the offer or decline.<br />
        If accept, the game is over and this is your player for your line-up.<br />
        If decline the offer, the game continues and 2 more of the cases are eliminated.<br />
        A new offer is now generated with the option to accept or decline.<br />
        If declined again, 2 more cases are eliminated and the final offer is generated.<br />
        If the final offer is declined, 1 more case is elimated and there are now only 2 remaining. The selected case and one more. <br />
        Here you can either keep your selected case or swap it for the last remaining one. <br />
        Once the player is settled upon, either by accepting an offer or letting the game play out, the game is over and this is the contestant's player for their line-up. <br />
        Be sure to record who ends up with what player as this data is not saved anywhere. <br />
        Hit the reset button to refill the cases and have your next league mate play for their player. Or refresh the page to switch position groups.<br />
        Once everyone has their 2-player line-ups, be sure to watch the games and then determine the winner after the weeks end.</p>

        <h4>Logic</h4>
        <p>Once the week and position group is set the game builds of pool of players based on their PPR projections for the week. <br />The pool is made up of the top 65 RB or top 95 WR.<br />
        From the pool, it then randomly selects 10 players to fill the cases, and the remaining become the leftovers.<br />
        Offers are then calculated based on the average projection of the cases still in play, and then selecting the player from the leftovers who is closest to this calculation. <br />
        The RESET button keeps the pool the exact same but rebuilds the cases and leftovers for the next contestant. <br />
        Refreshing the page will end up rebuilding the pools, this could result in the pool being in a different order than before if projections happened to be updated in the meantime.
        
        </p>

        <h4>Tips</h4>
        <p>My league mates and I try to get together on a video chat, like zoom or discord, that has screen sharing capabilities. We then have one person acting as a host and actually controlling the game. They do all the clicking and just ask what each person wants to do. We'll run through one-by-one until everyone has an RB and then we'll switch over to WRs and do the same. This way everyone is working with the exact same list in the exact same order with exact same projections.<br />
          The projections are based on full PPR.<br />
          Its still fantasy, projections don't mean much, remember to record your line-ups some where so you can see who wins after the week's games are concluded. <br />
          The projections are no longer updated once the game kicks, this means that if you are running this on Sunday morning you may see thursday players in the game. The points you see for them will be their projections, not their final real score. This can either be an advantage or disadvantage, who knows! It just adds to the fun!</p>
        </div>
    </>
  );
}

export default Home;
