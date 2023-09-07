import React, { useState } from 'react';
import Contestants from './contestants';

const Accordion = ({ doc, leagueId, season, actualWeek }) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div key={Math.random()} className="accordion-item">
      <div className="accordion-title" onClick={() => setIsActive(!isActive)}>
        <div>Week {doc.week}</div>
        <div>{isActive ? '-' : '+'}</div>
      </div>
      {isActive && <div className="accordion-content">
        <Contestants leagueId={leagueId} season={season} week={doc.week} actualWeek={actualWeek} />
      </div>}
    </div>
  );
};

export default Accordion;