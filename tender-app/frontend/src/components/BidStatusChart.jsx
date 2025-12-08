import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./BidStatusChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const BidStatusChart = ({ approved = 0, rejected = 0, pending = 0 }) => {
  console.log("BidStatusChart props:", { approved, rejected, pending });
  const hasData = approved > 0 || rejected > 0 || pending > 0;
  const total = approved + rejected + pending;

  if (!hasData) {
    return (
      <div className="bid-status-chart-card">
        <div className="bid-status-chart-header">
          <h3>Bid Status Overview</h3>
          <span className="total-count">Total: 0</span>
        </div>
        <div className="bid-status-chart no-data">
          <p>No bid status data yet.</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: ["Approved", "Rejected", "Pending"],
    datasets: [
      {
        data: [approved, rejected, pending],
        backgroundColor: ["#16a34a", "#ef4444", "#f97316"],
        borderColor: "#ffffff",
        borderWidth: 3,
        cutout: "60%",
      },
    ],
  };

  console.log("BidStatusChart data:", data);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 18,
          boxHeight: 18,
          padding: 16,
          font: { size: 12 },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    layout: {
      padding: 10,
    },
  };

  return (
    <div className="bid-status-chart-card">
      <div className="bid-status-chart-header">
        <h3>Bid Status Overview</h3>
        <span className="total-count">Total: {total}</span>
      </div>
      <div className="bid-status-chart-wrapper">
        <Doughnut data={data} options={options} />
      </div>
      <ul className="bid-status-legend">
        <li>Approved: {approved}</li>
        <li>Rejected: {rejected}</li>
        <li>Pending: {pending}</li>
      </ul>
    </div>
  );
};

export default BidStatusChart;
