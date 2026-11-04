# Insightlopedia

> A curated insight encyclopedia delivering timeless quotes and ideas indexed by influential figures and tags.

---

## ⚡ Quick Start

The repository includes a public, pre-populated SQLite database (`backend/test.db`), so no database provisioning or seed steps are needed.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- [npm](https://www.npmjs.com/)

### Setup & Run
```bash
git clone https://github.com/your-username/Insightlopedia.git
cd Insightlopedia

# 1. Install dependencies
npm install

# 2. Start development (both API and App concurrently)
npm run dev
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:3001](http://localhost:3001)

---

## 🛠️ Available Commands

Only two commands are needed from the repository root:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express API (`:3001`) with live reload and React App (`:3000`) concurrently for local development. |
| `npm start` | Starts both the API and client services concurrently. |

---

## 📁 Repository Structure

```text
Insightlopedia/
├── package.json              # Root orchestrator exposing 'npm run dev' & 'npm start'
├── .gitignore                # Git ignore rules (node_modules, build outputs, keeps test.db)
├── README.md                 # Project guide & API documentation
│
├── backend/                  # REST API Service (Node.js + Express)
│   ├── package.json          # Backend scripts & dependencies (express, cors, sqlite3)
│   ├── server.js             # API routes & non-destructive SQLite connection
│   └── test.db               # Public, version-controlled SQLite database (pre-seeded)
│
└── app/                      # Client Application (React + TypeScript)
    ├── package.json          # Frontend dependencies & CRA scripts
    ├── tsconfig.json         # TypeScript compiler configuration
    ├── public/               # HTML template & public web assets
    └── src/
        ├── App.tsx           # Main application view & clean quote filter state
        ├── App.css           # UI styling & theme
        ├── components/       # Modular UI components (QuoteCard, TagBar)
        ├── services/         # API client layer (fetchQuotes, fetchFigures)
        ├── types/            # TypeScript data models (Figure, Quote)
        ├── db/               # Backward-compatible component exports
        └── index.tsx         # React DOM entrypoint
```

---

## 🔌 API Reference

The backend provides a lightweight REST API querying the public `test.db`:

### `GET /figures`
Returns all figures.
```json
{
  "figures": [
    { "id": 1, "firstName": "Sadhguru", "lastName": "" },
    { "id": 2, "firstName": "Jordan", "lastName": "Peterson" }
  ]
}
```

### `GET /quotes`
Returns quotes, with optional tag filtering.
- **Query Parameter:** `tag` *(optional)* — e.g. `/quotes?tag=life`
```json
{
  "quotes": [
    {
      "id": 4,
      "figure_id": 1,
      "text": "If you resist change, you resist life.",
      "tags": "change,life"
    }
  ]
}
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](file:///Users/e.mojy.core/Documents/GitHub/Insightlopedia/LICENSE) file.
