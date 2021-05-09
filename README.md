# Kaholo-plugin-github
Github plugin for Kaholo.
This plugin is used to integrate with Github using it's REST API. You can see it's documentation [here](https://docs.github.com/en/rest).

## Settings
1. Username (String) **Optional** - The username of the default user to authenticate with.
2. Token (String) **Optional** - The OAuth token of the default user to authenticate with. You can see more information on creating tokens [here](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token).

## Method: Create Commit Status
Create a new commit status. Does so accoridng to this [documentation](https://docs.github.com/en/rest/reference/repos#create-a-commit-status).

### Parameters:
1. Username (String) **Optional** - The username of the user to authenticate with. **Required either here or in the settings**.
2. Token (String) **Optional** - The OAuth token of the user to authenticate with. You can see more information on creating tokens [here](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token). **Required either here or in the settings**.
3. Full Repository Name (String) **Required** - The full name of the repository of this commit status. In the format of *{owner}/{repo}*.
4. Commit SHA (String) **Required** - The SHA signature of the commit you want to send a new status update on.
5. State (Options) **Required** - The state of the status check. Can be one of the following:
* **Error**  - in the case of an error when executing the check.
* **Failure** - in case of the commit failing the status check.
* **Pending** - in case the status check is pending for the result.
* **Success** - in case of successful status check.
6. Linked Target URL (String) **Optional** - A URL link to a report of the status check in case there is one.
7. Description (Text) **Optional** - A short description of the status check results.
8. Context (String) **Optional** - A label to differentiate this status from the status of other systems. This field is case-insensitive. Default value is 'default'.