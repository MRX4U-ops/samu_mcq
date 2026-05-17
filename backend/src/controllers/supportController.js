const { supabaseAdmin } = require('../config/supabase');

// --- USER APIs ---

exports.createTicket = async (req, res) => {
  const { title, category, description, mcqId } = req.body;
  const userId = req.headers['user-id'];

  console.log(`[Support] POST /ticket - User: ${userId}, Title: ${title}`);

  if (!userId) {
    console.error('[Support] Missing User ID in headers');
    return res.status(401).json({ message: "User ID required" });
  }

  try {
    let priority = 'Low';
    if (['Payment Issue', 'Login Problem'].includes(category)) priority = 'High';
    else if (category === 'Technical Bug') priority = 'Medium';

    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('support_tickets')
      .insert({
        user_id: userId,
        title,
        category,
        priority,
        status: 'PENDING',
        description,
        mcq_id: mcqId
      })
      .select()
      .single();

    if (ticketError) {
      console.error('[Support] Create Ticket Error:', ticketError);
      throw ticketError;
    }

    console.log(`[Support] Ticket created successfully: ${ticket.id}`);
    res.status(201).json(ticket);
  } catch (error) {
    console.error('[Support] Create Exception:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getMyTickets = async (req, res) => {
  const userId = req.headers['user-id'];
  console.log(`[Support] GET /my-tickets - User: ${userId}`);
  try {
    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Support] Get My Tickets Error:', error);
      throw error;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  console.log(`[Support] GET /ticket/${req.params.id}`);
  try {
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (ticketError) throw ticketError;
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- ADMIN APIs ---

exports.getAdminTickets = async (req, res) => {
  console.log('[Support] GET /admin/all (Admin)');
  try {
    const { data: tickets, error } = await supabaseAdmin
      .from('support_tickets')
      .select(`
        *,
        profiles (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Support] Admin Get All Error:', error);
      throw error;
    }

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminUpdateStatus = async (req, res) => {
  const { status, admin_notes } = req.body;
  console.log(`[Support] PATCH /admin/status/${req.params.id} - Status: ${status}`);
  try {
    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .update({ status, admin_notes, updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('[Support] Admin Update Error:', error);
      throw error;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- CHAT APIs ---

exports.getMessages = async (req, res) => {
  const { ticketId } = req.params;
  try {
    const { data, error } = await supabaseAdmin
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.postMessage = async (req, res) => {
  const { ticketId, message, isAdminReply } = req.body;
  const senderId = req.headers['user-id'];

  try {
    const { data, error } = await supabaseAdmin
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: senderId,
        message,
        is_admin_reply: isAdminReply
      })
      .select()
      .single();

    if (error) throw error;

    if (isAdminReply) {
      await supabaseAdmin
        .from('support_tickets')
        .update({ status: 'IN_PROGRESS', updated_at: new Date() })
        .eq('id', ticketId);
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
