
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createWorkspace,
  getWorkspaces,
} from "../services/workspaceService";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./Workspace.css";

const Workspace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setError("");

        const response = await getWorkspaces();
        setWorkspaces(response?.workspaces || []);
      } catch (err) {
        console.error("Fetch workspaces error:", err);

        if (err.response?.status === 401) {
          navigate("/");
          return;
        }

        setError(
          err.response?.data?.message ||
          "Unable to load workspaces. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Workspace name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createWorkspace({
        name: form.name.trim(),
        description: form.description.trim(),
      });

      if (response?.workspace) {
        setWorkspaces((prev) => [
          response.workspace,
          ...prev,
        ]);
      }

      setForm({
        name: "",
        description: "",
      });

      setSuccess("Workspace created successfully!");
    } catch (err) {
      console.error("Create workspace error:", err);

      if (err.response?.status === 401) {
        navigate("/");
        return;
      }

      setError(
        err.response?.data?.message ||
        "Failed to create workspace. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="workspace-layout">
      <Sidebar />

      <div className="workspace-main">
        <Navbar />

        <div className="workspace-content">
          <div className="workspace-header">
            <div>
              <h1>Workspaces</h1>
              <p>
                Manage your teams and projects in one place.
              </p>
            </div>
          </div>

          <div className="workspace-grid">
            <section className="workspace-card create-workspace-card">
              <h3>Create New Workspace</h3>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Workspace name"
                  maxLength={100}
                  required
                />

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Workspace description"
                  rows={4}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Creating..."
                    : "Create Workspace"}
                </button>

                {error && (
                  <p className="workspace-error" role="alert">
                    {error}
                  </p>
                )}

                {success && (
                  <p className="workspace-success" role="status">
                    {success}
                  </p>
                )}
              </form>
            </section>

            <section className="workspace-card workspace-list-card">
              <h3>My Workspaces</h3>

              {isLoading ? (
                <p>Loading workspaces...</p>
              ) : workspaces.length === 0 ? (
                <p>No workspaces found.</p>
              ) : (
                <div className="workspace-list">
                  {workspaces.map((workspace) => (
                    <button
                      type="button"
                      className="workspace-item"
                      key={workspace.id}
                      onClick={() =>
                        navigate(`/workspace/${workspace.id}`)
                      }
                    >
                      <h4>
                        {workspace.name || "Untitled workspace"}
                      </h4>

                      <p>
                        {workspace.description || "No description"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
