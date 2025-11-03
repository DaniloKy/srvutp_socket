import Game from "./Game"

import Player from "./Player";

import Env from './Env';

type Splayer = {
  socket: WebSocket,
  player: Player
}

type updatePlayer = {
  playerName: string,
  gameWon: boolean,
  kills: number,
  points: number
}

export class WebServerV2 implements DurableObject {
  
  game: Game;
  state: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.game = new Game();
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    const path = url.pathname.slice(1).replace(/^ws/, "").slice(1);

    if (!path) {
      const upgradeHeader = request.headers.get("Upgrade");

      if (!upgradeHeader || upgradeHeader !== "websocket")
        return new Response("Expected Upgrade: websocket", {
          status: 426,
          statusText: "Upgrade Required",
          headers: { 'content-type': 'text/plain' },
        });

      return this.createWebSocketPair();
    }
    return new Response(null, {
      status: 400,
    });
  }

  async createWebSocketPair(): Promise<Response> {
    const [client, server] = Object.values(new WebSocketPair());

    await this.handleServerSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  handleServerSocket(socket: WebSocket) {

    socket.accept();

    let player: Player;
    let Splayer: Splayer;
    let id: string;
    
    do {
      id = Math.round(Math.random() * 0xffffff).toString(16);
      while (id.length < 6) id = `0${id}`;
    } while (this.game.getPlayer(id));

    socket.addEventListener("close", message => {
      if (message.wasClean)
        console.log(`[close] Connection closed cleanly, code=${message.code} reason=${message.reason}`);
      else
        console.log("[close] Connection died");
      const res = {
          type: "disconnect",
          response: {
            id
          }
      }

      this.broadcast(socket, res, this.game.queue);
      this.broadcast(socket, res, this.game.players);
      this.game.removeFromQueue(id);
      this.game.removePlayer(id);
      if(this.game.checkIfEnd()){
        const gameEnded = {
          type: "gameEnded",
          response: {}
        }
        this.broadcast(socket, gameEnded, this.game.queue, true);
        const lastPlayer = this.game.getLast();
        if(lastPlayer != null){
          const endPoints = this.game.calculatePoints(true, lastPlayer.player.kills, false);
          const gameEnd = {
            type: "youWon",
            response: {
              kills: lastPlayer.player.kills,
              points: endPoints,
            }
          }
          lastPlayer.socket.send(JSON.stringify(gameEnd));
          this.updatePlayerCareer({
            playerName: lastPlayer.player.name,
            gameWon: true,
            kills: lastPlayer.player.kills,
            points: endPoints,
          });
        }
      }
    });

    socket.addEventListener("error", message => {
      console.log(`[error] ${message.message}`);
    });

    socket.addEventListener("message", async (message: MessageEvent) => {

      const { action, body } = JSON.parse(message.data.toString());

      if(action === "connected"){

        console.log("MESSAGE CONNECTED", body.player_info.level)

        player = new Player(id, body.player_info.name, body.player_info.class_name, body.player_info.level);

        Splayer = {
          socket,
          player
        }

        this.game.addToQueue(id, Splayer);

        const playersInQueue = [...this.game.queue.values()];
        const res = {
          type: "connected",
          response: {
            me: player,
            users: playersInQueue.map(i => i.player).filter(x => x != player),
          }
        }
        socket.send(JSON.stringify(res));

        const res_ = {
          type: "connection",
          response: {
            player
          }
        }
        this.broadcast(socket, res_, this.game.queue);

        if(this.game.midGame){
          const playersInGame = [...this.game.players.values()].map(i => i.player);

          const midGame = {
            type: "midGame",
            response: {
              users: playersInGame
            }
          }
          socket.send(JSON.stringify(midGame));
        
        }else if(!this.game.midGame && this.game.checkIfStart()){
          this.game.midCountDown = true;
          const startCount = {
            type: "gameStarting",
            response: {}
          }
          this.broadcast(socket, startCount, this.game.queue, true);

          await new Promise<void>((resolve) => {
            setTimeout(
              () => {
                if(!this.game.midGame && this.game.checkIfStart()){
                  this.game.startGame();
                  const startGame = {
                    type: "startGame",
                    response: {
                      users: [...this.game.players.values()].map(i => i.player),
                    }
                  }
                  this.broadcast(socket, startGame, this.game.players, true);
                }
                resolve();
              },
              this.game.COUNT_DOWN * 1000
            );
          });          
        }

      }else if(action === "update"){

        Splayer.player.currentState = body.player_info.currentState;
        Splayer.player.pos_axis = body.player_info.pos;
        this.game.updatePlayer(body.player_info.id, Splayer);

        const users = [...this.game.players.values()];
        const res = {
          type: "update",
          response: {
            users: users.map(i => i.player).filter(x => x != player),
          }
        }
        socket.send(JSON.stringify(res));

      }else if(action === "click"){

        const radians = Math.atan2(body.mouse.y, body.mouse.x);

        const distance = 75;
        const endX = player.pos_axis.x + distance * Math.cos(radians);
        const endY = player.pos_axis.y + distance * Math.sin(radians);

        const {died, Splayer} = this.game.checkHit(player, endX, endY);
        if(died && Splayer){
          const playerId = Splayer.player.getId();
          const died = {
            type: "playerDied",
            response: {
                playerId: playerId,
            }
          }
          this.broadcast(socket, died, this.game.players, true);
          const playerPoints = this.game.calculatePoints(true, Splayer.player.kills, false);
          const lost = {
            type: "youLost",
            response: {
                kills: Splayer.player.kills,
                points: playerPoints,
            }
          }
          Splayer.socket.send(JSON.stringify(lost));
          this.updatePlayerCareer({
            playerName: Splayer.player.name,
            gameWon: false,
            kills: Splayer.player.kills,
            points: playerPoints,
          });
          this.game.removePlayer(playerId);
          if(this.game.checkIfEnd()){
            const gameEnded = {
              type: "gameEnded",
              response: {}
            }
            this.broadcast(socket, gameEnded, this.game.queue, true);
            const lastPlayer = this.game.getLast();
            if(lastPlayer != null){
              const winnerPoints = this.game.calculatePoints(true, lastPlayer.player.kills, true)
              const win = {
                type: "youWon",
                response: {
                    kills: lastPlayer.player.kills,
                    points: winnerPoints,
                }
              }
              lastPlayer.socket.send(JSON.stringify(win));
              this.updatePlayerCareer({
                playerName: lastPlayer.player.name,
                gameWon: true,
                kills: lastPlayer.player.kills,
                points: winnerPoints,
              });
            }
          }
        }
      }
    });
  }

  async broadcast(socket: WebSocket, send_response: Object, list: Map<string, Splayer>,  sendToAll: boolean = false){

    const players = list.values();

    for (const i of players){
        if(sendToAll)
          i.socket.send(JSON.stringify(send_response));
        else
          if(i.socket != socket)
              i.socket.send(JSON.stringify(send_response));
    }
  }
  async updatePlayerCareer(gameEnd: updatePlayer){
    console.log("gameEnd", gameEnd);
    const selectInner = "SELECT * FROM `players` INNER JOIN `player_stats` on `players`.`stats_id` = `player_stats`.`stats_id` ";
    const where = "WHERE `players`.`username`= ?1";
    console.log("prepare", selectInner+where+';');
    const result: any = await this.env.MY_DB.prepare(selectInner+where+';').bind(gameEnd.playerName).first();
    if(result){
      this.updateLevel(gameEnd, result);
      this.updateStats(gameEnd, result);
    }
  }
  async updateLevel(gameEnd: updatePlayer, result: any){
    const playerId = result.id;
    var level = result.level;
    var xp = result.xp;
    var xpToLvl = result.xpToLvl;
    const NEWXP = xp + gameEnd.points;
    if(NEWXP >= result.xpToLvl){
      xp = 0;
      level += 1;
      xpToLvl += xpToLvl*0.5;
    }else{
      xp += gameEnd.points;
    }

    const updateXp = "UPDATE `players` SET ";
    const values = `level = ${level}, xp = ${xp}, xpToLvl = ${xpToLvl} `;
    const where = "WHERE `players`.`id`= ?1 ";
    console.log(updateXp+values+where+';');
    const { success, error } = await this.env.MY_DB.prepare(updateXp+values+where+';').bind(playerId).run();
    console.log(success, error);
  }
  async updateStats(gameEnd: updatePlayer, result: any){
    const playerStatsId = result.stats_id;
    const plusKills = result.kills += gameEnd.kills;
    const plusGame = result.games_played += 1;
    var plusGameLost = result.games_lost;
    var plusDeath = result.deaths;
    var plusGameWon = result.games_won;
    if(!gameEnd.gameWon){
      plusGameLost += 1;
      plusDeath += 1;
    }else{
      plusGameWon += 1;
    }
    const updateStats = "UPDATE `player_stats` SET ";
    const values = `kills = ${plusKills}, deaths = ${plusDeath}, games_played = ${plusGame}, games_won = ${plusGameWon}, games_lost = ${plusGameLost} `;
    const where_ = "WHERE `player_stats`.`stats_id`= ?1 ";
    const { success, error } = await this.env.MY_DB.prepare(updateStats+values+where_+';').bind(playerStatsId).run();
    console.log(success, error);
  }


}
