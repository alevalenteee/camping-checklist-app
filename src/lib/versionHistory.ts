interface VersionUpdate {
  version: string;
  date: string;
  features: string[];
}

export const versionHistory: VersionUpdate[] = [
  {
    version: "1.1.0",
    date: "2024-03-20",
    features: [
      "Added list sharing functionality",
      "Users can now share their checklists via unique URLs",
      "Recipients can view and save shared lists to their account",
      "Added animated toast notifications for better UX",
      "Improved UI with new share button and animations"
    ]
  },
  {
    version: "1.0.0",
    date: "2024-03-19",
    features: [
      "Added swipe-to-edit functionality for mobile devices",
      "Improved UI responsiveness and animations",
      "Enhanced dark mode support",
      "Added checklist item capacity indicators"
    ]
  }
];

export const LATEST_VERSION = versionHistory[0].version; 