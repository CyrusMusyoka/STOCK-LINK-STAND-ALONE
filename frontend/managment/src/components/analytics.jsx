import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Spinner, Row, Col, Form, Alert, Carousel, Table, Modal, Button, Badge, Pagination, ListGroup, ListGroupItem, InputGroup
} from 'react-bootstrap';
import axios from 'axios';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, Filler } from 'chart.js';

// Using lucide-react for icons as specified in the guidelines
import {
  Coins, ShoppingCart, Clock, LineChart, Users, Tag,
  CreditCard, Package, Repeat, DollarSign, Send, Star, Download
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement, // Register ArcElement for doughnut/pie charts
  Filler // Register Filler plugin for area fills
);

// New comprehensive color palette for the dashboard
const MODERN_CHART_COLORS = [
  "#60A5FA", // Sky Blue
  "#A78BFA", // Lavender
  "#86EFAC", // Emerald Green
  "#FB923C", // Orange
  "#F87171", // Rose Red
  "#3B82F6", // Royal Blue
  "#C084FC", // Purple
  "#34D399", // Teal
  "#FCD34D", // Amber
  "#EF4444", // Crimson
  "#10B981", // Forest Green
  "#EAB308", // Gold
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  :root {
    --primary-red: #FF4532;
    --secondary-green: #00C853;
    --dark-text: #1A202C;
    --light-background: #F0F2F5;
    --card-background: #FFFFFF;
    --border-color: #D1D9E6;
    --error-text: #EF4444;
    --purple-gradient: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); /* Example purple gradient */
    --primary-gradient: linear-gradient(135deg, var(--primary-red) 0%, color-mix(in srgb, var(--primary-red) 80%, black) 100%);
    --success-gradient: linear-gradient(135deg, var(--secondary-green) 0%, color-mix(in srgb, var(--secondary-green) 80%, black) 100%);
    --danger-gradient: linear-gradient(135deg, var(--error-text) 0%, color-mix(in srgb, var(--error-text) 80%, black) 100%);
  }

  .dashboard-container {
    background: var(--light-background);
    min-height: 100vh;
    padding: 1rem;
    font-family: 'Inter', sans-serif;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(31,38,135,0.1);
    border: 1px solid rgba(255,255,255,0.18);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .glass-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(31,38,135,0.15);
  }
  .metric-highlight {
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(135deg, #6366f1, #007aff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .compact-carousel {
    height: 280px;
    border-radius: 1rem;
    overflow: hidden;
  }
  .carousel-image {
    height: 280px;
    object-fit: cover;
    width: 100%;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
  }
  .carousel-image:hover {
    transform: scale(1.02);
  }
  .carousel-control-prev-icon,
  .carousel-control-next-icon {
    background-color: rgba(0,0,0,0.5);
    border-radius: 50%;
    padding: 15px;
    background-size: 60%;
  }
  .status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .fast-moving {
    background: #d1fae5; /* Lighter Green */
    color: #065f46; /* Darker Green */
  }
  .slow-moving {
    background: #fee2e2; /* Lighter Red */
    color: #991b1b; /* Darker Red */
  }
  .icon-wrapper {
    width: 45px;
    height: 45px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-bottom: 1rem;
  }
  /* Specific icon wrapper gradients */
  .icon-wrapper.gradient-blue {
    background: linear-gradient(135deg, #3B82F6, #60A5FA);
  }
  .icon-wrapper.gradient-green {
    background: linear-gradient(135deg, #10B981, #34D399);
  }
  .icon-wrapper.gradient-orange {
    background: linear-gradient(135deg, #F97316, #FB923C);
  }
  .icon-wrapper.gradient-red {
    background: linear-gradient(135deg, #EF4444, #F87171);
  }
  .table-hover-modern tbody tr:hover {
    background: rgba(0,122,255,0.03);
  }
  .analytics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  }
  .time-selector {
    width: 200px;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    padding: 0.5rem 1rem;
  }
  .analytics-header h2 .text-primary-gradient {
    background: linear-gradient(45deg, #6366f1, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  /* Gradient text colors for various sections */
  .text-gradient-primary {
    background: linear-gradient(45deg, #3B82F6, #60A5FA); /* Blue gradient */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .text-gradient-success {
    background: linear-gradient(45deg, #10B981, #34D399); /* Green gradient */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .text-gradient-warning {
    background: linear-gradient(45deg, #F97316, #FB923C); /* Orange gradient */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    padding-top: 1rem;
    max-height: 400px;
    overflow-y: auto;
  }
  .product-card {
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s ease-in-out;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .product-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .product-card.selected {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
  .product-image {
    height: 100px;
    object-fit: cover;
    width: 100%;
    border-radius: 0.5rem 0.5rem 0 0;
  }
  .discount-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #EF4444; /* Crimson Red from palette */
    color: white;
    padding: 5px 10px;
    border-radius: 0.5rem;
    font-weight: bold;
    font-size: 0.8em;
  }

  /* Modal Specific Styles */
  .modal-content {
    border-radius: 1rem;
    border: none;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  .modal-header {
    border-bottom: none;
    padding: 1.5rem 1.5rem 0.5rem 1.5rem;
    background-color: var(--light-background); /* Light background for header */
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
  }
  .modal-title {
    font-weight: 700;
    color: var(--dark-text);
    font-size: 1.5rem;
  }
  .modal-body {
    padding: 1.5rem;
    background-color: var(--card-background); /* White background for body */
  }
  .modal-footer {
    border-top: none;
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    background-color: var(--light-background); /* Light background for footer */
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
  }
  .modal-footer .btn {
    border-radius: 0.75rem;
    font-weight: 600;
  }

  .doughnut-chart-container {
    position: relative;
    height: 200px;
    width: 200px;
    margin: 0 auto;
  }

  .chart-center-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  /* Responsive Adjustments */
  @media (max-width: 1200px) {
    .analytics-header {
      flex-direction: column;
      align-items: flex-start;
    }
    .analytics-header .time-selector {
      width: 100%;
      margin-top: 1rem;
    }
    .analytics-header .btn {
      width: 100%;
      margin-top: 0.5rem;
    }
    .compact-carousel {
      height: 250px; /* Slightly reduce height for smaller screens */
    }
    .carousel-image {
      height: 250px;
    }
  }

  @media (max-width: 768px) {
    .dashboard-container {
      padding: 1rem;
    }
    .metric-highlight {
      font-size: 1.5rem;
    }
    .compact-carousel {
      height: 200px; /* Further reduce height for mobile */
    }
    .carousel-image {
      height: 200px;
    }
    .product-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
    .analytics-header {
      padding: 0.75rem;
    }
  }

  @media (max-width: 576px) {
    .analytics-header {
      flex-direction: column;
      align-items: stretch;
    }
    .analytics-header h2 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
    }
    .analytics-header .time-selector,
    .analytics-header .btn {
      width: 100%;
      margin-top: 0.5rem;
    }
    .doughnut-chart-container {
      height: 180px;
      width: 180px;
    }
    .chart-center-text .h3 {
      font-size: 1.2rem;
    }
    .table-responsive {
      border: 1px solid var(--border-color); /* Add border for better table appearance on small screens */
      border-radius: 0.75rem;
    }
    .table-hover-modern thead {
      display: none; /* Hide table header on very small screens if preferred */
    }
    .table-hover-modern tbody tr {
      display: block;
      margin-bottom: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
    }
    .table-hover-modern tbody td {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    .table-hover-modern tbody td:last-child {
      border-bottom: none;
    }
    .table-hover-modern tbody td::before {
      content: attr(data-label);
      font-weight: 600;
      margin-right: 1rem;
    }
  }
`;

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('weekly');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 5;
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [emailTemplate, setEmailTemplate] = useState({
    subject: 'New Discount Alert!',
    body: 'Check out these amazing deals just for you!'
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:5000/api/sales/analytics?range=${timeRange}`);
        setAnalytics(data);
        console.log(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please ensure the backend server is running and accessible.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  useEffect(() => {
    const loadDiscounts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/discounts');
        setDiscounts(data);
      } catch (err) {
        console.error('Error loading discounts:', err);
      }
    };
    loadDiscounts();
  }, []);

  // Ensure repeatCustomers is always an array
  const repeatCustomers = Array.isArray(analytics?.repeatCustomers)
    ? analytics.repeatCustomers
    : [];

  // Loyal Customer Pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;

  const currentCustomers = repeatCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalCustomerPages = Math.ceil(repeatCustomers.length / customersPerPage);

  // Fuel Gauge Chart for Peak Hour
  const peakHourGaugeData = {
    datasets: [{
      data: [
        Math.min(analytics?.peakHour?.revenue || 0, 100000),
        Math.max(0, 100000 - (Math.min(analytics?.peakHour?.revenue || 0, 100000)))
      ],
      backgroundColor: ['#00ff00', '#e0e0e0'], // Using colors from the original request
      circumference: 270,
      rotation: 225,
      borderWidth: 0
    }]
  };

  const customerGrowthData = {
    labels: analytics?.customerGrowth?.map(item => item.week) || ['Week 1', 'Week 2', 'Week 3', 'Week 4'], // This should ideally come from analytics data
    datasets: [
      {
        label: 'Customer Growth',
        data: analytics?.customerGrowth?.map(item => item.count) || [100, 250, 400, 500], // This should also come from analytics data
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        pointRadius: 6,
        pointBackgroundColor: (context) => {
          const value = context.raw;
          if (value <= 200) return '#EF4444';
          if (value <= 400) return '#F97316';
          return '#34D399';
        },
        pointHoverBackgroundColor: '#2196F3',
      },
    ],
  };

  const customerGrowthOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' },
    },
    scales: {
      x: { grid: { display: false }, title: { display: true, text: 'Weeks' } },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Customer Count' },
        ticks: {
          callback: (value) => {
            if (value === 200) return 'Low';
            if (value === 400) return 'Medium';
            if (value > 400) return 'High';
            return value;
          },
        },
      },
    },
  };

  const productSalesData = {
    labels: [...new Set((analytics?.productSalesTrends || []).flatMap(p => p.salesData.map(d => d.date)))],
    datasets: (analytics?.productSalesTrends || []).map((product, index) => ({
      label: product.name,
      data: product.salesData.map(d => d.units_sold),
      borderColor: (analytics?.chartColors ? analytics.chartColors[index % analytics.chartColors.length] : MODERN_CHART_COLORS[index % MODERN_CHART_COLORS.length]),
      backgroundColor: `${(analytics?.chartColors ? analytics.chartColors[index % analytics.chartColors.length] : MODERN_CHART_COLORS[index % MODERN_CHART_COLORS.length])}40`,
      tension: 0.3,
      pointRadius: 3
    }))
  };

  const exportToExcel = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/sales/export', { responseType: 'blob' }); // Get as blob
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales_report.xlsx'); // Set filename
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      alert('Sales report exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data. Please ensure the backend supports Excel export.');
    }
  };

  // This data will now ideally be populated by the fetchAnalytics API call
  const revenueChartData = {
    labels: analytics?.revenueTrends?.map(item => item.date) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Revenue',
        data: analytics?.revenueTrends?.map(item => item.revenue) || [1000, 1200, 1100, 900, 1500, 1300, 1400],
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };


  const businessHealthPercent = useMemo(() => {
    if (analytics?.costAnalysis?.length > 0) {
      const overallCOGS = analytics.costAnalysis.reduce((sum, item) => sum + (Number(item.totalCOGS) || 0), 0);
      const overallRevenue = analytics.costAnalysis.reduce((sum, item) => sum + (Number(item.totalRevenue) || 0), 0);

      if (overallRevenue === 0) return 0;

      if (overallRevenue < 100000 && overallCOGS > overallRevenue * 0.8) { // Example: if revenue is low and COGS is high relative to it
        return 20;
      }
      if (overallRevenue < 100000 && overallCOGS <= overallRevenue * 0.8) {
        return 40;
      }

      let health = ((overallRevenue - overallCOGS) / overallRevenue) * 100;

      return Math.min(Math.max(health, 0), 100); // Ensure health is between 0 and 100
    }
    return 0;
  }, [analytics]);

  const toggleProductSelection = (product) => {
    setSelectedProducts(prev =>
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  };

  const sendDiscountEmails = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to send discounts for.');
      return;
    }
    try {
      const { data } = await axios.post('http://localhost:5000/api/discounts/notify', {
        productIds: selectedProducts.map(p => p.id),
        emailSubject: emailTemplate.subject,
        emailBody: emailTemplate.body
      });
      alert(`Emails sent to ${data.sentCount} customers!`);
      setShowDiscountModal(false);
      setSelectedProducts([]); // Clear selection after sending
    } catch (err) {
      console.error('Email send error:', err);
      alert('Failed to send emails. Check console for details and ensure backend email service is configured.');
    }
  };

  if (loading)
    return (
      <div className="dashboard-container text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className='mt-2 text-muted'>Loading Dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div className="dashboard-container">
        <Alert variant="danger" className="m-4 glass-card">{error}</Alert>
      </div>
    );

  return (
    <div className="dashboard-container">
      <style>{styles}</style>

      {/* Header */}
      <div className="analytics-header">
        <h2 className="mb-0 d-flex align-items-center gap-2">
          <LineChart size={38} className="text-primary-gradient" />
          <p className='text-dark-text fw-bold mb-0'>Your Daily Analytics</p>
        </h2>
        <div className='d-flex align-items-center gap-3 flex-wrap mt-3 mt-md-0'>
          <Form.Select
            className="time-selector"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Form.Select>
          <Button variant="primary" className="modern-button" onClick={exportToExcel}>
            <Download className="me-2" /> Export Report
          </Button>
        </div>
      </div>

      <Row className="g-4 mb-4 d-flex align-items-center">
        {/* Revenue */}
        <Col xl={4} md={6}>
          <Card className="glass-card p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-wrapper gradient-blue">
                <DollarSign size={24} color="white" />
              </div>
              <div>
                <h5 className="text-muted mb-1">Revenue Per Day</h5>
                <div className="metric-highlight">
                  Ksh {Number(analytics?.todaySales?.totalSales || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Transactions */}
        <Col xl={4} md={6}>
          <Card className="glass-card p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-wrapper gradient-green">
                <ShoppingCart size={24} color="white" />
              </div>
              <div>
                <h5 className="text-muted mb-1">Transactions</h5>
                <div className="metric-highlight">
                  {analytics?.todaySales?.transactions || 0}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Business Health */}
        <Col xl={4} md={6}>
          <Card className="glass-card p-3 d-flex flex-column align-items-center justify-content-center">
            <p className="text-muted mb-1">Business Health</p>
            <div className="battery-container d-flex align-items-center" style={{ border: '2px solid var(--dark-text)', padding: '4px', borderRadius: '4px', position: 'relative' }}>
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="battery-segment"
                  style={{
                    width: '8px',
                    height: '16px',
                    marginRight: '2px',
                    backgroundColor: businessHealthPercent > (index * 25)
                      ? (businessHealthPercent < 30 ? 'var(--error-text)' :
                        businessHealthPercent < 70 ? '#F59E0B' :
                          'var(--secondary-green)')
                      : '#ccc'
                  }}
                />
              ))}
              <div style={{ width: '3px', height: '10px', backgroundColor: 'var(--dark-text)', position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', borderRadius: '2px' }}></div>
            </div>
            <div className="metric-highlight mt-2">
              {businessHealthPercent.toFixed(0)}%
            </div>
          </Card>
        </Col>
      </Row>

      {/* Peak Hour Fuel Gauge and Customer Growth Chart */}
      <Row className="g-4 mb-4">
        <Col xl={4} lg={6}>
          <Card className="glass-card p-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Clock size={24} />
              <h4 className="text-gradient-primary mb-0">Peak Hour Performance</h4>
            </div>
            <div className="doughnut-chart-container">
              <Doughnut
                data={peakHourGaugeData}
                options={{
                  cutout: '80%',
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                  }
                }}
              />
              <div className="chart-center-text">
                <div className="h3 mb-0" style={{ color: 'var(--dark-text)' }}>{analytics?.peakHour?.hour || '--'}:00</div>
                <small className="text-muted">Peak Hour</small>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Badge bg="success" className="me-2 modern-button btn-success">
                Transactions: {analytics?.peakHour?.transactions || 0}
              </Badge>
              <Badge bg="warning" className="modern-button" style={{ backgroundColor: '#FCD34D', color: 'var(--dark-text)' }}>
                Revenue: Ksh {Number(analytics?.peakHour?.revenue || 0).toLocaleString()}
              </Badge>
            </div>
          </Card>
        </Col>

        {/* Customer Growth Chart */}
        <Col xl={8}>
          <Card className="glass-card p-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Users size={24} />
              <h4 className="text-gradient-primary mb-0">Customer Growth (Weekly)</h4>
            </div>
            <Bar
              data={customerGrowthData}
              options={customerGrowthOptions}
            />
          </Card>
        </Col>
      </Row>

      {/* Loyal Customers with Pagination */}
      <Card className="glass-card mb-4 p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Star size={24} />
          <h4 className="text-gradient-primary mb-0">Loyal Customers</h4>
        </div>
        {repeatCustomers.length > 0 ? (
          <>
            <div className="table-responsive">
              <Table hover className="table-hover-modern mb-0" style={{ color: 'var(--dark-text)' }}>
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Visits</th>
                    <th>Total Spent</th>
                    <th>Products Bought</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.map((cust, idx) => (
                    <tr key={idx}>
                      <td data-label="Customer">
                        <span className="me-2">📧</span>
                        {cust.customer_email}
                      </td>
                      <td data-label="Visits">
                        <Badge bg="primary" className="modern-button btn-primary" style={{ backgroundColor: '#3B82F6' }}>
                          {cust.transactionCount}
                        </Badge>
                      </td>
                      <td data-label="Total Spent" className="text-gradient-success">
                        Ksh {Number(cust.lifetimeValue).toLocaleString()}
                      </td>
                      <td data-label="Products Bought">
                        <Badge bg="warning" className="modern-button" style={{ backgroundColor: '#FCD34D', color: 'var(--dark-text)' }}>
                          {cust.totalProducts || 0}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                {[...Array(totalCustomerPages).keys()].map(number => (
                  <Pagination.Item
                    key={number + 1}
                    active={number + 1 === currentPage}
                    onClick={() => setCurrentPage(number + 1)}
                  >
                    {number + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-muted">
            <Users size={32} className="mb-2" style={{ color: 'var(--border-color)' }} />
            <p>No repeat customers yet.</p>
          </div>
        )}
      </Card>

      {/* Product Sales Trends & Manage Discounts */}
      <Row className="g-4 mb-4">
        <Col xl={8}>
          <Card className="glass-card sales-chart-container p-3">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
              <h4 className="text-gradient-primary mb-2 mb-md-0">
                <LineChart size={24} className="me-2" />
                Product Sales Trends
              </h4>
              <Button variant="primary" className="modern-button" onClick={() => setShowDiscountModal(true)}>
                <Tag className="me-2" /> Manage Discounts
              </Button>
            </div>
            <Line
              data={productSalesData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } },
                interaction: { mode: 'nearest', axis: 'x' },
                scales: {
                  x: { grid: { display: false }, ticks: { color: 'var(--dark-text)' } },
                  y: { beginAtZero: true, ticks: { color: 'var(--dark-text)' } }
                }
              }}
            />
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="glass-card p-3">
            <div className="d-flex justify-content-between align-items-center mb-3" style={{ color: 'var(--dark-text)' }}>
              <h5 className="mb-0 fw-bold">Top Products</h5>
              <small className="text-muted">Weekly Performance</small>
            </div>
            <Carousel className="compact-carousel" indicators={false}>
              {(analytics?.topProducts || []).map(product => (
                <Carousel.Item key={product.id}>
                  <div className="position-relative">
                    <img
                      src={
                        product.image
                          ? `http://localhost:5000/uploads/${encodeURIComponent(product.image)}` // Assuming local server for images
                          : 'https://placehold.co/400x280/F0F0F0/ADADAD?text=No+Image'
                      }
                      className="carousel-image"
                      alt={product.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x280/F0F0F0/ADADAD?text=No+Image" }}
                    />
                    {product.discount > 0 && (
                      <div className="discount-badge">
                        {product.discount}% OFF
                      </div>
                    )}
                    <div className="carousel-caption bg-dark bg-opacity-75 p-3" style={{ borderRadius: '0 0 0.75rem 0.75rem' }}>
                      <h6 className="mb-1 text-white">{product.name}</h6>
                      <div className="d-flex justify-content-between align-items-center text-white">
                        <span> Revenue <br /> Today </span>
                        <span className='fw-bold bg-white p-2 rounded-lg' style={{ color: 'var(--dark-text)' }}>KSH {Number(product.revenue || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
            {(analytics?.topProducts || []).length === 0 && (
              <div className="text-center py-4 text-muted">
                <Package size={32} className="mb-2" style={{ color: 'var(--border-color)' }} />
                <p>No top products to display.</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Payment Methods Breakdown */}
      <Card className="glass-card mb-4 p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <CreditCard size={24} />
          <h4 className="text-gradient-primary mb-0">Payment Methods Breakdown (Today)</h4>
        </div>
        {analytics.paymentMethods?.length > 0 ? (
          <div className="table-responsive">
            <Table bordered hover className="table-hover-modern mb-0" style={{ color: 'var(--dark-text)' }}>
              <thead className="table-light">
                <tr>
                  <th>Method</th>
                  <th>Transactions</th>
                  <th>Total Revenue (Ksh)</th>
                </tr>
              </thead>
              <tbody>
                {analytics.paymentMethods.map((pm, index) => (
                  <tr key={index}>
                    <td data-label="Method">{pm.payment_method}</td>
                    <td data-label="Transactions">{pm.transactions}</td>
                    <td data-label="Total Revenue (Ksh)" className="text-gradient-success">
                      Ksh {Number(pm.totalRevenue).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <CreditCard size={32} className="mb-2" style={{ color: 'var(--border-color)' }} />
            <p>No payment data available for today.</p>
          </div>
        )}
      </Card>

      {/* Cost Analysis by Category */}
      <Card className="glass-card mb-4 p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Repeat size={24} />
          <h4 className="text-gradient-primary mb-0">Cost Analysis by Category (Today)</h4>
        </div>
        {analytics.costAnalysis?.length > 0 ? (
          <div className="table-responsive">
            <Table bordered hover className="table-hover-modern mb-0" style={{ color: 'var(--dark-text)' }}>
              <thead className="table-light">
                <tr>
                  <th>Category</th>
                  <th>Total COGS (Ksh)</th>
                  <th>Total Revenue (Ksh)</th>
                  <th>Profit Margin (%)</th>
                </tr>
              </thead>
              <tbody>
                {analytics.costAnalysis.map((cat, idx) => {
                  const profitMargin = cat.totalRevenue > 0
                    ? ((cat.totalRevenue - cat.totalCOGS) / cat.totalRevenue * 100).toFixed(2)
                    : '0.00';
                  return (
                    <tr key={idx}>
                      <td data-label="Category">{cat.category}</td>
                      <td data-label="Total COGS (Ksh)">{Number(cat.totalCOGS).toLocaleString()}</td>
                      <td data-label="Total Revenue (Ksh)">{Number(cat.totalRevenue).toLocaleString()}</td>
                      <td data-label="Profit Margin (%)">{profitMargin}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <Repeat size={32} className="mb-2" style={{ color: 'var(--border-color)' }} />
            <p>No cost analysis data available.</p>
          </div>
        )}
      </Card>

      {/* Product Movement Section */}
      <Card className="glass-card mb-4 p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Package size={24} />
          <h4 className="text-gradient-primary mb-0">Product Movement (Today)</h4>
        </div>
        {analytics.productMovement?.length > 0 ? (
          <div className="table-responsive">
            <Table hover className="table-hover-modern mb-0" style={{ color: 'var(--dark-text)' }}>
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.productMovement.map((product, idx) => (
                  <tr key={idx}>
                    <td data-label="Product">
                      <span className="me-2">📦</span> {product.product_name}
                    </td>
                    <td data-label="Units Sold">{product.units_sold}</td>
                    <td data-label="Status">
                      <Badge className={`status-badge ${product.units_sold > 50 ? 'fast-moving' : 'slow-moving'}`}>
                        {product.units_sold > 50 ? 'Fast Moving' : 'Slow Moving'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <Package size={32} className="mb-2" style={{ color: 'var(--border-color)' }} />
            <p>No product movement data available for today.</p>
          </div>
        )}
      </Card>

      {/* Discount Management Modal */}
      <Modal show={showDiscountModal} onHide={() => setShowDiscountModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title><Tag className="me-2" /> Manage Discounts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Email Subject</Form.Label>
            <InputGroup>
              <InputGroup.Text><Send size={18} /></InputGroup.Text>
              <Form.Control
                type="text"
                value={emailTemplate.subject}
                onChange={(e) => setEmailTemplate({ ...emailTemplate, subject: e.target.value })}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email Body</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={emailTemplate.body}
              onChange={(e) => setEmailTemplate({ ...emailTemplate, body: e.target.value })}
            />
          </Form.Group>

      {Array.isArray(discounts) && discounts.length > 0 ? (
  <div className="product-grid">
    {discounts.map(product => (
      <Card
        key={product.id}
        className={`product-card ${selectedProducts.some(p => p.id === product.id) ? 'selected' : ''}`}
        onClick={() => toggleProductSelection(product)}
      >
                  <Card.Img variant="top" src={product.image || 'https://placehold.co/150x100?text=Product'} className="product-image" />
                  <Card.Body className="p-2">
                    <Card.Title className="mb-1" style={{ fontSize: '0.9rem', color: 'var(--dark-text)' }}>
                      {product.name}
                    </Card.Title>
                    <Card.Text className="text-muted" style={{ fontSize: '0.8rem' }}>
                      Ksh {Number(product.price).toLocaleString()}
                    </Card.Text>
                    {product.currentDiscount > 0 && (
                      <Badge bg="info" className="position-absolute top-0 end-0 m-2">
                        {product.currentDiscount}% Off
                      </Badge>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-muted">
              <Package size={28} className="mb-2" style={{ color: 'var(--border-color)' }} />
              <p>No products available to offer discounts.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDiscountModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={sendDiscountEmails} disabled={selectedProducts.length === 0}>
            <Send className="me-2" /> Send Discount Emails ({selectedProducts.length})
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AnalyticsDashboard;