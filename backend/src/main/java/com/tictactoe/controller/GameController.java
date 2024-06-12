package com.tictactoe.controller;

import com.tictactoe.controller.dto.ConnectRequest;
import com.tictactoe.exception.GameNotFoundException;
import com.tictactoe.exception.InvalidGameException;
import com.tictactoe.exception.InvalidParamException;
import com.tictactoe.model.Game;
import com.tictactoe.model.GamePlay;
import com.tictactoe.model.Player;
import com.tictactoe.model.Status;
import com.tictactoe.service.GameService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.*;
import org.springframework.security.core.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

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

    @PostMapping("/connect")
    public ResponseEntity<Game> connect(@RequestBody ConnectRequest connectRequest) throws InvalidParamException, InvalidGameException {
        log.info("connect request: {}", connectRequest);
        return ResponseEntity.ok(gameService.connectToGame(connectRequest.getPlayer(), connectRequest.getGameId()));
    }

    @PostMapping("/connect/random")
    public ResponseEntity<Game> connectRandom(@RequestBody Player player) throws GameNotFoundException {
        log.info("connect random {}", player);
        return ResponseEntity.ok(gameService.connectToRandomGame(player));
    }

    @PostMapping("/gameplay")
    public ResponseEntity<Game> gamePlay(@RequestBody GamePlay gamePlayRequest) throws InvalidGameException, GameNotFoundException {
        log.info("gameplay: {}", gamePlayRequest);
        Game game = gameService.gamePlay(gamePlayRequest);
        simpMessagingTemplate.convertAndSend("/topic/gameprogress/" + game.getGameId(), game);
        return ResponseEntity.ok(game);
    }
}
