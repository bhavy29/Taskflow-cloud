const dotenv = require('dotenv');

dotenv.config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const pool = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const taskRoutes = require('./routes/task.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

app.set('io', io);

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test server api
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});


app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/tasks', taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Socket Code 
// io.on('connection', (socket) => {
//   console.log(`Socket connected: ${socket.id}`);

//   socket.on('join-workspace', (workspaceId) => {
//     if (workspaceId) {
//       socket.join(`workspace:${workspaceId}`);
//       console.log(`Socket ${socket.id} joined workspace ${workspaceId}`);
//     }
//   });

//   socket.on('leave-workspace', (workspaceId) => {
//     if (workspaceId) {
//       socket.leave(`workspace:${workspaceId}`);
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log(`Socket disconnected: ${socket.id}`);
//   });
// });

// Start server
const PORT = process.env.PORT || 5000;

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the process using this port or set PORT to another value.`);
    process.exit(1);
  }
  throw error;
});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

pool.query('SELECT NOW()')
  .then(() => console.log('PostgreSQL Connected'))
  .catch(err => console.error('Database connection error:', err));

module.exports = app;
