const { supabaseAdmin } = require('../config/supabase');
const paymentStore = require('../services/paymentStore');

const SUPER_ADMIN_EMAIL = 'mohd6396889713@gmail.com';

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token provided' });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Not authorized, invalid or expired token' });
    }

    const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*, subscriptions(id, status, start_date, end_date)')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.status === 'blocked' && !isSuperAdmin) {
      return res.status(403).json({ error: 'Your account has been suspended or blocked. Please contact support.' });
    }

    const subsList = Array.isArray(profile?.subscriptions)
      ? profile.subscriptions
      : (profile?.subscriptions ? [profile.subscriptions] : []);
    const sub = subsList[0] || null;

    const role = isSuperAdmin ? 'super_admin' : (profile?.role || 'user');
    const isAdminUser = isSuperAdmin || role === 'admin' || role === 'super_admin';

    let permissions = {};
    if (isSuperAdmin) {
      paymentStore.ALL_PERMISSIONS.forEach((p) => { permissions[p] = true; });
    } else if (isAdminUser) {
      permissions = await paymentStore.getSubAdminPermissions(user.id);
    }

    req.user = {
      ...user,
      role,
      isSuperAdmin,
      isAdmin: isAdminUser,
      permissions,
      status: profile?.status || 'active',
      profile,
      subscription: sub,
    };

    next();
  } catch (error) {
    console.error('[protect middleware] error:', error.message);
    res.status(401).json({ error: 'Not authorized' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.isSuperAdmin || req.user.role === 'admin' || req.user.role === 'super_admin')) {
    return next();
  }
  return res.status(403).json({ error: 'Not authorized as an admin' });
};

const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.isSuperAdmin) {
    return next();
  }
  return res.status(403).json({ error: 'Only Super Admin can perform this action' });
};

const requirePermission = (perm) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authorized' });
  if (req.user.isSuperAdmin) return next();
  if ((req.user.role === 'admin' || req.user.role === 'super_admin') && req.user.permissions?.[perm]) {
    return next();
  }
  return res.status(403).json({ error: `Permission denied: requires '${perm}'` });
};

/**
 * Enforces all 6 backend subscription verification checks:
 * 1. User authenticated
 * 2. User account not blocked
 * 3. Subscription exists (or admin override)
 * 4. Subscription status is ACTIVE (and not suspended/cancelled/revoked)
 * 5. Current server time < expiry date
 * 6. Auto-expires stale subscriptions cleanly without deleting history
 */
const requireActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.status === 'blocked' && !req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Account is blocked', code: 'ACCOUNT_BLOCKED' });
    }
    if (req.user.isSuperAdmin || req.user.isAdmin) {
      return next();
    }

    const subState = await paymentStore.computeUserSubscriptionState(req.user.id);
    if (!subState.isActive) {
      return res.status(403).json({
        error: 'Active subscription required to access premium content.',
        code: 'SUBSCRIPTION_REQUIRED',
        subscriptionStatus: subState.status,
      });
    }

    req.subscriptionState = subState;
    next();
  } catch (err) {
    console.error('[requireActiveSubscription] error:', err.message);
    res.status(500).json({ error: 'Failed to verify subscription status' });
  }
};

module.exports = {
  SUPER_ADMIN_EMAIL,
  protect,
  adminOnly,
  superAdminOnly,
  requirePermission,
  requireActiveSubscription,
};
