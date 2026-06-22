import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

import { getDashboardStats } from "../services/dashboardService";

import "./Dashboard.css";

const Dashboard = () => {

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    workspaces: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {

        const response = await getDashboardStats();

        setStats(response.stats);

      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        <Navbar />

        <div className="dashboard-content">

          <div className="welcome-section">
            <h1>Welcome Back 👋</h1>
            <p>
              Manage your projects and tasks efficiently.
            </p>
          </div>

          <div className="stats-grid">

            <StatCard
              title="Total Tasks"
              value={stats.totalTasks}
              color="#112D4E"
            />

            <StatCard
              title="Completed"
              value={stats.completedTasks}
              color="#3F72AF"
            />

            <StatCard
              title="Pending"
              value={stats.pendingTasks}
              color="#F59E0B"
            />

            <StatCard
              title="Workspaces"
              value={stats.workspaces}
              color="#10B981"
            />

          </div>

          <div className="dashboard-row">

            <div className="dashboard-card">
              <h3>My Tasks</h3>

              <ul>
                <li>Build Dashboard UI</li>
                <li>Integrate Task APIs</li>
                <li>Setup Team Chat</li>
              </ul>
            </div>

            <div className="dashboard-card">
              <h3>Recent Projects</h3>

              <ul>
                <li>TaskFlow Cloud</li>
                <li>Expense Tracker</li>
                <li>Internship Project</li>
              </ul>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;