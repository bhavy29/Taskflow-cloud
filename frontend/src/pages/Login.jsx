import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import "./Login.css";

const Login = () => {

    const [form, setForm] = useState({
        email: '',
        password: '',
    })
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleChanges = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            await loginUser(form)
            console.log("Login successful, navigating to dashboard...");
            navigate('/dashboard')
        } catch (err) {
            setError('Invalid email or password')
            console.log(err)
        }
    }

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>

                <h1>TaskFlow Cloud</h1>
                <h2>Login</h2>

                <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChanges}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChanges}
                    required
                />

                <button type="submit">
                    Login
                </button>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <p className="register-link">
                    Don't have an account? <a href="/register">Register</a>
                </p>
            </form>
        </div>
    );
};

export default Login;