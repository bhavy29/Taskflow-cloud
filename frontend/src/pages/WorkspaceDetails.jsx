import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MemberList from "../components/MemberList";
import AddMemberModal from "../components/AddMemberModal";
import TaskList from "../components/TaskList";
import CreateTaskModal from "../components/CreateTaskModal";

import {
    addWorkspaceMember,
    getWorkspaceById,
    getWorkspaceMembers,
    getWorkspaceTasks,
    createWorkspaceTask,
} from "../services/workspaceService";

import { deleteTask, updateTask } from "../services/taskService";

import "./Workspace.css";

const WorkspaceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState(null);
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [memberModalOpen, setMemberModalOpen] = useState(false);
    const [taskModalOpen, setTaskModalOpen] = useState(false);

    const [memberSubmitting, setMemberSubmitting] = useState(false);
    const [taskSubmitting, setTaskSubmitting] = useState(false);

    const [selectedTask, setSelectedTask] = useState(null);

    // Determine the current user's role in this workspace.
    const canManageWorkspace =
        String(workspace?.role || "").toLowerCase() === "admin";

    // Only workspace admins can manage tasks.
    const canManageTasks = canManageWorkspace;

    const workspaceTitle = useMemo(
        () => workspace?.name || "Workspace",
        [workspace]
    );

    // Fetch workspace details, members, and tasks.
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [
                workspaceResponse,
                membersResponse,
                tasksResponse,
            ] = await Promise.all([
                getWorkspaceById(id),
                getWorkspaceMembers(id),
                getWorkspaceTasks(id),
            ]);

            setWorkspace(workspaceResponse?.workspace || null);
            setMembers(membersResponse?.members || []);
            setTasks(tasksResponse?.tasks || []);
        } catch (err) {
            console.error("Workspace fetch error:", err);

            if (err.response?.status === 401) {
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Unable to load workspace details."
            );
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Add a member. Only admins should be allowed by the backend.
    const handleAddMember = async (payload) => {
        if (!canManageWorkspace) {
            setError("Only workspace admins can add members.");
            return;
        }

        try {
            setMemberSubmitting(true);
            setError("");
            setSuccess("");

            const response = await addWorkspaceMember(id, payload);

            setSuccess(
                response?.message || "Member added successfully."
            );

            setMemberModalOpen(false);

            await fetchData();
        } catch (err) {
            console.error("Add member error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to add member."
            );
        } finally {
            setMemberSubmitting(false);
        }
    };

    // Open the task modal only for admins.
    const openTaskModal = (task = null) => {
        if (!canManageTasks) {
            setError(
                "Only workspace admins can create, assign, or edit tasks."
            );
            return;
        }

        setError("");
        setSuccess("");
        setSelectedTask(task);
        setTaskModalOpen(true);
    };

    // Create or update a task.
    const handleCreateTask = async (payload) => {
        if (!canManageTasks) {
            setError(
                "Only workspace admins can create or assign tasks."
            );
            return;
        }

        try {
            setTaskSubmitting(true);
            setError("");
            setSuccess("");

            const taskPayload = {
                ...payload,
                assigned_to: payload.assigned_to || null,
            };

            if (selectedTask) {
                await updateTask(selectedTask.id, taskPayload);

                setSuccess("Task updated successfully.");
            } else {
                await createWorkspaceTask(id, taskPayload);

                setSuccess("Task created successfully.");
            }

            setTaskModalOpen(false);
            setSelectedTask(null);

            await fetchData();
        } catch (err) {
            console.error("Save task error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to save task."
            );
        } finally {
            setTaskSubmitting(false);
        }
    };

    // Delete a task.
    const handleDeleteTask = async (task) => {
        if (!canManageTasks) {
            setError("Only workspace admins can delete tasks.");
            return;
        }

        const confirmed = window.confirm(
            `Delete task "${task.title}"?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await deleteTask(task.id);

            setSuccess("Task deleted successfully.");

            await fetchData();
        } catch (err) {
            console.error("Delete task error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to delete task."
            );
        }
    };

    // Close the task modal and clear the selected task.
    const closeTaskModal = () => {
        setTaskModalOpen(false);
        setSelectedTask(null);
    };

    return (
        <div className="workspace-layout">
            <Sidebar />

            <div className="workspace-main">
                <Navbar />

                <div className="workspace-content">
                    <div className="workspace-header">
                        <div>
                            <h1>{workspaceTitle}</h1>

                            <p>
                                {workspace?.description ||
                                    "No description available."}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <p className="workspace-details-empty">
                            Loading workspace...
                        </p>
                    ) : error && !workspace ? (
                        <div className="workspace-details-error">
                            {error}
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div
                                    className="workspace-details-error"
                                    role="alert"
                                >
                                    {error}
                                </div>
                            )}

                            {success && (
                                <p
                                    className="workspace-success"
                                    role="status"
                                >
                                    {success}
                                </p>
                            )}

                            <div className="workspace-details-grid">
                                {/* Team members */}
                                <section className="workspace-card">
                                    <div className="section-header">
                                        <h3>Team Members</h3>

                                        {canManageWorkspace && (
                                            <button
                                                type="button"
                                                className="action-btn"
                                                onClick={() => {
                                                    setError("");
                                                    setSuccess("");
                                                    setMemberModalOpen(true);
                                                }}
                                            >
                                                + Add Member
                                            </button>
                                        )}
                                    </div>

                                    <MemberList members={members} />
                                </section>

                                {/* Workspace tasks */}
                                <section className="workspace-card">
                                    <div className="section-header">
                                        <h3>Tasks</h3>

                                        {canManageTasks && (
                                            <button
                                                type="button"
                                                className="action-btn"
                                                onClick={() =>
                                                    openTaskModal()
                                                }
                                            >
                                                + Create Task
                                            </button>
                                        )}
                                    </div>

                                    <TaskList
                                        tasks={tasks}
                                        canManageTasks={canManageTasks}
                                        onEdit={
                                            canManageTasks
                                                ? openTaskModal
                                                : undefined
                                        }
                                        onDelete={
                                            canManageTasks
                                                ? handleDeleteTask
                                                : undefined
                                        }
                                    />
                                </section>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Add member modal: admins only */}
            {canManageWorkspace && (
                <AddMemberModal
                    isOpen={memberModalOpen}
                    onClose={() => setMemberModalOpen(false)}
                    onSubmit={handleAddMember}
                    isSubmitting={memberSubmitting}
                />
            )}

            {/* Create/edit task modal: admins only */}
            {canManageTasks && (
                <CreateTaskModal
                    isOpen={taskModalOpen}
                    onClose={closeTaskModal}
                    onSubmit={handleCreateTask}
                    members={members}
                    isSubmitting={taskSubmitting}
                    initialTask={selectedTask}
                />
            )}
        </div>
    );
};

export default WorkspaceDetails;
