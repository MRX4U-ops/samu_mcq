-- SUPABASE SCHEMA FOR SAMU MCQs

-- 1. PROFILES TABLE
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SUBSCRIPTIONS TABLE
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. PAYMENT REQUESTS TABLE
CREATE TABLE public.payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE NOT NULL,
    payment_reference TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    amount DECIMAL(10, 2) NOT NULL DEFAULT 199.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FUNCTION: Check if user has an active subscription
CREATE OR REPLACE FUNCTION public.check_active_subscription(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id = target_user_id
        AND status = 'active'
        AND end_date > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER: Automatically activate subscription on payment approval
CREATE OR REPLACE FUNCTION public.handle_payment_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        INSERT INTO public.subscriptions (user_id, start_date, end_date, status)
        VALUES (NEW.user_id, NOW(), NOW() + INTERVAL '90 days', 'active')
        ON CONFLICT (user_id) DO UPDATE 
        SET 
            start_date = EXCLUDED.start_date,
            end_date = EXCLUDED.end_date,
            status = EXCLUDED.status;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_approved
    AFTER UPDATE ON public.payment_requests
    FOR EACH ROW
    WHEN (NEW.status = 'approved' AND OLD.status = 'pending')
    EXECUTE FUNCTION public.handle_payment_approval();

-- 4. DEVICES TABLE (Anti-Abuse)
CREATE TABLE public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- 6. ADMIN CHECK FUNCTION (Prevents Infinite Recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES

-- Profiles: Users can view/update their own profile. Admins can view all.
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- Subscriptions: Users view own. Admins manage all.
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
    FOR ALL USING (public.is_admin());

-- Payment Requests: Users insert/view own. Admins manage all.
CREATE POLICY "Users can view own payments" ON public.payment_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payment_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage payments" ON public.payment_requests
    FOR ALL USING (public.is_admin());

-- Devices: Users manage own.
CREATE POLICY "Users manage own devices" ON public.devices
    FOR ALL USING (auth.uid() = user_id);

-- 6. AUTOMATIC PROFILE CREATION ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role, status)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
        CASE 
            WHEN NEW.email = 'mohd6396889713@gmail.com' THEN 'admin'
            ELSE 'user'
        END,
        'active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. FUNCTION TO CHECK DEVICE LIMIT
CREATE OR REPLACE FUNCTION public.check_device_limit()
RETURNS TRIGGER AS $$
DECLARE
    device_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO device_count FROM public.devices WHERE user_id = NEW.user_id;
    
    -- If device exists, just update last_login (this logic will be in app, but here for safety)
    IF EXISTS (SELECT 1 FROM public.devices WHERE user_id = NEW.user_id AND device_id = NEW.device_id) THEN
        RETURN NEW;
    END IF;

    IF device_count >= 2 THEN
        RAISE EXCEPTION 'Maximum device limit (2) reached. Please logout from another device.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER before_device_insert
    BEFORE INSERT ON public.devices
    FOR EACH ROW EXECUTE FUNCTION public.check_device_limit();

-- 8. COURSES TABLE
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. SUBJECTS TABLE
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, title)
);

-- 10. TOPICS TABLE
CREATE TABLE public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subject_id, title)
);

-- 11. MCQS TABLE
CREATE TABLE public.mcqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings
    correct_index INTEGER NOT NULL,
    explanation TEXT,
    task_type TEXT DEFAULT 'test_question' CHECK (task_type IN ('test_question', 'situational_task')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. ENABLE RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcqs ENABLE ROW LEVEL SECURITY;

-- 13. POLICIES

-- Courses/Subjects/Topics: Public Read
CREATE POLICY "Public can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public can view topics" ON public.topics FOR SELECT USING (true);

-- MCQs: Only subscribed users or admins can view
CREATE POLICY "Subscribed users can view MCQs" ON public.mcqs 
    FOR SELECT USING (public.check_active_subscription(auth.uid()) OR public.is_admin());

-- Admin Management
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage subjects" ON public.subjects FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage topics" ON public.topics FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage mcqs" ON public.mcqs FOR ALL USING (public.is_admin());

-- 14. PROMO CODES TABLE
CREATE TABLE public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage DECIMAL(5, 2) NOT NULL,
    usage_limit INTEGER NOT NULL,
    current_usage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the TRH20 code
INSERT INTO public.promo_codes (code, discount_percentage, usage_limit)
VALUES ('TRH20', 20.00, 50);

-- Insert the TRH75 code
INSERT INTO public.promo_codes (code, discount_percentage, usage_limit)
VALUES ('TRH75', 75.00, 50);

-- Update payment_requests to track promo usage
ALTER TABLE public.payment_requests ADD COLUMN promo_code_id UUID REFERENCES public.promo_codes(id);

-- FUNCTION: Validate Promocode
CREATE OR REPLACE FUNCTION public.validate_promo(promo_code TEXT)
RETURNS JSON AS $$
DECLARE
    promo_record RECORD;
BEGIN
    SELECT * INTO promo_record FROM public.promo_codes 
    WHERE code = promo_code AND is_active = TRUE;

    IF NOT FOUND THEN
        RETURN json_build_object('valid', FALSE, 'message', 'Invalid promocode');
    END IF;

    IF promo_record.current_usage >= promo_record.usage_limit THEN
        RETURN json_build_object('valid', FALSE, 'message', 'Promocode usage limit reached');
    END IF;

    RETURN json_build_object(
        'valid', TRUE, 
        'id', promo_record.id,
        'discount_percentage', promo_record.discount_percentage
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS for promo_codes
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active promo codes" ON public.promo_codes FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage promo codes" ON public.promo_codes FOR ALL USING (public.is_admin());

-- 15. SUPPORT TICKETS TABLE
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'Low',
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED')),
    description TEXT NOT NULL,
    admin_notes TEXT,
    mcq_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. TICKET MESSAGES TABLE
CREATE TABLE public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. ENABLE RLS FOR SUPPORT
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all tickets" ON public.support_tickets FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view messages for own tickets" ON public.ticket_messages 
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid()));
CREATE POLICY "Users can post messages to own tickets" ON public.ticket_messages 
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid()));
CREATE POLICY "Admins manage all messages" ON public.ticket_messages FOR ALL USING (public.is_admin());

-- 18. BATTLE ROOMS TABLE
CREATE TABLE public.battle_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    host_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL CHECK (task_type IN ('test_question', 'situational_task')),
    status TEXT DEFAULT 'lobby' CHECK (status IN ('lobby', 'live', 'ended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. BATTLE PLAYERS TABLE
CREATE TABLE public.battle_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.battle_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    answers JSONB DEFAULT '{}'::jsonb, -- map of question_index -> selected_option_index
    is_ready BOOLEAN DEFAULT FALSE,
    finished BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- 20. BATTLE QUESTIONS TABLE
CREATE TABLE public.battle_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.battle_rooms(id) ON DELETE CASCADE,
    mcq_id UUID NOT NULL REFERENCES public.mcqs(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    UNIQUE(room_id, mcq_id)
);

-- 21. BATTLE RESULTS TABLE
CREATE TABLE public.battle_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.battle_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    accuracy DECIMAL(5, 2) DEFAULT 0.00,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Enable RLS for battle tables
ALTER TABLE public.battle_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_results ENABLE ROW LEVEL SECURITY;

-- Select policies (Allow authenticated users to read)
CREATE POLICY "Allow authenticated read battle_rooms" ON public.battle_rooms FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated read battle_players" ON public.battle_players FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated read battle_questions" ON public.battle_questions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated read battle_results" ON public.battle_results FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert/Update/Delete policies (Allow anyone authenticated to participate)
CREATE POLICY "Allow authenticated manage battle_rooms" ON public.battle_rooms FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated manage battle_players" ON public.battle_players FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated manage battle_questions" ON public.battle_questions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated manage battle_results" ON public.battle_results FOR ALL USING (auth.uid() IS NOT NULL);

