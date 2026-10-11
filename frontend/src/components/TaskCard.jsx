const TaskCard = ({ task, canManageTasks = false, onEdit, onDelete }) => {
    return (
        <div className="task-card">
            <div className="task-card-header">
                <h4>{task.title || "Untitled task"}</h4>
                {canManageTasks && (
                    <div className="task-card-actions">
                        <button type="button" className="secondary-btn" onClick={() => onEdit(task)}>
                            Edit
                        </button>
                        <button type="button" className="danger-btn" onClick={() => onDelete(task)}>
                            Delete
                        </button>
                    </div>
                )}
            </div>
            <p>{task.description || "No description"}</p>
            <div className="task-meta-grid">
                <span>Assigned To: {task.assigned_to_name || task.assigned_to || "Unassigned"}</span>
                <span>Priority: {task.priority || "Low"}</span>
                <span>Status: {task.status || "To Do"}</span>
                <span>Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No due date"}</span>
            </div>
        </div>
    );
};

export default TaskCard;
