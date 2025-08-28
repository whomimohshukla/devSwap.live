Roadmaps Data (Easy Editing)

Where to edit
- Folder: src/data/roadmaps
- Built-in dataset: index.ts (baseRoadmaps)
- Simple overrides/additions: drop a JSON file in this folder.

How it works
- We load all .json files in this folder at build/dev time (Vite import.meta.glob).
- If a JSON roadmap has the same id as a built-in one, it overrides it.
- If it has a new id, it is added.

JSON shape (must match types in src/lib/roadmaps.ts)
{
  "id": "data-analyst",
  "title": "Data Analyst Roadmap",
  "level": "beginner",
  "description": "Spreadsheets, SQL, BI tools, and storytelling with data.",
  "tags": ["SQL", "Excel", "BI"],
  "stages": [
    {
      "id": "fundamentals",
      "title": "Fundamentals",
      "summary": "Core tools and data literacy.",
      "steps": [
        {
          "id": "excel",
          "title": "Excel/Sheets Basics",
          "description": "Cells, formulas, charts, pivot tables, data cleaning.",
          "resources": [
            { "label": "Google Sheets", "href": "https://support.google.com/a/users/answer/9282959" }
          ]
        }
      ]
    }
  ]
}

Quick start
1) Copy example.data-analyst.json to data-analyst.json.
2) Edit fields you want. Save.
3) The site hot-reloads; your changes appear immediately.

Importing in code
- Prefer: import { roadmaps } from '@/data/roadmaps'
- Legacy (still works): import { roadmaps } from '@/lib/roadmaps'

Notes
- Keep ids stable. The Graph/List pages use the id to navigate.
- For internal Learn links, use paths like /learn/react, /learn/nodejs.
- You can split different roadmaps into separate JSON files (e.g., python.json, devops.json) for easier maintenance.
