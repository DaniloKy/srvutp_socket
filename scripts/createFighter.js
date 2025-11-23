
const { HEADERS } = require('./config');

fetch("https://srvutpnew.surviveutopia.workers.dev/classes", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
        name: "Fighter",
        name_compiled: "fighter",
        tiny_description: "The Fighter class embodies the pinnacle of martial skill!",
        description: "+10% Meele Damage \n +10% Health \n -15% Speed"
    }),
}).then(async function(res){
    console.log(await res.text());
})