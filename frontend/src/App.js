import React, { useEffect, useState } from "react";
import "./App.css";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import SignOut from "./SignOut";
import { refreshSessionTokenIfNeeded } from "./CognitoUtils";

// const ip = "localhost";
// const ip = "3.235.16.88";
const ip = process.env.REACT_APP_BACKEND_IP;
const url = "http://" + ip + ":8080";

function App() {
  const [gameId, setGameId] = useState("");
  const [playerType, setPlayerType] = useState("");
  const [turns, setTurns] = useState([
    ["#", "#", "#"],
    ["#", "#", "#"],
    ["#", "#", "#"],
  ]);
  const [gameOn, setGameOn] = useState(false);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);

  const [currentTurn, setCurrentTurn] = useState("");

  useEffect(() => {
    if (gameId) {
      connectToSocket(gameId);
    }
  }, [gameId]);

  const connectToSocket = (gameId) => {
    const client = new Client();
    client.configure({
      brokerURL: "ws://" + ip + ":8080/gameplay",
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected");

        client.subscribe(`/topic/gameprogress/${gameId}`, (message) => {
          const data = JSON.parse(message.body);
          console.log(data);
          setPlayer1(data.player1.nickname);
          setPlayer2(data.player2.nickname);
          displayResponse(data);
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
      debug: (str) => {
        console.log(new Date(), str);
      },
    });

    client.activate();
  };

  const createGame = async () => {
    await refreshSessionTokenIfNeeded();

    const accessToken = localStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        url + "/game/start",
        { nickname: localStorage.getItem("username") },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setGameId(response.data.gameId);
      setPlayerType("X");
      setCurrentTurn("X");
      setPlayer1(response.data.player1.nickname);
      setPlayer2("");
      start();
      alert("Stworzyłeś grę o identyfikatorze " + response.data.gameId);
      
      // console.log(process.env.REACT_APP_AWS_ACCESS_KEY_ID);

      setGameOn(true);
    } catch (error) {
      console.log(error);
    }
  };

  const start = async () => {
    setTurns([
      ["#", "#", "#"],
      ["#", "#", "#"],
      ["#", "#", "#"],
    ]);
  };

  const connectToRandom = async () => {
    await refreshSessionTokenIfNeeded();

    const accessToken = localStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        url + "/game/connect/random",
        { nickname: localStorage.getItem("username") },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setGameId(response.data.gameId);
      setPlayerType("O");
      start();
      connectToSocket(response.data.gameId);
      alert("Rozpoczynasz swoją grę z " + response.data.player1.nickname);
      setGameOn(true);
      setPlayer1(response.data.player1.nickname);
      setPlayer2(response.data.player2.nickname);
      displayResponse(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const makeAMove = async (xCoordinate, yCoordinate) => {
    console.log("playerType" + playerType);
    console.log("currTurn" + currentTurn);

    if (!gameOn || currentTurn !== playerType) return;

    await refreshSessionTokenIfNeeded();

    const accessToken = localStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        url + "/game/gameplay",
        {
          type: playerType,
          coordinateX: xCoordinate,
          coordinateY: yCoordinate,
          gameId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      displayResponse(response.data, playerType);
    } catch (error) {
      console.log(error);
    }
  };

  const displayResponse = (data) => {
    const newTurns = turns.map((row, i) =>
      row.map((cell, j) => {
        if (data.board[i][j] === 1) return "X";
        if (data.board[i][j] === 2) return "O";
        if (data.board[i][j] === 0) return "#";
        return cell;
      })
    );
    setTurns(newTurns);
    if (data.winner) {
      alert("Wygrał " + data.winner);
      setGameOn(false);
    } else {
      setCurrentTurn(data.currentTurn);
      setGameOn(true);
    }
  };

  const handleGameIdChange = (event) => {
    setGameId(event.target.value);
  };

  return (
    <div
      style={{
        background: "#745500",
        color: "#666",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {localStorage.getItem("accessToken") ? (
        <div>
          <h1
            style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff" }}
          >
            Tic Tac Toe
          </h1>
          <table style={{ width: '100%', tableLayout: 'fixed' }}>
            <tr>
            <td style={{ textAlign: 'center' }}>
              <h1 style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff" }}>
                X
              </h1>
              <h1>{player1}</h1>
            </td>
              <td>
                <div
                  id="box"
                  style={{
                    background: "#4d3900",
                    padding: "20px",
                    borderRadius: "10px",
                    maxWidth: "350px",
                    margin: "10px auto",
                  }}
                  className="centered-container"
                >
                  <button className="button button-margin" onClick={createGame}>
                    Stwórz grę
                  </button>
                  <input
                    type="text"
                    id="gameId"
                    placeholder="Identyfikator gry"
                    value={gameId}
                    onChange={handleGameIdChange}
                    className="input-text"
                  />
                  <button className="button" onClick={connectToRandom}>
                    Dołącz do losowej gry
                  </button>
                  <ul
                    id="gameBoard"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      listStyle: "none",
                      padding: 0,
                    }}
                  >
                    {turns.map((row, i) =>
                      row.map((cell, j) => (
                        <li
                          key={`${i}-${j}`}
                          onClick={() => makeAMove(i, j)}
                          style={{
                            float: "left",
                            margin: "10px",
                            height: "70px",
                            width: "70px",
                            textAlign: "center",
                            fontSize: "50px",
                            background: "#9a7100",
                            color: "#ccc",
                            textAlign: "center",
                            borderRadius: "5px",
                          }}
                          className={
                            cell === "X" ? "x" : cell === "O" ? "o" : ""
                          }
                        >
                          {cell !== "#" ? cell : ""}
                        </li>
                      ))
                    )}
                  </ul>
                  <div className="clearfix" style={{ clear: "both" }}></div>
                </div>
              </td>

              <td style={{ textAlign: 'center' }}>
              <h1 style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff" }}>
                O
              </h1>
              <h1>{player2}</h1>
            </td>
            </tr>
          </table>
          <SignOut />
        </div>
      ) : (
        <div className="centered-container">
          {showSignUp ? (
            <>
              <SignUp />
              <button
                className="switchButton"
                onClick={() => setShowSignUp(false)}
              >
                Masz już konto? Zaloguj się
              </button>
            </>
          ) : (
            <>
              <SignIn />
              <button
                className="switchButton"
                onClick={() => setShowSignUp(true)}
              >
                Nie masz konta? Zarejestruj się
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
