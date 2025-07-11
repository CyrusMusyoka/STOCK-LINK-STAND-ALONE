import React, { useState } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import axios from 'axios';

function Cart() {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');

  // 
  const handleCheckout = async () => {
    try {
      const res = await axios.post('/api/sales', { items: cart });
      setMessage('Sale successful! Receipt sent via email.');
      setCart([]);
    } catch (error) {
      setMessage('Error processing sale.');
    }
  };

  return (
    <div className="mt-4">
      <h3>Shopping Cart</h3>
      <ListGroup>
        {cart.map((item, idx) => (
          <ListGroup.Item key={idx}>
            {item.name} x {item.qty} - KSH {item.price * item.qty}
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Button className="mt-3" onClick={handleCheckout}>
        Checkout
      </Button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Cart;
