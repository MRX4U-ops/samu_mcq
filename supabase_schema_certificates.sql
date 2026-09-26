-- SUPABASE DATABASE MIGRATION: CERTIFICATES TABLE
-- Execute this script in the Supabase SQL Editor to create the certificates table.

-- Create table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id TEXT UNIQUE NOT NULL, -- Format: SAMU-2026-XXXXXX
    student_name TEXT NOT NULL,
    score DECIMAL(5, 2) NOT NULL,
    subject_name TEXT NOT NULL,
    completion_date TEXT NOT NULL,
    achievement_level TEXT NOT NULL, -- 'Platinum Scholar', 'Gold Excellence', 'Academic Distinction'
    qr_code_url TEXT,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- 1. Allow public read access to verify certificates
CREATE POLICY "Allow public read certificates" ON public.certificates
    FOR SELECT USING (true);

-- 2. Allow admins/service role to manage all certificates
CREATE POLICY "Allow admin manage certificates" ON public.certificates
    FOR ALL USING (public.is_admin());

-- Create index for faster verification searches
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON public.certificates(certificate_id);
