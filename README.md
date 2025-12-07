# Retail Sales Management System (TruEstate Assignment)

Hi, this is **Pranay Pillutla**. This is my submission for the Full Stack Intern assignment. I've built a dashboard to manage retail sales data, focusing on performance and a clean, premium UI.

## Tech Stack Choices
I decided to go with a tech stack I'm comfortable with but also one that allows for scalability:
- **Frontend**: React (Vite) - *Fast and lightweight.*
- **Styling**: Vanilla CSS - *I wanted full control over the design variables without relying on frameworks like Tailwind for this specific task.*
- **Backend**: Node.js & Express - *Robust and easy to handle extensive API logic.*
- **Database**: Supabase (PostgreSQL) - *Cloud-hosted, scalable, and perfect for production deployment.*

## Features & How It Works

### 1. Robust Search
I implemented the search logic on the backend using regex. It checks both `Customer Name` and `Phone Number`. I added a **debounce** on the frontend (500ms) so we don't spam the API while typing.

### 2. Smart Filtering
The filters are dynamic. You can combine multiple filters like `Region` + `Gender`.
*   *Challenge*: The Age filter was tricky because of ranges like "18-25". I handled this in the `App.jsx` handler first, then sent `minAge`/`maxAge` to the backend to keep the query clean.

### 3. Accurate Stats
Instead of calculating stats on the frontend (which would only show the *current page's* stats), I query the entire filtered dataset on the backend. This way, the "Total Amount" and "Total Discount" reflect the **entire filtered dataset**, not just the 10 rows you see.

### 4. Custom Data Seeder
The CSV dataset was huge (100k+ records). I wrote a custom seeder script using streams to parse it line-by-line and insert it in chunks of 5000. This avoids crashing Node.js with memory errors.

---

## Setup Instructions

### Prerequisites
- Node.js installed.
- Supabase account (free tier works fine).

### Getting Started

1.  **Install Dependencies**
    I split the project into `backend` and `frontend`. You need to install packages for both:
    ```bash
    cd backend
    npm install

    cd ../frontend
    npm install
    ```

2.  **Seed the Database**
    Make sure the CSV file is in `backend/data/`. Then run:
    ```bash
    cd backend
    npm run seed
    ```
    *(This might take a few seconds as it processes the large file).*

3.  **Run the App**
    Start both servers:
    *   Backend (Port 5000): `npm start` (inside backend folder)
    *   Frontend (Port 5173): `npm run dev` (inside frontend folder)

    Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

---
*Built by Pranay Pillutla.*
