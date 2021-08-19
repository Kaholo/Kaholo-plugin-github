const fetch = require('node-fetch');
const parsers = require("./parsers");

const githubApiUrl = "https://api.github.com";

async function sendToGithub(url, httpMethod, token, body) {
    if (!token) {
        throw "Must provide Authentication Token!";
    }
    const accept = `application/vnd.github.${url.endsWith("generate") ? "baptiste-preview" : "v3"}+json`;
    const reqParams = {
        method: httpMethod,
        headers: {  
            'Accept': accept,
            'Authorization': "token " + token
        }
    }
    if (body) {
        reqParams.body = JSON.stringify(removeEmptyFieldsRecursive(body));
        reqParams.headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(githubApiUrl + url, reqParams);
    const jsonRes = await res.json();
    if (!res.ok || jsonRes.message === "Not Found") { throw jsonRes };
    return jsonRes;
}

function removeEmptyFields(obj) {
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
    return obj;
}


function removeEmptyFieldsRecursive(obj) {
    Object.keys(obj).forEach(key => {
        if (obj[key] === undefined) delete obj[key];
        else if (typeof obj[key] === "object") removeEmptyFieldsRecursive(obj[key]);
    });
    return obj;
}

async function listGithubRequest(params, settings, path, searchParams){
    searchParams = removeEmptyFields({
        ...searchParams, 
        page: parsers.number(params.page), 
        per_page: parsers.number(params.per_page)
    });
    if (Object.keys(searchParams).length > 0) {
        path += "?" + new URLSearchParams(searchParams);
    }
    return sendToGithub(path, "GET", params.token || settings.token)
}

function stripAction(func){
    return async (action, settings) => {
        return func(action.params, settings);
    };
}

module.exports = {
    sendToGithub,
    listGithubRequest,
    removeEmptyFieldsRecursive,
    stripAction
};