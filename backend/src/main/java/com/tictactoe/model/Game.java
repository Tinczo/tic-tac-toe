package com.tictactoe.model;

import lombok.Data;

@Data
public class Game {
    private String gameId;
    private Player player1;
    private Player player2;
    private GameStatus status;
    private int[][] board;
    private TicTacToeSymbols winner;
    private String currentTurn;
}
