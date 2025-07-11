import React, { useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { CartProvider } from './context/cartContext';
import { FiBox, FiPieChart, FiActivity, FiPlusCircle, FiStar } from 'react-icons/fi';
import ProductList from './components/productList';
import CartSidebar from './components/cartSide';
import Analytics from './components/analytics';
import StockAnalytics from './components/stockAnalysis';
import ProductForm from './components/productForm';


import './App.css'; // Ensure this has styles (see CSS snippet below)
import AuthComponent from './components/authComponents/auth';


function App() {
  const location = useLocation();

  useEffect(() => {
    console.log('Electron environment detected, skipping PWA installation');
  }, []);

  const navLinks = [
    { path: "/products", icon: <FiBox />, text: "Products" },
    { path: "/analytics", icon: <FiPieChart />, text: "Analytics" },
    { path: "/stock-analytics", icon: <FiActivity />, text: "Stock Analysis" },
    { path: "/create", icon: <FiPlusCircle />, text: "Create" },
  ];

  // Function to close the navbar collapse
  const closeNavbar = () => {
    const navbarCollapse = document.getElementById('main-nav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      navbarCollapse.classList.remove('show');
    }
  };

  return (
    <CartProvider>
      <Navbar expand="lg" className="app-navbar shadow-sm position-sticky z-3 top-0">
        <Container fluid>
          <Navbar.Brand as={NavLink} to="/" className="d-flex align-items-center">
            <span className="gradient-text">Stock-Link</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-nav" className="custom-toggler border-0">
            <span className="navbar-toggler-icon-custom"></span>
          </Navbar.Toggle>

          <Navbar.Collapse id="main-nav">
            <Nav className="mx-auto gap-2">
              {navLinks.map((link, index) => (
                <Nav.Link
                  key={index}
                  as={NavLink}
                  to={link.path}
                  className={({ isActive }) =>
                    `nav-link-custom d-flex align-items-center${isActive ? ' active-link' : ''}`
                  }
                  onClick={closeNavbar} // Add this onClick handler
                >
                  {link.icon}
                  <span className="ms-1">{link.text}</span>
                </Nav.Link>
              ))}
            </Nav>

            <Nav className="ms-auto">
              <CartSidebar />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="main-content">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/sales" element={<h2>Sales Component</h2>} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/stock-analytics" element={<StockAnalytics />} />
          <Route path="/create" element={<ProductForm />} />
          <Route path="/register" element={<AuthComponent />} />
        </Routes>
      </Container>

      <footer className="system-footer bg-light border-top p-2 d-flex flex-column">
        <Container fluid className="footer-top d-flex justify-content-between align-items-center mb-1">
          <span className="small footer-status">
            Logged in as: <span className="text-success fw-bold">Admin</span> | System Status: <span className="text-success fw-bold">Operational</span>
          </span>
          <span className="small footer-version">
            <span className="text-primary fw-bold">Stock-Link</span> | SYS-VERSION - 1.1.01
          </span>
        </Container>
        <Container fluid className="footer-bottom text-center py-1">
          <marquee className="footer-marquee" behavior="scroll" direction="left" scrollamount="5">
            <span className="text-danger fw-bold me-3">🔥 System Failure? Get Expert Support! 🔥</span>
            <span className="text-dark me-3">Contact Us: <strong className="text-primary">0740045355</strong> | Email: <strong className="text-primary">infowelttallis@gmail.com</strong></span>
            <span className="text-info ms-3">Your Reliable Partner for Stock Management Solutions!</span>
          </marquee>
          <span className="small d-block mt-1">
            <strong>Powered By Welt Tallis</strong>
          </span>
        </Container>
      </footer>
    </CartProvider>
  );
}

export default App;