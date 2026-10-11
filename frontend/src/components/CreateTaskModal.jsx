import { useState } from "react";

const CreateTaskModal = ({ isOpen, onClose, onSubmit, members = [], isSubmitting, initialTask }) => {
    const [form, setForm] = useState({
        title: initialTask?.title || "",
        description: initialTask?.description || "",
        assigned_to: initialTask?.assigned_to || "",
        priority: initialTask?.priority || "Medium",
        status: initialTask?.status || "To Do",
        deadline: initialTask?.deadline || "",
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{initialTask ? "Edit Task" : "Create Task"}</h3>
                    <button type="button" className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <input name="title" value={form.title} onChange={handleChange} placeholder="Task title" required />
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="Task description" rows={4} />
                    <select name="assigned_to" value={form.assigned_to} onChange={handleChange}>
                        <option value="">Assign to</option>
                        {members.map((member) => (
                            <option key={member.id} value={member.user_id || member.id}>
                                {member.name || member.email}
                            </option>
                        ))}
                    </select>
                    <select name="priority" value={form.priority} onChange={handleChange}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <input name="deadline" type="date" value={form.deadline} onChange={handleChange} />
                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : initialTask ? "Save Changes" : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
