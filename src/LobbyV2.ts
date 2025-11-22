
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
};

import Env from "./Env";

export class LobbyV2 implements DurableObject {
    state: DurableObjectState;
    env: Env;
    online: Map<string, any>;

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.env = env;
        this.online = new Map();
    }

    async fetch(request:Request) {
        if (request.method == "POST") {
            const res = await this.handlePost(request);
            return new Response(JSON.stringify(res), {
                headers: corsHeaders,
            });
        } else {
            const res = await this.handleGet();
            return new Response(JSON.stringify(res), {
                headers: corsHeaders,
            });
        }
    }

    async handlePost(request:Request) {
        const url = new URL(request.url);
        const [ path, ...segments ] = url.pathname.slice(1).split('/');
        if(segments[0] == "connection"){
            const body:any = await request.json();
            this.online.set(body.username, body.timestamp);

            var res = {
            "type": "connection",
                "response": {
                    online: [...this.online.keys()],
                }
            }
            return res;

        }else if(segments[0] == "update"){
            this.checkTimeout();
            const body:any = await request.json();
            this.online.set(body.username, body.timestamp);

            var res = {
            "type": "connection",
                "response": {
                    online: [...this.online.keys()],
                }
            }
            return res;
        }
    }

    async handleGet() {

        var res = {
          "type": "update",
          "response": {
            online: [...this.online.keys()],
          }
        }

        return res;

    }

    async checkTimeout(){
        const timestamp_interval = 60;
        const currTime = +new Date();

        var iterator = this.online.entries()
        var player;
        while(player = iterator.next().value){
            const playerTime = +new Date(`${player[1]}`);
            if(playerTime != null){
                if(currTime - playerTime > (timestamp_interval)*1000){
                    console.log(player[0], "AFK DISCONENCT")
                    this.online.delete(player[0]);
                }
            }
        }
    }

}