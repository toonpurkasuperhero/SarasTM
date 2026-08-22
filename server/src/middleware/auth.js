const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  // Handle Mock Token Interception
  if (token === 'mock-artisan-token') {
    req.user = {
      id: '34a1841b-9fd6-4409-96e3-fb61c5915071',
      email: 'priyadevi@sarastm.in',
      role: 'artisan',
    };
    return next();
  }

  if (token === 'mock-buyer-token') {
    req.user = {
      id: 'buyer-mock-id-456',
      email: 'buyer@sarastm.in',
      role: 'buyer',
    };
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      req.user = null;
      return next();
    }
    req.user = user;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  next();
}

module.exports = { verifyToken, requireAuth };
