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
    const jsonRes = await res.json();
    if (jsonRes.errors && jsonRes.errors.length > 0){
        throw jsonRes;
    }
    return jsonRes;
}

function btoa(str){
    Buffer.from(str).toString('base64');
}
    
module.exports = {
    sendToGithub
};