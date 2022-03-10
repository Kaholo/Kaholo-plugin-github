const { stripAction } = require("./helpers");
const autocomplete = require("./autocomplete");

const githubService = require("./github.service");

module.exports = {
  sendStatus: githubService.sendStatus,
  createRepo: githubService.createRepo,
  createRepoFromTemplate: githubService.createRepoFromTemplate,
  createRepoWebhook: githubService.createRepoWebhook,
  createOrganizationWebhook: githubService.createOrganizationWebhook,
  postPRComment: stripAction(githubService.postPRComment),
  setBranchProtectionRule: githubService.setBranchProtectionRule,
  // list/get funcs
  getAuthenticatedUser: stripAction(githubService.getAuthenticatedUser),
  getRepository: stripAction(githubService.getRepository),
  getPullRequest: stripAction(githubService.getPullRequest),
  listOrgs: stripAction(githubService.listOrgs),
  listRepos: stripAction(githubService.listRepos),
  listBranches: stripAction(githubService.listBranches),
  listCommits: stripAction(githubService.listCommits),
  listPullRequests: stripAction(githubService.listPullRequests),
  // autocomplete
  ...autocomplete,
};
