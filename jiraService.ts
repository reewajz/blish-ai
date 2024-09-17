import axios, { AxiosRequestConfig } from "axios";
import { IssueStressAnalyzer } from "./analyser/IssueAnalyser";
import { JiraIssue } from "./interface/jira.interface";
import { fetchOutlookCalendarEvents } from "./calanderService";
const { GoogleGenerativeAI } = require("@google/generative-ai");
import config from "./config";
import { extractContentText } from "./jiraContentParser";

const JIRA_API_URL = process.env.JIRA_API_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

/**
 * periodically check the user's assigned tickets from Jira and ask if user is facing any issue
 * if any then try to give few suggestions by reading description of the ticket
 * only one jira ticket desc is read at a time
 *
 * using calendar events we can also check if user is busy in any meeting or not
 */

// Function to get user's assigned tickets from Jira
export async function getUserTickets(userEmail?: string): Promise<any> {
  const jiraEmail = userEmail || JIRA_EMAIL;
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Basic ${Buffer.from(
        jiraEmail + ":" + JIRA_API_TOKEN
      ).toString("base64")}`,
      Accept: "application/json",
    },
  };
  try {
    // const response = await axios.get(
    //   `${JIRA_API_URL}/search?jql=assignee=currentUser() AND Sprint=${sprintId}`,
    //   config
    // );
    const response = await axios.get(
      `${JIRA_API_URL}/search?jql=assignee=currentUser()`,
      config
    );
    return response.data.issues;
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    throw error;
  }
}

export async function getJiraTicketById(ticketId: string): Promise<JiraIssue> {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Basic ${Buffer.from(
        JIRA_EMAIL + ":" + JIRA_API_TOKEN
      ).toString("base64")}`,
      Accept: "application/json",
    },
  };
  try {
    const response = await axios.get(
      `${JIRA_API_URL}/issue/${ticketId}`,
      config
    );
    const jiraIssue: JiraIssue = response.data;
    const description = extractContentText(
      jiraIssue.fields.description.content
    );
    const genAI = run(description);
    return genAI;
  } catch (error) {
    console.error("Error fetching Jira ticket by ID:", error);
    throw error;
  }
}

async function analyzeUserTickets() {
  try {
    const issues = await getUserTickets();
    for (const issue of issues) {
      console.log("Analyzing issue:", issue.key);
      const issueStressAnalyzer = new IssueStressAnalyzer(issue);
      /**
       * if issue level is high we can add comments on jira ...
       * by reading the description ai try to give few suggestions
       */
      console.log(issueStressAnalyzer.analyzeStressLevel());
    }
  } catch (error: any) {
    console.error("Error occurred:", error.message);
  }
}

const genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY);

async function run(description: string) {
  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Provide a solution for the following problem:\n${description}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}

// run();
// analyzeUserTickets();

// fetchOutlookCalendarEvents();
