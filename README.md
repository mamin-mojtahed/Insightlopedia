# Insightlopedia

> A curated insight encyclopedia delivering timeless quotes and ideas indexed by influential figures and topics.

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

### Top-Level NPM Scripts

Execute these commands from the repository root:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express API (`:3001`) with live reload and React App (`:3000`) concurrently. |
| `npm start` | Starts both the API and client services concurrently. |
| `npm run add-quote` | Launches the CLI wizard or flag-driven tool to add a new quote into the database. |
| `npm run delete-quote` | Launches the CLI wizard or flag-driven tool to delete a quote from the database. |
| `npm test --workspace=app` | Runs the frontend test suites with Jest and React Testing Library. |
| `npm run build --workspace=app` | Compiles an optimized production build of the React application. |

---

### ✍️ Adding Quotes via CLI

Quotes can be added directly from the command line without opening the web interface. If topics/tags are omitted, non-auxiliary keywords are automatically extracted from the quote text, and the author figure is automatically resolved or registered in the database.

#### 1. Interactive Mode
Run the command without arguments to enter an interactive prompt:
```bash
npm run add-quote
```
```text
--- Insightlopedia: Add a New Quote ---
Enter quote: Simplicity is the ultimate sophistication.
Enter author: Leonardo da Vinci
Enter topics/tags (optional, comma-separated): 

✓ Quote successfully added to Insightlopedia!
  ID:     17
  Quote:  "Simplicity is the ultimate sophistication."
  Author: Leonardo da Vinci (Figure ID: 5)
  Topics: simplicity, ultimate, sophistication
```

#### 2. Flag-Driven Mode
Pass parameters directly via command-line flags:
```bash
# Automated topic extraction:
npm run add-quote -- --quote "He who has a why to live can bear almost any how." --author "Friedrich Nietzsche"

# With custom topics:
npm run add-quote -- --quote "Know thyself." --author "Socrates" --tags "philosophy, wisdom, self-awareness"
```

#### 3. Direct Node Invocation
```bash
node backend/cli.js --quote "..." --author "..." [--tags "..."]
# or positional:
node backend/cli.js "Quote text" "Author Name" "tag1, tag2"
```

---

### 🗑️ Deleting Quotes via CLI

Quotes can be removed directly via the command line with safety confirmation checks.

#### 1. Interactive Mode
Run without arguments to enter the interactive prompt:
```bash
npm run delete-quote
```
```text
--- Insightlopedia: Delete Quote ---
Enter the ID of the quote to delete: 18

Found Quote #18:
  "A quote to test cancel."
  — Tester

Are you sure you want to delete this quote? (y/N): y

✓ Quote 18 successfully deleted from Insightlopedia!
  Deleted Quote: "A quote to test cancel."
  Author:        Tester
```

#### 2. Target by ID (with confirmation prompt)
Specify the quote ID directly:
```bash
npm run delete-quote -- 18
```

#### 3. Force Delete (bypass confirmation)
Useful for automated scripts and CI/CD pipelines using `--yes`, `-y`, or `--force`:
```bash
npm run delete-quote -- 18 --yes
```

#### 4. Direct Node Invocation
```bash
node backend/deleteQuote.js <id> [--yes]
# or through the main CLI:
node backend/cli.js delete <id> [--yes]
```

---

## 🎨 User Interface Features

- **Unified Filtering**:
  - A single search bar drives all filtering without confusing "filter-within-filtered" states.
  - Tapping any **topic tag**, **author name**, or **non-auxiliary word in quotes** automatically populates or clears the search bar.
- **Add Quote Modal (+)**:
  - An icon-only plus button positioned to the left of the search bar opens a modal dialog to input a quote, author (with auto-suggestions from known figures), and optional topics.
- **Subtle Delete Button with Confirmation**:
  - Located on the top-right of each quote card.
  - Subtle, low-opacity trash icon (`Trash2` from Lucide) that expands into an inline `Delete? [Delete] [Cancel]` confirmation pill to prevent accidental removals.
  - Dismissible via button click, clicking outside the card, or pressing `Escape`.

---

## 📁 Repository Structure

```text
Insightlopedia/
├── package.json              # Root orchestrator exposing 'npm run dev', 'add-quote', 'delete-quote'
├── .gitignore                # Git ignore rules (node_modules, build outputs, keeps test.db)
├── README.md                 # Project guide & API documentation
│
├── backend/                  # REST API & CLI Services (Node.js + Express + SQLite)
│   ├── package.json          # Backend scripts & dependencies (express, cors, sqlite3)
│   ├── server.js             # API routes & non-destructive SQLite connection
│   ├── addQuote.js           # Shared logic for quote insertion & automatic topic extraction
│   ├── deleteQuote.js        # Shared logic & CLI tool for safe quote deletion
│   ├── cli.js                # Unified command line interface (add & delete)
│   └── test.db               # Public, version-controlled SQLite database (pre-seeded)
│
└── app/                      # Client Application (React + TypeScript)
    ├── package.json          # Frontend dependencies & scripts
    ├── tsconfig.json         # TypeScript compiler configuration
    ├── public/               # HTML template & public web assets
    └── src/
        ├── App.tsx           # Main application view & unified filter state
        ├── App.css           # UI styling, responsive design & animations
        ├── components/
        │   ├── AddQuoteModal.tsx   # Modal dialog for adding quotes
        │   ├── QuoteCard.tsx       # Quote card with word-tapping & subtle delete action
        │   ├── SearchBar.tsx       # Search bar with plus icon trigger
        │   └── TagBar.tsx          # Topic tag navigation bar
        ├── services/
        │   └── api.ts        # Client API layer (fetchQuotes, createQuote, deleteQuote)
        ├── types/
        │   └── index.ts      # TypeScript interfaces (Quote, Figure)
        ├── utils/
        │   └── textUtils.ts  # Tokenizer & auxiliary word filter
        └── index.tsx         # React DOM entrypoint
```

---

## 🔌 REST API Reference

The backend provides a lightweight REST API backed by `backend/test.db`:

### `GET /quotes`
Returns quotes, optionally filtered by tag.
- **Query Parameter:** `tag` *(optional)* — e.g. `/quotes?tag=life`
- **Response:**
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

### `POST /quotes`
Adds a new quote. Automatically creates author figure if not already existing, and automatically derives salient topics if `tags` is omitted.
- **Request Body:**
```json
{
  "text": "Simplicity is the ultimate sophistication.",
  "author": "Leonardo da Vinci",
  "tags": "simplicity, design"
}
```
- **Response (201 Created):**
```json
{
  "quote": {
    "id": 17,
    "figure_id": 5,
    "text": "Simplicity is the ultimate sophistication.",
    "tags": ["simplicity", "design"]
  },
  "figure": {
    "id": 5,
    "firstName": "Leonardo",
    "lastName": "da Vinci"
  }
}
```

### `DELETE /quotes/:id`
Deletes a quote by ID.
- **URL Parameter:** `id` — Numeric ID of the quote.
- **Response (200 OK):**
```json
{
  "message": "Quote deleted successfully",
  "id": 18,
  "quote": {
    "id": 18,
    "text": "A quote to test cancel.",
    "tags": ["quote", "test", "cancel"],
    "author": "Tester"
  }
}
```

### `GET /figures`
Returns all registered figures.
- **Response:**
```json
{
  "figures": [
    { "id": 1, "firstName": "Sadhguru", "lastName": "" },
    { "id": 2, "firstName": "Jordan", "lastName": "Peterson" }
  ]
}
```

### `GET /health`
Service health check and timestamp.
- **Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-11-08T03:00:00.000Z"
}
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file.
