
const { HEADERS } = require('./config');

fetch("http://127.0.0.1:8787/character", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
        belong_to: 1,
        username: "carl",
        class_name: "archer",
    }),
}).then(async function(res){
    console.log(await res.text());
})