const fetch = require("node-fetch");
const parsers = require("./parsers");

const githubApiUrl = "https://api.github.com";

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

async function listGithubRequest(params, settings, path, searchParams) {
  const resolvedSearchParams = removeEmptyFields({
    ...searchParams,
    page: parsers.number(params.page),
    per_page: parsers.number(params.per_page),
  });
  let resolvedPath = path;
  if (Object.keys(resolvedSearchParams).length > 0) {
    resolvedPath += "?";
    // if param is the query do not encode the value,
    // otherwise the github does not parse it correctly
    resolvedPath += Object.entries(resolvedSearchParams).map(([key, value]) => `${key}=${key === "q" ? value : encodeURIComponent(value)}`).join("&");
  }
  return sendToGithub(resolvedPath, "GET", params.token || settings.token);
}

function stripAction(func) {
  return async (action, settings) => func(action.params, settings);
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

function parseAndHandleGithubError(errorMessage) {
  return (error) => {
    throw error.message === "Not Found" ? new Error(errorMessage) : error;
  };
}

module.exports = {
  sendToGithub,
  listGithubRequest,
  removeEmptyFieldsRecursive,
  stripAction,
  getRepo,
  parseAndHandleGithubError,
};
