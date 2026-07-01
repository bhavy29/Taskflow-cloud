import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

import { getDashboardStats, getDashboardTasks } from "../services/dashboardService";
import { getProfile } from "../services/authService"
import { updateTaskStatus } from "../services/taskService";

import "./Dashboard.css";

const Dashboard = () => {

  const [user, setUser] = useState(" ")
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    workspaces: 0
  });
  const [tasks, setTasks] = useState([]);

  useEffect(() => {

    const fetchData = async () => {
      try {

        const profile = await getProfile();
        setUser(profile.data.user);

        const stats = await getDashboardStats();
        setStats(stats.stats);

        const taskResponse = await getDashboardTasks();
        setTasks(taskResponse.tasks);

      } catch (error) {
        console.error(error);
      }
    };


    fetchData();
  }, []);

  const handleComplete = async (taskId) => {
    try {

      await updateTaskStatus(taskId, "Done");

      setTasks(prev =>
        prev.filter(task => task.id !== taskId)
      );

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        <Navbar />

        <div className="dashboard-content">

          <div className="welcome-section">
            <h1>Welcome 👋{user.name}</h1>
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

              <div className="card-header">
                <h3>My Tasks</h3>

                <button className="create-task-btn">
                  + Create
                </button>
              </div>

              {tasks.length > 0 ? (
                tasks.map(task => (
                  <div className="task-item" key={task.id}>

                    <div>
                      <h4>{task.title}</h4>
                      <p>{task.status}</p>
                    </div>

                    <button
                      onClick={() => handleComplete(task.id)}
                    >
                      Complete
                    </button>

                  </div>
                ))
              ) : (
                <p>No pending tasks 🎉</p>
              )}

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