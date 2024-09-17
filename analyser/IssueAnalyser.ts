import { JiraIssue } from "../interface/jira.interface";

export class IssueStressAnalyzer {
  private issue: JiraIssue;

  constructor(issue: JiraIssue) {
    this.issue = issue;
  }

  private getTimeDiscrepancy(): number {
    console.log("empty :::::", this.issue.fields);
    const { timespent, timeoriginalestimate } = this.issue.fields;
    if (timespent && timeoriginalestimate) {
      return timespent - timeoriginalestimate;
    }
    return 0;
  }

  private isHighPriority(): boolean {
    return this.issue.fields.priority.name === "Highest";
  }

  private isInProgress(): boolean {
    return this.issue.fields.status.name === "In Progress";
  }

  private daysSinceLastUpdate(): number {
    const updatedDate = new Date(this.issue.fields.updated);
    const currentDate = new Date();
    return (currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24);
  }

  public analyzeStressLevel(): string {
    const timeDiscrepancy = this.getTimeDiscrepancy();
    const stressFactors = [
      timeDiscrepancy < 0,
      this.isHighPriority(),
      this.isInProgress(),
      this.daysSinceLastUpdate() < 2,
    ];

    const stressLevel = stressFactors.some((condition) => condition)
      ? "High"
      : "Low";
    return `Issue Type: ${this.issue.fields.issuetype.name}, Stress Level: ${stressLevel}`;
  }
}
