const { sendToGithub } = require("./helpers");

async function sendStatus(action, settings) {
    const {repo, sha, state, 
        linkedUrl, description, context} = action.params;
    const user = action.params.user || settings.user;
    const token = action.params.token || settings.token;
    if (!user || !token || !repo || !sha || !state){
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
    
    const res = await sendToGithub(reqUrl, "POST", body, user, token);
    if (res.message && res.message.includes("No commit found for SHA")){
        throw res;
    }
    return res;
}

module.exports = {
    sendStatus
};