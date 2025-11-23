
const { HEADERS } = require('./config');

fetch("https://srvutpnew.surviveutopia.workers.dev/classes", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
        name: "Archer",
        name_compiled: "archer",
        tiny_description: "The Archer class is a skilled ranged combatant!",
        description: "-5% Meele Damage \n -5% Health \n +20% Speed"
    }),
}).then(async function(res){
    console.log(await res.text());
})