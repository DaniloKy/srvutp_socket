
fetch("http://127.0.0.1:8787/character", {
    method: "POST",
    headers: {
        "Authorization": "Umx25i9qGZXM8zy1p3H5vUAYwqZh40cJ59VNTzAx",
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        belong_to: 1,
        username: "carl",
        class_name: "archer",
    }),
}).then(async function(res){
    console.log(await res.text());
})