const { supabaseAdmin } = require('../config/supabase');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Not authorized, invalid token' });
    }

    // Get profile and subscription status
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*, subscriptions(status, end_date)')
      .eq('id', user.id)
      .single();

    req.user = {
        ...user,
        role: profile?.role || 'user',
        status: profile?.status || 'active',
        subscription: profile?.subscriptions?.[0] || null
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as an admin' });
  }
};

module.exports = { protect, adminOnly };
