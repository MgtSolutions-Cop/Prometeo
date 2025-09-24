const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Auth service en puerto ${PORT}`));
