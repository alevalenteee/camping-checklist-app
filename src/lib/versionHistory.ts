interface VersionUpdate {
  version: string;
  date: string;
  features: string[];
}

export const versionHistory: VersionUpdate[] = [
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
  // New versions will be added here
];

export const LATEST_VERSION = versionHistory[0].version; 