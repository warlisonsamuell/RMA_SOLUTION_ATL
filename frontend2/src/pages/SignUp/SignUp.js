// src/pages/SignUp/SignUp.js
import React, { useState } from "react";
import { Link} from "react-router-dom";
import "./SignUp.css";


const SignUp = () => {
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Por favor, insira um e-mail válido.");
      return;
    }

    const user = { matricula, email, password };

    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        alert("Cadastro realizado com sucesso!");
        setMatricula("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setErrorMessage("");
      } else {
        const data = await response.json();
        setErrorMessage(data.detail || "Erro ao criar conta.");
      }
    } catch (error) {
      setErrorMessage("Erro ao tentar se conectar com o servidor.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Cadastro</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <form onSubmit={handleSignUp}>
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
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Cadastrar</button>
      </form>
      <div className="Login-link">
        <p>
          Já tem uma conta? <Link to="/">Fazer Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
