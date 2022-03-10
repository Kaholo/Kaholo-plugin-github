const parsers = require("./parsers");
const {
  listOrgs, getAuthenticatedUser, listBranches, listCommits, listPullRequests, searchRepos,
} = require("./github.service");

// auto complete helper methods

const MAX_RESULTS = 10;

function mapAutoParams(autoParams) {
  const params = {};
  autoParams.forEach((param) => {
    params[param.name] = parsers.autocomplete(param.value);
  });
  return params;
}

function getAutoResult(id, value) {
  return {
    id: id || value,
    value: value || id,
  };
}

function filterItems(items, query) {
  let resultItems = items;
  if (query) {
    // split by '.' or ' ' and make lower case
    const qWords = query.split(/[. ]/g).map((word) => word.toLowerCase());
    resultItems = resultItems.filter((item) => (
      qWords.every((word) => item.value.toLowerCase().includes(word))
    ));
    resultItems = resultItems.sort((word1, word2) => (
      word1.value.toLowerCase().indexOf(qWords[0]) - word2.value.toLowerCase().indexOf(qWords[0])
    ));
  }
  return resultItems.splice(0, MAX_RESULTS);
}

/** *
 * @returns {[{id, value}]} filtered result items
 ** */
function handleResult(result, query, parseFunc) {
  const defaultParseFunc = (item) => getAutoResult(`${item.full_name || item.login || item.id || ""}`, item.name || item.title);
  const items = result.map(parseFunc || defaultParseFunc);
  return filterItems(items, query);
}
function getParseFromParam(paramName) {
  return (item) => getAutoResult(item[paramName]);
}
function returnUnique(items) {
  const ids = new Set();
  return items.reduce((prev, cur) => {
    if (!ids.has(cur.id)) {
      prev.push(cur);
      ids.add(cur.id);
    }
    return prev;
  }, []);
}

// auto complete main methods
function listAuto(listFunc, parseFunc, compareFunc) {
  return async (query, pluginSettings, triggerParameters) => {
    const settings = mapAutoParams(pluginSettings); const
      params = mapAutoParams(triggerParameters);
    let items = [];
    params.per_page = 50;
    params.query = query;
    while (items.length < MAX_RESULTS) {
      let result;
      try {
        // TODO: Change the way of fetching data
        // eslint-disable-next-line
        result = await listFunc(params, settings);
      } catch (err) {
        throw new Error(`An error encountered while using the autocomplete function: ${err.message || JSON.stringify(err)}`);
      }
      if (result.length === 0) {
        return items;
      }
      // add all items that matched with the query, parsed
      items = returnUnique(items.concat(handleResult(result, query, parseFunc)));
      if (!query) {
        return items;
      }
      // if specified compareFunc or long enough query, check for exact match
      if (compareFunc || query.length >= Math.min(items.map((item) => item.id.length))) {
        // if found exact match, return it.
        const defaultCompareFunc = (item) => (
          item.value.toLowerCase().startsWith(query.toLowerCase())
          || item.id.toLowerCase().startsWith(query.toLowerCase())
        );
        const exactMatch = items.find(compareFunc ? compareFunc(query) : defaultCompareFunc);
        if (exactMatch) {
          return [exactMatch];
        }
      }
      if (result.length < 50) { return items; }
      params.page = (params.page || 0) + 1;
    }
    return items;
  };
}

async function listOwnersAuto(query, pluginSettings, triggerParameters) {
  const settings = mapAutoParams(pluginSettings); const
    params = mapAutoParams(triggerParameters);
  try {
    const curUserLogin = (await getAuthenticatedUser(params, settings)).login;
    const owners = [getAutoResult("user", curUserLogin),
      ...(await listOrgs(params, settings)).map(getParseFromParam("login"))];
    return filterItems(owners, query);
  } catch (err) {
    throw new Error(`An error encountered while listing owners: ${err.message || JSON.stringify(err)}`);
  }
}

module.exports = {
  listOwnersAuto,
  listPRAuto: listAuto(
    listPullRequests,
    (item) => getAutoResult(item.number.toString(), item.title),
  ),
  listOrgsAuto: listAuto(listOrgs),
  listReposAuto: listAuto(searchRepos),
  listBranchesAuto: listAuto(listBranches, getParseFromParam("name")),
  listCommitsAuto: listAuto(
    listCommits,
    (item) => getAutoResult(
      item.sha,
      `${item.commit.message.replace(/[\n!@#$%^&*()+=;]/g, " ")} [${item.sha.substring(0, 7)}]`,
    ),
    (query) => (
      query && query.length > 6
        ? (item) => item.id.toLowerCase().startsWith(query.toLowerCase())
        : () => false
    ),
  ),
};
