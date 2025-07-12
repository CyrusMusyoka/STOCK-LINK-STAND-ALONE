import React, { useState } from 'react';
import {
    Offcanvas, Button, Form, Stack, Badge, ListGroup,
    Modal, Spinner, InputGroup, ButtonGroup, Alert
} from "react-bootstrap";
import {
    Mail, Printer, Plus, Minus, Trash2, ShoppingCart, CheckCircle, XCircle, Phone
} from 'lucide-react';
import { useCart } from '../context/cartContext'; // Corrected path to cartContext

const styles = `
    /* Cart Trigger Button */
    .cart-trigger {
        font-size: 1rem;
        padding: 0.6rem 1.2rem;
        border-radius: 25px;
        transition: all 0.3s ease;
        border-color: #4B0082; /* Primary color */
        color: #4B0082; /* Primary color */
    }

    .cart-trigger:hover {
        background-color: #4B0082; /* Primary color */
        color: white;
    }

    .cart-trigger .badge {
        font-size: 0.75rem;
        padding: 0.4em 0.6em;
    }

    /* Pulse animation for badge */
    .pulse {
        animation: pulse-animation 1s infinite;
    }

    @keyframes pulse-animation {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }

    /* Offcanvas (Cart Drawer) Styling */
    .cart-drawer {
        width: 100%; /* Default for small screens */
        max-width: 450px; /* Max width for larger screens */
        background-color: #f8f9fa; /* Light background */
    }

    .cart-drawer .offcanvas-header {
        background-color: #FFFFFF;
        border-bottom: 1px solid #dee2e6;
    }

    .cart-drawer .offcanvas-title {
        color: #212529; /* Dark text */
    }

    .cart-drawer .list-group-item {
        border-color: #e9ecef;
        background-color: #FFFFFF;
        transition: background-color 0.2s ease;
    }

    .cart-drawer .list-group-item:hover {
        background-color: #f1f3f5;
    }

    .cart-drawer .quantity-btn {
        min-width: 32px;
    }

    .cart-drawer .form-control[type="number"] {
        -moz-appearance: textfield; /* Firefox */
    }
    .cart-drawer .form-control[type="number"]::-webkit-outer-spin-button,
    .cart-drawer .form-control[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .cart-drawer .checkout-summary {
        background-color: #FFFFFF;
        padding: 15px;
        border-top: 1px solid #dee2e6;
    }

    /* Checkout Modal Styling */
    .checkout-modal .modal-content {
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .checkout-modal .modal-header {
        background-color: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
        padding: 1.5rem;
    }

    .checkout-modal .modal-title {
        color: #212529;
    }

    .checkout-modal .modal-body {
        padding: 2rem;
        background-color: #FFFFFF; /* Ensure white background for the form */
    }

    .checkout-modal .form-label {
        font-weight: 600;
        color: #495057; /* Slightly darker text for labels */
    }

    .checkout-modal .form-select,
    .checkout-modal .form-control,
    .checkout-modal .input-group-text {
        border-radius: 0.5rem !important; /* Softer edges */
        border: 1px solid #ced4da;
        background-color: #f1f3f5; /* Light background for inputs */
    }

    .checkout-modal .input-group-text {
        background-color: #e9ecef;
    }

    .checkout-modal .receipt-method-buttons .btn {
        border-radius: 0.5rem !important;
        font-weight: 500;
        transition: all 0.2s ease;
    }

    .checkout-modal .receipt-method-buttons .btn-primary {
        background-color: #4B0082; /* Primary color */
        border-color: #4B0082; /* Primary color */
    }

    .checkout-modal .receipt-method-buttons .btn-outline-secondary {
        color: #495057;
        border-color: #ced4da;
    }

    .checkout-modal .receipt-method-buttons .btn-outline-secondary:hover {
        background-color: #e9ecef;
    }

    .checkout-modal .modal-footer {
        background-color: #f8f9fa;
        border-top: 1px solid #e9ecef;
        padding: 1.5rem;
    }

    .mpesa-status-alert {
        font-size: 0.9rem;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
    }
`;

const CartSidebar = () => {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        calculateTotal,
        clearCart
    } = useCart();

    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentData, setPaymentData] = useState({
        method: 'cash',
        receiptMethod: 'email',
        email: '',
        amountTendered: '',
        mpesaPhoneNumber: ''
    });
    const [processing, setProcessing] = useState(false);
    const [mpesaPaymentStatus, setMpesaPaymentStatus] = useState('idle'); // idle, awaiting_confirmation, confirmed, failed

    const calculateChange = () => {
        const total = calculateTotal();
        const tendered = parseFloat(paymentData.amountTendered) || 0;
        return tendered >= total ? tendered - total : 0;
    };

const initiateMpesaPaymentSimulation = async () => {
  if (!paymentData.mpesaPhoneNumber || !/^\d{10}$/.test(paymentData.mpesaPhoneNumber)) {
    alert('Please enter a valid 10-digit M-Pesa phone number (e.g., 07XXXXXXXX).');
    return;
  }

  setMpesaPaymentStatus('awaiting_confirmation');
  setProcessing(true);

  try {
    const phone = paymentData.mpesaPhoneNumber.replace(/^0/, "254");
    const amount = calculateTotal(); // ✅ Now using actual cart total

    console.log("📤 Sending STK Push request to backend with:", { phone, amount });

    const response = await fetch("http://localhost:5000/api/mpesa/stk-push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, amount }),
    });

    const data = await response.json();
    console.log("📥 Backend responded:", data);

    if (data.ResponseCode === "0") {
      alert(`✅ ${data.CustomerMessage || "STK Push sent successfully!"}`);
      setMpesaPaymentStatus('confirmed');
    } else {
      alert(`❌ Payment failed: ${data.errorMessage || 'Unknown error'}`);
      setMpesaPaymentStatus('failed');
    }

  } catch (err) {
    console.error("❌ Error during STK push:", err);
    alert("Payment request failed. Check if backend is running.");
    setMpesaPaymentStatus('failed');
  } finally {
    setProcessing(false);
  }
};

    const handleProcessOrder = async () => {
        const total = calculateTotal();

        if (paymentData.method === 'cash') {
            if (calculateChange() < 0) {
                alert('Amount tendered must cover total amount due.');
                return;
            }
        } else if (paymentData.method === 'mpesa') {
            if (mpesaPaymentStatus !== 'confirmed') {
                alert('M-Pesa payment not confirmed. Please initiate and wait for confirmation, or choose another method.');
                return;
            }
        }

        setProcessing(true);
        try {
            //  send   to  backend 
            console.log("Order processed:", {
                items: cartItems,
                paymentData,
                total
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            alert('Order processed successfully!');
            clearCart();
            setShowCart(false);
            setShowCheckout(false);
            setPaymentData({
                method: 'cash',
                receiptMethod: 'email',
                email: '',
                amountTendered: '',
                mpesaPhoneNumber: ''
            });
            setMpesaPaymentStatus('idle');
        } catch (error) {
            alert('Error processing order. Please try again.');
            console.error("Order processing error:", error);
        } finally {
            setProcessing(false);
        }
    };


    return (
        <>
            <style>{styles}</style>

            <Button
                variant="outline-dark"
                onClick={() => setShowCart(true)}
                className="position-relative cart-trigger"
            >
                <ShoppingCart size={20} className="me-2" />
                Cart
                {cartItems.length > 0 && (
                    <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle pulse">
                        {cartItems.length}
                    </Badge>
                )}
            </Button>

            <Offcanvas
                show={showCart}
                onHide={() => setShowCart(false)}
                placement="end"
                className="cart-drawer shadow-lg"
            >
                <Offcanvas.Header closeButton className="border-bottom pb-2">
                    <Offcanvas.Title className="d-flex align-items-center gap-2">
                        <ShoppingCart size={24} className="text-primary" />
                        <span className="fs-5 fw-semibold text-dark">Shopping Cart</span>
                    </Offcanvas.Title>
                </Offcanvas.Header>

                <Offcanvas.Body className="d-flex flex-column p-3">
                    {cartItems.length === 0 ? (
                        <div className="text-center my-auto py-5">
                            <XCircle size={60} className="text-muted opacity-50" />
                            <p className="text-muted mt-3">Your cart is empty</p>
                        </div>
                    ) : (
                        <>
                            <ListGroup variant="flush" className="flex-grow-1 rounded-3 overflow-hidden">
                                {cartItems.map(item => (
                                    <ListGroup.Item
                                        key={item.id}
                                        className="py-3 border-bottom bg-white hover-item"
                                    >
                                        <Stack direction="horizontal" gap={3}>
                                            <div className="me-auto">
                                                <h6 className="mb-1 fw-semibold text-dark">{item.name}</h6>
                                                <div className="d-flex align-items-center gap-2">
                                                    <ButtonGroup size="sm" className="shadow-sm">
                                                        <Button
                                                            variant="outline-secondary"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="quantity-btn"
                                                        >
                                                            <Minus size={16} />
                                                        </Button>
                                                        <Form.Control
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 0))
                                                            }
                                                            className="text-center border-0 bg-light"
                                                            style={{ width: '60px' }}
                                                        />
                                                        <Button
                                                            variant="outline-secondary"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="quantity-btn"
                                                        >
                                                            <Plus size={16} />
                                                        </Button>
                                                    </ButtonGroup>
                                                    <span className="text-muted fs-7">
                                                        @ KSH: {item.price ? item.price.toFixed(2) : '0.00'}
                                                    </span>
                                                </div>
                                            </div>
                                            <Stack className="align-items-end">
                                                <Button
                                                    variant="link"
                                                    className="text-danger p-0 opacity-75 hover-opacity"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                                <span className="text-dark fw-semibold fs-5">
                                                    Khs {((item.price || 0) * item.quantity).toFixed(2)}
                                                </span>
                                            </Stack>
                                        </Stack>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>

                            <div className="mt-auto border-top pt-3 checkout-summary">
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted">Subtotal:</span>
                                    <span className="fw-semibold text-dark fs-5">
                                        Kshs {calculateTotal().toFixed(2)}
                                    </span>
                                </div>
                                <Button
                                    variant="primary"
                                    className="w-100 py-2 rounded-pill shadow-sm"
                                    onClick={() => setShowCheckout(true)}
                                >
                                    Proceed to Checkout
                                </Button>
                            </div>
                        </>
                    )}
                </Offcanvas.Body>
            </Offcanvas>

            <Modal show={showCheckout} onHide={() => { setShowCheckout(false); setMpesaPaymentStatus('idle'); }} centered className="checkout-modal">
                <Modal.Header closeButton>
                    <Modal.Title className="fw-semibold text-dark">Checkout</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-light">
                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-muted mb-2">Payment Method</Form.Label>
                            <Form.Select
                                value={paymentData.method}
                                onChange={(e) => {
                                    setPaymentData(p => ({ ...p, method: e.target.value }));
                                    setMpesaPaymentStatus('idle');
                                }}
                                className="rounded-pill border-0 shadow-sm"
                            >
                                <option value="cash">Cash</option>
                                <option value="mpesa">M-Pesa</option>
                            </Form.Select>
                        </Form.Group>

                        {paymentData.method === 'cash' && (
                            <Form.Group className="mb-4">
                                <Form.Label className="text-muted mb-2">Amount Tendered</Form.Label>
                                <InputGroup className="shadow-sm">
                                    <InputGroup.Text className="bg-white border-0">Ksh :  </InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        value={paymentData.amountTendered}
                                        onChange={(e) => setPaymentData(p => ({ ...p, amountTendered: e.target.value }))}
                                        min={calculateTotal()}
                                        step="0.01"
                                        className="rounded-pill border-0 bg-light"
                                    />
                                </InputGroup>
                                {paymentData.amountTendered && (
                                    <div className="mt-2 text-end">
                                        <span className="text-muted me-2">Change Due:</span>
                                        <span className="fw-semibold text-success">
                                            Ksh : {calculateChange().toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </Form.Group>
                        )}

                        {paymentData.method === 'mpesa' && (
                            <>
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-muted mb-2">M-Pesa Phone Number</Form.Label>
                                    <InputGroup className="shadow-sm">
                                        <InputGroup.Text className="bg-white border-0"><Phone size={20} /></InputGroup.Text>
                                        <Form.Control
                                            type="tel"
                                            value={paymentData.mpesaPhoneNumber}
                                            onChange={(e) => setPaymentData(p => ({ ...p, mpesaPhoneNumber: e.target.value }))}
                                            placeholder="e.g., 0712345678"
                                            className="rounded-pill border-0 bg-light"
                                            pattern="[0-9]{10}"
                                            maxLength="10"
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <div className="d-grid gap-2 mb-4">
                                    <Button
                                        variant="success"
                                        onClick={initiateMpesaPaymentSimulation}
                                        disabled={mpesaPaymentStatus === 'awaiting_confirmation' || processing || !paymentData.mpesaPhoneNumber}
                                        className="rounded-pill shadow-sm"
                                        style={{ backgroundColor: '#33AF33', borderColor: '#33AF33' }}
                                    >
                                        {mpesaPaymentStatus === 'awaiting_confirmation' ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Awaiting M-Pesa Confirmation...
                                            </>
                                        ) : mpesaPaymentStatus === 'confirmed' ? (
                                            <>
                                                <CheckCircle size={20} className="me-2" />
                                                Payment Confirmed!
                                            </>
                                        ) : (
                                            <>
                                                <Phone size={20} className="me-2" />
                                                Initiate M-Pesa Payment
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {mpesaPaymentStatus === 'failed' && (
                                    <Alert variant="danger" className="mpesa-status-alert text-center">
                                        <XCircle size={20} className="me-2" />
                                        M-Pesa Payment Failed. Please try again or choose another method.
                                    </Alert>
                                )}
                                {mpesaPaymentStatus === 'confirmed' && (
                                    <Alert variant="success" className="mpesa-status-alert text-center">
                                        <CheckCircle size={20} className="me-2" />
                                        M-Pesa payment received! Ready to confirm order.
                                    </Alert>
                                )}
                            </>
                        )}

                        <Form.Group className="mb-4">
                            <Form.Label className="text-muted mb-2">Receipt Delivery</Form.Label>
                            <div className="d-flex gap-2 receipt-method-buttons">
                                <Button
                                    variant={paymentData.receiptMethod === 'email' ? 'primary' : 'outline-secondary'}
                                    onClick={() => setPaymentData(p => ({ ...p, receiptMethod: 'email' }))}
                                    className="flex-grow-1 d-flex align-items-center justify-content-center gap-2 rounded-pill"
                                >
                                    <Mail size={20} />
                                    Email
                                </Button>
                                <Button
                                    variant={paymentData.receiptMethod === 'print' ? 'primary' : 'outline-secondary'}
                                    onClick={() => setPaymentData(p => ({ ...p, receiptMethod: 'print' }))}
                                    className="flex-grow-1 d-flex align-items-center justify-content-center gap-2 rounded-pill"
                                >
                                    <Printer size={20} />
                                    Print
                                </Button>
                            </div>
                        </Form.Group>

                        {paymentData.receiptMethod === 'email' && (
                            <Form.Group className="mb-4">
                                <Form.Label className="text-muted mb-2">Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={paymentData.email}
                                    onChange={(e) => setPaymentData(p => ({ ...p, email: e.target.value }))}
                                    placeholder="Enter receipt email"
                                    className="rounded-pill border-0 shadow-sm bg-light"
                                />
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-top pt-3 bg-light">
                    <Button
                        variant="outline-secondary"
                        onClick={() => { setShowCheckout(false); setMpesaPaymentStatus('idle'); }}
                        className="rounded-pill"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleProcessOrder}
                        disabled={
                            processing ||
                            (paymentData.method === 'cash' && (calculateChange() < 0 || !paymentData.amountTendered)) ||
                            (paymentData.method === 'mpesa' && mpesaPaymentStatus !== 'confirmed') ||
                            (paymentData.receiptMethod === 'email' && !paymentData.email) ||
                            cartItems.length === 0 // Disable if cart is empty
                        }
                        className="rounded-pill shadow-sm"
                    >
                        {processing ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Processing...
                            </>
                        ) : 'Confirm Order'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CartSidebar;