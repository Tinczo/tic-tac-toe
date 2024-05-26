package com.tictactoe.service;

import com.tictactoe.exception.InvalidGameException;
import com.tictactoe.exception.InvalidParamException;
import com.tictactoe.exception.GameNotFoundException;
import com.tictactoe.model.*;
import com.tictactoe.storage.GameStorage;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class GameService {
    public Game createGame(Player player){
        Game game = new Game();
        game.setBoard(new int[3][3]);
        game.setGameId(UUID.randomUUID().toString());
        game.setPlayer1(player);
        game.setStatus(GameStatus.NEW);
        GameStorage.getInstance().setGame(game);
        return game;
    }

    public Game connectToGame(Player player2, String gameId) throws InvalidParamException, InvalidGameException {
        if(!GameStorage.getInstance().getGames().containsKey(gameId)){
            throw new InvalidParamException("Game with provided ID does not exist!");
        }
        Game game = GameStorage.getInstance().getGames().get(gameId);

        if (game.getPlayer2() != null){
            throw new InvalidGameException("Game is not valid anymore!");
        }

        game.setPlayer2(player2);
        game.setStatus(GameStatus.IN_PROGRESS);
        GameStorage.getInstance().setGame(game);
        return game;
    }

    public Game connectToRandomGame(Player player2) throws GameNotFoundException {
        Game game = GameStorage.getInstance().getGames().values().stream()
                .filter(it->it.getStatus().equals(GameStatus.NEW))
                .filter(it -> !it.getPlayer1().equals(player2))
                .findFirst()
                .orElseThrow(() -> new GameNotFoundException("Game not found!"));

        game.setPlayer2(player2);
        game.setStatus(GameStatus.IN_PROGRESS);
        GameStorage.getInstance().setGame(game);
        game.setCurrentTurn("X");
        return game;
    }

    public Game gamePlay(GamePlay gamePlay) throws GameNotFoundException, InvalidGameException {
        if(!GameStorage.getInstance().getGames().containsKey(gamePlay.getGameId())){
            throw new GameNotFoundException("Game not found!");
        }

        Game game = GameStorage.getInstance().getGames().get(gamePlay.getGameId());

        if(game.getStatus().equals(GameStatus.FINISHED)){
            throw new InvalidGameException("Game is already finished!");
        }

        int [][] board = game.getBoard();
        board[gamePlay.getCoordinateX()][gamePlay.getCoordinateY()] = gamePlay.getType().getValue();

        Boolean xWinner = checkWinner(game.getBoard(), TicTacToeSymbols.X);
        Boolean oWinner = checkWinner(game.getBoard(), TicTacToeSymbols.O);

        if(xWinner)
        {
            game.setWinner(TicTacToeSymbols.X);
            game.getPlayer1().setScore(1);
            game.getPlayer2().setScore(0);
        }
        else if (oWinner)
        {
            game.setWinner(TicTacToeSymbols.O);
            game.getPlayer1().setScore(0);
            game.getPlayer2().setScore(1);
        }

        String turn;
        if(game.getCurrentTurn().equals("O")) {
            turn = "X";
        }
        else {
            turn = "O";
        }
        game.setCurrentTurn(turn);

        GameStorage.getInstance().setGame(game);

        return game;
    }

    private Boolean checkWinner(int[][] board, TicTacToeSymbols ticTacToeSymbols) {
        int [] boardArray = new int[9];
        int boardArrayIndex = 0;
        for (int[] ints : board) {
            for (int anInt : ints) {
                boardArray[boardArrayIndex] = anInt;
                boardArrayIndex++;
            }
        }

        int [][] winningCombinations = {{0, 1, 2}, {3, 4, 5}, {6, 7, 8},
                {0, 3, 6}, {1, 4, 7}, {2, 5, 8},
                {0, 4, 8}, {2, 4, 6}};

        for (int[] winningCombination : winningCombinations) {
            int counter=0;
            for (int i : winningCombination) {
                if (boardArray[i] == ticTacToeSymbols.getValue()) {
                    counter++;
                    if (counter == 3) {
                        return true;
                    }
                }
            }
        }
        return false;
    }


}
