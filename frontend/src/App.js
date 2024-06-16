import React, { useEffect, useState } from "react";
import "./App.css";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import SignOut from "./SignOut";
import { refreshSessionTokenIfNeeded } from "./CognitoUtils";
import GameList from "./GameList";
import RankingList from "./RankingList"; // Importujemy nowy komponent

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
  const [player1Photo, setPlayer1Photo] = useState("");
  const [player2Photo, setPlayer2Photo] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  const [currentTurn, setCurrentTurn] = useState("");
  const [showGameList, setShowGameList] = useState(false);
  const [showRankingList, setShowRankingList] = useState(false); // Nowy stan
  const [client, setClient] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);

  useEffect(() => {
    if (gameId) {
      connectToSocket(gameId);
    }
  }, [gameId]);

  const connectToSocket = (gameId) => {
    const newClient = new Client();
    newClient.configure({
      brokerURL: "ws://" + ip + ":8080/gameplay",
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected");

        const newSubscription = newClient.subscribe(
          `/topic/gameprogress/${gameId}`,
          (message) => {
            const data = JSON.parse(message.body);
            console.log(data);
            setPlayer1(data.player1.nickname);
            setPlayer1Photo(data.player1.photoURL);
            setPlayer2(data.player2.nickname);
            setPlayer2Photo(data.player2.photoURL);
            displayResponse(data);
          }
        );

        setSubscription(newSubscription);
        localStorage.setItem('gameEnded', "false");
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
      debug: (str) => {
        console.log(new Date(), str);
      },
    });

    newClient.activate();
    setClient(newClient);
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
      setPlayer1Photo(response.data.player1.photoURL);
      setPlayer2("");
      setPlayer2Photo("");
      start();
      alert("Stworzyłeś grę o identyfikatorze " + response.data.gameId);

      connectToSocket(response.data.gameId);

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
      setPlayer1Photo(response.data.player1.photoURL);
      setPlayer2(response.data.player2.nickname);
      setPlayer2Photo(response.data.player2.photoURL);

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
    if (data.winner) {
      const ended = localStorage.getItem("gameEnded");
      console.log("gameEnded: ", ended);
      if (ended === "false") {
        localStorage.setItem('gameEnded', "true");
        setGameEnded(true);
        alert("Wygrał " + data.winner);
        console.log("Wygrał " + data.winner);
        setGameOn(false);
        console.log("player1: ", player1);
        console.log("player2: ", player2);
        console.log("localStorage: ", localStorage.getItem("username"));
        if (data.winner === "X" && player1 === localStorage.getItem("username")) {
          postRankingUpdate();
        } else if (data.winner === "O" && player2 === localStorage.getItem("username")) {
          postRankingUpdate();
        }

        if (subscription) {
          subscription.unsubscribe();
        }

        if (client) {
          client.deactivate();
        }



      }
    } else {
      setCurrentTurn(data.currentTurn);
      setGameOn(true);
    }

    const newTurns = turns.map((row, i) =>
      row.map((cell, j) => {
        if (data.board[i][j] === 1) return "X";
        if (data.board[i][j] === 2) return "O";
        if (data.board[i][j] === 0) return "#";
        return cell;
      })
    );
    setTurns(newTurns);
  };

  const handleGameIdChange = (event) => {
    setGameId(event.target.value);
  };

  const showGameListHandler = () => {
    setShowGameList(true);
  };

  const showRankingListHandler = () => { // Funkcja do wyświetlania rankingów
    setShowRankingList(true);
  };

  const backToMain = () => {
    setShowGameList(false);
    setShowRankingList(false); // Powrót z rankingów
  };

  const postRankingUpdate = async () => {
    await refreshSessionTokenIfNeeded();

    const accessToken = localStorage.getItem("accessToken");

    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");

    console.log("username: ", username);
    console.log("email: ", email);

    const response = await fetch(url + "/game/invoke-lambda", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ username, email }),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Request failed: ${errorMessage}`);
    }

    const data = await response.json();
    return data;
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
        showGameList ? (
          <GameList backToMain={backToMain} />
        ) : showRankingList ? ( // Wyświetlanie rankingów
          <RankingList backToMain={backToMain} />
        ) : (
          <div>
            <h1
              style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff" }}
            >
              Tic Tac Toe
            </h1>
            <table style={{ width: "100%", tableLayout: "fixed" }}>
              <tr>
                <td style={{ textAlign: "center" }}>
                  <h1
                    style={{
                      fontFamily: "'Press Start 2P', cursive",
                      color: "#fff",
                    }}
                  >
                    X
                  </h1>
                  <h1>{player1}</h1>
                  {player1Photo && (
                    <img
                      src={player1Photo}
                      alt={`${player1}'s profile`}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  )}
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
                    <button
                      className="button button-margin"
                      onClick={createGame}
                    >
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

                <td style={{ textAlign: "center" }}>
                  <h1
                    style={{
                      fontFamily: "'Press Start 2P', cursive",
                      color: "#fff",
                    }}
                  >
                    O
                  </h1>
                  <h1>{player2}</h1>
                  {player2Photo && (
                    <img
                      src={player2Photo}
                      alt={`${player2}'s profile`}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </td>
              </tr>
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  <div className="button-container">
                    <SignOut />
                    <button
                      className="logoutButton"
                      onClick={showGameListHandler}
                    >
                      Lista gier
                    </button>
                    <button
                      className="logoutButton"
                      onClick={showRankingListHandler} // Ustawiamy wyświetlanie rankingów
                    >
                      Rankingi
                    </button>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        )
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
