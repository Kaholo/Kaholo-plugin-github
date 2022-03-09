const { sendToGithub, listGithubRequest, getRepo, createGithubSearchQuery } = require("./helpers");
const parsers = require("./parsers");

async function sendStatus(action, settings) {
    const { state, linkedUrl, description, context } = action.params;
    const repo = getRepo(action.params);
    const sha = parsers.autocomplete(action.params.sha);
    const token = action.params.token || settings.token;
    if (!token || !sha || !state) {
        throw "One of required parameters was not given";
    }
    const reqUrl = `/repos/${repo}/statuses/${sha}`;
    const body = {
        state: state,
        target_url: parsers.string(linkedUrl),
        description: parsers.string(description),
        context: parsers.string(context),
    };

    const res = await sendToGithub(reqUrl, "POST", token, body);
    if (res.message && res.message.includes("No commit found for SHA")) {
        throw res;
    }
    return res;
}

async function createRepo(action, settings) {
    const { name, private, autoInit, gitignoreTemplate, description } = action.params;
    const owner = parsers.autocomplete(action.params.owner);
    const token = action.params.token || settings.token;
    if (!token || !name) {
        throw "One of required parameters was not given";
    }
    const reqPath = owner && owner !== "user" ? `/orgs/${owner}/repos` : `/user/repos`;
    const body = {
        name: parsers.string(name),
        private: parsers.boolean(private),
        auto_init: parsers.boolean(autoInit),
        gitignore_template: parsers.string(gitignoreTemplate),
        description: parsers.string(description),
    };

    return sendToGithub(reqPath, "POST", token, body);
}

async function createRepoFromTemplate(action, settings) {
    const { templateRepo, name, description, private } = action.params;
    const owner = parsers.autocomplete(action.params.owner);
    const token = action.params.token || settings.token;
    if (!token || !templateRepo || !name) {
        throw "One of required parameters was not given";
    }
    if (!templateRepo.includes("/")) {
        throw `Bad template repository name format.
Repository Name should be in the format of {owner}/{repo}`;
    }
    const reqPath = `/repos/${templateRepo}/generate`;
    const body = {
        name: parsers.string(name),
        private: parsers.boolean(private),
        owner: owner === "user" ? undefined : owner,
        description: parsers.string(description),
    };

    return sendToGithub(reqPath, "POST", token, body);
}

async function createRepoWebhook(action, settings) {
    const { url, secret, insecureSsl, notActive } = action.params;
    const repo = getRepo(action.params);
    const contentType = action.params.contentType || "json";
    const events = parsers.array(action.params.events);
    const token = action.params.token || settings.token;
    if (!token || !url) {
        throw "One of required parameters was not given";
    }
    const reqPath = `/repos/${repo}/hooks`;
    const body = {
        name: "web",
        config: {
            url: parsers.string(url),
            content_type: parsers.string(contentType),
            insecure_ssl: parsers.boolean(insecureSsl) ? 1 : 0,
            secret: secret,
        },
        events: events.length > 0 ? events : undefined,
        active: !parsers.boolean(notActive),
    };

    return sendToGithub(reqPath, "POST", token, body);
}

async function createOrganizationWebhook(action, settings) {
    const { url, secret, insecureSsl, notActive, username, password } = action.params;
    const org = parsers.autocomplete(action.params.org);
    const contentType = action.params.contentType || "json";
    const events = parsers.array(action.params.events);
    const token = action.params.token || settings.token;
    if (!token || !org || !url) {
        throw "One of required parameters was not given";
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
        active: !parsers.boolean(notActive),
    };

    return sendToGithub(reqPath, "POST", token, body);
}

async function setBranchProtectionRule(action, settings) {
    const params = action.params;
    const repo = getRepo(params);
    const reqPath = `/repos/${repo}/branches/${params.branch}/protection`;
    const body = {
        required_status_checks: { 
            strict: true, 
            contexts: Array.isArray(params.contexts) ? params.contexts : params.contexts.split('\n')
        },
        enforce_admins: parsers.boolean(params.enforceAdmins),
        required_pull_request_reviews: {
            dismissal_restrictions: { users: [], teams: [] },
            dismiss_stale_reviews: parsers.boolean(params.dismissStaleReviews),
            require_code_owner_reviews: parsers.boolean(params.requireOwnerReview),
            required_approving_review_count: parsers.number(params.approvingCount),
            bypass_pull_request_allowances: { users: [], teams: [] },
        },
        restrictions: null
    };

    const token = action.params.token || settings.token;
    return sendToGithub(reqPath, "PUT", token, body);
}

async function listOrgs(params, settings) {
    return listGithubRequest(params, settings, "/user/orgs");
}

async function getAuthenticatedUser(params, settings) {
    return sendToGithub("/user", "GET", params.token || settings.token);
}

async function getRepository(params, settings) {
    return sendToGithub(`/repos/${getRepo(params)}`, "GET", params.token || settings.token);
}

async function getPullRequest(params, settings) {
    const pr = parsers.pullRequest(params.pr);
    if (!pr || pr.paramType !== "pulls") {
        throw "Must provide the pull request either from autocomplete or it's ID from code.";
    }
    if (pr.url) return sendToGithub(pr.url.pathname, "GET", params.token || settings.token);
    return sendToGithub(`/repos/${getRepo(params)}/pulls/${pr.id}`, "GET", params.token || settings.token);
}

async function postPRComment(params, settings) {
    const pr = parsers.pullRequest(params.pr);
    const comment = parsers.string(params.comment);
    if (!pr || !comment) {
        throw "One of required parameters was not given";
    }
    var path;
    if (pr.paramType === "issues") {
        path = pr.url.pathname;
        if (!path.endsWith("/comments")) {
            path += "/comments";
        }
    } else {
        const pullRequest = await getPullRequest(params, settings);
        path = new URL(pullRequest.comments_url).pathname;
    }
    return sendToGithub(path, "POST", params.token || settings.token, { body: comment });
}

async function listRepos(params, settings) {
    let owner = parsers.autocomplete(params.owner);
    if (!owner || owner === "user") {
        return listGithubRequest(params, settings, "/user/repos");
    }
    return listGithubRequest(params, settings, `/orgs/${owner}/repos`);
}

async function searchRepos(params, settings) {
    const query = createGithubSearchQuery(params);
    const repos = await listGithubRequest(params, settings, "/search/repositories", query && {
        q: query
    });
    return repos.items;
}

async function listBranches(params, settings) {
    const repo = getRepo(params);
    return listGithubRequest(params, settings, `/repos/${repo}/branches`);
}

async function listCommits(params, settings) {
    const repo = getRepo(params);
    const branch = parsers.autocomplete(params.branch);
    return listGithubRequest(params, settings, `/repos/${repo}/commits`, { sha: branch });
}

async function listPullRequests(params, settings) {
    const repo = getRepo(params);
    return listGithubRequest(params, settings, `/repos/${repo}/pulls`);
}

module.exports = {
    sendStatus,
    createRepo,
    createRepoFromTemplate,
    createRepoWebhook,
    createOrganizationWebhook,
    postPRComment,
    setBranchProtectionRule,
    // list/get funcs
    getAuthenticatedUser,
    getRepository,
    getPullRequest,
    listOrgs,
    listRepos,
    listBranches,
    listCommits,
    listPullRequests,
    searchRepos,
};
