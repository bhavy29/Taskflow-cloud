import { useState } from "react";

const AddMemberModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
    const [form, setForm] = useState({ email: "", role: "Member" });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
        setForm({ email: "", role: "Member" });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Add Member</h3>
                    <button type="button" className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Member email"
                        required
                    />
                    <select name="role" value={form.role} onChange={handleChange}>
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                    </select>
                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMemberModal;
