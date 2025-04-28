'use client';

import { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * ChangePersonal Component
 * 
 * This component displays statistics about profile update requests
 * in a bar chart format.
 */
export default function ChangePersonal({ title, endpoint, chartType = 'bar' }) {
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          console.log('Profile update stats:', data.stats); // Debug log
          setStats(data.stats);
        } else {
          throw new Error(data.message || 'Failed to fetch statistics');
        }
      } catch (error) {
        console.error('Error fetching profile update stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (endpoint) {
      fetchStats();
    }
  }, [endpoint]);

  // Prepare chart data
  const chartData = {
    labels: ['รออนุมัติ', 'อนุมัติแล้ว', 'ปฏิเสธ'],
    datasets: [
      {
        label: 'จำนวนคำขอ',
        data: [
          parseInt(stats.pending) || 0, 
          parseInt(stats.approved) || 0, 
          parseInt(stats.rejected) || 0
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',  // Yellow for pending
          'rgba(75, 192, 192, 0.6)',   // Green for approved
          'rgba(255, 99, 132, 0.6)'    // Red for rejected
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Chart options with improved styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Prompt, sans-serif',
            size: 14
          },
          padding: 20
        }
      },
      title: {
        display: true,
        text: title || 'สถิติคำขอเปลี่ยนข้อมูลส่วนตัว',
        font: {
          family: 'Prompt, sans-serif',
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'Prompt, sans-serif',
          size: 14
        },
        bodyFont: {
          family: 'Prompt, sans-serif',
          size: 13
        },
        padding: 12,
        cornerRadius: 6,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw} รายการ`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        border: {
          dash: [4, 4]
        },
        ticks: {
          font: {
            family: 'Prompt, sans-serif',
            size: 12
          },
          precision: 0, // Only show whole numbers
          callback: function(value) {
            return value.toLocaleString('th-TH');
          }
        },
        title: {
          display: true,
          text: 'จำนวน (รายการ)',
          font: {
            family: 'Prompt, sans-serif',
            size: 14
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Prompt, sans-serif',
            size: 12
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 0,
        bottom: 10
      }
    },
    elements: {
      bar: {
        borderRadius: 6
      }
    }
  };

  // Summary cards for the statistics
  const StatCard = ({ title, value, bgColor, textColor }) => (
    <div className={`${bgColor} p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow`}>
      <p className={`text-sm font-medium ${textColor}`}>{title}</p>
      <p className={`text-2xl font-bold ${textColor.replace('700', '800')}`}>
        {loading ? '-' : value.toLocaleString('th-TH')}
      </p>
    </div>
  );

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
        <p>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title || 'สถิติคำขอเปลี่ยนข้อมูลส่วนตัว'}</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a8a]"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="ทั้งหมด" 
              value={stats.total} 
              bgColor="bg-gray-50" 
              textColor="text-gray-700" 
            />
            <StatCard 
              title="รออนุมัติ" 
              value={stats.pending} 
              bgColor="bg-yellow-50" 
              textColor="text-yellow-700" 
            />
            <StatCard 
              title="อนุมัติแล้ว" 
              value={stats.approved} 
              bgColor="bg-green-50" 
              textColor="text-green-700" 
            />
            <StatCard 
              title="ปฏิเสธ" 
              value={stats.rejected} 
              bgColor="bg-red-50" 
              textColor="text-red-700" 
            />
          </div>
          
          <div className="h-80 w-full">
            <Bar
              ref={chartRef}
              data={chartData}
              options={chartOptions}
            />
          </div>
        </>
      )}
    </div>
  );
}