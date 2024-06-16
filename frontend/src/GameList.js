import React, { useState, useEffect } from "react";
import axios from "axios";
import { refreshSessionTokenIfNeeded } from "./CognitoUtils";

const GameList = ({ backToMain }) => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    await refreshSessionTokenIfNeeded();
    const accessToken = localStorage.getItem("accessToken");

    try {
      const response = await axios.get(
        `http://${process.env.REACT_APP_BACKEND_IP}:8080/game/list`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setGames(response.data);
      console.log("Games fetched:", response.data);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  return (
    <div>
      <h1 style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff" }}>
        Lista gier
      </h1>
      <table style={{ width: "100%", tableLayout: "fixed", color: "#fff", textAlign: "center" }}>
  <thead>
    <tr>
      <th>
        <h1 style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff" }}>
          X
        </h1>
      </th>
      <th>
        <h1 style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff" }}>
          O
        </h1>
      </th>
    </tr>
  </thead>
  <tbody>
    {games.map((game) => (
      <tr key={game.gameId}>
        <td style={{ color: game.winner === game.player1 ? "yellow" : "inherit", fontFamily: "'Press Start 2P', cursive" }}>
          {game.player1}
        </td>
        <td style={{ color: game.winner === game.player2 ? "yellow" : "inherit", fontFamily: "'Press Start 2P', cursive" }}>
          {game.player2}
        </td>
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

export default GameList;
