
fetch("https://srvutpnew.surviveutopia.workers.dev/classes", {
    method: "POST",
    headers: {
        "Authorization": "Umx25i9qGZXM8zy1p3H5vUAYwqZh40cJ59VNTzAx",
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: "Fighter",
        name_compiled: "fighter",
        tiny_description: "The Fighter class embodies the pinnacle of martial skill!",
        description: "+10% Meele Damage \n +10% Health \n -15% Speed"
    }),
}).then(async function(res){
    console.log(await res.text());
})