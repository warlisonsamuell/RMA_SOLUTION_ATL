import React, { useState, useEffect } from 'react';
import './RegisterRMA.css';

function RegisterRMA() {
  const [product, setProduct] = useState('');
  const [defectDetails, setDefectDetails] = useState('');
  const [rmaRequests, setRmaRequests] = useState([]);
  const [user, setUser] = useState('');

  useEffect(() => {
    const loggedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    
    if (!loggedUser || !token) {
      alert("Você precisa estar logado para acessar essa página.");
      window.location.href = "/login";
    } else {
      setUser(loggedUser);
      fetchRMARequests(token);
    }
  }, []);

  const fetchRMARequests = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/rma/requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRmaRequests(data.rma_requests);
      } else {
        alert("Erro ao carregar as solicitações de RMA.");
      }
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
      alert("Erro de conexão com o servidor.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");

    if (!user || !token) {
      alert("Você precisa estar logado para registrar a solicitação.");
      return;
    }

    // Criando nova solicitação RMA para o backend
    const newRequest = {
      produto: product,
      defeito: defectDetails,
      status: 'Pendente',
      usuario: user,
    };

    try {
      const response = await fetch('http://localhost:8000/rma/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newRequest),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchRMARequests(token);
        setProduct('');
        setDefectDetails('');
      } else {
        alert("Erro ao registrar a solicitação de RMA.");
      }
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      alert("Erro de conexão com o servidor.");
    }
  };

  return (
    <div className="rma-page">
      <h1>Abrir Chamado</h1>

      <form className="rma-form" onSubmit={handleSubmit}>
        <label>Produto</label>
        <select
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          required
        >
          <option value="">Selecione um produto</option>
          <option value="Geladeira">Geladeira</option>
          <option value="Microondas">Microondas</option>
          <option value="Ar-Condicionado">Ar-Condicionado</option>
          <option value="Outros">Outros</option>
        </select>

        <label>Detalhes do Produto e Defeito</label>
        <input
          type="text"
          value={defectDetails}
          onChange={(e) => setDefectDetails(e.target.value)}
          placeholder="Descreva detalhes do produto e defeito"
          required
        />

        <button type="submit" className="btn">Abrir Chamado</button>
      </form>

      <h2>Chamados Abertos</h2>
      <div className="rma-requests">
        {rmaRequests.length > 0 ? (
          rmaRequests.map((request) => (
            <div key={request.id} className="rma-request">
              <p><strong>ID:</strong> {request.id}</p>
              <p><strong>Produto:</strong> {request.produto}</p>
              <p><strong>Defeito:</strong> {request.defeito}</p>
              <p><strong>Status:</strong> {request.status}</p>
              <p><strong>Data:</strong> {request.createdAt}</p>
            </div>
          ))
        ) : (
          <p>Nenhum chamado de suporte técnico encontrado.</p>
        )}
      </div>
    </div>
  );
}

export default RegisterRMA;
