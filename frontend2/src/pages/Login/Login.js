// src/pages/Login/Login.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const user = { matricula, password };

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("user", matricula);
        navigate("/rma");
      } else {
        const data = await response.json();
        setErrorMessage(data.detail || "Credenciais inválidas.");
      }
    } catch (error) {
      setErrorMessage("Erro ao tentar se conectar com o servidor.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="matricula">Matrícula</label>
          <input
            type="text"
            id="matricula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
      <div className="register-link">
        <p>
          Não tem uma conta? <Link to="/signup">Cadastre-se aqui</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
