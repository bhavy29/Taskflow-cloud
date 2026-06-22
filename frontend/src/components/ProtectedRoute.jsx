import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                await axios.get(
                    "http://localhost:5000/api/auth/profile",
                    {
                        withCredentials: true
                    }
                );

                setAuthenticated(true);

            } catch (error) {
                console.error("Error occurred while verifying user:", error);
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, []);

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return authenticated
        ? children
        : <Navigate to="/" replace />;
};

export default ProtectedRoute;