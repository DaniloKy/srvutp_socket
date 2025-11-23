
const { HEADERS } = require('./config');

fetch("http://127.0.0.1:8787/classes", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
        name: "test",
        name_compiled: "test",
        tiny_description: "test test test test",
        description: "test test test test test test test test test test test test test test test test test test test test test test test test test test test test test ."
    }),
}).then(async function(res){
    console.log(await res.text());
})