const { sendToGithub, listOrgs, getAuthenticatedUser, listRepos, listBranches, listCommits, stripAction} = require("./helpers");
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
        state: state
    }
    if (linkedUrl) body.target_url = linkedUrl;
    if (description) body.description = description;
    if (context) body.context = context;
    
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
        auto_init: parsers.boolean(autoInit)
    }
    if (gitignoreTemplate) body.gitignore_template = parsers.string(gitignoreTemplate);
    if (description) body.description =  parsers.string(description);
    
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
        private: parsers.boolean(private)
    }
    if (owner && owner !== "user") body.owner = owner;
    if (description) body.description = description;
    
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
        },
        active: !parsers.boolean(notActive)
    }
    if (secret) body.config.secret = secret;
    if (events.length > 0) body.events = events;
    
    return sendToGithub(reqPath, "POST", token, body);;
}

module.exports = {
    sendStatus,
    createRepo,
    createRepoFromTemplate,
    createRepoWebhook,
    // list funcs
    listOrgs: stripAction(listOrgs),
    getAuthenticatedUser: stripAction(getAuthenticatedUser),
    listRepos: stripAction(listRepos),
    listBranches: stripAction(listBranches),
    listCommits: stripAction(listCommits),
    // autocomplete
    ...require("./autocomplete")
};