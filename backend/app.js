const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const testRoutes = require('./routes/tests');
const organizationRoutes = require('./routes/organizations');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/vyvern', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/organizations', organizationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 