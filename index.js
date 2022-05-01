const core = require('@actions/core');
const github = require('@actions/github');


// most @actions toolkit packages have async methods
async function run() {
  try {
    const title = github.context.payload.pull_request.title;
    core.info(`Processing PR:${title}  ...`);

    const repo = core.getInput('repo', {required: true});
    const owner = core.getInput('owner', {required: true});
    const pr_number = core.getInput('pr_number', {required: true});
    const github_token = core.getInput('github_token', {required: true});    

    const getJiraTicketsFromPrTitle = ( ) => {
      const trimmedTitle=title.replaceAll("\\s","")
      const JIRA_TICKETS  = trimmedTitle.split('-')[0].split('\\|')
      core.info( ` JIRA Ticket ${JIRA_TICKETS}`)
    }

    const octokit = new github.getOctokit(github_token)
    const { data: pullRequestContent } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pr_number,
    });

    //stage ("check Linked JIRA's") {
    getJiraTicketsFromPrTitle(pullRequestContent)

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
