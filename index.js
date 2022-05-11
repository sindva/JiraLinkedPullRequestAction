const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

async function setJiraTicketStatus ( JIRA_TICKET, status, jira_token )  {
  const url = "https://support.apps.darva.com/"+'rest/api/2/issue/SINAPPSHAB-'+JIRA_TICKET+'/transitions'
  const jsonData = {
      transition:{
        id:status}
      }

    fetch(url, {
      method: 'POST',
      body: JSON.stringify( jsonData),
      headers: {
        'Authorization': `Basic ${jira_token}`,
        'Accept': 'application/json'
      }
    })
    .then(response => {
      core.info(
        `Response: ${response.status} ${response.statusText}`
      );
      return response.text();
    })
    .then(text => core.info(text))
    .catch(err => core.info(err));
}

async function getJiraTicket (ticket , jira_token ) {
  const url = "https://support.apps.darva.com/"+'rest/api/2/issue/SINAPPSHAB-'+ticket
  fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${jira_token}`,
      'Accept': 'application/json'
    }
  })
  .then(response => {
    core.info(
      ` getJiraTicket Response: ${response.status} ${response.statusText}`
    );
    return response.text();
  })
  .then(text => core.info(text))
  .catch(err => core.info(err));
}

async function  setJiraTicketAControler ( JIRA_TICKETS) {
  JIRA_TICKETS.forEach ( ticket => setJiraTicketStatus(ticket, "41"))
}

async function getMileStoneFromEtiquette ( etiquettesTicketJira ) {
  if ( etiquettesTicketJira.contains('FLUOR-BIS') ) {
      core.info ('on set FLUOR-BIS')
      return 55
  } else if (  etiquettesTicketJira.contains('FLUOR') ) {
      core.info ('on set FLUOR')
      return 53
  } else if (  etiquettesTicketJira.contains('PALLADIUM') ) {
      core.info ('on set PALLADIUM')
      return 52
  } else if (  etiquettesTicketJira.contains('ARGON') ) {
      core.info ('on set ARGON')
      return 54
  } else return 54 
}






// most @actions toolkit packages have async methods
async function run() {
  try {
    const title = github.context.payload.pull_request.title;
    core.info(`Processing PR:${title}  ...`)

    const repo = core.getInput('repo', {required: true})
    const owner = core.getInput('owner', {required: true})
    const pr_number = core.getInput('pr_number', {required: true})
    const github_token = core.getInput('github_token', {required: true})
    const jira_token = core.getInput('jira_token', {required: true})
    const JIRA_TICKETS = core.getInput('jira_tickets', {required: true})

    const octokit = new github.getOctokit(github_token)
    const { data: pullRequestContent } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pr_number,
    });

    const setPrMilestone =  ( etiquettesTicketJira ) => {
      const milestoneToSet =  getMileStoneFromEtiquette(etiquettesTicketJira)
      octokit.rest.pulls.update({
        owner,
        repo,
        pull_number: pr_number,
        body: { ...pullRequestContent, milestone: milestoneToSet }
      });
    }

    setJiraTicketAControler(JIRA_TICKETS, jira_token)
    const jsonTicket = getJiraTicket(JIRA_TICKETS[0], jira_token)
    //on récupere la liste des etiquettes du Jira
    const etiquettesTicketJira = jsonTicket.fields.labels
    core.info(`Etiquettes trouvées dans le ticket Jira:${etiquettesTicketJira}`)

    core.info('Traitement du Milestone:')
    setPrMilestone( etiquettesTicketJira)


  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
