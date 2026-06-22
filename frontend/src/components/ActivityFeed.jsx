const ActivityFeed = ({ activities = [] }) => {
    const defaultActivities = [
        { text: "Jasmine commented on the task review", time: "10m ago" },
        { text: "A new workspace was created", time: "1h ago" },
        { text: "Task completion rate rose to 76%", time: "Yesterday" }
    ];
    const list = activities.length ? activities : defaultActivities;

    return (
        <section className="dashboard-card activity-feed-card">
            <div className="dashboard-card-header">
                <h3>Activity feed</h3>
                <span>Recent updates</span>
            </div>

            <ul className="activity-feed-list">
                {list.map((activity, index) => (
                    <li key={index} className="activity-feed-item">
                        <p>{activity.text}</p>
                        <span>{activity.time}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default ActivityFeed;
