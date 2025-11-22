
fetch("https://srvutpnew.surviveutopia.workers.dev/classes", {
    method: "POST",
    headers: {
        "Authorization": "Umx25i9qGZXM8zy1p3H5vUAYwqZh40cJ59VNTzAx",
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: "Mage",
        name_compiled: "mage",
        tiny_description: "The Mage class is a wielder of arcane powers",
        description: "+5% Meele Damage \n +5% Health \n +5% Speed"
    }),
}).then(async function(res){
    console.log(await res.text());
})