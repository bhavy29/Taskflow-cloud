
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    FaHome,
    FaTasks,
    FaProjectDiagram,
    // FaUsers,
    // FaCalendarAlt,
    // FaComments,
    // FaChartLine,
    // FaCog,
    FaSignOutAlt
} from "react-icons/fa";
import { getProfile, logoutUser } from "../services/authService";

import "./Sidebar.css";

const Sidebar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        let isMounted = true;

        getProfile()
            .then((response) => {
                if (isMounted) {
                    setUser(response.data.user);
                }
            })
            .catch((error) => {
                console.error("Failed to load profile:", error);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error(error);
        } finally {
            navigate("/");
        }
    };

    const displayName = user?.name?.trim() || "User";
    const initials = displayName
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="sidebar">

            <div className="logo">
                <h2>TaskFlow Cloud</h2>
            </div>

            <div className="menu">

                <NavLink to="/dashboard" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                    <FaHome />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/tasks" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                    <FaTasks />
                    <span>My Tasks</span>
                </NavLink>

                <NavLink to="/workspaces" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                    <FaProjectDiagram />
                    <span>Projects</span>
                </NavLink>

                {/* <div className="menu-item">
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
                </div> */}

            </div>

            <div className="profile-card">
                <div className="avatar">{user ? initials : "..."}</div>

                <div className="profile-details">
                    <h4>{user ? displayName : "Loading profile..."}</h4>
                    {user?.email && <p>{user.email}</p>}
                </div>
            </div>

            <div className="logout" onClick={handleLogout}>
                <FaSignOutAlt />
                <span>Logout</span>
            </div>

        </div>
    );
};

export default Sidebar;
