# Retail Sales Management System

## 1. Overview
A specialized internal tool for managing retail sales data. It features a high-performance backend capable of handling 100,000+ records and a premium, responsive React frontend with advanced Search, Filtering, Sorting, and Pagination capabilities to retrieve insights instantly.

## 2. Tech Stack
- **Frontend**: React (Vite), Tailwind CSS.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Tools**: VS Code, Postman.

## 3. Search Implementation Summary
- **Backend**: Implemented using MongoDB `$or` regex queries for case-insensitive partial matching on `Customer Name` and `Phone Number`. Text indexes are used for performance optimization.
- **Frontend**: Debounced search input ensures smooth user experience without spamming API calls.

## 4. Filter Implementation Summary
- **Multi-Select**: Supports filtering by multiple values (e.g., Region, Category) using `$in` operator.
- **Range Filters**: Age and Date filters use `$gte` and `$lte` operators.
- **Dynamic**: Filters can be combined arbitrarily (e.g., "Female" customers in "North" region buying "Electronics").

## 5. Sorting Implementation Summary
- Supports sorting by Date, Quantity, and Customer Name.
- Preserves active search and filter states.
- Implemented via `.sort()` cursor modifier in MongoDB.

## 6. Pagination Implementation Summary
- Server-side pagination using `skip` and `limit`.
- Returns metadata (`totalPages`, `currentPage`) to generate frontend controls.
- "Next/Previous" and Page Number navigation fully supported.

## 7. Setup Instructions
### Steps
1. **Clone & Install**:
   ```bash
   # Root directory
   npm install # (if needed)
   
   cd backend
   npm install
   
   cd ../frontend
   npm install
   ```

2. **Data Setup**:
   - Ensure MongoDB is running.
   - Place `truestate_assignment_dataset.csv` in `backend/data/`.
   - Run Seeder:
     ```bash
     cd backend
     npm run seed
     ```

3. **Run Application**:
   - **Backend**:
     ```bash
     cd backend
     npm start 
     # Server: http://localhost:5000
     ```
   - **Frontend**:
     ```bash
     cd frontend
     npm run dev
     # Client: http://localhost:5173
     ```
