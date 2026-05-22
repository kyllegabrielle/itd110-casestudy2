# Crime Incident Mapping System (CIMS)

## Project Overview
A graph-based public safety and security web application designed to manage and visualize crime-related data. By leveraging Neo4j, the system highlights the power of graph relationships in identifying patterns between suspects, incidents, officers, and locations.

### Tech Stack
- **Frontend:** React + Vite, Tailwind CSS, Recharts
- **Backend:** Node.js + Express
- **Database:** Neo4j (Graph Database)
- **State Management:** React Context or Redux
- **Authentication:** JWT (Optional)
- **Tools:** Axios, Lucide-React, qrcode.react

---

## Recommended Folder Structure
```text
neo4j-crime-system/
├── backend/
│   ├── config/             # Database connection, env config
│   ├── controllers/        # Route logic (Business logic)
│   ├── routes/             # API route definitions
│   ├── middleware/         # Auth, error handling, validation
│   ├── utils/              # Cypher query helpers, backups
│   ├── .env                # Environment variables (Git ignored)
│   ├── package.json
│   └── server.js           # Express entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components (Common, Layout, Charts)
│   │   ├── pages/          # Dashboard, IncidentManagement, Login
│   │   ├── assets/         # Images, global styles
│   │   ├── hooks/          # Custom hooks for API calls
│   │   ├── context/        # Global state (Auth, UI)
│   │   ├── utils/          # Formatting, constants
│   │   └── App.jsx
│   ├── .env                # Frontend environment variables
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── GEMINI.md               # Project instructions and architecture
```

---

## Development Conventions

### API Route Conventions
- **Endpoint Prefix:** `/api/v1`
- **Resource Naming:** Plural nouns (e.g., `/api/v1/incidents`).
- **Standard Methods:**
  - `GET /incidents` - List all incidents
  - `GET /incidents/:id` - Detailed view
  - `POST /incidents` - Create new record
  - `PUT /incidents/:id` - Update record
  - `DELETE /incidents/:id` - Soft/Hard delete
- **Analytics:** `/api/v1/dashboard/stats`

### React Component Conventions
- **Functional Components:** Use arrow functions and React Hooks.
- **File Naming:** PascalCase for components (e.g., `IncidentCard.jsx`).
- **Styling:** Utility-first with Tailwind CSS.
- **Props:** Destructure props in the function signature.
- **Separation of Concerns:** Keep complex logic in custom hooks.

### Neo4j / Cypher Query Conventions
- **Labels:** PascalCase (e.g., `(:Incident)`, `(:Suspect)`).
- **Relationships:** UPPER_SNAKE_CASE (e.g., `[:INVOLVED_IN]`).
- **Properties:** camelCase (e.g., `incidentDate`, `reportStatus`).
- **Injection Prevention:** **ALWAYS** use parameters (`$param`) instead of string template literals for user input.
- **Example Query:**
  ```cypher
  MATCH (s:Suspect)-[:INVOLVED_IN]->(i:Incident)
  WHERE i.id = $incidentId
  RETURN s, i
  ```

---

## Neo4j Schema Design (Graph Model)

### Core Nodes
- `(Incident)`: {id, title, description, dateTime, status}
- `(Suspect)`: {id, name, aliases, description, riskLevel}
- `(Officer)`: {id, name, badgeNumber, rank}
- `(Location)`: {id, address, coordinates, zone}
- `(CrimeType)`: {id, name, severity}
- `(Victim)`: {id, name, contactInfo}

### Relationships
- `(Suspect) -[:INVOLVED_IN]-> (Incident)`
- `(Incident) -[:OCCURRED_AT]-> (Location)`
- `(Officer) -[:HANDLED]-> (Incident)`
- `(Incident) -[:HAS_TYPE]-> (CrimeType)`
- `(Victim) -[:AFFECTED_BY]-> (Incident)`

---

## Suggested Dependencies

### Backend
- `express`: Fast, unopinionated web framework.
- `neo4j-driver`: Official driver for Neo4j.
- `dotenv`: Zero-dependency module that loads environment variables.
- `cors`: Middleware to enable CORS.
- `morgan`: HTTP request logger.
- `joi` or `zod`: Schema validation for API requests.

### Frontend
- `recharts`: A composable charting library built on React components.
- `axios`: Promise based HTTP client.
- `react-router-dom`: Declarative routing for React.
- `lucide-react`: Beautiful & consistent icon toolkit.
- `qrcode.react`: React component for generating QR codes.
- `date-fns`: Modern JavaScript date utility library.

---

## Coding Standards & Standards
- **ESLint & Prettier:** Use the project's `.eslintrc` and `.prettierrc` (if present) to maintain code style.
- **Async/Await:** Use `async/await` with `try/catch` blocks for all asynchronous operations.
- **Error Handling:** Implement a global error handler in the backend and use Error Boundaries in the frontend.
- **Naming:**
  - Variables/Functions: `camelCase`
  - Components/Classes: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`

---

## Suggested Development Workflow
1. **Model Data:** Finalize the Cypher model and test queries in Neo4j Browser/Bloom.
2. **Backend API:** Implement Express routes and Neo4j controllers.
3. **Frontend Shell:** Set up Vite, Tailwind, and basic routing.
4. **CRUD Integration:** Connect the Incident management forms to the Backend.
5. **Analytics:** Implement Dashboard charts using Recharts.
6. **Advanced Features:** Add Search, JSON backup, and QR code generation.

---

## Git Commit Naming Conventions
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: ...` - A new feature
- `fix: ...` - A bug fix
- `docs: ...` - Documentation changes
- `style: ...` - Changes that do not affect the meaning of the code
- `refactor: ...` - A code change that neither fixes a bug nor adds a feature
- `perf: ...` - A code change that improves performance

---

## Environment Variable Setup

**Backend (`backend/.env`):**
```env
PORT=5000
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Example API Structure
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/incidents` | Get all incidents |
| POST | `/api/v1/incidents` | Create a new incident |
| GET | `/api/v1/incidents/search` | Search incidents by title/type |
| GET | `/api/v1/dashboard/stats` | Get chart data (incidents by type/status) |
| GET | `/api/v1/backup/download` | Export data as JSON |

---

## Deployment Suggestions
- **Database:** [Neo4j AuraDB](https://neo4j.com/cloud/aura/) (Free tier available).
- **Backend:** [Render](https://render.com/) or [Railway](https://railway.app/).
- **Frontend:** [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/).

---

## Dashboard & Chart Suggestions
- **Incident Trends:** AreaChart showing incidents over time.
- **Crime Type Distribution:** PieChart showing the breakdown of incident types.
- **Officer Workload:** BarChart comparing incidents handled per officer.
- **Status Overview:** Simple DonutChart for (Open/Closed/Pending) incidents.

---

## Bonus Feature Recommendations
- **Geospatial Mapping:** Use `react-leaflet` to plot incident locations on a real map.
- **Graph Visualization:** Use `react-force-graph` or `neovis.js` to show interactive incident-suspect relationships.
- **Audit Logs:** Track who edited an incident and when.
- **Bulk Import:** Upload CSV files to seed the graph.
