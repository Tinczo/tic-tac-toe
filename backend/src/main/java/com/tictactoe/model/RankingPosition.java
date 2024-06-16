package com.tictactoe.model;


import lombok.Data;

@Data
public class RankingPosition {
    private String player;
    private int wins;
    private int position;
}
