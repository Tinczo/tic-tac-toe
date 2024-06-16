package com.tictactoe.service;

import com.tictactoe.exception.GameNotFoundException;
import com.tictactoe.exception.InvalidGameException;
import com.tictactoe.exception.InvalidParamException;
import com.tictactoe.model.*;
import com.tictactoe.storage.GameStorage;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import java.time.Duration;
import java.util.*;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@AllArgsConstructor
public class GameService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    private DynamoDbClient dynamoDbClient;

    public Game createGame(Player player){
        player.setPhotoURL(getPhotoUrl(player.getNickname()));
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

        player2.setPhotoURL(getPhotoUrl(player2.getNickname()));
        game.setPlayer2(player2);
        game.setStatus(GameStatus.IN_PROGRESS);
        GameStorage.getInstance().setGame(game);
        return game;
    }

    public Game connectToRandomGame(Player player2) throws GameNotFoundException {
        Game game = GameStorage.getInstance().getGames().values().stream()
                .filter(it -> it.getStatus().equals(GameStatus.NEW))
                .filter(it -> !it.getPlayer1().equals(player2))
                .findFirst()
                .orElseThrow(() -> new GameNotFoundException("Game not found!"));

        player2.setPhotoURL(getPhotoUrl(player2.getNickname()));
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
            saveGameResult(game.getGameId(), game.getPlayer1().getNickname(), game.getPlayer2().getNickname(), game.getPlayer1().getNickname());
        }
        else if (oWinner)
        {
            game.setWinner(TicTacToeSymbols.O);
            game.getPlayer1().setScore(0);
            game.getPlayer2().setScore(1);
            saveGameResult(game.getGameId(), game.getPlayer1().getNickname(), game.getPlayer2().getNickname(), game.getPlayer2().getNickname());
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

    private String getPhotoUrl(String nickname) {
//        String bucketName = System.getenv("REACT_APP_S3_BUCKET_NAME"); //TODO:
        String bucketName = "tic-tac-toe-266586";
         try {
             GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                     .bucket(bucketName)
                     .key(nickname)
                     .build();

             GetObjectPresignRequest getObjectPresignRequest = GetObjectPresignRequest.builder()
                     .signatureDuration(Duration.ofMinutes(10))
                     .getObjectRequest(getObjectRequest)
                     .build();

             PresignedGetObjectRequest presignedGetObjectRequest = s3Presigner.presignGetObject(getObjectPresignRequest);
             String photoUrl = presignedGetObjectRequest.url().toString();
             return photoUrl;
         } catch (Exception e) {
             // Ignorujemy wyjątek, próbujemy następne rozszerzenie
         }
        return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOwRConBYl2t6L8QMOAQqa5FDmPB_bg7EnGA&s"; // Zwraca null jeśli żadne z rozszerzeń nie pasuje
    }

    public void saveGameResult(String gameId, String player1, String player2, String winner) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("GameId", AttributeValue.builder().s(gameId).build());
        item.put("Player1", AttributeValue.builder().s(player1).build());
        item.put("Player2", AttributeValue.builder().s(player2).build());
        item.put("Winner", AttributeValue.builder().s(winner).build());
        log.info("Saving game result to DynamoDB: " + item);

        PutItemRequest request = PutItemRequest.builder()
//                .tableName(System.getenv("REACT_APP_DYNAMO_NAME")) //TODO:
                .tableName("GameScores")
                .item(item)
                .build();

        dynamoDbClient.putItem(request);
    }

    public List<FinishedGame> listFinishedGames() {
        ScanRequest scanRequest = ScanRequest.builder()
//                .tableName(System.getenv("REACT_APP_DYNAMO_NAME")) //TODO:
                .tableName("GameScores")
                .build();

        ScanResponse scanResponse = dynamoDbClient.scan(scanRequest);
        List<FinishedGame> finishedGames = new ArrayList<>();

        for (Map<String, software.amazon.awssdk.services.dynamodb.model.AttributeValue> item : scanResponse.items()) {
            FinishedGame finishedGame = new FinishedGame();
            finishedGame.setGameId(item.get("GameId").s());
            finishedGame.setPlayer1(item.get("Player1").s());
            finishedGame.setPlayer2(item.get("Player2").s());
            finishedGame.setWinner(item.get("Winner").s());
            finishedGames.add(finishedGame);
        }

        return finishedGames;
    }
}
