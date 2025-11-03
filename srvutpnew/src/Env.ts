export default interface Env{
    readonly TOKEN: string;
    readonly MY_DB: D1Database;
    readonly LOBBY_V2: DurableObjectNamespace 
    readonly WEBSERVER_V2: DurableObjectNamespace 
    readonly MAIN: DurableObjectNamespace
    readonly YOUR_PERKS: KVNamespace
    readonly YOUR_SKILLS: KVNamespace
    readonly YOUR_INVENTORY: KVNamespace
    readonly YOUR_STASH: KVNamespace
}