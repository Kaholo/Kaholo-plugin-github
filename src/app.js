const { sendToGithub } = require("./helpers");

async function sendStatus(action, settings) {
    const {repo, sha, state, 
        linkedUrl, description, context} = action.params;
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
    
    const res = await sendToGithub(reqUrl, "POST", body, token);
    if (res.message && res.message.includes("No commit found for SHA")){
        throw res;
    }
    return res;
}

async function createRepo(action, settings) {
    const {name, org, private, autoInit, gitignoreTemplate, description} = action.params;
    const token = action.params.token || settings.token;
    if (!token || !name){
        throw("One of required parameters was not given");
    }
    const reqPath = org ? `/orgs/${org}/repos` : `/user/repos`;
    let body = {
        name, 
        private,
        auto_init: autoInit
    }
    if (gitignoreTemplate) body.gitignore_template = gitignoreTemplate;
    if (description) body.description = description;
    
    return sendToGithub(reqPath, "POST", body, token);;
}

module.exports = {
    sendStatus,
    createRepo
};