import React, { useState } from 'react';
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2

// Define custom styles as a string for consistency and better aesthetics
const styles = `
  .auth-container {
    background: linear-gradient(135deg, #f0f2f5 0%, #e0e5ec 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    font-family: 'Inter', sans-serif;
  }

  .auth-card {
    border-radius: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border: none;
    overflow: hidden;
    background: #ffffff;
  }

  .auth-header {
    background: linear-gradient(135deg, #ff4532 0%, #ff8c00 100%);
    color: white;
    padding: 1rem 2.5rem;
    text-align: center;
    border-bottom: none;
    border-top-left-radius: 1.5rem;
    border-top-right-radius: 1.5rem;
  }

  .auth-header h2 {
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .auth-header p {
    opacity: 0.9;
    margin-bottom: 0;
  }

  .auth-body {
    padding: 2rem;
  }

  .form-control-custom {
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d9e6;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .form-control-custom:focus {
    border-color: #ff4532;
    box-shadow: 0 0 0 0.25rem rgba(255, 69, 50, 0.25);
  }

  .btn-primary-custom {
    background: linear-gradient(135deg, #ff4532 0%, #ff8c00 100%);
    border: none;
    border-radius: 0.75rem;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(255, 69, 50, 0.2);
  }

  .btn-primary-custom:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(255, 69, 50, 0.3);
    background: linear-gradient(135deg, #ff8c00 0%, #ff4532 100%); /* Slight gradient shift on hover */
  }

  .btn-link-custom {
    color: #ff4532;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .btn-link-custom:hover {
    color: #ff8c00;
    text-decoration: underline;
  }

  .alert-styled {
    border-radius: 0.75rem;
    background-color: rgba(255, 69, 50, 0.1);
    border-color: #ff4532;
    color: #ff4532;
  }
`;

function AuthComponent() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return false;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: error || 'Please check your input.', // Use existing error or a generic one
        timer: 3000,
        showConfirmButton: false,
        customClass: {
          popup: 'swal2-responsive-popup'
        }
      });
      return;
    }

    setLoading(true);

    const loadingMessage = formData.email === 'admin@example.com' ? 'Logging in as Admin...' : 'Logging in...';

    Swal.fire({
      title: loadingMessage,
      text: 'Please wait...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'swal2-responsive-popup'
      }
    });

    try {
      const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          ...(isLogin ? {} : { username: formData.email.split('@')[0] }) // Use part of email as username for registration
        })
      });

      const data = await res.json();
      Swal.close(); // Close loading pop-up

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong during authentication.');
      }

      // Save token or session if needed
      if (isLogin) {
        localStorage.setItem('auth-token', data.token);
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Redirecting to dashboard...',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal2-responsive-popup'
          }
        }).then(() => {
          navigate('/products'); // Redirect to products or dashboard after successful login
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'You can now log in with your new account.',
          timer: 3000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal2-responsive-popup'
          }
        }).then(() => {
          setIsLogin(true); // Switch to login form after registration
          setFormData({ email: formData.email, password: '', confirmPassword: '' }); // Pre-fill email
        });
      }
    } catch (err) {
      Swal.close(); // Ensure loading pop-up is closed on error
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Authentication Failed',
        text: err.message || 'Invalid credentials. Please try again.',
        timer: 3000,
        showConfirmButton: false,
        customClass: {
          popup: 'swal2-responsive-popup'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-container">
      <style>{styles}</style> {/* Apply custom styles */}
      <Card className="auth-card" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>
            {isLogin ? 'Sign in to continue to Stock-Link' : 'Get started with your free Stock-Link account'}
          </p>
        </div>
        <Card.Body className="auth-body">
          {error && <Alert variant="danger" className="alert-styled">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                className="form-control-custom"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                className="form-control-custom"
                required
              />
            </Form.Group>

            {!isLogin && (
              <Form.Group className="mb-4">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  className="form-control-custom"
                  required
                />
              </Form.Group>
            )}

            <Button type="submit" className="w-100 mb-3 btn-primary-custom" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            <div className="text-center">
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <Button variant="link" onClick={() => { setIsLogin(false); setError(''); setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); }} className="p-0 btn-link-custom">
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Button variant="link" onClick={() => { setIsLogin(true); setError(''); setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); }} className="p-0 btn-link-custom">
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AuthComponent;
