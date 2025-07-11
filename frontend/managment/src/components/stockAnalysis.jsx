import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card, Spinner, Row, Col, Badge, Button, Modal, Form,
  ListGroup, ListGroupItem, Alert, Carousel, InputGroup
} from 'react-bootstrap';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import {
  BarChart, Box, Database, RotateCw, // Icons for charts, total products, total stock, refresh
  Settings, TriangleAlert, Flame, XCircle, Trophy, // Icons for settings, alerts, hot sellers, out of stock, valuation
  Package // For InputGroup icon in settings modal
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CHART_COLORS = ["#FF4532", "#00C853", "#5856d6", "#ffcc00", "#ff2d55"];
const DEFAULT_THRESHOLD = 10;
const API_URL = 'http://localhost:5000/api/products'; // Backend API URL

// Define custom styles as a string for TailwindCSS compatibility and overall aesthetics
const styles = `
  :root {
    --primary-red: #FF4532;
    --secondary-green: #00C853;
    --dark-text: #1A202C;
    --light-background: #F0F2F5;
    --card-background: #FFFFFF;
    --border-color: #D1D9E6;
    --error-text: #EF4444;
    --purple-gradient: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    --primary-gradient: linear-gradient(135deg, var(--primary-red) 0%, color-mix(in srgb, var(--primary-red) 80%, black) 100%);
    --success-gradient: linear-gradient(135deg, var(--secondary-green) 0%, color-mix(in srgb, var(--secondary-green) 80%, black) 100%);
    --danger-gradient: linear-gradient(135deg, var(--error-text) 0%, color-mix(in srgb, var(--error-text) 80%, black) 100%);
  }

  .analytics-container {
    background: var(--light-background);
    min-height: 100vh;
    padding: 0rem;
    font-family: 'Inter', sans-serif;
  }

  .stylish-card {
    background: var(--card-background);
   
    box-shadow: 0 8px 32px rgba(31,38,135,0.1);
    border: none;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .stylish-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(31,38,135,0.15);
  }

  .modern-button {
    border-radius: 0.75rem;
    font-weight: 600;
    transition: all 0.3s ease;
    padding: 0.75rem 0.85rem;
    border: none;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    background-color: var(--primary-red);
    color: white;
  }
  .modern-button:hover {
    background-color: color-mix(in srgb, var(--primary-red) 90%, black);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(255, 69, 50, 0.2);
  }

  .modern-button.btn-light-outline {
    background-color: transparent;
    border: 1px solid var(--border-color);
    color: var(--dark-text);
  }
  .modern-button.btn-light-outline:hover {
    background-color: var(--light-background);
    color: var(--primary-red);
  }

  .card-header-styled {
    background: var(--primary-gradient);
    color: white;
    border-top-left-radius: 1.5rem;
    border-top-right-radius: 1.5rem;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: none;
  }

  .card-header-warning-styled {
    background: linear-gradient(135deg, #FCD34D 0%, #EAB308 100%);
    color: var(--dark-text);
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: none;
  }

  .card-header-danger-styled {
    background: var(--danger-gradient);
    color: white;
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: none;
  }

  .stat-card {
    border-radius: 1.2rem;
    padding: 1.5rem;
    color: white;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 120px;
  }

  .stat-card.bg-gradient-primary {
    background: var(--primary-gradient);
  }
  .stat-card.bg-gradient-purple {
    background: var(--purple-gradient);
  }
  .stat-card.bg-gradient-success {
    background: var(--success-gradient);
  }
  .stat-card.bg-gradient-danger {
    background: var(--danger-gradient);
  }

  .stat-card .icon-container {
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    padding: 0.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    margin-bottom: 10px;
  }
  .stat-card .icon-container svg {
    color: white;
  }

  .alert-styled {
    background-color: color-mix(in srgb, var(--error-text) 10%, var(--card-background));
    border-color: var(--error-text);
    color: var(--dark-text);
    border-radius: 0.75rem;
    padding: 1rem 1.5rem;
    animation: fadeIn 0.5s ease-out;
  }
  .alert-styled strong {
    color: var(--error-text);
  }
  .alert-styled .close-button {
    color: var(--error-text);
    opacity: 0.7;
  }
  .alert-styled .close-button:hover {
    opacity: 1;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .bounce {
    animation: bounce 0.8s infinite alternate;
  }
  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-5px); }
  }

  .list-group-item.hover-light:hover {
    background-color: var(--light-background);
  }

  .chart-container {
    min-height: 300px;
    position: relative;
  }

  .modal-content {
    border-radius: 1rem;
    border: none;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  .modal-header {
    border-bottom: none;
    padding: 1.5rem 1.5rem 0.5rem 1.5rem;
  }
  .modal-title {
    font-weight: 700;
    color: var(--dark-text);
    font-size: 1.5rem;
  }
  .modal-body {
    padding: 0.5rem 1.5rem 1.5rem 1.5rem;
  }
  .modal-footer {
    border-top: none;
    padding: 0.5rem 1.5rem 1.5rem 1.5rem;
  }

  .input-group-modern .form-control,
  .input-group-modern .input-group-text {
    border-radius: 0.75rem;
    border: 1px solid var(--border-color);
  }
  .input-group-modern .form-control {
    padding: 0.75rem 1rem;
  }
  .input-group-modern .input-group-text {
    background-color: var(--light-background);
  }

  .form-label {
    font-weight: 600;
    color: var(--dark-text);
  }
`;

// Simple Toast Notification Component
function Toast({ message, type, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000); // Hide after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  const bgColor = type === 'success' ? '#28a745' : '#dc3545';
  const textColor = 'white';

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: bgColor,
      color: textColor,
      padding: '15px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      {message}
      <button
        onClick={() => { setVisible(false); onClose(); }}
        style={{
          background: 'none',
          border: 'none',
          color: textColor,
          fontSize: '1.2em',
          cursor: 'pointer'
        }}
      >
        &times;
      </button>
    </div>
  );
}

function StockAnalytics() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [thresholdInput, setThresholdInput] = useState('');
  const [products, setProducts] = useState([]); // Products will now come from API
  const [localProductSettings, setLocalProductSettings] = useState([]); // Simulating productSettings for thresholds

  const [toast, setToast] = useState(null); // State for toast notifications

  // Function to show toast
  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  const productSettings = localProductSettings;

  // Derived data - these remain the same, just `products` source changes
  const totalStock = useMemo(() => products.reduce((sum, p) => sum + p.stock, 0), [products]);
  const totalProducts = useMemo(() => products.length, [products]);
  const outOfStockProducts = useMemo(() => products.filter(p => p.stock <= 0), [products]);
  const totalInventoryValue = useMemo(() => (
    products.reduce((sum, p) => sum + (p.stock * (parseFloat(p.price) || 0)), 0)
  ), [products]);

  const topSellingProducts = useMemo(() => (
    products
      .filter(p => (p.salesCount || 0) > 0)
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 5)
  ), [products]);

  const stats = useMemo(() => [
    {
      title: "Total Products",
      value: totalProducts,
      icon: <Box className="fs-2" />,
      color: "bg-gradient-primary",
      textColor: "text-white"
    },
    {
      title: "Total Valuation",
      value: `Ksh ${totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: <Trophy className="fs-2" />,
      color: "bg-gradient-purple",
      textColor: "text-white"
    },
    {
      title: "Total Stock",
      value: totalStock,
      icon: <Database className="fs-2" />,
      color: "bg-gradient-success",
      textColor: "text-white"
    },
    {
      title: "Out of Stock",
      value: outOfStockProducts.length,
      icon: <XCircle className="fs-2" />,
      color: "bg-gradient-danger",
      textColor: "text-white"
    }
  ], [totalProducts, totalInventoryValue, totalStock, outOfStockProducts.length]);

  const checkLowStock = useCallback(() => {
    const alerts = products.filter(product => {
      const setting = productSettings.find(ps => ps.productId === product.id);
      const threshold = setting?.threshold ?? DEFAULT_THRESHOLD;
      return product.stock > 0 && product.stock <= threshold;
    });

    if (alerts.length > 0) {
      setLowStockProducts(alerts);
      // Original: new Audio(alertSound).play().catch(() => console.warn('Audio playback failed'));
      // Audio playback removed due to environment limitations, replaced with toast
      showToast('Low stock detected for some products!', 'error');
    } else {
      setLowStockProducts([]);
    }
  }, [products, productSettings, showToast]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      const completeProducts = response.data.map(product => ({
        ...product,
        // Provide default values if API data is incomplete
        category: product.category || 'Uncategorized',
        salesCount: product.salesCount || 0,
        image: product.image || `https://placehold.co/60x60/F0F0F0/ADADAD?text=${encodeURIComponent(product.name || 'Product')}`
      }));
      setProducts(completeProducts);
      setLastUpdated(new Date());
      showToast('Data fetched successfully!', 'success');
    } catch (error) {
      console.error('Failed to load data from API:', error);
      showToast('Failed to load data from API. Displaying cached/empty data.', 'error');
      // If API fails, clear products to avoid using stale or undefined data
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const processChartData = useCallback((products) => {
    const categoryData = products.reduce((acc, product) => {
      const category = product.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + (product.stock || 0);
      return acc;
    }, {});

    const labels = Object.keys(categoryData).filter(label => label);
    const dataValues = labels.map(label => categoryData[label]);

    setChartData({
      labels,
      datasets: [{
        label: 'Stock Units',
        data: dataValues,
        backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        hoverBackgroundColor: labels.map((_, i) => `${CHART_COLORS[i % CHART_COLORS.length]}99`),
        barThickness: 30,
        categoryPercentage: 0.5,
      }]
    });
  }, []);

  const forceRefresh = useCallback(async () => {
    // Clear existing data and settings before fetching new to simulate a full refresh
    setProducts([]);
    setLocalProductSettings([]);
    setLowStockProducts([]);
    setChartData(null);
    await fetchData(); // Fetch fresh data from the API
  }, [fetchData]);

  // Effect to fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effect to process chart data and check low stock whenever products or product settings change
  useEffect(() => {
    if (products.length > 0) {
      processChartData(products);
      checkLowStock();
    } else {
      setChartData(null); // Clear chart if no products
      setLowStockProducts([]); // Clear low stock alerts if no products
    }
  }, [products, productSettings, processChartData, checkLowStock]);


  const handleSaveThreshold = useCallback(async () => {
    if (selectedProduct && thresholdInput !== '') {
      const newThreshold = Number(thresholdInput);
      setLocalProductSettings(prevSettings => {
        const existingIndex = prevSettings.findIndex(ps => ps.productId === selectedProduct.id);
        if (existingIndex !== -1) {
          return prevSettings.map((item, idx) =>
            idx === existingIndex ? { ...item, threshold: newThreshold } : item
          );
        } else {
          return [...prevSettings, { productId: selectedProduct.id, threshold: newThreshold }];
        }
      });
      setShowSettings(false);
      setThresholdInput('');
      checkLowStock(); // Re-check low stock after threshold change
      showToast(`Threshold for ${selectedProduct.name} saved!`, 'success');
    } else {
      showToast('Please enter a valid threshold.', 'error');
    }
  }, [selectedProduct, thresholdInput, checkLowStock, showToast]);

  return (
    <div className="analytics-container">
      <style>{styles}</style>
      <Card className="stylish-card mt-4 overflow-hidden">
        <Card.Header className="card-header-styled">
          <div className="d-flex align-items-center">
            <BarChart className="me-2 fs-4" />
            <h4 className="mb-0 fw-bold">📊 Stock Analytics Dashboard</h4>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Button variant="light" size="sm" className="modern-button btn-light-outline rounded-pill" onClick={forceRefresh}>
              <RotateCw className="me-1" /> Force Refresh
            </Button>
            <Button variant="light" size="sm" className="modern-button btn-light-outline rounded-pill" onClick={() => setShowSettings(true)}>
              <Settings className="me-1" /> Settings
            </Button>
            <small className="d-flex align-items-center text-white">
              Updated: {lastUpdated.toLocaleTimeString()}
            </small>
          </div>
        </Card.Header>

        <Card.Body className="position-relative">
          <div className="position-absolute top-0 end-0 w-50 h-100 bg-gradient-light opacity-10" style={{ zIndex: 0 }} />

          {lowStockProducts.length > 0 && (
            <Alert variant="danger" className="d-flex align-items-center mb-4 alert-styled" dismissible onClose={() => setLowStockProducts([])}>
              <TriangleAlert className="me-5 fs-4 bounce" />
              <div>
                <strong>🚨 Low Stock Alert!</strong> {lowStockProducts.length} product(s) need attention
              </div>
            </Alert>
          )}

          <Row className="g-3 mb-4">
            {stats.map((stat, index) => (
              <Col key={index} xs={12} md={3}>
                <Card className={`h-100 stat-card border-0 d-flex flex-column align-items-start ${stat.color} ${stat.textColor}`}>
                  <Card.Body className="d-flex flex-column align-items-start p-3 w-100">
                    <div className="icon-container me-2 mb-2">
                      {stat.icon}
                    </div>
                    <small className="text-uppercase fw-semibold" style={{opacity: 0.8}}>{stat.title}</small>
                    <h2 className="mt-1 fw-bold">{stat.value}</h2>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4">
            <Col xl={8} className="mb-4">
              <Card className="h-100 stylish-card">
                <Card.Header className="bg-light py-3" style={{borderBottom: '1px solid var(--border-color)', borderRadius: '1.2rem 1.2rem 0 0'}}>
                  <h5 className="mb-0 fw-bold" style={{color: 'var(--dark-text)'}}>📈 Stock Distribution by Category</h5>
                </Card.Header>
                <Card.Body className="chart-container">
                  {loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" style={{color: 'var(--primary-red)'}} />
                      <p className="mt-2" style={{color: 'var(--dark-text)'}}>Loading Analytics...</p>
                    </div>
                  ) : chartData && chartData.labels.length > 0 ? ( // Only render chart if data exists
                    <div style={{ height: '400px' }}>
                      <Bar
                        data={chartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label: ctx => `${ctx.dataset.label}: ${ctx.raw} units`
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: { color: 'rgba(0,0,0,0.05)' },
                              title: { display: true, text: 'Stock Units', color: 'var(--dark-text)' },
                              ticks: { color: 'var(--dark-text)' }
                            },
                            x: {
                              grid: { display: false },
                              ticks: { color: 'var(--dark-text)', font: { weight: '600' } }
                            }
                          },
                          animation: { duration: 1000, easing: 'easeInOutQuart' }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted">
                      <BarChart className="mb-3" size={48} style={{color: 'var(--border-color)'}} />
                      <h5 style={{color: 'var(--dark-text)'}}>No analytics data available</h5>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col xl={4}>
              <Row className="g-4 h-100">
                <Col xs={12}>
                  <Card className="h-100 stylish-card">
                    <Card.Header className="card-header-danger-styled">
                      <XCircle className="me-2" />
                      🚫 Out of Stock
                    </Card.Header>
                    <Card.Body className="p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <ListGroup variant="flush">
                        {outOfStockProducts.length === 0 ? (
                          <div className="text-center text-muted py-3">
                            🎉 All products in stock!
                          </div>
                        ) : (
                          outOfStockProducts.map(product => (
                            <ListGroupItem
                              key={product.id}
                              className="d-flex justify-content-between align-items-center hover-light"
                              style={{color: 'var(--dark-text)', borderBottom: '1px solid var(--border-color)'}}
                            >
                              <span>{product.name}</span>
                              <Badge bg="danger" className="status-badge danger">0</Badge>
                            </ListGroupItem>
                          ))
                        )}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12}>
                  <Card className="h-100 stylish-card">
                    <Card.Header className="card-header-warning-styled">
                      <Flame className="me-2" />
                      🔥 Hot Sellers
                    </Card.Header>
                    <Card.Body className="p-0">
                      {topSellingProducts.length > 0 ? (
                        <Carousel indicators={false} interval={3000}>
                          {topSellingProducts.map((product, index) => (
                            <Carousel.Item key={product.id}>
                              <div className="text-center position-relative">
                                <div className="position-absolute top-0 start-0 m-2">
                                  <Badge pill style={{backgroundColor: 'var(--primary-red)', color: 'white'}} className="fs-6">
                                    #{index + 1}
                                  </Badge>
                                </div>
                                <img
                                  src={product.image || 'https://placehold.co/300x180/F0F0F0/ADADAD?text=No+Image'}
                                  alt={product.name}
                                  className="img-fluid rounded-top"
                                  style={{
                                    height: '180px',
                                    objectFit: 'cover',
                                    width: '100%',
                                    filter: 'brightness(0.95)'
                                  }}
                                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x180/F0F0F0/ADADAD?text=No+Image" }}
                                />
                                <div className="p-3 bg-light" style={{borderTop: '1px solid var(--border-color)', borderRadius: '0 0 1rem 1rem'}}>
                                  <h5 className="mb-1 fw-bold" style={{color: 'var(--dark-text)'}}>{product.name}</h5>
                                  <div className="d-flex justify-content-center align-items-center">
                                    <Badge style={{backgroundColor: 'var(--dark-text)', color: 'white'}} pill className="me-2">
                                      Sold: {product.salesCount}
                                    </Badge>
                                    <Badge style={{backgroundColor: 'var(--secondary-green)', color: 'white'}} pill>
                                      Ksh {Number(product.price).toLocaleString()}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </Carousel.Item>
                          ))}
                        </Carousel>
                      ) : (
                        <div className="text-center text-muted py-4">
                          <Flame className="mb-3" size={32} style={{color: 'var(--border-color)'}} />
                          <h5 style={{color: 'var(--dark-text)'}}>No sales data yet</h5>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Modal show={lowStockProducts.length > 0} onHide={() => setLowStockProducts([])} centered>
        <Modal.Header closeButton className="alert-danger" style={{backgroundColor: 'var(--error-text)', color: 'white', borderBottom: 'none'}}>
          <Modal.Title>
            <TriangleAlert className="me-2" />
            Low Stock Alert
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{backgroundColor: 'var(--card-background)', color: 'var(--dark-text)'}}>
          <ListGroup variant="flush">
            {lowStockProducts.map(product => {
              const setting = productSettings?.find(ps => ps.productId === product.id);
              const threshold = setting?.threshold ?? DEFAULT_THRESHOLD;

              return (
                <ListGroupItem
                  key={product.id}
                  className="d-flex justify-content-between align-items-center"
                  style={{color: 'var(--dark-text)', borderBottom: '1px solid var(--border-color)'}}
                >
                  <div>
                    <span className="d-block fw-bold">{product.name}</span>
                    <small className="text-muted">
                      Current stock: {product.stock}
                    </small>
                  </div>
                  <Badge bg="danger" className="status-badge danger">Threshold: {threshold}</Badge>
                </ListGroupItem>
              )
            })}
          </ListGroup>
        </Modal.Body>
      </Modal>

      <Modal show={showSettings} onHide={() => { setShowSettings(false); setSelectedProduct(null); setThresholdInput(''); }} centered>
        <Modal.Header closeButton style={{backgroundColor: 'var(--light-background)', borderBottom: 'none'}}>
          <Modal.Title className="fw-bold" style={{color: 'var(--dark-text)'}}>Stock Threshold Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{backgroundColor: 'var(--card-background)', color: 'var(--dark-text)'}}>
          {selectedProduct ? (
            <>
              <h5 style={{color: 'var(--primary-red)'}}>{selectedProduct.name}</h5>
              <Form.Group>
                <Form.Label htmlFor="thresholdInput">Set Low Stock Threshold:</Form.Label>
                <InputGroup className="input-group-modern mb-3">
                  <InputGroup.Text><Package size={18} /></InputGroup.Text>
                  <Form.Control
                    id="thresholdInput"
                    type="number"
                    value={thresholdInput}
                    onChange={(e) => setThresholdInput(e.target.value)}
                    placeholder={`Current: ${productSettings.find(ps => ps.productId === selectedProduct.id)?.threshold ?? DEFAULT_THRESHOLD}`}
                    min="0"
                  />
                </InputGroup>
              </Form.Group>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="outline-secondary" className="modern-button btn-light-outline" onClick={() => { setSelectedProduct(null); setThresholdInput(''); }}>
                  Cancel
                </Button>
                <Button variant="primary" className="modern-button" onClick={handleSaveThreshold}>
                  Save Threshold
                </Button>
              </div>
            </>
          ) : (
            <ListGroup variant="flush">
              {products.length === 0 ? (
                <div className="text-center text-muted py-3">No products to configure.</div>
              ) : (
                products.map(product => (
                  <ListGroupItem
                    key={product.id}
                    action
                    onClick={() => { setSelectedProduct(product); setThresholdInput(productSettings.find(ps => ps.productId === product.id)?.threshold ?? ''); }}
                    className="d-flex justify-content-between align-items-center hover-light"
                    style={{color: 'var(--dark-text)', borderBottom: '1px solid var(--border-color)'}}
                  >
                    <span>{product.name}</span>
                    <Badge bg="secondary">
                      Threshold: {productSettings.find(ps => ps.productId === product.id)?.threshold ?? DEFAULT_THRESHOLD}
                    </Badge>
                  </ListGroupItem>
                ))
              )}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default StockAnalytics;