import { supabase, supabaseAdmin } from './supabase';

// supabaseAdmin uses the service role key → bypasses RLS → sees ALL data
// supabase uses the anon key → used only for auth operations

export const adminService = {
  // ── 1. Dashboard Metrics ──
  async getDashboardStats() {
    try {
      const nowIso = new Date().toISOString();
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: blockedUsers },
        { count: totalMCQs },
        { count: pendingPayments },
        { count: approvedPayments },
        { count: totalCourses },
        { count: totalSubjects },
        { count: totalTopics },
        { count: openTickets },
        { data: approvedPaymentsData },
        { data: recentSubsData }
      ] = await Promise.all([
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'blocked'),
        supabaseAdmin.from('mcqs').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('payment_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabaseAdmin.from('payment_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('subjects').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('topics').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('support_tickets').select('*', { count: 'exact', head: true }).in('status', ['PENDING', 'IN_PROGRESS', 'open']),
        supabaseAdmin.from('payment_requests').select('amount').eq('status', 'approved'),
        supabaseAdmin.from('subscriptions').select('id, start_date, end_date, status, profiles:user_id(name, email)').order('created_at', { ascending: false }).limit(5)
      ]);

      const { count: activeSubscriptions } = await supabaseAdmin
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('end_date', nowIso);

      const totalRevenue = (approvedPaymentsData || []).reduce((acc, curr) => acc + (Number(curr.amount) || 49), 0);

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        blockedUsers: blockedUsers || 0,
        totalMCQs: totalMCQs || 0,
        pendingPayments: pendingPayments || 0,
        approvedPayments: approvedPayments || 0,
        totalRevenue: totalRevenue || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalCourses: totalCourses || 0,
        totalSubjects: totalSubjects || 0,
        totalTopics: totalTopics || 0,
        openTickets: openTickets || 0,
        recentSubs: recentSubsData || []
      };
    } catch (e) {
      console.error('adminService.getDashboardStats error:', e);
      return {
        totalUsers: 0, activeUsers: 0, blockedUsers: 0,
        totalMCQs: 0, pendingPayments: 0, approvedPayments: 0,
        totalRevenue: 0, activeSubscriptions: 0, totalCourses: 0,
        totalSubjects: 0, totalTopics: 0, openTickets: 0, recentSubs: []
      };
    }
  },

  // ── 2. User Management ──
  async getUsers({ search = '', status = 'all' } = {}) {
    try {
      let query = supabaseAdmin
        .from('profiles')
        .select('*, subscriptions(id, status, start_date, end_date)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status === 'active') {
        query = query.eq('status', 'active');
      } else if (status === 'blocked') {
        query = query.eq('status', 'blocked');
      }

      const { data, count, error } = await query.limit(500);
      if (error) throw error;

      const now = new Date();
      let users = (data || []).map(u => {
        const subs = Array.isArray(u.subscriptions) ? u.subscriptions : (u.subscriptions ? [u.subscriptions] : []);
        const activeSub = subs.find(s => s.status === 'active' && (!s.end_date || new Date(s.end_date) >= now));
        return {
          ...u,
          hasActiveSub: !!activeSub,
          activeSubEndDate: activeSub?.end_date || null,
          role: u.role || 'user',
          status: u.status || 'active'
        };
      });

      if (status === 'premium') {
        users = users.filter(u => u.hasActiveSub);
      }

      if (search.trim()) {
        const term = search.toLowerCase();
        users = users.filter(u =>
          (u.email && u.email.toLowerCase().includes(term)) ||
          (u.name && u.name.toLowerCase().includes(term)) ||
          (u.phone && u.phone.includes(term))
        );
      }

      return { users, total: count || users.length };
    } catch (e) {
      console.error('adminService.getUsers error:', e);
      return { users: [], total: 0 };
    }
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteUser(userId) {
    await supabaseAdmin.from('subscriptions').delete().eq('user_id', userId);
    await supabaseAdmin.from('support_tickets').delete().eq('user_id', userId);
    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
    if (error) throw error;
    return true;
  },

  async createUser({ email, name, phone, grantDays = 90 }) {
    const userId = crypto.randomUUID();
    const { data: profile, error: pErr } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: userId,
        email: email.trim().toLowerCase(),
        name: name.trim(),
        phone: phone?.trim() || '',
        role: 'user',
        status: 'active',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (pErr) throw pErr;

    if (grantDays > 0) {
      const now = new Date();
      const end = new Date(now.getTime() + grantDays * 86400000);
      await supabaseAdmin.from('subscriptions').insert([{
        user_id: userId,
        status: 'active',
        start_date: now.toISOString(),
        end_date: end.toISOString()
      }]);
    }
    return profile;
  },

  // ── 3. Subscriptions ──
  async getSubscriptions({ search = '', status = 'all' } = {}) {
    try {
      let query = supabaseAdmin
        .from('subscriptions')
        .select('id, user_id, start_date, end_date, status, created_at, profiles:user_id(name, email, phone)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, count, error } = await query.limit(500);
      if (error) throw error;

      let subs = (data || []).map(s => {
        const p = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
        return {
          ...s,
          user: p || { name: 'Unknown Student', email: s.user_id, phone: '' }
        };
      });

      if (search.trim()) {
        const term = search.toLowerCase();
        subs = subs.filter(s =>
          (s.user.email && s.user.email.toLowerCase().includes(term)) ||
          (s.user.name && s.user.name.toLowerCase().includes(term)) ||
          (s.user.phone && s.user.phone.includes(term))
        );
      }

      return { subscriptions: subs, total: count || subs.length };
    } catch (e) {
      console.error('adminService.getSubscriptions error:', e);
      return { subscriptions: [], total: 0 };
    }
  },

  async grantSubscription(userId, { days = 90, customDate = '', reason = 'Admin Manual Grant' }) {
    let endDate;
    if (customDate) {
      endDate = new Date(customDate).toISOString();
    } else {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + Number(days));
      endDate = targetDate.toISOString();
    }

    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: endDate
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .insert([{
          user_id: userId,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: endDate
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // ── 4. Support Tickets ──
  async getSupportTickets({ search = '', status = 'all' } = {}) {
    try {
      let query = supabaseAdmin
        .from('support_tickets')
        .select('id, user_id, title, category, description, priority, status, admin_notes, created_at, updated_at, profiles:user_id(name, email, phone)')
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      let tickets = (data || []).map(t => {
        const p = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
        return {
          ...t,
          user: p || { name: 'Student', email: t.user_id, phone: '' }
        };
      });

      if (search.trim()) {
        const term = search.toLowerCase();
        tickets = tickets.filter(t =>
          (t.title && t.title.toLowerCase().includes(term)) ||
          (t.description && t.description.toLowerCase().includes(term)) ||
          (t.user.name && t.user.name.toLowerCase().includes(term)) ||
          (t.user.email && t.user.email.toLowerCase().includes(term))
        );
      }

      return tickets;
    } catch (e) {
      console.error('adminService.getSupportTickets error:', e);
      return [];
    }
  },

  async updateSupportTicket(ticketId, { status, adminNotes }) {
    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .update({
        status,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ── 5. Payment Requests ──
  async getPaymentRequests({ search = '', status = 'all' } = {}) {
    try {
      let query = supabaseAdmin
        .from('payment_requests')
        .select('*, profiles:user_id(name, email, phone)')
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      let requests = (data || []).map(r => {
        const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
        return {
          ...r,
          user: p || { name: 'Student', email: r.user_id, phone: '' }
        };
      });

      if (search.trim()) {
        const term = search.toLowerCase();
        requests = requests.filter(r =>
          (r.transaction_id && r.transaction_id.toLowerCase().includes(term)) ||
          (r.user.name && r.user.name.toLowerCase().includes(term)) ||
          (r.user.email && r.user.email.toLowerCase().includes(term))
        );
      }

      return requests;
    } catch (e) {
      console.error('adminService.getPaymentRequests error:', e);
      return [];
    }
  },

  async updatePaymentRequest(requestId, { status }) {
    const { data: request, error: rErr } = await supabaseAdmin
      .from('payment_requests')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();
    if (rErr) throw rErr;

    // If approved, automatically activate subscription for 90 days!
    if (status === 'approved' && request.user_id) {
      const now = new Date();
      const end = new Date(now.getTime() + 90 * 86400000);
      await supabaseAdmin.from('subscriptions').upsert([{
        user_id: request.user_id,
        status: 'active',
        start_date: now.toISOString(),
        end_date: end.toISOString()
      }], { onConflict: 'user_id' });
    }
    return request;
  },

  async recordManualPayment({ userId, amount = 49, transactionId = '', validityDays = 90 }) {
    const ref = `MANUAL-${Date.now()}`;
    const { data: request, error: rErr } = await supabaseAdmin
      .from('payment_requests')
      .insert([{
        user_id: userId,
        amount: Number(amount) || 49,
        transaction_id: transactionId || ref,
        payment_reference: ref,
        status: 'approved',
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (rErr) throw rErr;

    if (userId) {
      await this.grantSubscription(userId, { days: validityDays, reason: 'Manual Payment Recorded' });
    }
    return request;
  },

  // ── 6. Academic Hierarchy (Courses, Subjects, Topics) ──
  async getFullAcademicHierarchy() {
    try {
      const [coursesRes, subjectsRes, topicsP1, topicsP2] = await Promise.all([
        supabaseAdmin.from('courses').select('*').order('created_at', { ascending: true }),
        supabaseAdmin.from('subjects').select('*').order('created_at', { ascending: true }),
        supabaseAdmin.from('topics').select('*').range(0, 999).order('created_at', { ascending: true }),
        supabaseAdmin.from('topics').select('*').range(1000, 2499).order('created_at', { ascending: true })
      ]);

      const courses = coursesRes.data || [];
      const subjects = subjectsRes.data || [];
      const topics = [...(topicsP1.data || []), ...(topicsP2.data || [])];

      const topicsBySub = {};
      topics.forEach(t => {
        if (!topicsBySub[t.subject_id]) topicsBySub[t.subject_id] = [];
        topicsBySub[t.subject_id].push({ ...t, name: t.name || t.title });
      });

      const subsByCourse = {};
      subjects.forEach(s => {
        if (!subsByCourse[s.course_id]) subsByCourse[s.course_id] = [];
        subsByCourse[s.course_id].push({
          ...s,
          name: s.name || s.title,
          topics: topicsBySub[s.id] || []
        });
      });

      return courses.map(c => ({
        ...c,
        name: c.name || c.title,
        subjects: subsByCourse[c.id] || []
      }));
    } catch (e) {
      console.error('adminService.getFullAcademicHierarchy error:', e);
      return [];
    }
  },

  async getCourses() {
    const { data, error } = await supabaseAdmin.from('courses').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(c => ({ ...c, name: c.name || c.title }));
  },

  async getSubjects(courseId) {
    let query = supabaseAdmin.from('subjects').select('*').order('created_at', { ascending: true });
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getTopics(subjectId) {
    let query = supabaseAdmin.from('topics').select('*').order('created_at', { ascending: true });
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // ── 7. MCQs Live Management ──
  async getMcqs(topicId, taskType) {
    let query = supabaseAdmin.from('mcqs').select('*').order('created_at', { ascending: true });
    if (Array.isArray(topicId)) {
      if (topicId.length > 0) {
        query = query.in('topic_id', topicId);
      } else {
        return [];
      }
    } else if (topicId && topicId !== 'all') {
      query = query.eq('topic_id', topicId);
    }
    if (taskType) {
      query = query.eq('task_type', taskType);
    }
    const { data, error } = await query.limit(1000);
    if (error) throw error;
    return data || [];
  },

  async saveMcq(mcqData) {
    if (mcqData.id) {
      const { data, error } = await supabaseAdmin
        .from('mcqs')
        .update(mcqData)
        .eq('id', mcqData.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('mcqs')
        .insert([mcqData])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async deleteMcq(mcqId) {
    const { error } = await supabaseAdmin.from('mcqs').delete().eq('id', mcqId);
    if (error) throw error;
    return true;
  },

  async bulkInsertMcqs(topicId, questions, taskType = 'test_question') {
    const formatted = questions.map(q => ({
      topic_id: topicId,
      question: q.question,
      options: q.options,
      correct_index: q.correctIndex ?? 0,
      explanation: q.explanation || '',
      task_type: taskType
    }));
    const { data, error } = await supabaseAdmin.from('mcqs').insert(formatted);
    if (error) throw error;
    return data;
  },

  // ── 8. Sub-Admin Staff Management ──
  async getSubAdmins() {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('role', 'admin').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addSubAdmin(email) {
    const { data: user, error: uErr } = await supabaseAdmin.from('profiles').select('id').eq('email', email.trim().toLowerCase()).single();
    if (uErr || !user) throw new Error('User not found with this email. Student must register an account first.');
    const { data, error } = await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', user.id);
    if (error) throw error;
    return true;
  },

  async removeSubAdmin(userId) {
    const { data, error } = await supabaseAdmin.from('profiles').update({ role: 'user' }).eq('id', userId);
    if (error) throw error;
    return true;
  }
};

export default adminService;
