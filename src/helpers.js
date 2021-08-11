const fetch = require('node-fetch');

const githubApiUrl = "https://api.github.com";

async function sendToGithub(url, httpMethod, body, token) {
    const res = await fetch(githubApiUrl + url, {
        method: httpMethod,
        body: body ?  JSON.stringify(body) : undefined,
        headers: {  'Accept': 'application/vnd.github.v3+json',
                    'Authorization': 'token '+ token,   
                    'Content-Type': 'application/json', },
    });
    const jsonRes = await res.json();
    if (jsonRes.errors && jsonRes.errors.length > 0){
        throw jsonRes;
    }
    return jsonRes;
}
    
module.exports = {
    sendToGithub
};