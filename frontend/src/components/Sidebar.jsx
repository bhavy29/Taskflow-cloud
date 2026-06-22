
import {
    FaHome,
    FaTasks,
    FaProjectDiagram,
    FaUsers,
    FaCalendarAlt,
    FaComments,
    FaChartLine,
    FaCog,
    FaSignOutAlt
} from "react-icons/fa";

import "./Sidebar.css";

const Sidebar = () => {
    return (
        <div className="sidebar">

            <div className="logo">
                <h2>TaskFlow Cloud</h2>
            </div>

            <div className="menu">

                <div className="menu-item active">
                    <FaHome />
                    <span>Dashboard</span>
                </div>

                <div className="menu-item">
                    <FaTasks />
                    <span>My Tasks</span>
                </div>

                <div className="menu-item">
                    <FaProjectDiagram />
                    <span>Projects</span>
                </div>

                <div className="menu-item">
                    <FaUsers />
                    <span>Team</span>
                </div>

                <div className="menu-item">
                    <FaCalendarAlt />
                    <span>Calendar</span>
                </div>

                <div className="menu-item">
                    <FaComments />
                    <span>Messages</span>
                </div>

                <div className="menu-item">
                    <FaChartLine />
                    <span>Reports</span>
                </div>

                <div className="menu-item">
                    <FaCog />
                    <span>Settings</span>
                </div>

            </div>

            <div className="profile-card">
                <div className="avatar">BC</div>

                <div>
                    <h4>Bhavy</h4>
                    <p>Team Leader</p>
                </div>
            </div>

            <div className="logout">
                <FaSignOutAlt />
                <span>Logout</span>
            </div>

        </div>
    );
};

export default Sidebar;
