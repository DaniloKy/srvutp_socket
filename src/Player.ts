type pos_axis = {
    x: number,
    y: number
};
export default class Player{
    id: string;
    name: string;
    my_class: string;
    level: number;
    currentHp: number;
    maxHp: number = 100;
    melee_damage: number = 20;
    walk_vel: number = 2.5;
    kills: number;
    points: number;

    pos_axis :pos_axis = {
        x: 0,
        y: 0,
    };

    currentState: string = "idle";

    constructor(id: string, name: string, my_class: string, level: number){
        this.id = id;
        this.name = name;
        this.my_class = my_class;
        this.level = level;
        this.points = 0;
        this.kills = 0;
        this.whoAmI(my_class);
        this.currentHp = this.maxHp;
    }

    getId(){
        return this.id;
    }

    whoAmI(player_class: string){
        const multiplier: number = this.level*2
        switch(player_class){
            case "fighter":
                this.maxHp = 110 + multiplier;
                this.melee_damage = 40 + + multiplier;
                this.walk_vel *= 2;
                break;
            case "archer":
                this.maxHp = 90 + multiplier;
                this.melee_damage = 20 + multiplier;
                this.walk_vel *= 3;
                break;
            case "mage":
                this.maxHp = 100 + multiplier;
                this.melee_damage = 30 + multiplier;
                this.walk_vel *= 2.5;
                break;
        }
    }

    addKill(){
        this.kills++;
    }

    takeHit(damage: number){
        this.currentHp -= damage;
        if(this.currentHp > 0)
            return true;
        return false;
    }

}