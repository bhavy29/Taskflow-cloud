const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');
const cookieParser = require("cookie-parser");

const authRoutes = require('./routes/auth.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const taskRoutes = require('./routes/task.routes'); 

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/tasks', taskRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

pool.query('SELECT NOW()')
  .then(() => console.log('PostgreSQL Connected'))
  .catch(err => console.error('Database connection error:', err));

  module.exports = app;
