import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { FaUpload, FaSpinner } from 'react-icons/fa';

function ProductForm() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(''); // New category state
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setPreview('');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(imageFile);

    return () => {
      reader.abort();
    };
  }, [imageFile]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category); // Append category
    formData.append('price', price);
    formData.append('stock', stock);
    if (imageFile) formData.append('image', imageFile);

    try {
      const res = await axios.post('http://localhost:5000/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({ 
        text: `Product created! Image Path: ${res.data.imagePath}`, 
        type: 'success' 
      });
      
      // Reset form
      setName('');
      setCategory(''); // Reset category
      setPrice('');
      setStock('');
      setImageFile(null);
    } catch (error) {
      console.error(error);
      setMessage({ 
        text: error.response?.data?.message || 'Error creating product', 
        type: 'danger' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <Card.Body className="p-5">
        <h2 className="text-center mb-4 gradient-text">Create New Product</h2>
        
        {message.text && (
          <Alert variant={message.type} className="text-center">
            {message.text}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            <Col md={6}>
              <Form.Group controlId="productImage" className="mb-4">
                <div className="image-upload-wrapper border-2 rounded-3 p-4 text-center">
                  {preview ? (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="upload-preview img-fluid rounded-3"
                    />
                  ) : (
                    <div className="py-5">
                      <FaUpload className="h3 text-muted mb-3" />
                      <p className="text-muted mb-0">Drag & drop or click to upload</p>
                    </div>
                  )}
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="d-none"
                    id="fileInput"
                  />
                  <Form.Label 
                    htmlFor="fileInput" 
                    className="btn btn-outline-primary mt-3"
                  >
                    Choose Image
                  </Form.Label>
                </div>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="productName" className="mb-4">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-control-lg"
                />
              </Form.Group>

              <Form.Group controlId="productCategory" className="mb-4">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter product category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="form-control-lg"
                />
              </Form.Group>

              <Form.Group controlId="productPrice" className="mb-4">
                <Form.Label>Price (Ksh)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="Enter product price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="form-control-lg"
                />
              </Form.Group>

              <Form.Group controlId="productStock" className="mb-4">
                <Form.Label>Stock Quantity</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter stock quantity"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  className="form-control-lg"
                />
              </Form.Group>

              <div className="d-grid">
                <Button 
                  variant="primary" 
                  type="submit" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="spin" /> Creating...
                    </>
                  ) : (
                    'Create Product'
                  )}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ProductForm;

// Add this CSS in your main stylesheet
const styles = `
  .gradient-text {
    background: linear-gradient(45deg, #4B79CF, #4BCFBF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .image-upload-wrapper {
    border: 2px dashed #dee2e6;
    transition: border-color 0.3s ease;
    background: #f8f9fa;
  }

  .image-upload-wrapper:hover {
    border-color: #4B79CF;
    cursor: pointer;
  }

  .upload-preview {
    max-height: 300px;
    object-fit: contain;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
