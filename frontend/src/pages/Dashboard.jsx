import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

import { getDashboardStats, getDashboardTasks, getDashboardProjects } from "../services/dashboardService";
import { getProfile } from "../services/authService"
import { updateTaskStatus, createTask } from "../services/taskService";
import { connectSocket, disconnectSocket } from "../services/socket";

import "./dashboard.css";

const Dashboard = () => {

  const [user, setUser] = useState({ name: "", id: null });
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    workspaces: 0
  });
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", deadline: "" });
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {

    const fetchData = async () => {
      try {

        const profile = await getProfile();
        setUser(profile.data.user);

        const stats = await getDashboardStats();
        setStats(stats.stats);

        const taskResponse = await getDashboardTasks();
        setTasks(taskResponse.tasks);

        const projectResponse = await getDashboardProjects();
        setProjects(projectResponse.projects);

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const socket = connectSocket();

    const handleTaskUpdate = (payload) => {
      if (!payload) return;
      const { event, task } = payload;

      setTasks((prevTasks) => {
        if (!task) return prevTasks;

        switch (event) {
          case "created":
            return prevTasks.some((existingTask) => existingTask.id === task.id)
              ? prevTasks
              : [task, ...prevTasks];
          case "updated":
          case "status-updated":
            return prevTasks.map((existingTask) =>
              existingTask.id === task.id ? task : existingTask
            );
          case "deleted":
            return prevTasks.filter((existingTask) => existingTask.id !== task.id);
          default:
            return prevTasks;
        }
      });
    };

    socket.on("task:update", handleTaskUpdate);

    return () => {
      socket.off("task:update", handleTaskUpdate);
      disconnectSocket();
    };
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

  const handleCreateToggle = () => {
    setShowCreateForm((prev) => !prev);
    setCreateError("");
  };

  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreateError("");
    setIsCreating(true);

    try {
      const payload = {
        title: taskForm.title,
        description: taskForm.description,
        status: "To Do",
        deadline: taskForm.deadline || null,
        assigned_to: user.id || undefined
      };

      const response = await createTask(payload);
      const newTask = response.task;

      setTasks((prev) => [newTask, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalTasks: prev.totalTasks + 1,
        pendingTasks: prev.pendingTasks + 1
      }));
      setTaskForm({ title: "", description: "", deadline: "" });
      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
      setCreateError(err.response?.data?.message || "Failed to create task");
    } finally {
      setIsCreating(false);
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

                <button className="create-task-btn" onClick={handleCreateToggle}>
                  {showCreateForm ? "Cancel" : "+ Create"}
                </button>
              </div>

              {showCreateForm && (
                <form className="create-task-form" onSubmit={handleCreateTask}>
                  <input
                    name="title"
                    value={taskForm.title}
                    onChange={handleTaskChange}
                    placeholder="Task title"
                    required
                  />
                  <textarea
                    name="description"
                    value={taskForm.description}
                    onChange={handleTaskChange}
                    placeholder="Task description"
                    rows={3}
                  />
                  <input
                    type="date"
                    name="deadline"
                    value={taskForm.deadline}
                    onChange={handleTaskChange}
                  />
                  <div className="create-task-actions">
                    <button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Task"}
                    </button>
                  </div>
                  {createError && <p className="create-task-error">{createError}</p>}
                </form>
              )}

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

              {projects.length === 0 ? (
                <p>No recent projects yet.</p>
              ) : (
                <ul>
                  {projects.map((project) => (
                    <li key={project.id}>
                      <strong>{project.name}</strong>
                      {project.description ? ` — ${project.description}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;