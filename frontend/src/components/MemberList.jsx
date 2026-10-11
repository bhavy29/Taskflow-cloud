const MemberList = ({ members = [] }) => {
    if (!members.length) {
        return <p className="workspace-details-empty">No team members yet.</p>;
    }

    return (
        <div className="member-list">
            {members.map((member) => (
                <div className="member-item" key={member.id}>
                    <div>
                        <h4>{member.name || "Unnamed member"}</h4>
                        <p>{member.email}</p>
                    </div>
                    <span className="member-role">{member.role || "Member"}</span>
                </div>
            ))}
        </div>
    );
};

export default MemberList;
