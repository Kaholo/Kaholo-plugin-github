const { stripAction } = require("./helpers");

const githubService = require("./githubService");

module.exports = {
    sendStatus: githubService.sendStatus,
    createRepo: githubService.createRepo,
    createRepoFromTemplate: githubService.createRepoFromTemplate,
    createRepoWebhook: githubService.createRepoWebhook,
    createOrganizationWebhook: githubService.createOrganizationWebhook,
    // list/get funcs
    listOrgs: stripAction(githubService.listOrgs),
    getAuthenticatedUser: stripAction(githubService.getAuthenticatedUser),
    listRepos: stripAction(githubService.listRepos),
    listBranches: stripAction(githubService.listBranches),
    listCommits: stripAction(githubService.listCommits),
    // autocomplete
    ...require("./autocomplete")
};