import express, { Request, Response } from "express";
import { getJiraTicketById, getUserTickets } from "./jiraService";
import {
  createOutlookCalendarEvent,
  extractEventDetailsFromPrompt,
} from "./calanderService";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get(
  "/jira-tickets/email/:userEmail",
  async (req: Request, res: Response) => {
    const { userEmail } = req.params;
    try {
      const tickets = await getUserTickets(userEmail);
      res.json(tickets);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  }
);

app.get("/jira-tickets/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const tickets = await getJiraTicketById(id);
    res.json(tickets);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.post("/create-outlook-event", async (req: Request, res: Response) => {
  const { eventDetails } = req.body;
  try {
    const createdEvent = await createOutlookCalendarEvent(eventDetails);
    res.json(createdEvent);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.post("/create-event-from-prompt", async (req: Request, res: Response) => {
  console.log("req ", req.body);

  const { userPrompt } = req?.body;
  try {
    const eventDetails = await extractEventDetailsFromPrompt(userPrompt);
    const createdEvent = await createOutlookCalendarEvent(eventDetails);
    res.json(createdEvent);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
