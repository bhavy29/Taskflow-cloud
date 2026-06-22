import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "./Login.css";

const Register = () => {

  const [form, setForm] = useState({
    name: '',
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
      await registerUser(form)
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
        <h2>Create Account</h2>

        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={form.name}
          onChange={handleChanges}
          required
        />

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
          Register
        </button>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <p className="register-link">
          Already have an account?{" "}
          <a href="/">Login</a>
        </p>

      </form>
    </div>
  );

}

export default Register
