package com.tictactoe.model;


import lombok.Data;

@Data
public class FinishedGame {
    private String gameId;
    private String player1;
    private String player2;
    private String winner;
}
