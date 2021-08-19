const parsers = require("./parsers");
const { listOrgs, getAuthenticatedUser, listRepos, listBranches, listCommits } = require("./helpers");

// auto complete helper methods

const MAX_RESULTS = 10;

function mapAutoParams(autoParams){
  const params = {};
  autoParams.forEach(param => {
    params[param.name] = parsers.autocomplete(param.value);
  });
  return params;
}

/***
 * @returns {[{id, value}]} filtered result items
 ***/
function handleResult(result, query, parseFunc){
  if (!parseFunc) {
    parseFunc = (item) => getAutoResult(item.full_name || item.id, item.name);
  }
  const items = result.map(parseFunc);
  return filterItems(items, query);
}

function getAutoResult(id, value) {
  return {
    id: id || value,
    value: value || id
  };
}

function getParseFromParam(paramName) {
  return (item) => getAutoResult(item[paramName]);
}

function filterItems(items, query){
  if (query){
    const qWords = query.split(/[. ]/g).map(word => word.toLowerCase()); // split by '.' or ' ' and make lower case
    items = items.filter(item => qWords.every(word => item.value.toLowerCase().includes(word)));
    items = items.sort((word1, word2) => word1.value.toLowerCase().indexOf(qWords[0]) - word2.value.toLowerCase().indexOf(qWords[0]));
  }
  return items.splice(0, MAX_RESULTS);
}

// auto complete main methods
function listAuto(listFunc, parseFunc){
  return async (query, pluginSettings, triggerParameters) => {
    const settings = mapAutoParams(pluginSettings), params = mapAutoParams(triggerParameters); 
    let items = [];
    params.per_page = 100;
    while (items.length < MAX_RESULTS) {
      let result = await listFunc(params, settings);
      if (result.length === 0) break;
      items = items.concat(handleResult(result, query, parseFunc));
      if (!query) break;
      // if found exact match, return it.
      const exactMatch = items.find(item => item.value.toLowerCase() === query.toLowerCase() || item.id === query.toLowerCase());
      if (exactMatch) return [exactMatch];
      params.page = (params.page || 0) + 1;
    }
    return items;
  }
}

async function listOwnersAuto(query, pluginSettings, triggerParameters){
  const settings = mapAutoParams(pluginSettings), params = mapAutoParams(triggerParameters); 
  const curUserLogin = (await getAuthenticatedUser(params, settings)).login;
  const owners = [getAutoResult("user", curUserLogin),
                  ...(await listOrgs(params, settings)).map(getParseFromParam("login"))];
  return filterItems(owners, query);
}

module.exports = {
  listOwnersAuto,
  listReposAuto: listAuto(listRepos),
  listBranchesAuto: listAuto(listBranches, getParseFromParam("name")),
  listCommitsAuto: listAuto(listCommits, (item) => getAutoResult(item.sha, 
    `${item.commit.message} [${item.sha.substring(0, 7)}]`))
}