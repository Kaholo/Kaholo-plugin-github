const fetch = require('node-fetch');

const githubApiUrl = "https://api.github.com";

async function sendToGithub(url, httpMethod, body, user, token) {
    const res = await fetch(githubApiUrl + url, {
        method: httpMethod,
        body: JSON.stringify(body),
        headers: {  'Accept': 'application/vnd.github.v3+json',
                    'Authorization': 'token '+token,   
                    'Content-Type': 'application/json', },
    });
    return res.json();
}

function btoa(str){
    Buffer.from(str).toString('base64');
}
    
module.exports = {
    sendToGithub
};