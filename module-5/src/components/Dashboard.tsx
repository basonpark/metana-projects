"use client";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { BlockData, TokenTransfer, DashboardData } from "../types/blockchain";
import { BlockchainService } from "../services/blockchain.service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState<DashboardData>({
    blocks: [],
    transfers: [],
  });

  useEffect(() => {
    const blockchainService = new BlockchainService();
    let mounted = true;

    const updateDashboard = async (blockNumber: number) => {
      if (!mounted) return;

      try {
        const [blockData, transferData] = await Promise.all([
          blockchainService.getBlockData(blockNumber),
          blockchainService.getTokenTransfers(blockNumber),
        ]);

        setData((prevData) => {
          const newBlocks = [...prevData.blocks, blockData].slice(-10);
          const newTransfers = [...prevData.transfers, transferData].slice(-10);
          return { blocks: newBlocks, transfers: newTransfers };
        });
      } catch (error) {
        console.error("Error updating dashboard:", error);
      }
    };

    // Initial load of last 10 blocks
    const loadInitialData = async () => {
      const currentBlock = await blockchainService.provider.getBlockNumber();
      for (let i = 0; i < 10; i++) {
        await updateDashboard(currentBlock - 9 + i);
      }
    };

    loadInitialData();
    blockchainService.onNewBlock(updateDashboard);

    return () => {
      mounted = false;
      blockchainService.disconnect();
    };
  }, []);

  const chartOptions = {
    responsive: true,
    animation: {
      duration: 0,
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold">Ethereum Analytics Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Token Transfer Volume Chart */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold">Token Transfer Volume</h2>
          <Line
            data={{
              labels: data.transfers.map((t) => t.blockNumber),
              datasets: [
                {
                  label: "Transfer Volume",
                  data: data.transfers.map((t) => t.totalVolume),
                  borderColor: "rgb(75, 192, 192)",
                  tension: 0.1,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>

        {/* Base Fee Chart */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold">Base Fee (Gwei)</h2>
          <Line
            data={{
              labels: data.blocks.map((b) => b.number),
              datasets: [
                {
                  label: "Base Fee",
                  data: data.blocks.map((b) => b.baseFee),
                  borderColor: "rgb(255, 99, 132)",
                  tension: 0.1,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>

        {/* Gas Usage Ratio Chart */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold">Gas Usage Ratio (%)</h2>
          <Line
            data={{
              labels: data.blocks.map((b) => b.number),
              datasets: [
                {
                  label: "Gas Used/Limit Ratio",
                  data: data.blocks.map((b) => b.gasUsedRatio),
                  borderColor: "rgb(153, 102, 255)",
                  tension: 0.1,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
