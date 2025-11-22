
fetch("http://127.0.0.1:8787/classes", {
    method: "POST",
    headers: {
        "Authorization": "Umx25i9qGZXM8zy1p3H5vUAYwqZh40cJ59VNTzAx",
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: "test",
        name_compiled: "test",
        tiny_description: "test test test test",
        description: "test test test test test test test test test test test test test test test test test test test test test test test test test test test test test ."
    }),
}).then(async function(res){
    console.log(await res.text());
})