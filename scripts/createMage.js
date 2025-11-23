
const { HEADERS } = require('./config');

fetch("https://srvutpnew.surviveutopia.workers.dev/classes", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
        name: "Mage",
        name_compiled: "mage",
        tiny_description: "The Mage class is a wielder of arcane powers",
        description: "+5% Meele Damage \n +5% Health \n +5% Speed"
    }),
}).then(async function(res){
    console.log(await res.text());
})