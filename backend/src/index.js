require('dotenv').config();
const express = require('express');
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS config - allowing both local dev and production frontend
// added vercel URL after deployment
app.use(cors({
    origin: ['http://localhost:5173', 'https://tru-estate-project-phi.vercel.app'],
    credentials: true
}));
app.use(express.json());

app.use('/api/transactions', transactionRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
