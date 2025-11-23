
const { HEADERS } = require('./config');

fetch("https://srvutpnew.surviveutopia.workers.dev/character", {
    method: "GET",
    headers: HEADERS,
}).then(async function(res){
    console.log(await res.text());
})