-- ============================================================================
-- SSMU MCQs — Payment, Subscription Plans & Audit Trail SQL Upgrade
-- Run this in Supabase SQL Editor if you also want native Postgres tables
-- for plans, orders, transactions, and audit logs.
-- (Note: The backend also maintains automatic private Storage fallback so
--  all features work immediately in production.)
-- ============================================================================

-- 0. Remove legacy fixed-90-day trigger so backend controls dynamic plan durations & renewals
DROP TRIGGER IF EXISTS on_payment_approved ON public.payment_requests;

-- 1. Extend profiles with student academic metadata & sub-admin permissions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hemis_id TEXT,
  ADD COLUMN IF NOT EXISTS course_year TEXT,
  ADD COLUMN IF NOT EXISTS semester TEXT,
  ADD COLUMN IF NOT EXISTS admin_permissions JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS is_suspicious_flagged BOOLEAN DEFAULT FALSE;

-- 2. Extend payment_requests with rejection_reason & metadata
ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS order_id TEXT,
  ADD COLUMN IF NOT EXISTS plan_id TEXT,
  ADD COLUMN IF NOT EXISTS validity_days INTEGER DEFAULT 90,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'PENDING';

-- 3. Dynamic Subscription Plans Table (Admin decides price & days)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  days INTEGER NOT NULL CHECK (days > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default ₹49 / 90-day plan if empty
INSERT INTO public.subscription_plans (name, description, days, price, is_popular, is_active, sort_order)
SELECT 'Standard 90-Day Pass', 'Full access to all 6 medical courses, 8,000+ MCQs, AI Tutor & Battle Mode', 90, 49.00, TRUE, TRUE, 1
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans);

-- 4. App Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Payment Orders Table
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  plan_id TEXT,
  plan_name TEXT,
  validity_days INTEGER NOT NULL DEFAULT 90,
  payment_method TEXT NOT NULL DEFAULT 'DIRECT_UPI',
  upi_id TEXT NOT NULL DEFAULT 'mrx4u@ybl',
  payment_reference TEXT UNIQUE NOT NULL,
  promo_code_id UUID REFERENCES public.promo_codes(id),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);

-- 6. Payment Transactions Table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_order_id UUID REFERENCES public.payment_orders(id) ON DELETE CASCADE,
  payment_request_id UUID REFERENCES public.payment_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE NOT NULL,
  payer_name TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  transaction_date TIMESTAMPTZ,
  screenshot_path TEXT,
  verification_method TEXT DEFAULT 'MANUAL_ADMIN',
  verification_status TEXT DEFAULT 'PENDING_VERIFICATION' CHECK (verification_status IN ('PENDING', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  provider_reference TEXT,
  is_suspicious BOOLEAN DEFAULT FALSE,
  suspicious_reasons JSONB DEFAULT '[]'::jsonb,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_txns_user ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_txns_status ON public.payment_transactions(verification_status);

-- 7. Payment Audit Logs (Immutable)
CREATE TABLE IF NOT EXISTS public.payment_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT NOT NULL,
  admin_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  reason TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Subscription Audit Logs (Immutable)
CREATE TABLE IF NOT EXISTS public.subscription_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  admin_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  previous_values JSONB,
  new_values JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RLS Policies
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view active plans" ON public.subscription_plans;
CREATE POLICY "Public view active plans" ON public.subscription_plans FOR SELECT USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage plans" ON public.subscription_plans;
CREATE POLICY "Admins manage plans" ON public.subscription_plans FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users view own orders" ON public.payment_orders;
CREATE POLICY "Users view own orders" ON public.payment_orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own txns" ON public.payment_transactions;
CREATE POLICY "Users view own txns" ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage orders" ON public.payment_orders;
CREATE POLICY "Admins manage orders" ON public.payment_orders FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage txns" ON public.payment_transactions;
CREATE POLICY "Admins manage txns" ON public.payment_transactions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins view payment audit logs" ON public.payment_audit_logs;
CREATE POLICY "Admins view payment audit logs" ON public.payment_audit_logs FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins view sub audit logs" ON public.subscription_audit_logs;
CREATE POLICY "Admins view sub audit logs" ON public.subscription_audit_logs FOR SELECT USING (public.is_admin());
