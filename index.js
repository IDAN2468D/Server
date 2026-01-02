require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const os = require('os');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

/**
 * 1. תיקון שגיאת ה-Validation (Proxy)
 * חובה ב-Render כדי שה-Rate Limiter יזהה כתובות IP נכון
 */
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

// Logging Middleware
app.use(morgan('dev'));

/**
 * 2. Rate Limiting
 * מגן על ה-API מפני הצפות
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דקות
  max: 100, // מקסימום 100 בקשות לכל IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Middleware בסיסי
app.use(cors());
app.use(express.json());

/**
 * 3. התחברות ל-MongoDB
 * ודא שב-Render הגדרת משתנה סביבה בשם DB_URL עם הקישור מ-Atlas
 */
const mongoURI = process.env.DB_URL;

if (!mongoURI) {
  console.error('❌ ERROR: DB_URL is not defined in environment variables!');
} else {
  mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((error) => {
      console.error('❌ MongoDB connection error details:');
      console.error(error.message);
    });
}

// נתיב בריאות (Health Check)
app.get('/health', (req, res) => {
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

// טיפול בשגיאות גלובלי
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

// הגדרת פורט
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('---------------------------------------------------------');
  console.log(`🚀 Server is running on port ${PORT}`);

  // הדפסת IP מקומי (לצרכי פיתוח בלבד)
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`🌐 Network: http://${iface.address}:${PORT}`);
      }
    }
  }
  console.log('---------------------------------------------------------');
});