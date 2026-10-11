import TaskCard from "./TaskCard";

const TaskList = ({ tasks = [], canManageTasks = false, onEdit, onDelete }) => {
    if (!tasks.length) {
        return <p className="workspace-details-empty">No tasks yet for this workspace.</p>;
    }

    return (
        <div className="task-list">
            {tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    canManageTasks={canManageTasks}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default TaskList;
