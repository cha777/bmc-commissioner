-- Create Metals Table
CREATE TABLE IF NOT EXISTS public.metals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    weight NUMERIC NOT NULL,
    is_permanent BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Commission Rates Table
CREATE TABLE IF NOT EXISTS public.rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_units NUMERIC NOT NULL,
    max_units NUMERIC NOT NULL,
    rate NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Daily Records Table
-- Using JSONB to store the complex array structures generated locally
CREATE TABLE IF NOT EXISTS public.daily_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL,
    total_units NUMERIC NOT NULL,
    snapshot_avg_price NUMERIC NOT NULL,
    snapshot_rates_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    production_details JSONB NOT NULL DEFAULT '[]'::jsonb,
    employees JSONB NOT NULL DEFAULT '[]'::jsonb,
    note TEXT,
    disable_negative_commissions BOOLEAN DEFAULT false,
    idle_employee_count NUMERIC DEFAULT 0,
    additional_bonus_per_weight NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) but allow authenticated users full access
-- This ensures unauthenticated requests are rejected by Supabase API
ALTER TABLE public.metals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;

-- Create Policies for Authenticated Users
CREATE POLICY "Allow authenticated full access on metals" ON public.metals FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access on employees" ON public.employees FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access on rates" ON public.rates FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access on daily_records" ON public.daily_records FOR ALL TO authenticated USING (true);