import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ChartVisualization = ({ fileId }) => {
  const [fileData, setFileData] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [is3D, setIs3D] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/excel/files/${fileId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setFileData(response.data);
        if (response.data.headers.length > 0) {
          setXAxis(response.data.headers[0]);
          setYAxis(response.data.headers[1] || response.data.headers[0]);
        }
      } catch (error) {
        console.error('Error fetching file data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (fileId) {
      setLoading(true);
      fetchFileData();
    }
  }, [fileId]);

  const prepareChartData = () => {
    if (!fileData || !xAxis || !yAxis) return null;

    const labels = fileData.data.map(item => item[xAxis]);
    const data = fileData.data.map(item => item[yAxis]);

    return {
      labels,
      datasets: [
        {
          label: yAxis,
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const render3DChart = () => {
    if (!fileData || !xAxis || !yAxis) return null;

    const data = fileData.data.map(item => ({
      x: parseFloat(item[xAxis]) || 0,
      y: parseFloat(item[yAxis]) || 0,
      z: 0,
    }));

    return (
      <Canvas style={{ height: '400px' }}>
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {data.map((point, index) => (
          <mesh key={index} position={[point.x, point.y, point.z]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="royalblue" />
          </mesh>
        ))}
      </Canvas>
    );
  };

  const render2DChart = () => {
    const chartData = prepareChartData();
    if (!chartData) return null;

    const options = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `${yAxis} vs ${xAxis}`,
        },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
    };

    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'scatter':
        return <Scatter data={chartData} options={options} />;
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!fileData) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="pie">Pie Chart</option>
          <option value="scatter">Scatter Plot</option>
        </select>

        <select
          value={xAxis}
          onChange={(e) => setXAxis(e.target.value)}
          className="p-2 border rounded"
        >
          {fileData.headers.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>

        <select
          value={yAxis}
          onChange={(e) => setYAxis(e.target.value)}
          className="p-2 border rounded"
        >
          {fileData.headers.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={is3D}
            onChange={(e) => setIs3D(e.target.checked)}
            className="form-checkbox"
          />
          3D View
        </label>
      </div>

      <div id="chart-container" className="bg-white p-4 rounded-lg shadow-lg h-[500px] w-full">
        {is3D ? render3DChart() : render2DChart()}
      </div>
    </div>
  );
};

export default ChartVisualization; 