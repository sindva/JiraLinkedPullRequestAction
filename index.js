const core = require("@actions/core");
const github = require("@actions/github");
const fetch = require("node-fetch");
const defaultMilestone = 54;
const { Octokit } = require('@octokit/action')
const octokit =new Octokit()
//const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
//const issue_number = github.context.issue.number
async function getJiraTicket(ticket, jira_token) {
  core.info(`in  getJiraTicket ${ticket} `);
  const jira_url_Api= core.getInput("jira_url_Api", { required: true });
  const url = jira_url_Api + ticket;
  core.info(url)
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
    return 54;
  } else return defaultMilestone;
}
const jira_token = core.getInput("jira_token", { required: true });
const pr_num = core.getInput("pr_number", { required: true })
// most @actions toolkit packages have async methods
async function run() {
  try {
    const title = github.context.payload.pull_request.title;
    core.info(`Processing PR__time passes data:${title}  ...`);

 
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
    //let resp =   await updateMileStone(milestoneNumberToSet)
    //core.info(`milestone ... ${resp}`);

    core.setOutput("milestone", milestoneNumberToSet);
  

  } catch (error) {
    core.setFailed(error.message);
  }
}
const client = new github.GitHub(jira_token);
async function updateMileStone (milestoneNumberToSet){

await client.issues.update({
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  issue_number: pr_num,
  milestone: milestoneNumberToSet,
});
}

if(octokit){
  run();
}

