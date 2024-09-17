export interface JiraIssue {
  fields: {
    issuetype: {
      name: string;
    };
    timespent: number;
    timeoriginalestimate: number;
    priority: {
      name: string;
    };
    status: {
      name: string;
    };
    description: {
      version: number;
      type: string;
      content: Record<string, any>[];
    };
    created: string;
    updated: string;
  };
}
