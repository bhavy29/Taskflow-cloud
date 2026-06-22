const TaskList = ({ tasks = [] }) => {
    const defaultTasks = [
        { title: "Launch wireframes", due: "Today", status: "In progress" },
        { title: "Sync with marketing", due: "Tomorrow", status: "Pending" },
        { title: "Fix login bug", due: "Wed", status: "In review" }
    ];
    const list = tasks.length ? tasks : defaultTasks;

    return (
        <section className="dashboard-card task-list-card">
            <div className="dashboard-card-header">
                <h3>My Tasks</h3>
                <span>{list.length} items</span>
            </div>

            <ul className="task-list-items">
                {list.map((task, index) => (
                    <li key={index} className="task-list-item">
                        <div>
                            <strong>{task.title}</strong>
                            <p>{task.due}</p>
                        </div>
                        <span className={`task-status ${task.status.toLowerCase().replace(/\s+/g, "-")}`}>
                            {task.status}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default TaskList;
