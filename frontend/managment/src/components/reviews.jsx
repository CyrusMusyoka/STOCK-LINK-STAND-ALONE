// src/components/ReviewForm.jsx
import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { FaStar, FaRegStar, FaUser, FaEnvelope, FaThumbsUp, FaLightbulb, FaBug } from 'react-icons/fa';
import ReactRating from 'react-rating';

/**
 * Enhanced ReviewForm component with:
 * - Star rating visualizations
 * - Sectioned layout with icons
 * - Better visual hierarchy
 * - Loading states
 * - Improved validation feedback
 */
const ReviewForm = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    overallRating: 5,
    usabilityRating: 5,
    performanceRating: 5,
    featuresRating: 5,
    liked: '',
    improvements: '',
    issues: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRatingChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      await axios.post('/api/reviews', formData);
      setMessage('Thank you for helping us improve! 🌟 We appreciate your feedback.');
      setFormData({
        userName: '',
        userEmail: '',
        overallRating: 5,
        usabilityRating: 5,
        performanceRating: 5,
        featuresRating: 5,
        liked: '',
        improvements: '',
        issues: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="review-form-container my-5">
    <Card className="shadow-lg border-0 overflow-hidden">
      <Card.Body className="p-4">
        <div className="text-start mb-5">
          <h2 className="fw-bold text-gradient mb-3">
            <FaThumbsUp className="me-2" />
            Share Your Experience
          </h2>
          <p className="text-muted mb-0">
  Share your experience and help us improve our   Systems.  
</p>

        </div>

        {message && <Alert variant="success" className="fade-in-alert">{message}</Alert>}
        {error && <Alert variant="danger" className="fade-in-alert">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Personal Info Section */}
          <Card className="mb-4 border-0 bg-soft-primary">
            <Card.Body className="p-4">
              <h5 className="mb-4 d-flex align-items-center text-primary">
                <FaUser className="me-2 fs-5" />
                About You (optional)
              </h5>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group controlId="userName" className="mb-3">
                    <Form.Label className="text-muted small">Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="rounded-pill border-0 shadow-sm"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="userEmail" className="mb-3">
                    <Form.Label className="text-muted small">Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="userEmail"
                      value={formData.userEmail}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="rounded-pill border-0 shadow-sm"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Ratings Section */}
          <Card className="mb-4 border-0 bg-soft-warning">
            <Card.Body className="p-4">
              <h5 className="mb-4 d-flex align-items-center text-warning">
                <FaStar className="me-2 fs-5" />
                System Ratings
              </h5>
              
              <div className="rating-section">
                <Form.Group controlId="overallRating" className="mb-4">
                  <Form.Label className="d-block mb-3 fw-semibold">Overall Satisfaction</Form.Label>
                  <ReactRating
                    emptySymbol={<FaRegStar className="text-warning fs-3" />}
                    fullSymbol={<FaStar className="text-warning fs-3" />}
                    initialRating={formData.overallRating}
                    onChange={(value) => handleRatingChange('overallRating', value)}
                  />
                </Form.Group>

                <Row className="g-4">
                  <Col md={4}>
                    <Form.Group controlId="usabilityRating" className="text-center">
                      <Form.Label className="d-block mb-2 fw-semibold small">Usability</Form.Label>
                      <ReactRating
                        emptySymbol={<FaRegStar className="text-warning fs-4" />}
                        fullSymbol={<FaStar className="text-warning fs-4" />}
                        initialRating={formData.usabilityRating}
                        onChange={(value) => handleRatingChange('usabilityRating', value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="performanceRating" className="text-center">
                      <Form.Label className="d-block mb-2 fw-semibold small">Performance</Form.Label>
                      <ReactRating
                        emptySymbol={<FaRegStar className="text-warning fs-4" />}
                        fullSymbol={<FaStar className="text-warning fs-4" />}
                        initialRating={formData.performanceRating}
                        onChange={(value) => handleRatingChange('performanceRating', value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="featuresRating" className="text-center">
                      <Form.Label className="d-block mb-2 fw-semibold small">Features</Form.Label>
                      <ReactRating
                        emptySymbol={<FaRegStar className="text-warning fs-4" />}
                        fullSymbol={<FaStar className="text-warning fs-4" />}
                        initialRating={formData.featuresRating}
                        onChange={(value) => handleRatingChange('featuresRating', value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>

          {/* Feedback Section */}
          <Card className="mb-4 border-0 bg-soft-info">
            <Card.Body className="p-4">
              <h5 className="mb-4 d-flex align-items-center text-info">
                <FaLightbulb className="me-2 fs-5" />
                Your Feedback
              </h5>

              <Form.Group controlId="liked" className="mb-4">
                <Form.Label className="fw-semibold small">What worked well?</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="liked"
                  value={formData.liked}
                  onChange={handleChange}
                  placeholder="What aspects of the system did you appreciate?"
                  className="border-0 shadow-sm rounded-3"
                />
              </Form.Group>

              <Form.Group controlId="improvements" className="mb-4">
                <Form.Label className="fw-semibold small">Suggestions for improvement</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="improvements"
                  value={formData.improvements}
                  onChange={handleChange}
                  placeholder="How can we make your experience better?"
                  className="border-0 shadow-sm rounded-3"
                />
              </Form.Group>

              <Form.Group controlId="issues" className="mb-4">
                <Form.Label className="fw-semibold small d-flex align-items-center">
                  <FaBug className="me-2" />
                  Encountered any issues?
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="issues"
                  value={formData.issues}
                  onChange={handleChange}
                  placeholder="Describe any problems you faced..."
                  className="border-0 shadow-sm rounded-3"
                />
              </Form.Group>
            </Card.Body>
          </Card>

          <div className="text-start mt-4">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={submitting}
              className="rounded-pill px-5 shadow-sm submit-button"
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Submitting...
                </>
              ) : (
                'Share Your Feedback'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  </Container>
  );
};

export default ReviewForm;