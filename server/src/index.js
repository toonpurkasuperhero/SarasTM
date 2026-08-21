require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { verifyToken } = require('./middleware/auth');
const listingRouter = require('./routes/listing');
const imagesRouter = require('./routes/images');
const passportRouter = require('./routes/passport');
const complianceRouter = require('./routes/compliance');
const paymentsRouter = require('./routes/payments');
const buyerRouter = require('./routes/buyer');
const reviewsRouter = require('./routes/reviews');
const { initializeRAG } = require('./services/rag');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use(verifyToken);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'SarasTM API' });
});

app.use('/api/listing', listingRouter);
app.use('/api/images', imagesRouter);
app.use('/api/passport', passportRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/buyer', buyerRouter);
app.use('/api/reviews', reviewsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, async () => {
  console.log(`SarasTM API running on port ${PORT}`);
  initializeRAG().catch(console.error);
});

module.exports = app;
