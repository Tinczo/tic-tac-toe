package com.tictactoe.model;

import lombok.Data;

@Data
public class Player {
    private String nickname;
    private String photoURL;
    private int score;
}
