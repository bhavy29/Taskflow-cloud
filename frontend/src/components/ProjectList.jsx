const ProjectList = ({ projects = [] }) => {
    const defaultProjects = [
        { name: "Growth sprint", progress: 82 },
        { name: "Workspace redesign", progress: 56 },
        { name: "API rollout", progress: 40 }
    ];
    const list = projects.length ? projects : defaultProjects;

    return (
        <section className="dashboard-card project-list-card">
            <div className="dashboard-card-header">
                <h3>Active projects</h3>
                <span>{list.length} projects</span>
            </div>

            <div className="project-list-items">
                {list.map((project, index) => (
                    <div key={index} className="project-list-item">
                        <div>
                            <strong>{project.name}</strong>
                            <p>{project.progress}% complete</p>
                        </div>
                        <div className="project-progress-bar">
                            <div style={{ width: `${project.progress}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProjectList;
