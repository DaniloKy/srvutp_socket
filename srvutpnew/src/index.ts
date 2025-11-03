
import Env from './Env';

export { WebServerV2 } from './WebServerV2';

export { LobbyV2 } from './LobbyV2.js';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, GET, HEAD, OPTIONS"
}

export default {
  async fetch(request: Request, env: Env) {
    try {
      if(request.method === "OPTIONS"){
        return handleOptions(request);
      }
      if(request.method === "HEAD"){
        return new Response(null, {status: 200});
      }else{
        return await handleRequest(request, env);
      }
    } catch (e) {
      return new Response(`${e}`);
    }
  }
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  console.log("handle!")
  try {
    const url = new URL(request.url);
    const [ path, ...segments ] = url.pathname.slice(1).split('/');
    /*console.log(request.method, request.headers.get('Authorization'), env.TOKEN);
    console.log("AUTH TOKEN: ", request.headers.get('Authorization') == env.TOKEN);
    if(request.headers.get('Authorization') != env.TOKEN){
      return new Response(null, {
        status: 401,
      });
    }*/
    
    if(path === "ws"){
      const stub = env.WEBSERVER_V2.get(env.WEBSERVER_V2.idFromName("srv_utp"));
      const res = await stub.fetch(request);
      return res;
    }else if(path === "classes"){
      if(request.method === "GET"){
        if(segments[0] == null){
          const { results } = await env.MY_DB.prepare('SELECT * FROM `classes`').all();
          return Response.json(results);
        }else{
          if(url.searchParams.get('name') == "true"){
            const result = await env.MY_DB.prepare('SELECT * FROM `classes` WHERE `name_compiled`= ?1;').bind(segments[0]).first();
            return Response.json(result);
          }else{
            const result = await env.MY_DB.prepare('SELECT * FROM `classes` WHERE `id`=?1;').bind(segments[0]).first();
            return Response.json(result);
          }
        }
      }else if(request.method === "POST"){
        var body: any = await request.json();
        const { success, error } = await env.MY_DB.prepare('INSERT INTO `classes` (name, name_compiled, tiny_description, description) values(?1, ?2, ?3, ?4);').bind(body.name, body.name_compiled, body.tiny_description, body.description).run();
        console.log(success, error);
        return success? new Response(null, { status: 204 }) : handleRtrErr(error);
      }
    }else if(path === "character"){
      if(request.method === "GET"){
        const selectInner = "SELECT * FROM `players` INNER JOIN `player_stats` on `players`.`stats_id` = `player_stats`.`stats_id` ";
        if(segments[0] == null){
          const { results } = await env.MY_DB.prepare(selectInner).all();
          return Response.json(results);
        }else if(segments[0] == "belong_to"){
          const where = "WHERE `belong_to`= ?1";
          const { results } = await env.MY_DB.prepare(selectInner+where+';').bind(segments[1]).all();
          console.log(results);
          return Response.json(results);
        }else{
          if(url.searchParams.get('username') == "true"){
            const where = "WHERE `username`= ?1 ";
            const result = await env.MY_DB.prepare(selectInner+where+'LIMIT 1;').bind(segments[0]).first();
            return Response.json(result);
          }else{
            const mySelectInner = "SELECT `players`.*, `player_stats`.*, `classes`.`id` as class_id, `classes`.*, `players`.`id`  FROM `players` INNER JOIN `player_stats` on `players`.`stats_id` = `player_stats`.`stats_id` ";
            const innerClass = "INNER JOIN `classes` on `players`.`class_name` = `classes`.`name_compiled` ";
            const where = "WHERE `players`.`id`= ?1 AND `players`.`belong_to`= ?2 ";
            const result = await env.MY_DB.prepare(mySelectInner+innerClass+where+'LIMIT 1;').bind(segments[0], segments[1]).first();
            console.log(result);
            return Response.json(result);
          }
        }
      }else if(request.method === "POST"){
        var body: any = await request.json();
        var playerStatsId: any = await createPlayerStats();
        const { success, error } = await env.MY_DB.prepare('INSERT INTO `players` (`belong_to`, `username`, `class_name`, `stats_id`) VALUES(?1, ?2, ?3, ?4);').bind(body.belong_to, body.username, body.class_name, playerStatsId).run();
        console.log(success, error);
        return success? new Response(null, { status: 204 }) : handleRtrErr(error);
      }else if(request.method === "DELETE"){
        if(segments[0] != null && segments[1] != null){
          const { success, error } = await env.MY_DB.prepare('DELETE FROM `players` WHERE `belong_to` = ?1 AND `username` = ?2;').bind(segments[0], segments[1]).run();
          console.log(success, error);
          return success? new Response(null, { status: 204 }) : handleRtrErr(error);
        }
      }
    }else if(path == "lobby"){
      if(request.method === "GET"){
        if(segments[0] == "update"){
          const stub = env.LOBBY_V2.get(env.LOBBY_V2.idFromName("srv"));
          const res = await stub.fetch(request);
          return res;
        }
      }else if(request.method === "POST"){
        const stub = env.LOBBY_V2.get(env.LOBBY_V2.idFromName("srv"));
        const res = await stub.fetch(request);
        return res;
      }
    }
    return new Response("Not Found", {
        status: 404,
        statusText: "Not Found",
    });
  
  } catch (e) {
    if (request.headers.get("Upgrade") === "websocket") {
      const [client, server] = Object.values(new WebSocketPair());

      server.accept();
      server.send(JSON.stringify({error: `${e}`}));
      server.close(1011, "Uncaught exception during session setup");

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response(`${e}`, {
        status: 500,
        statusText: `Internal Server Error: ${e}`,
    });
  }

  async function createPlayerStats(){
    try{
      await env.MY_DB.prepare('INSERT INTO `player_stats`(`kills`) VALUES(0);').run();
      const result:any = await env.MY_DB.prepare('SELECT LAST_INSERT_ROWID() as lastId').first();
      return result.lastId;
    }catch(e){
      return new Response(`${e}`, {
        status: 500,
        statusText: `Internal Server Error: ${e}`,
      });
    }
  }

}

async function handleRtrErr(e: any): Promise<Response> {
  let error = "Internal Error";

  if (e instanceof Error) {
    error += `:\t${e.toString()} --- ${e.stack}`;
  }

  return new Response(error, {
    status: 500,
    headers: new Headers({
      "Content-Type": "text/plain",
    }),
  });
}

function handleOptions(request: Request) {
  if (request.headers.get("Origin") !== null &&
      request.headers.get("Access-Control-Request-Method") !== null &&
      request.headers.get("Access-Control-Request-Headers") !== null) {
      // Handle CORS pre-flight request.
      return new Response(null, {
          headers: corsHeaders
      })
  } else {
      // Handle standard OPTIONS request.
      return new Response(null, {
          headers: {
              "Allow": "GET, HEAD, POST, OPTIONS",
          }
      })
  }
}
