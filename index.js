const core = require('@actions/core');
const github = require('@actions/github');


// most @actions toolkit packages have async methods
async function run() {
  try {
    const repo = core.getInput('repo', {required: true});
    const owner = core.getInput('owner', {required: true});
    const pr_number = core.getInput('pr_number', {required: true});
    const github_token = core.getInput('github_token', {required: true});    
    const jira_token = core.getInput('jira_token', {required: true});

    const octokit = new github.getOctokit(github_token)
    const { data: pullRequestContent } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pr_number,
    });


    core.info(`Processing PR:${pullRequestContent.title}  ...`);
    core.info(`Jira token:${jira_token}  ...`);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
