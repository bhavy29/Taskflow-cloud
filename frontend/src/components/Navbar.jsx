import { FaBell, FaSearch } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
    return (
        <div className="navbar">

            <div className="search-box">
                <FaSearch />
                <input
                    type="text"
                    placeholder="Search anything..."
                />
            </div>

            <div className="navbar-right">

                <button className="create-btn">
                    + Create
                </button>

                <div className="notification">
                    <FaBell />
                </div>

                <div className="user-avatar">
                    BC
                </div>

            </div>

        </div>
    );
};

export default Navbar;