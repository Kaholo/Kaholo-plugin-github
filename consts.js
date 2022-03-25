const CREATE_REPO_NOT_FOUND_ERROR_MESSAGE = "Github returned error \"Not Found\" only. Perhaps your access token provides insufficient access. The required scope to create a new repository is \"repo\" (full control of private repositories).";
const CREATE_ORG_WEBHOOK_NOT_FOUND_ERROR_MESSAGE = "Github returned error \"Not Found\" only. Perhaps your access token provides insufficient access. The required scope to create an organization webhook is \"admin:org_hook\" (full control of organization hooks).";

module.exports = {
  CREATE_REPO_NOT_FOUND_ERROR_MESSAGE,
  CREATE_ORG_WEBHOOK_NOT_FOUND_ERROR_MESSAGE,
};
