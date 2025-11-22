
import Player from "./Player";

type Splayer = {
    socket: WebSocket,
    player: Player
}

type CheckDied = {
    died: boolean,
    Splayer?: Splayer
}

export default class Game{
    mapSize = {
        width: 2560,
        height: 2560
    }
    SWORD_REACH_WIDTH = 30;
    SWORD_REACH_HEIGHT = 20;

    POINT_PER_PLAY = 25;
    POINTS_PER_KILL = 50;
    POINTS_POR_WIN = 100;

    COUNT_DOWN = 10;
    count_down;
    players: Map<string, Splayer>;
    queue: Map<string, Splayer>;
    MIN_TO_START = 2;
    midGame;
    midCountDown;
    start_game;
    countDownStarted;
    countdownTime: any;

    constructor(){
        this.count_down = this.COUNT_DOWN*1;
        this.countDownStarted = false;
        this.midGame = false;
        this.midCountDown = false;
        this.start_game = false;
        this.players = new Map();
        this.queue = new Map();
        this.countdownTime = null;
    }

    getPlayer(playerId: string){
        return this.players.get(playerId);
    }

    updatePlayer(playerId: string, Splayer: Splayer){
        this.players.set(playerId, Splayer)
    }

    addPlayer(playerId: string, Splayer: Splayer){
        this.players.set(playerId, Splayer)
    }

    removePlayer(playerId: string){
        this.players.delete(playerId);
    }

    addToQueue(playerId: string, Splayer: Splayer){
        this.queue.set(playerId, Splayer)
    }

    removeFromQueue(playerId: string){
        this.queue.delete(playerId);
    }

    checkIfStart() {
        if(this.players.size <= 0)
            this.midGame = false;
        if (this.queue.size >= this.MIN_TO_START) {
            return this.start_game = true;
        } else {
            return this.start_game = false;
        }
    }

    checkIfEnd(): boolean {
        console.log("CHECK IF END", this.players.size)
        if(this.players.size <= 1){
            this.endGame();
            return true;
        }
        return false;
    }

    endGame(){
        this.midGame = false;
        for(const [id] of [...this.queue.entries()]){
            this.removePlayer(id);
        }
    }
    getLast(): Splayer|null{

        for(const Splayer of this.players.values()){
            return Splayer;
        }
        return null;
    }

    startGame(){
        this.midGame = true;
        for(const [id, Splayer] of [...this.queue.entries()]){
            this.addPlayer(id, Splayer);
            this.removeFromQueue(id);
        }

        const users = [...this.players.values()];
        for(const player of users.map(i => i.player)){
            player.pos_axis = this.randomizeLocations();
        }
    }

    calculatePoints(play: boolean, kills?: number, win?: boolean): number{
        var points = 0;
        console.log(kills)
        if(play)
            points += this.POINT_PER_PLAY;
        if(kills)
            points +=  kills * this.POINTS_PER_KILL;
        if(win)
            points += this.POINTS_POR_WIN;
        return points;
    }

    randomizeLocations(){
        const x = Math.random()*(this.mapSize.width / 3) + (this.mapSize.width / 3);
        const y = Math.random()*(this.mapSize.height / 3) + (this.mapSize.height / 3);
        return {x, y}
    }

    checkHit(player: Player, endX: number, endY: number): CheckDied{
        
        const player_id = player.getId();

        const MIN_X = endX - this.SWORD_REACH_WIDTH;
        const MAX_X = endX + this.SWORD_REACH_WIDTH
        const MIN_Y = endY - this.SWORD_REACH_HEIGHT;
        const MAX_Y = endY + this.SWORD_REACH_WIDTH
        
        for(const [id, Splayer] of [...this.players.entries()]){
            if(id != player_id){
                if(MIN_X <= Splayer.player.pos_axis.x && Splayer.player.pos_axis.x <= MAX_X && MIN_Y <= Splayer.player.pos_axis.y && Splayer.player.pos_axis.y <= MAX_Y){
                    console.log("HIT!!!")
                    const alive = Splayer.player.takeHit(player.melee_damage);
                    if(alive){
                        const res = {
                            type: "takeHit",
                            response: {
                                newHP: Splayer.player.currentHp,
                            }
                        }
                        Splayer.socket.send(JSON.stringify(res));
                        return {died: false};
                    }else{
                        player.addKill();
                        return {died: true, Splayer: Splayer};
                    }
                }
            }
        }
        return {died: false};

    }

}