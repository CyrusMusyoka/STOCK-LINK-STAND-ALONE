// Update the /discounts/notify endpoint
router.post('/discounts/notify', async (req, res) => {
    try {
      const { discounts, emailTemplate } = req.body;
      
      // Get active customers with purchase history
      const customers = db.prepare(`
        SELECT DISTINCT customer_email 
        FROM sales 
        WHERE customer_email IS NOT NULL
        AND customer_email != ''
      `).all();
  
      // Get product details with images
      const productsWithDetails = db.prepare(`
        SELECT 
          p.id,
          p.name,
          p.price,
          p.image,
          d.discount_percent,
          (p.price * (1 - d.discount_percent/100)) AS discounted_price
        FROM products p
        JOIN discounts d ON p.id = d.product_id
        WHERE date('now') BETWEEN d.start_date AND d.end_date
      `).all();
  
      const emailResults = await Promise.allSettled(
        customers.map(async (customer) => {
          const mailOptions = {
            from: `"Store Discounts" <${process.env.EMAIL_USER}>`,
            to: customer.customer_email,
            subject: emailTemplate.subject,
            html: `
              <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <h2 style="color: #2563eb;">${emailTemplate.subject}</h2>
                <p>${emailTemplate.body}</p>
                
                <div style="margin-top: 30px;">
                  ${productsWithDetails.map(product => `
                    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                      <img src="http://localhost:5000/uploads/${product.image}" 
                           alt="${product.name}"
                           style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px;">
                      <div style="margin-top: 15px;">
                        <h3 style="margin: 0;">${product.name}</h3>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                          <span style="text-decoration: line-through; color: #6b7280;">
                            Ksh ${product.price.toFixed(2)}
                          </span>
                          <span style="font-size: 1.2em; color: #16a34a;">
                            Ksh ${product.discounted_price.toFixed(2)}
                          </span>
                          <span style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px;">
                            ${product.discount_percent}% OFF
                          </span>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `
          };
  
          await transporter.sendMail(mailOptions);
          return customer.customer_email;
        })
      );
  
      const successfulEmails = emailResults.filter(r => r.status === 'fulfilled');
      const failedEmails = emailResults.filter(r => r.status === 'rejected');
  
      res.json({
        success: true,
        sentCount: successfulEmails.length,
        failedCount: failedEmails.length,
        failedEmails: failedEmails.map(f => f.reason)
      });
  
    } catch (error) {
      console.error('Discount notification error:', error);
      res.status(500).json({
        error: 'Failed to send discount notifications',
        details: error.message
      });
    }
  });