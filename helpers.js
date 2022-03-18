const fetch = require("node-fetch");
const parsers = require("./parsers");

const githubApiUrl = "https://api.github.com";
const DEFAULT_RESULTS_PER_PAGE = 100;
const REQUEST_LIMIT_REACHED_ERROR_MESSAGE = "Plugin sent too many requests to the GitHub API. The result may be incomplete. Please wait one minute before executing the pipeline again.";

async function sendToGithub(url, httpMethod, token, body) {
  if (!token) {
    throw new Error("Must provide Authentication Token!");
  }
  const accept = `application/vnd.github.${url.endsWith("generate") ? "baptiste-preview" : "v3"}+json`;
  const reqParams = {
    method: httpMethod,
    headers: {
      Accept: accept,
      Authorization: `token ${token}`,
    },
  };
  if (body) {
    reqParams.body = JSON.stringify(removeEmptyFieldsRecursive(body));
    reqParams.headers["Content-Type"] = "application/json";
  }
  const res = await fetch(githubApiUrl + url, reqParams);
  const jsonRes = await res.json();
  if (!res.ok || jsonRes.message === "Not Found") { throw jsonRes; }
  return jsonRes;
}

async function listGithubRequest(params, settings, path, searchParams, bigQuery = false) {
  const page = parsers.number(params.page) || 1;
  const perPage = parsers.number(params.per_page) || DEFAULT_RESULTS_PER_PAGE;
  const resolvedSearchParams = removeEmptyFields({
    ...searchParams,
    page,
    per_page: perPage,
  });

  let resolvedPath = path;
  if (Object.keys(resolvedSearchParams).length > 0) {
    resolvedPath += "?";
    // if param is the query do not encode the value,
    // otherwise the github does not parse it correctly
    resolvedPath += Object.entries(resolvedSearchParams).map(([key, value]) => (
      `${key}=${key === "q" ? value : encodeURIComponent(value)}`
    )).join("&");
  }
  let githubResults;
  try {
    githubResults = await sendToGithub(resolvedPath, "GET", params.token || settings.token);
  } catch (error) {
    if (error.message.startsWith("API rate limit exceeded")) {
      console.error(new Error(REQUEST_LIMIT_REACHED_ERROR_MESSAGE));
      return [];
    }
    throw error;
  }
  if (githubResults.items) {
    githubResults = githubResults.items;
  }
  if (bigQuery && githubResults.length >= DEFAULT_RESULTS_PER_PAGE) {
    const newParams = {
      ...params,
      page: page + 1,
      per_page: perPage,
    };
    const recursiveResults = await listGithubRequest(
      newParams,
      settings,
      path,
      resolvedSearchParams,
      true,
    );
    githubResults = githubResults.concat(recursiveResults);
  }
  return githubResults;
}

function createListCommitsSearchParams(params) {
  const branch = parsers.autocomplete(params.branch);
  const since = parsers.string(params.since);
  return {
    sha: branch,
    ...(since ? { since } : {}),
  };
}

function getRepo(params) {
  const repo = parsers.autocomplete(params.repo);
  if (!repo) {
    throw new Error("Must provide a repository");
  }
  if (!repo.includes("/")) {
    throw new Error("Bad repository name format.\nRepository Name should be in the format of {owner}/{repo}");
  }
  return repo;
}

function removeEmptyFields(obj) {
  const resultObj = obj;
  Object.keys(resultObj).forEach((key) => resultObj[key] === undefined && delete resultObj[key]);
  return resultObj;
}

function removeEmptyFieldsRecursive(obj) {
  const resultObj = obj;
  Object.keys(resultObj).forEach((key) => {
    if (resultObj[key] === undefined) { delete resultObj[key]; } else if (typeof resultObj[key] === "object" && resultObj[key] !== null) { removeEmptyFieldsRecursive(resultObj[key]); }
  });
  return resultObj;
}

function stripAction(func) {
  return async (action, settings) => func(action.params, settings);
}

module.exports = {
  sendToGithub,
  listGithubRequest,
  removeEmptyFieldsRecursive,
  stripAction,
  getRepo,
  createListCommitsSearchParams,
};
