import React from "react";
import MapChart from "./MapChart";

import './App.css'

function App() {
  return (
    <>
      <MapChart />
      <footer className="app-footer">
        Data from <a href="https://projects.propublica.org/climate-migration/" target="_blank" rel="noopener noreferrer">ProPublica / Rhodium Group</a>
      </footer>
    </>
  )
}

export default App
