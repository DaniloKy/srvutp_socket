const fs = require('fs');
const path = require('path');

// Try to read .env from root
const envPath = path.resolve(__dirname, '../.env');
let token = "";

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/TOKEN=(.*)/);
    if (match) {
        token = match[1].trim();
    }
}

if (!token) {
    console.warn("Warning: TOKEN not found in .env file");
}

module.exports = {
    TOKEN: token,
    HEADERS: {
        "Authorization": token,
        "Content-Type": "application/json",
    }
};
