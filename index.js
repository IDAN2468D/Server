require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const os = require('os'); // ספרייה מובנית למציאת כתובת ה-IP של המכונה

const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middleware
app.use(helmet());

// Logging Middleware
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// התחברות ל-MongoDB
mongoose.connect(process.env.DB_URL)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// Middleware
app.use(cors());
app.use(express.json());

// נתיב בריאות (Health Check)
app.use('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// API routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const itemsRouter = require('./routes/items');
app.use('/api/items', itemsRouter);

const aiRouter = require('./routes/ai');
app.use('/api/ai', aiRouter);

// טיפול בנתיבים לא קיימים (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route Not Found' });
});

// טיפול בשגיאות גלובלי (Error Handler)
app.use((err, req, res, next) => {
  // Log the error
  console.error(`[Error] ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// הגדרת פורט וכתובת מארח
const PORT = process.env.PORT || 3000;
// שימוש ב-'0.0.0.0' מאפשר גישה מכל מכשיר ברשת (באמצעות ה-IP של המחשב)
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('---------------------------------------------------------');
  console.log(`🚀 Server is running!`);
  console.log(`🏠 Local:            http://localhost:${PORT}`);

  // מציאת כתובת ה-IP המקומית להצגה בטרמינל
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`🌐 Network (Your IP): http://${iface.address}:${PORT}`);
      }
    }
  }
  console.log('---------------------------------------------------------');
});