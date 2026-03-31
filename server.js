const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Order endpoint
app.post('/api/order', async (req, res) => {
  const order = req.body;

  const msg = {
    to: process.env.ADMIN_EMAIL || 'myshoppyyacc@gmail.com',
    from: process.env.ADMIN_EMAIL || 'myshoppyyacc@gmail.com',
    subject: `🛒 New Order Received - ${order.order_id}`,
    html: `
      <h2>New Order Details</h2>
      <p><strong>Order ID:</strong> ${order.order_id}</p>
      <p><strong>Customer Name:</strong> ${order.customer_name}</p>
      <p><strong>Email:</strong> ${order.customer_email}</p>
      <p><strong>Phone:</strong> ${order.customer_phone}</p>
      <p><strong>Address:</strong> ${order.address}</p>
      <p><strong>Payment Method:</strong> ${order.payment_method}</p>
      <h3>Items:</h3>
      <ul>
        ${order.items.map(item => `<li>${item.name} x ${item.quantity} = ₹${item.price * item.quantity}</li>`).join('')}
      </ul>
      <p><strong>Total:</strong> ₹${order.total}</p>
    `
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true, message: 'Order placed and notification sent.' });
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error);
    res.status(200).json({ success: true, message: 'Order placed, but email notification failed. We will contact you manually.' });
  }
});

// Contact endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  const msg = {
    to: process.env.ADMIN_EMAIL || 'myshoppyyacc@gmail.com',
    from: process.env.ADMIN_EMAIL || 'myshoppyyacc@gmail.com',
    subject: `New Contact Message from ${name}`,
    html: `
      <h2>Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error);
    res.status(200).json({ success: true, message: 'Message received, but email notification failed.' });
  }
});

// ========== ADD THIS LINE TO SERVE STATIC FILES ==========
app.use(express.static(__dirname));

// Serve index.html (optional – static middleware will also serve it)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
