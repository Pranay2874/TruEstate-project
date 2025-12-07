# Architecture Documentation - Retail Sales Management System

## 1. Backend Architecture

### Overview
The backend follows a **RESTful API** design using **Node.js** and **Express**, coupled with **MongoDB** for data persistence. The architecture emphasizes separation of concerns through a layered structure (Routes, Controllers, Services/Models).

### Directory Structure
- **src/index.js**: Entry point. initializes Express app, middleware (CORS, Body Parser), and DB connection.
- **src/routes/**: Defines API endpoints. Decouples HTTP routing from business logic.
- **src/controllers/**: Handles request processing, parameter validation, and invokes models/services. Returns standardized JSON responses.
- **src/models/**: Mongoose schemas defining data structure and validation rules.
- **src/utils/**: Helper scripts (e.g., Data Seeder).

### Data Flow
1. **Request**: Client sends GET request with query params (search, filters, page).
2. **Route**: `transactionRoutes` directs request to `transactionController`.
3. **Controller**: 
    - Extracts and sanitizes query parameters.
    - Constructs MongoDB aggregation/find queries.
    - Handles logic for Text Search (`$text`, `$regex`) and Range Filters (`$gte`, `$lte`).
4. **Database**: MongoDB executes query using optimized indices (Text Index on Name/Phone).
5. **Response**: JSON data with results and pagination metadata is returned.

## 2. Frontend Architecture

### Overview
Built with **React (Vite)**, the frontend focuses on a **Component-Based Architecture**. It uses **Vanilla CSS** with a modular approach and CSS Variables for a consistent, premium design system.

### Directory Structure
- **src/main.jsx**: Application entry point.
- **src/App.jsx**: Main layout container and state orchestrator.
- **src/components/**: Reusable UI elements (Sidebar, Header, FilterPanel, TransactionTable).
- **src/services/**: API abstraction layer (`api.js`) to handle Axios requests.
- **src/styles/**: Modular CSS files for each component.

### State Management
- **Local State (useState)**: Managed in `App.jsx` to coordinate the "Single Source of Truth" for:
    - `filters`: Object storing active filter criteria.
    - `search`: Current search query string.
    - `sort`: Sorting field and order.
    - `pagination`: Current page and limit.
- **Prop Drilling**: State and handlers are passed down to stateless UI components (e.g., `FilterPanel`, `Pagination`).

## 3. Module Responsibilities

| Module | Responsibility |
|--------|----------------|
| **Backend / Seeder** | Efficiently parses large CSV (Streams) and populates MongoDB with batch inserts. |
| **Backend / Controller** | Dynamic query construction for any combination of filters/sorts. |
| **Frontend / FilterPanel** | Renders dynamic dropdowns based on distinct DB values. |
| **Frontend / Table** | Pure presentational component for rendering grid data. |

