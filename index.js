const core = require("@actions/core");
const github = require("@actions/github");
const fetch = require("node-fetch");
const defaultMilestone = 56;

async function getJiraTicket(ticket, jira_token) {
  core.info(`in  getJiraTicket ${ticket} `);
  const jira_url_Api= core.getInput("jira_url_Api", { required: true });
  const url = jira_url_Api + ticket;
  const resp = fetch(url, {
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

  return resp;
}

async function getMileStoneFromEtiquette(etiquettesTicketJira) {
  if (etiquettesTicketJira.includes("PHOSPHORE")) {
    core.info("on set PHOSPHORE");
    return 56;
  } else if (etiquettesTicketJira.includes("FLUOR-BIS")) {
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

// most @actions toolkit packages have async methods
async function run() {
  try {
    const title = github.context.payload.pull_request.title;
    const existingMilestone = github.context.payload.pull_request.milestone;
    const jira_token = core.getInput("jira_token", { required: true });
    const inputJiraTickets =  core.getInput("jira_tickets", { required: false })
    const JIRA_TICKETS = inputJiraTickets ?  JSON.parse(inputJiraTickets) :[] ;
    core.info(`Processing PR :${title}  ... milestone ${existingMilestone && existingMilestone.title}`);
    let milestoneNumberToSet = defaultMilestone;
    if (JIRA_TICKETS.length > 0) {
      const jsonTicket = await getJiraTicket(JIRA_TICKETS[0], jira_token);
      //on récupere la liste des etiquettes du Jira
      const etiquettesTicketJira = jsonTicket.fields.labels;
      core.info(`found  etiquettesTicketJira ${etiquettesTicketJira}`);
      core.info(
        `Etiquettes trouvées dans le ticket Jira:${etiquettesTicketJira}`
      );
      core.info("Traitement du Milestone:");
      milestoneNumberToSet = await getMileStoneFromEtiquette(
        etiquettesTicketJira
      );
    } else {
      if ( existingMilestone !== null ) {
        milestoneNumberToSet = existingMilestone.number;
      }
    }
    core.info(`we output milestone number:${milestoneNumberToSet}`);
    core.setOutput("milestone", milestoneNumberToSet);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();


