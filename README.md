# Kaholo GitHub Plugin
This plugin extends Kaholo to be able to work with GitHub using the [GitHub REST API](https://docs.github.com/en/rest).

## Authentication
Authentication with GitHub is handled using a GitHub-issued token. There are [several types of tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) that will work equally well for this:
* Personal Access Token (Classic)
* Fine-grained Personal Access Token
* Git App token
* OAuth App token

GitHub tokens are easily recognizable because they are strings that begin with something like "gho_", "ghp_", or "github_pat_", depending on which type of token it is. For example this classic PAT:

    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

## Kaholo Accounts
The GitHub tokens are managed in Kaholo Accounts. An account must be created in order to use the plugin. To do this, go to Settings | Plugins and click on the name of the "GitHub" plugin, which is a blue link that will take you to plugin settings and accounts. An account can also be created by adding a GitHub action to a pipeline, selecting a method, dropping open the "Account" parameter and selecting "Add New Plugin Account".

The account takes only one parameter, which is the token itself, "Authentication Token". The token must be vaulted in the Kaholo Vault, which can be done while creating the account by clicking on "Add New Vault Item".

## Required Parameters
Some parameters are marked as required in the UI, meaning the method will not run without them. For example method "List Commits" requires Owner, Repository, and then Branch. The GitHub API doesn't really require Owner, but it is included anyway to help a user narrow the search for the Repository using the autocomplete features with simple drop-down navigation. If left empty or otherwise unconfigured, the method will refuse to run.

If the Repository and Branch are known, for example via the Kaholo code layer, Owner can be hard-coded with any random string and the method will still return the correct list of commits for the branch. This is done by toggling the code switch and then putting in a string, e.g. `"randomstring123"`. This satisfies the "required" status of the parameter and allows it to be used without knowing Owner.

Similarly, while Repository is required, it can also be hard-coded with a string matching "ownerOrOrg/repositoryName" and the Branch autocomplete drop-down will still work. This may be useful if for example the repository comes from Configuration. However, if using the UI autocomplete one will notice only the repository name is displayed, but while coding this parameter the longer owner/repo string is required to succeed. The easiest way to find the correct format for the string in code is to use the autocompletes to successfully run the action, and then examine the parameters as listed in the Activity Log of that successful Action execution. The string as shown in the Activity Log is the string that will work in code.

## Plugin Installation
For download, installation, upgrade, downgrade and troubleshooting of plugins in general, see [INSTALL.md](./INSTALL.md).

## Method: Create Commit Status
This method assigns a status of `error`, `failure`, `pending`, or `success` to a specific commit, which is then reflected in pull requests involving the commit. Commit statuses can also include an optional description and details URL, which makes them more useful in the GitHub web console.

### Parameter: Owner
Owner is the user or organization that owns a repository in GitHub. The autocomplete provides a list of users and organizations based on those accessible with the token provided in the plugin account.

Note: For some methods this parameter is not strictly required, but is used to narrow the autocomplete searches for downstream parameters such as repository. In the event downstream parameters are automated using the code layer, to work around the "required" nature of Owner, enable the code layer and provide some string for this parameter too, e.g. `"noOwner"`.

### Parameter: Repository
Repository is the GitHub "Repository Name". The autocomplete provides a list of repositories to choose from based on the selection of Owner. If using the code layer for Repository, the format is `"owner/repositoryName"`. For example the repository of this plugin if coded would be `"Kaholo/kaholo-plugin-github"`.

### Parameter: Branch
The branch of the repository, as in those listed by command `git branch`. The autocomplete provides a list of branches to choose from based on the selection for Repository.

### Parameter: Commit
A specific commit, as in those listed by command `git log`. The autocomplete will provide a list of commits based on selection of Branch, displaying commit message and partial SHA. If coded, use the full SHA string of the commit, e.g. `4f284538eb0c09f09d7f87aaf8d907c65ad9bbe6`.

### Parameter: State
The state, or status, to assign to the commit. The available states include `Success`, `Pending`, `Error`, and `Failure`.

### Parameter: Details URL
In the GitHub web console, a pull request including a commit with a status displays a [Details](https://docs.github.com/en/rest/commits/statuses) link, linked to the URL provided here.

### Parameter: Description
A text description to accompany the Status assigned. This is typically congratulatory for a `Success`, an appeal for patience if `Pending`, or an apology, explanation, or both if `Error` or `Failure` were assigned. The description is made plainly visible in the GitHub web console when viewing the status of a pull request.

### Parameter: Context
A context label for the purpose of combining statuses. For example if there's a CI build and code analysis and a security scan all three of which must be successful in order for a pull request to be merged, each of the three commit statuses would be applied using their own context. Context labels are arbitrary strings, e.g. `continuous-integration/kaholo` or `sonarqube`.

## Method: Create New Repository
Creates a new GitHub Repository, which is a git repository that tracks and saves the history of all changes made to the files in a project, combined with a user-friendly web console interface provided by GitHub.

### Parameter: Repository Name
A name for the repository to be created. Most repositories are named using only lower case letters and dashes, for example `kaholo-plugin-github`.

### Parameter: Description
A description of the repository that is displayed in the "About" section in repository view in GitHub.

### Parameter: Owner
Owner is the user or organization that owns a repository in GitHub. The autocomplete provides a list of users and organizations based on those accessible with the token provided in the plugin account.

### Parameter: Private
If enabled the repository is created as a private repository - available only to those specifically granted access. Otherwise it is public, meaning anybody can clone it anonymously.

### Parameter: Auto Init
If enabled, this will create the repository with an empty README file.

### Parameter: GitIgnore Template
If provided a valid GitIgnore template value, for example `Node` or `C++` or `WordPress`, this will create an appropriate .gitignore file for the repository.

## Method: Create Repository From Template
Creates a new GitHub Repository, which is a git repository that tracks and saves the history of all changes made to the files in a project, combined with a user-friendly web console interface provided by GitHub. This method differs from "Create Repository" in that it uses an existing repository template, which is useful to provide the repository with initial content and configuration.

### Parameter: Template Repository Name
This parameter is unlike "Repository" found in other methods in that it has no autocomplete, and requires the full `owner/repository` string for the template repository, as opposed to just the repository name alone. For example if the repository of this plugin were a template, the string would be `Kaholo/kaholo-plugin-github`.

### Parameter: New Repository Name
A name for the new repository to create.

### Parameter: Description
A description of the repository that is displayed in the "About" section in repository view in GitHub.

### Parameter: New Repository Owner
Owner is the user or organization that owns a repository in GitHub. The autocomplete provides a list of users and organizations based on those accessible with the token provided in the plugin account.

### Parameter: Private
If enabled the repository is created as a private repository - available only to those specifically granted access. Otherwise it is public, meaning anybody can clone it anonymously.

## Method: Create Repository Webhook
Creates a GitHub webhook for the repository. Webhooks cause GitHub to notify other systems when certain events take place in GitHub. For example, if there's a pull request made to a repository, a GitHub webhook might notify Kaholo so that a CI/CD pipeline is triggered to build and test the PR automatically. This plugin method configures the webhook on the GitHub side. The [Kaholo GitHub Webhook Trigger](https://github.com/Kaholo/kaholo-trigger-github) would then be used in Kaholo pipelines to receive and trigger on such notifications.

### Parameter: Owner
Owner is the user or organization that owns a repository in GitHub. The autocomplete provides a list of users and organizations based on those accessible with the token provided in the plugin account.

Note: For some methods this parameter is not strictly required, but is used to narrow the autocomplete searches for downstream parameters such as repository. In the event downstream parameters are automated using the code layer, to work around the "required" nature of Owner, enable the code layer and provide some string for this parameter too, e.g. `"noOwner"`.

### Parameter: Repository
Repository is the GitHub "Repository Name". The autocomplete provides a list of repositories to choose from based on the selection of Owner. If using the code layer for Repository, the format is `"owner/repositoryName"`. For example the repository of this plugin if coded would be `"Kaholo/kaholo-plugin-github"`.

### Parameter: Subscribed Events
GitHub webhooks can be configured to notify of specific events, for example 'push' or 'pull_request'. A full list of events is available in the [GitHub documentation](https://docs.github.com/en/webhooks-and-events/webhooks/webhook-events-and-payloads). List events here one per line. If left empty, all events are sent by the webhook - the equivalent to "Send me everything" when configuring in the GitHub web console.

### Parameter: Webhook URL
The URL where the webhook events should be sent. For example, if using the GitHub trigger in Kaholo, the URL will be something like `https://myacct.kaholo.net/webhook/github/push`.

### Parameter: Webhook Content Type
Select from `JSON` or `x-www-form-urlencoded`. This choice depends on the types accepted by the Webhook URL. If using the Kaholo GitHub trigger in Kaholo, either type will work the same.

### Parameter: Secret
A secret string shared between GitHub and webhook URL to validate the webhook events. Leave empty to configure a webhook without a secret.

### Parameter: Disable SSL Verification
GitHub by default will validate TLS certificate of the webhook URL and not send events if the certificate cannot be verified. If the webhook URL has no valid certificate to be verified, enable this parameter to skip the verification.

### Parameter: Leave Webhook Inactive
Enable this parameter to configure the webhook but not activate it. No webhook events will be sent until the webhook is activated.

## Method: Create Organization Webhook
Creates a GitHub webhook for an Organization. Webhooks cause GitHub to notify other systems when certain events take place in GitHub. For example, if there's a pull request made to a repository, a GitHub webhook might notify Kaholo so that a CI/CD pipeline is triggered to build and test the PR automatically. This plugin method configures the webhook on the GitHub side. The [Kaholo GitHub Webhook Trigger](https://github.com/Kaholo/kaholo-trigger-github) would then be used in Kaholo pipelines to receive and trigger on such notifications.

### Parameter: Organization
Select the Organization using the autocomplete. The autocomplete shows only organizations that are associated with the authentication token. If none are listed then the user of the token isn't associated with any organizations. Consider using repository-level webhooks instead.

### Parameter: Subcribed Events
GitHub webhooks can be configured to notify of specific events, for example 'push' or 'pull_request'. A full list of events is available in the [GitHub documentation](https://docs.github.com/en/webhooks-and-events/webhooks/webhook-events-and-payloads). List events here one per line. If left empty, all events are sent by the webhook - the equivalent to "Send me everything" when configuring in the GitHub web console.

### Parameter: Webhook URL
The URL where the webhook events should be sent. For example, if using the GitHub trigger in Kaholo, the URL will be something like `https://myacct.kaholo.net/webhook/github/push`.

### Parameter: Webhook Content Type
Select from `JSON` or `x-www-form-urlencoded`. This choice depends on the types accepted by the Webhook URL. If using the Kaholo GitHub trigger in Kaholo, either type will work the same.

### Parameter: Secret
A secret string shared between GitHub and webhook URL to validate the webhook events. Leave empty to configure a webhook without a secret.

### Parameter: Disable SSL Verification
GitHub by default will validate TLS certificate of the webhook URL and not send events if the certificate cannot be verified. If the webhook URL has no valid certificate to be verified, enable this parameter to skip the verification.

### Parameter: Webhook Username
If the webhook URL requires user/password authentication, provide username here. Otherwise leave empty.

### Parameter: Webhook Password
If the webhook URL requires user/password authentication, put the password in a Kaholo Vault item and select that item here. Otherwise leave empty.

### Parameter: Leave Webhook Inactive
Enable this parameter to configure the webhook but not activate it. No webhook events will be sent until the webhook is activated.

## Method: List Connected Organizations
This method lists Organizations associated with the user of the authentication token given in the GitHub plugin account.

### Parameter: Execute Big Query
If expecting greater than 100 results and the complete list of results is needed, enable this parameter.

## Method: List Repositories
This method lists repositories associated with the user of the authentication token given in the GitHub plugin account.

### Parameter: Owner
Owner is the user or organization that owns a repository in GitHub. The autocomplete provides a list of users and organizations based on those accessible with the token provided in the plugin account.

### Parameter: Type
By default `All` types are returned, but to narrow the list to only `Forks`, `Public`, `Private`, or `Archived` repositories, select one from the drop-down menu.

### Parameter: Execute Big Query
If expecting greater than 100 results and the complete list of results is needed, enable this parameter.

## Method: List Branches
This method lists all branches of the specified repository.

### Parameter: Owner
Owner is the user or organization that owns a repository in GitHub. The autocomplete provides a list of users and organizations based on those accessible with the token provided in the plugin account.

Note: For some methods this parameter is not strictly required, but is used to narrow the autocomplete searches for downstream parameters such as repository. In the event downstream parameters are automated using the code layer, to work around the "required" nature of Owner, enable the code layer and provide some string for this parameter too, e.g. `"noOwner"`.

### Parameter: Repository
Repository is the GitHub "Repository Name". The autocomplete provides a list of repositories to choose from based on the selection of Owner. If using the code layer for Repository, the format is `"owner/repositoryName"`. For example the repository of this plugin if coded would be `"Kaholo/kaholo-plugin-github"`.

### Parameter: Execute Big Query
If expecting greater than 100 results and the complete list of results is needed, enable this parameter.

## Method: List Commits
This methods lists commits to the specified branch of a repository.

### Parameter: Owner
Owner is the user or organization that owns a repository in GitHub. The autocomplete provides a list of users and organizations based on those accessible with the token provided in the plugin account.

Note: For some methods this parameter is not strictly required, but is used to narrow the autocomplete searches for downstream parameters such as repository. In the event downstream parameters are automated using the code layer, to work around the "required" nature of Owner, enable the code layer and provide some string for this parameter too, e.g. `"noOwner"`.

### Parameter: Repository
Repository is the GitHub "Repository Name". The autocomplete provides a list of repositories to choose from based on the selection of Owner. If using the code layer for Repository, the format is `"owner/repositoryName"`. For example the repository of this plugin if coded would be `"Kaholo/kaholo-plugin-github"`.

### Parameter: Branch
The branch of the repository, as in those listed by command `git branch`. The autocomplete provides a list of branches to choose from based on the selection for Repository.

### Parameter: Since
If only recent commits are of interest, specify the earliest committerdate to retrieve here. The format is `YYYY-MM-DDTHH:MM:SSZ`, where the `T` is a separator between date and time, and the `Z` indicates "Zulu", aka UTC, or GMT+0 time zone.

### Parameter: Execute Big Query
If expecting greater than 100 results and the complete list of results is needed, enable this parameter.

## Method: Get Authenticated User
This method gets information about the user associated with the authentication token given in the GitHub plugin account.

## Method: Get Repository Info
This method gets information about the specified repository.

### Parameter: Owner
Owner is the user or organization that owns a repository in GitHub. The autocomplete provides a list of users and organizations based on those accessible with the token provided in the plugin account.

Note: For some methods this parameter is not strictly required, but is used to narrow the autocomplete searches for downstream parameters such as repository. In the event downstream parameters are automated using the code layer, to work around the "required" nature of Owner, enable the code layer and provide some string for this parameter too, e.g. `"noOwner"`.

### Parameter: Repository
Repository is the GitHub "Repository Name". The autocomplete provides a list of repositories to choose from based on the selection of Owner. If using the code layer for Repository, the format is `"owner/repositoryName"`. For example the repository of this plugin if coded would be `"Kaholo/kaholo-plugin-github"`.

## Method: Get Pull Request
This method gets information about a specific pull request.

### Parameter: Owner
Owner is the user or organization that owns a repository in GitHub. The autocomplete provides a list of users and organizations based on those accessible with the token provided in the plugin account.

Note: For some methods this parameter is not strictly required, but is used to narrow the autocomplete searches for downstream parameters such as repository. In the event downstream parameters are automated using the code layer, to work around the "required" nature of Owner, enable the code layer and provide some string for this parameter too, e.g. `"noOwner"`.

### Parameter: Repository
Repository is the GitHub "Repository Name". The autocomplete provides a list of repositories to choose from based on the selection of Owner. If using the code layer for Repository, the format is `"owner/repositoryName"`. For example the repository of this plugin if coded would be `"Kaholo/kaholo-plugin-github"`.

### Parameter: Pull Request
Use the autocomplete to select one specific pull request.

## Method: Post Comment On Pull Request
This method posts a comment on a pull request.

### Parameter: Owner
Owner is the user or organization that owns a repository in GitHub. The autocomplete provides a list of users and organizations based on those accessible with the token provided in the plugin account.

Note: For some methods this parameter is not strictly required, but is used to narrow the autocomplete searches for downstream parameters such as repository. In the event downstream parameters are automated using the code layer, to work around the "required" nature of Owner, enable the code layer and provide some string for this parameter too, e.g. `"noOwner"`.

### Parameter: Repository
Repository is the GitHub "Repository Name". The autocomplete provides a list of repositories to choose from based on the selection of Owner. If using the code layer for Repository, the format is `"owner/repositoryName"`. For example the repository of this plugin if coded would be `"Kaholo/kaholo-plugin-github"`.

### Parameter: Pull Request
Use the autocomplete to select the pull request about which to comment.

### Parameter: Comment
The text comment that will be posted on the selected pull request.

## Method: Set Branch Protection Rule
This method sets branch protection rules on the specified branch of a repository.

### Parameter: Owner
Owner is the user or organization that owns a repository in GitHub. The autocomplete provides a list of users and organizations based on those accessible with the token provided in the plugin account.

Note: For some methods this parameter is not strictly required, but is used to narrow the autocomplete searches for downstream parameters such as repository. In the event downstream parameters are automated using the code layer, to work around the "required" nature of Owner, enable the code layer and provide some string for this parameter too, e.g. `"noOwner"`.

### Parameter: Repository
Repository is the GitHub "Repository Name". The autocomplete provides a list of repositories to choose from based on the selection of Owner. If using the code layer for Repository, the format is `"owner/repositoryName"`. For example the repository of this plugin if coded would be `"Kaholo/kaholo-plugin-github"`.

### Parameter: Branch
The branch of the repository, as in those listed by command `git branch`. The autocomplete provides a list of branches to choose from based on the selection for Repository.

### Parameter: Required Checks
A list of the specified checks required, listed one per line. For example if there's a continuous build and code analysis automation tagged `ci-build` and `code-analysis`, respectively, this parameter would contain:

    ci-build
    code-analysis

Leave the parameter empty if there are no specific checks required, to just choose from the three common checks parameterized below.

### Parameter: Dismiss Stale Reviews
If enabled, a branch protection rule will be created to automatically dismiss approving reviews when further commits are made to the pull request.

### Parameter: Require Owner Review
If enabled, a branch protection rule will be created mandating the owner review a pull request before it can be merged.

### Parameter: Approving Count
Any number of required approvals from zero to six. If zero, then no approvals are required to merge the pull request.