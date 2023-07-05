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
Owner is the user or organization that owns a repository. While this parameter is not necessarily required for a successful result, it is included to narrow the autocomplete searches for downstream parameters such as repository. If using the code layer and the downstream parameter is already known, it is possible that 
### Parameter: Repository
### Parameter: Branch
### Parameter: Commit
### Parameter: State
### Parameter: Details URL
### Parameter: Description
### Parameter: Context
## Method: Create New Repository
### Parameter: Repository Name
### Parameter: Description
### Parameter: Owner
### Parameter: Private
### Parameter: Auto Init
### Parameter: GitIgnore Template
## Method: Create Repository From Template
### Parameter: Template Repository Name
### Parameter: New Repository Name
### Parameter: Description
### Parameter: New Repository Owner
### Parameter: Private
## Method: Create Repository Webhook
### Parameter: Owner
### Parameter: Repository
### Parameter: Subscribed Events
### Parameter: Webhook URL
### Parameter: Webhook Content Type
### Parameter: Secret
### Parameter: Disable SSL Verification
### Parameter: Leave Webhook Inactive
## Method: Create Organization Webhook
### Parameter: Organization
### Parameter: Subcribed Events
### Parameter: Webhook URL
### Parameter: Webhook Content Type
### Parameter: Secret
### Parameter: Disable SSL Verification
### Parameter: Webhook Username
### Parameter: Webhook Password
### Parameter: Leave Webhook Inactive
## Method: List Connected Organizations
### Parameter: Execute Big Query
## Method: List Repositories
### Parameter: Owner
### Parameter: Type
### Parameter: Execute Big Query
## Method: List Branches
### Parameter: Owner
### Parameter: Repository
### Parameter: Execute Big Query
## Method: List Commits
### Parameter: Owner
### Parameter: Repository
### Parameter: Branch
### Parameter: Since
### Parameter: Execute Big Query
## Method: Get Authenticated User
## Method: Get Repository Info
### Parameter: Owner
### Parameter: Repository
## Method: Get Pull Request
### Parameter: Owner
### Parameter: Repository
### Parameter: Pull Request
## Method: Post Comment On Pull Request
### Parameter: Owner
### Parameter: Repository
### Parameter: Pull Request
### Parameter: Comment
## Method: Set Branch Protection Rule
### Parameter: Owner
### Parameter: Repository
### Parameter: Branch
### Parameter: Required Checks
### Parameter: Dismiss Stale Reviews
### Parameter: Require Owner Review
### Parameter: Approving Count
