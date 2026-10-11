
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getMyTasks, updateTaskStatus } from "../services/taskService";
import "./Tasks.css";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completingTaskId, setCompletingTaskId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setError("");

        const response = await getMyTasks();

        // Display only pending tasks
        const pendingTasks = (response.tasks || []).filter(
          (task) => task.status === "Pending"
        );

        setTasks(pendingTasks);
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401) {
          navigate("/");
          return;
        }

        setError("Unable to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [navigate]);

  const handleComplete = async (taskId) => {
    try {
      setCompletingTaskId(taskId);
      setError("");

      // Update task status in the backend
      await updateTaskStatus(taskId, "Done");

      // Remove the completed task from the visible list
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskId)
      );
    } catch (err) {
      console.error(err);
      setError("Unable to complete task. Please try again.");
    } finally {
      setCompletingTaskId(null);
    }
  };

  return (
    <div className="tasks-layout">
      <Sidebar />

      <div className="tasks-main">
        <Navbar />

        <div className="tasks-content">
          <div className="tasks-header">
            <h1>My Tasks</h1>
            <p>Tasks assigned to you and ready for action.</p>
          </div>

          {loading ? (
            <p>Loading tasks...</p>
          ) : error && tasks.length === 0 ? (
            <p className="error-message">{error}</p>
          ) : tasks.length === 0 ? (
            <p>No pending tasks. You're all caught up!</p>
          ) : (
            <>
              {error && (
                <p className="error-message">{error}</p>
              )}

              <div className="tasks-list">
                {tasks.map((task) => (
                  <div className="task-card" key={task.id}>
                    <div>
                      <h3>{task.title}</h3>

                      <p>{task.description}</p>

                      <div className="task-meta">
                        <span>{task.status}</span>

                        {task.deadline && (
                          <span>
                            Due{" "}
                            {new Date(
                              task.deadline
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleComplete(task.id)}
                      disabled={completingTaskId === task.id}
                    >
                      {completingTaskId === task.id
                        ? "Completing..."
                        : "Mark Done"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
