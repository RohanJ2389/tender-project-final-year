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
      <div className="bid-status-card">
        <div className="bid-status-card-header">
          <h3>Bid Status Overview</h3>
          <span className="bid-status-total-pill">Total: 0</span>
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
    <div className="bid-status-card">
      <div className="bid-status-card-header">
        <h3>Bid Status Overview</h3>
        <span className="bid-status-total-pill">Total: {total}</span>
      </div>
      <div className="bid-status-chart-wrapper">
        <Doughnut data={data} options={options} />
      </div>
      <div className="bid-status-counts">
        <span className="count-item">
          <span className="count-dot approved"></span>
          Approved: {approved}
        </span>
        <span className="count-item">
          <span className="count-dot rejected"></span>
          Rejected: {rejected}
        </span>
        <span className="count-item">
          <span className="count-dot pending"></span>
          Pending: {pending}
        </span>
      </div>
    </div>
  );
};

export default BidStatusChart;
