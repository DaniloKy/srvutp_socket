
fetch("https://srvutpnew.surviveutopia.workers.dev/character", {
    method: "GET",
    headers: {
        "Authorization": "Umx25i9qGZXM8zy1p3H5vUAYwqZh40cJ59VNTzAx",
        "Content-Type": "application/json",
    },
}).then(async function(res){
    console.log(await res.text());
})