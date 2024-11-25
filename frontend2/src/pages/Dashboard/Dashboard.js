import React, { useEffect, useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { useTable } from "react-table";
import "./Dashboard.css";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Dashboard = () => {
  const [rmaData, setRmaData] = useState({
    status_count: {},
    avg_time: {},
    defect_count: {},
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRmaData = async () => {
      try {
        const response = await fetch("http://localhost:8000/rma/metrics");
        if (!response.ok) throw new Error("Erro ao buscar dados");

        const data = await response.json();
        setRmaData(data);
      } catch (error) {
        setError("Erro ao carregar dados do dashboard");
      }
    };

    fetchRmaData();
  }, []);

  // Tempo médio de cada etapa
  const avgTimeData = {
    labels: ["Pendente", "Em Teste", "Concluída"],
    datasets: [
      {
        label: "Tempo Médio (minutos)",
        data: [
          rmaData.avg_time.pendente || 0,
          rmaData.avg_time.em_teste || 0,
          rmaData.avg_time.concluida || 0,
        ],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Tipos de defeitos
  // const defectData = {
  //   labels: Object.keys(rmaData.defect_count),
  //   datasets: [
  //     {
  //       label: "Contagem de Defeitos",
  //       data: Object.values(rmaData.defect_count),
  //       backgroundColor: "rgba(255, 99, 132, 0.6)",
  //       borderColor: "rgba(255, 99, 132, 1)",
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  // Tabela para exibir os tipos de defeitos mais frequentes
  const dataTable = useMemo(
    () => {
      return Object.keys(rmaData.defect_count).map(defeito => ({
        defeito: defeito,
        quantidade: rmaData.defect_count[defeito] || 0,
      }));
    },
    [rmaData]
  );

  const columns = useMemo(
    () => [
      {
        Header: "Tipo de Defeito",
        accessor: "defeito",
      },
      {
        Header: "Quantidade",
        accessor: "quantidade",
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data: dataTable });

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      {error && <div className="error-message">{error}</div>}

      {/* status de RMA */}
      <div className="status-container">
        <h3>Status do RMA</h3>
        <div><strong>Pendente:</strong> {rmaData.status_count.pendente || 0}</div>
        <div><strong>Recebida:</strong> {rmaData.status_count.recebida || 0}</div>
        <div><strong>Em Teste:</strong> {rmaData.status_count.em_teste || 0}</div>
        <div><strong>Concluída:</strong> {rmaData.status_count.concluida || 0}</div>
      </div>

      {/* Gráfico de Tempo Médio de Etapas */}
      <div className="chart-container">
        <h3>Tempo Médio de Cada Etapa</h3>
        <Bar data={avgTimeData} />
      </div>

      {/* Gráfico de Tipos de Defeitos */}
      {/* <div className="chart-container">
        <h3>Tipos de Defeitos Mais Comuns</h3>
        <Bar data={defectData} />
      </div> */}

      {/* Tipos de Defeitos */}
      <div className="table-container">
        <h3>Tipos de Defeitos Mais Frequentes</h3>
        <table {...getTableProps()} className="defect-table">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>{column.render("Header")}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Dashboard;
