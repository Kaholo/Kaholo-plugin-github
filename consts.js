const CREATE_REPO_FAILED_MESSAGE = "Github only returned error \"Not Found\". Perhaps your access token provides insufficient access? The required scope to create a new repository is \"repo\" (full control of private repositories).";
const CREATE_ORG_WEBHOOK_FAILED_MESSAGE = "Github only returned error \"Not Found\". Perhaps your access token provides insufficient access? The required scope to create an organization webhook is \"admin:org_hook\" (full control of organization hooks).";

module.exports = {
  CREATE_REPO_FAILED_MESSAGE,
  CREATE_ORG_WEBHOOK_FAILED_MESSAGE,
};
