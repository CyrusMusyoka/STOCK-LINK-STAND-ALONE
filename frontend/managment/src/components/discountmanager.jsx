// function DiscountManager({ products }) {
//     const [selectedProducts, setSelectedProducts] = useState([]);
//     const [discountPercentage, setDiscountPercentage] = useState(10);
//     const [emailTemplate, setEmailTemplate] = useState({
//       subject: "Exciting New Discounts!",
//       body: "We're offering special discounts just for you!"
//     });
  
//     const handleSubmit = async () => {
//       try {
//         const response = await axios.post('/api/discounts/notify', {
//           discounts: selectedProducts.map(p => ({
//             ...p,
//             discountedPrice: p.price * (1 - discountPercentage/100)
//           })),
//           emailTemplate
//         });
  
//         alert(`Successfully notified ${response.data.sentCount} customers!`);
//         setSelectedProducts([]);
//       } catch (error) {
//         alert('Failed to send notifications: ' + error.message);
//       }
//     };
  
//     return (
//       <div className="discount-manager">
//         <div className="product-grid">
//           {products.map(product => (
//             <div 
//               key={product.id}
//               className={`product-card ${selectedProducts.some(p => p.id === product.id) ? 'selected' : ''}`}
//               onClick={() => setSelectedProducts(prev => 
//                 prev.some(p => p.id === product.id) 
//                   ? prev.filter(p => p.id !== product.id)
//                   : [...prev, product]
//               }
//             >
//               <img 
//                 src={`http://localhost:5000/uploads/${product.image}`} 
//                 alt={product.name}
//                 className="product-image"
//               />
//               <div className="product-info">
//                 <h4>{product.name}</h4>
//                 <div className="price-section">
//                   <span className="original-price">
//                     Ksh {product.price.toFixed(2)}
//                   </span>
//                   <span className="discounted-price">
//                     Ksh {(product.price * (1 - discountPercentage/100)).toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="discount-badge">
//                   {discountPercentage}% OFF
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
  
//         <div className="discount-controls">
//           <Form.Group>
//             <Form.Label>Discount Percentage</Form.Label>
//             <Form.Control
//               type="number"
//               value={discountPercentage}
//               onChange={(e) => setDiscountPercentage(Math.min(100, Math.max(0, e.target.value)))}
//               min="0"
//               max="100"
//             />
//           </Form.Group>
  
//           <Form.Group>
//             <Form.Label>Email Subject</Form.Label>
//             <Form.Control
//               type="text"
//               value={emailTemplate.subject}
//               onChange={(e) => setEmailTemplate({...emailTemplate, subject: e.target.value})}
//             />
//           </Form.Group>
  
//           <Form.Group>
//             <Form.Label>Email Body</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={4}
//               value={emailTemplate.body}
//               onChange={(e) => setEmailTemplate({...emailTemplate, body: e.target.value})}
//             />
//           </Form.Group>
  
//           <Button 
//             variant="primary" 
//             onClick={handleSubmit}
//             disabled={selectedProducts.length === 0}
//           >
//             Send to {selectedProducts.length} Selected Products
//           </Button>
//         </div>
//       </div>
//     );
//   }