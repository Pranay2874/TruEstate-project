# System Architecture - TruEstate Project

## 1. Backend Approach
I built the backend using **Node.js** and **Express**. I chose a **Layered Architecture** because it keeps the code organized and easy to debug.

### Folder Structure
*   `src/index.js` - This is where the app starts and DB connection happens.
*   `src/routes` - I separated the routes to keep `index.js` clean.
*   `src/controllers` - All the logic for sorting, filtering, and stats lives here.
*   `src/models` - The Mongoose schema.
*   `src/utils` - I put the CSV seeder script here.

### How Data Flows
1.  **Request**: When you change a filter on the frontend, it sends a GET request.
2.  **Controller**: I check `req.query` for things like `search` or `minAge`.
3.  **Query Building**: I build a MongoDB query object dynamically. For example, if you search "John", I add a regex to the query.
4.  **Aggregation**: For the top stats bar, I run an aggregation pipeline on the *same query* so the stats match the table exactly.

---

## 2. Frontend Approach
I used **React (Vite)** because it's fast. I didn't use any UI libraries like MUI or Bootstrap because I wanted to show I can write custom **CSS**.

### Key Components
*   `App.jsx` - This is the "brain". It holds the state for `filters`, `page`, and `data`. It passes these down to children.
*   `Sidebar.jsx` & `Header.jsx` - Static layout parts.
*   `FilterPanel.jsx` - This was the hardest part. It handles all the dropdowns and date inputs.
*   `TransactionTable.jsx` - Just takes data and displays it.

### State Management
I decided to stick with simple **React Context / State** in `App.jsx` because Redux would be overkill for this size of project.
*   The `search` input has a debounce so it doesn't lag.
*   `useEffect` triggers a new API fetch whenever `page` or `filters` change.

---

## 3. Why I made these choices
| Decision | Why? |
| :--- | :--- |
| **Vanilla CSS** | To keep the bundle size small and demonstrate CSS skills. |
| **MongoDB Aggregations** | I wanted the stats (Total Amount) to be 100% accurate across all pages, not just the one being viewed. |
| **Custom Seeder** | The dataset was too big for a simple JSON import, so I wrote a stream-based parser. |

