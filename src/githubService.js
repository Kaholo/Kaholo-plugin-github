const { sendToGithub, listGithubRequest, removeEmptyFieldsRecursive} = require("./helpers");
const parsers = require("./parsers");

async function sendStatus(action, settings) {
    const {state, linkedUrl, description, context} = action.params;
    const repo = parsers.autocomplete(action.params.repo);
    const sha = parsers.autocomplete(action.params.sha);
    const token = action.params.token || settings.token;
    if (!token || !repo || !sha || !state){
        throw("One of required parameters was not given");
    }
    if (!repo.includes("/")){
        throw(`Bad repository name format.
Repository Name should be in the format of {owner}/{repo}`);
    }
    const reqUrl = `/repos/${repo}/statuses/${sha}`;
    const body = {
        state: state,
        target_url: parsers.string(linkedUrl),
        description: parsers.string(description),
        context: parsers.string(context)
    };
    
    const res = await sendToGithub(reqUrl, "POST", token, body);
    if (res.message && res.message.includes("No commit found for SHA")){
        throw res;
    }
    return res;
}

async function createRepo(action, settings) {
    const {name, private, autoInit, gitignoreTemplate, description} = action.params;
    const owner = parsers.autocomplete(action.params.owner);
    const token = action.params.token || settings.token;
    if (!token || !name){
        throw("One of required parameters was not given");
    }
    const reqPath = owner && owner !== "user" ? `/orgs/${owner}/repos` : `/user/repos`;
    const body = {
        name: parsers.string(name), 
        private: parsers.boolean(private),
        auto_init: parsers.boolean(autoInit),
        gitignore_template: parsers.string(gitignoreTemplate),
        description: parsers.string(description)
    };
    
    return sendToGithub(reqPath, "POST", token, body);;
}

async function createRepoFromTemplate(action, settings) {
    const {templateRepo, name, description, private} = action.params;
    const owner = parsers.autocomplete(action.params.owner);
    const token = action.params.token || settings.token;
    if (!token || !templateRepo || !name){
        throw("One of required parameters was not given");
    }
    if (!templateRepo.includes("/")){
        throw(`Bad template repository name format.
Repository Name should be in the format of {owner}/{repo}`);
    }
    const reqPath = `/repos/${templateRepo}/generate`;
    const body = {
        name: parsers.string(name), 
        private: parsers.boolean(private),
        owner: owner === "user" ? undefined : owner,
        description: parsers.string(description)
    }
    
    return sendToGithub(reqPath, "POST", token, body);;
}

async function createRepoWebhook(action, settings) {
    const {url, secret, insecureSsl, notActive} = action.params;
    const repo = parsers.autocomplete(action.params.repo);
    const contentType = action.params.contentType || "json";
    const events = parsers.array(action.params.events);
    const token = action.params.token || settings.token;
    if (!token || !repo || !url) {
        throw("One of required parameters was not given");
    }
    if (!repo.includes("/")){
        throw(`Bad repository name format.
Repository Name should be in the format of {owner}/{repo}`);
    }
    const reqPath = `/repos/${repo}/hooks`;
    const body = {
        name: "web", 
        config: {
            url: parsers.string(url),
            content_type: parsers.string(contentType),
            insecure_ssl: parsers.boolean(insecureSsl) ? 1 : 0,
            secret: secret
        },
        events: events.length > 0 ? events : undefined,
        active: !parsers.boolean(notActive)
    }
    
    return sendToGithub(reqPath, "POST", token, body);;
}

async function createOrganizationWebhook(action, settings) {
    const {url, secret, insecureSsl, notActive, username, password} = action.params;
    const org = parsers.autocomplete(action.params.org);
    const contentType = action.params.contentType || "json";
    const events = parsers.array(action.params.events);
    const token = action.params.token || settings.token;
    if (!token || !org || !url) {
        throw("One of required parameters was not given");
    }
    const reqPath = `/orgs/${org}/hooks`;
    const body = {
        name: "web", 
        config: {
            url: parsers.string(url),
            content_type: parsers.string(contentType),
            insecure_ssl: parsers.boolean(insecureSsl) ? 1 : 0,
            secret: parsers.string(secret),
            username: parsers.string(username),
            password: parsers.string(password),
        },
        events: events.length > 0 ? events : undefined,
        active: !parsers.boolean(notActive)
    }
    
    return sendToGithub(reqPath, "POST", token, body);;
}

async function listOrgs(params, settings) {
    return listGithubRequest(params, settings, "/user/orgs");
}
    
async function getAuthenticatedUser(params, settings) {
    return sendToGithub("/user", "GET", params.token || settings.token);
}

async function listRepos(params, settings) {
    let owner = parsers.autocomplete(params.owner);
    if (!owner || owner === "user") {
        return listGithubRequest(params, settings, "/user/repos");
    }
    return listGithubRequest(params, settings, `/orgs/${owner}/repos`);
}

async function listBranches(params, settings) {
    const repo = parsers.autocomplete(params.repo);
    if (!repo) throw "Must provide a repository";
    if (!repo.includes("/")){
        throw(`Bad repository name format.
Repository Name should be in the format of {owner}/{repo}`);
    }
    return listGithubRequest(params, settings, `/repos/${repo}/branches`);
}

async function listCommits(params, settings) {
    const repo = parsers.autocomplete(params.repo);
    if (!repo) throw "Must provide a repository";
    if (!repo.includes("/")){
        throw(`Bad repository name format.
Repository Name should be in the format of {owner}/{repo}`);
    }
    const branch = parsers.autocomplete(params.branch);
    return listGithubRequest(params, settings, `/repos/${repo}/commits`, {sha: branch});
}

module.exports = {
    sendStatus,
    createRepo,
    createRepoFromTemplate,
    createRepoWebhook,
    createOrganizationWebhook,
    // list/get funcs
    getAuthenticatedUser, 
    listOrgs,
    listRepos,
    listBranches,
    listCommits
}