const core = require("@actions/core");
const github = require("@actions/github");
const fetch = require("node-fetch");
const defaultMilestone = 54;
const { Octokit } = require('@octokit/action')
const octokit =new Octokit()
const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
const pr_number= core.getInput("pr_number", { required: true });
async function getJiraTicket(ticket, jira_token) {
  core.info(`in  getJiraTicket ${ticket} `);
  const jira_url_Api= core.getInput("jira_url_Api", { required: true });
  const url = jira_url_Api + ticket;
  const toto = fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${jira_token}`,
      Accept: "application/json",
    },
  })
    .then((response) => {
      const res = response.json();
      core.info(`response ${res}`);
      return res;
    })
    .catch((err) => core.info(err));

  return toto;
}

async function getMileStoneFromEtiquette(etiquettesTicketJira) {
  if (etiquettesTicketJira.includes("PHOSPHORE")) {
    core.info("on set PHOSPHORE");
    return 2;
  }
  if (etiquettesTicketJira.includes("FLUOR-BIS")) {
    core.info("on set FLUOR-BIS");
    return 55;
  } else if (etiquettesTicketJira.includes("FLUOR")) {
    core.info("on set FLUOR");
    return 53;
  } else if (etiquettesTicketJira.includes("PALLADIUM")) {
    core.info("on set PALLADIUM");
    return 52;
  } else if (etiquettesTicketJira.includes("ARGON")) {
    core.info("on set ARGON");
    return 2;
  } else return defaultMilestone;
}

// most @actions toolkit packages have async methods
async function run() {
  try {
    const title = github.context.payload.pull_request.title;
    core.info(`Processing PR__time passes data:${title}  ...`);
    const jira_token = core.getInput("jira_token", { required: true });
    const inputJiraTickets =  core.getInput("jira_tickets", { required: false })
    const JIRA_TICKETS = inputJiraTickets ?  JSON.parse(inputJiraTickets) :[] ;
    core.info(`Processing PR :${title}  ...`);
    let milestoneNumberToSet = defaultMilestone;
    if (JIRA_TICKETS.length > 0) {
      const jsonTicket = await getJiraTicket(JIRA_TICKETS[0], jira_token);
      core.info(`after  getJiraTicket`);
      //on récupere la liste des etiquettes du Jira
      const etiquettesTicketJira = jsonTicket.fields.labels;
      core.info(`after  etiquettesTicketJira ${etiquettesTicketJira}`);
      core.info(
        `Etiquettes trouvées dans le ticket Jira:${etiquettesTicketJira}`
      );

      core.info("Traitement du Milestone:");
      milestoneNumberToSet = await getMileStoneFromEtiquette(
        etiquettesTicketJira
      );
    }
    core.info(`we output milestone number:${milestoneNumberToSet}`);
    await updateMileStone(milestoneNumberToSet)
    core.setOutput("milestone", milestoneNumberToSet);
  

  } catch (error) {
    core.setFailed(error.message);
  }
}
async function updateMileStone(milestoneNumberToSet){

  const milestoneToSet =  {
    "url": "https://api.github.com/repos/sindva/JiraLinkedPullRequestAction/milestones/5",
    "html_url": "https://github.com/sindva/JiraLinkedPullRequestAction/milestone/5",
    "labels_url": "https://api.github.com/repos/sindva/JiraLinkedPullRequestAction/milestones/5/labels",
    "id": 8045255,
    "node_id": "MI_kwDOHbpJYc4AesLH",
    "number": 5,
    "title": "ARGON",
    "description": null,
    "creator": {
      "login": "sandcht",
      "id": 99471869,
      "node_id": "U_kgDOBe3R_Q",
      "avatar_url": "https://avatars.githubusercontent.com/u/99471869?v=4",
      "gravatar_id": "",
      "url": "https://api.github.com/users/sandcht",
      "html_url": "https://github.com/sandcht",
      "followers_url": "https://api.github.com/users/sandcht/followers",
      "following_url": "https://api.github.com/users/sandcht/following{/other_user}",
      "gists_url": "https://api.github.com/users/sandcht/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/sandcht/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/sandcht/subscriptions",
      "organizations_url": "https://api.github.com/users/sandcht/orgs",
      "repos_url": "https://api.github.com/users/sandcht/repos",
      "events_url": "https://api.github.com/users/sandcht/events{/privacy}",
      "received_events_url": "https://api.github.com/users/sandcht/received_events",
      "type": "User",
      "site_admin": false
    },
    "open_issues": 1,
    "closed_issues": 0,
    "state": "open",
    "created_at": "2022-06-03T07:10:11Z",
    "updated_at": "2022-06-03T10:06:16Z",
    "due_on": null,
    "closed_at": null
  }

  core.info(`in update = ${milestoneNumberToSet} ${pr_number}`)
   await octokit.rest.issues.update({
    owner,
    repo,
    title : 'new title' ,
    issue_number: pr_number,
    milestone: milestoneToSet,
  });
}
if(octokit){
  run();
}

