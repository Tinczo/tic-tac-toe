package com.tictactoe.controller;

import com.tictactoe.controller.dto.ConnectRequest;
import com.tictactoe.exception.GameNotFoundException;
import com.tictactoe.exception.InvalidGameException;
import com.tictactoe.exception.InvalidParamException;
import com.tictactoe.model.*;
import com.tictactoe.service.GameService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Slf4j
@AllArgsConstructor
@RequestMapping("/game")
@CrossOrigin("*")
public class GameController {
    private final GameService gameService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @PostMapping("/start")
    public ResponseEntity<Game> start(@RequestBody Player player){
        log.info("start game request: {}", player);
        return ResponseEntity.ok(gameService.createGame(player));
    }

    @PostMapping("/connect/random")
    public ResponseEntity<Game> connectRandom(@RequestBody Player player) throws GameNotFoundException {
        log.info("connect random {}", player);
        Game game = gameService.connectToRandomGame(player);
        log.info("Player 1 photo: {}", game.getPlayer1().getPhotoURL());
        log.info("Player 2 photo: {}", game.getPlayer2().getPhotoURL());
        simpMessagingTemplate.convertAndSend("/topic/gameprogress/" + game.getGameId(), game);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/connect")
    public ResponseEntity<Game> connect(@RequestBody ConnectRequest connectRequest) throws InvalidParamException, InvalidGameException {
        log.info("connect request: {}", connectRequest);
        Game game = gameService.connectToGame(connectRequest.getPlayer(), connectRequest.getGameId());
        simpMessagingTemplate.convertAndSend("/topic/gameprogress/" + game.getGameId(), game);
        return ResponseEntity.ok(game);
    }

    @GetMapping("/list")
    public ResponseEntity<List<FinishedGame>> listGames() {
        List<FinishedGame> finishedGames = gameService.listFinishedGames();
        log.info("list games: {}", finishedGames);
        return ResponseEntity.ok(finishedGames);
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<RankingPosition>> ranking() {
        List<RankingPosition> rankings = gameService.ranking();
        log.info("list games: {}", rankings);
        return ResponseEntity.ok(rankings);
    }

    @PostMapping("/gameplay")
    public ResponseEntity<Game> gamePlay(@RequestBody GamePlay gamePlayRequest) throws InvalidGameException, GameNotFoundException {
        log.info("gameplay: {}", gamePlayRequest);
        Game game = gameService.gamePlay(gamePlayRequest);
        simpMessagingTemplate.convertAndSend("/topic/gameprogress/" + game.getGameId(), game);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/invoke-lambda")
    public ResponseEntity<?> invokeLambda(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String email = payload.get("email");

        gameService.invokeLambda(username, email);

        return ResponseEntity.ok("Lambda invoked successfully");
    }
}
