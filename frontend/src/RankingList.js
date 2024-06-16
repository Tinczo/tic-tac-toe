import React, { useState, useEffect } from "react";
import axios from "axios";
import { refreshSessionTokenIfNeeded } from "./CognitoUtils";

const RankingList = ({ backToMain }) => {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    await refreshSessionTokenIfNeeded();
    const accessToken = localStorage.getItem("accessToken");

    try {
      const response = await axios.get(
        `http://${process.env.REACT_APP_BACKEND_IP}:8080/game/ranking`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setRankings(response.data);
      console.log("Rankings fetched:", response.data);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    }
  };

  const getColor = (position) => {
    if (position === 1) return "gold";
    if (position === 2) return "silver";
    if (position === 3) return "#cd7f32"; // Bronze
    return "inherit";
  };

  return (
    <div>
      <h1 style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff" }}>
        Rankingi
      </h1>
      <table style={{ width: "100%", tableLayout: "fixed", color: "#fff", textAlign: "center" }}>
        <thead>
          <tr>
            <th style={{ fontFamily: "'Press Start 2P', cursive" }}>Miejsce</th>
            <th style={{ fontFamily: "'Press Start 2P', cursive" }}>Gracz</th>
            <th style={{ fontFamily: "'Press Start 2P', cursive" }}>Wygrane</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((ranking) => (
            <tr key={ranking.player} style={{ color: getColor(ranking.position), fontFamily: "'Press Start 2P', cursive" }}>
              <td>{ranking.position}</td>
              <td>{ranking.player}</td>
              <td>{ranking.wins}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <button onClick={backToMain} className="logoutButton">
          Powrót do gry
        </button>
      </div>
    </div>
  );
};

export default RankingList;
