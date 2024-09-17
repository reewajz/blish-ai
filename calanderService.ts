import axios from "axios";
const { GoogleGenerativeAI } = require("@google/generative-ai");
import config from "./config";
const { ACCESS_TOKEN } = config;

// Function to fetch events from Microsoft Outlook Calendar
export async function fetchOutlookCalendarEvents() {
  const accessToken = ACCESS_TOKEN;
  const now = new Date();
  const endTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  ).toISOString();

  const url = `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${now.toISOString()}&endDateTime=${endTime}&$select=subject,start,end&$orderby=start/dateTime`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const events = response.data.value;
    console.log(events); // Logs the fetched events
  } catch (error) {
    console.error(error);
  }
}

export async function createOutlookCalendarEvent(eventDetails: {
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees: { emailAddress: { address: string; name?: string } }[];
  body?: { contentType: "HTML" | "Text"; content: string };
}) {
  const url = `https://graph.microsoft.com/v1.0/me/events`;

  try {
    const response = await axios.post(url, eventDetails, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Event created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}
const eventDetails = {
  subject: "Testing of Automation",
  start: {
    dateTime: "2024-06-16T16:00:00+05:45",
    timeZone: "Asia/Kathmandu",
  },
  end: {
    dateTime: "2024-06-16T16:30:00+05:45",
    timeZone: "Asia/Kathmandu",
  },
  attendees: [
    {
      emailAddress: {
        address: "user@gmail.com",
        name: "user",
      },
    },
  ],
};

export async function extractEventDetailsFromPrompt(
  userPrompt: string
): Promise<{
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees: { emailAddress: { address: string; name?: string } }[];
  body?: { contentType: "HTML" | "Text"; content: string };
}> {
  const extractedDetailsText = await run(userPrompt);

  const extractedDetails = extractAndParseJSON(extractedDetailsText);

  return {
    subject: extractedDetails.subject,
    start: extractedDetails.start,
    end: extractedDetails.end,
    attendees: extractedDetails.attendees,
    body: extractedDetails.body,
  };
}

const genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY);

async function run(description: string) {
  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Extract subject, start: { dateTime: [in iso string]; timeZone: [harcoded to nepali time] };end: { dateTime: [in iso string]; timeZone: [harcoded to nepali time] };attendees: { emailAddress: { address: string; name?: string } }[] from the following description in json format:\n${description}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log("from calendar::", text);
  return text;
}

function extractAndParseJSON(text: string): any {
  // Regular expression to match a JSON object
  const jsonRegex = /\{[\s\S]*\}/;
  const match = text.match(jsonRegex);

  if (match) {
    try {
      const json = JSON.parse(match[0]);
      return json;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  } else {
    console.log("No JSON found in the text.");
    return null;
  }
}
