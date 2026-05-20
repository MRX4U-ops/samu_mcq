import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, Clock, User as UserIcon } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicketAndMessages();
    const interval = setInterval(fetchMessagesOnly, 5000); // poll messages every 5 seconds
    return () => clearInterval(interval);
  }, [id]);

  const fetchTicketAndMessages = async () => {
    try {
      setLoading(true);
      const [ticketRes, messagesRes] = await Promise.all([
        axiosInstance.get(`/support/ticket/${id}`),
        axiosInstance.get(`/support/messages/${id}`)
      ]);
      setTicket(ticketRes.data);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      // Fallback
      setTicket({ id, title: 'Payment Issue', status: 'PENDING', category: 'Payment' });
      setMessages([
        { id: 'm1', sender_id: 'user', message: 'I paid but it says not active.', is_admin_reply: false, created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesOnly = async () => {
    try {
      const messagesRes = await axiosInstance.get(`/support/messages/${id}`);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Error polling messages:', error);
    }
  };

  const handleSend = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const response = await axiosInstance.post('/support/messages', {
        ticketId: id,
        message: reply,
        isAdminReply: true
      });
      setMessages(prev => [...prev, response.data]);
      setReply('');
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading ticket...</div>;
  if (!ticket) return <div className="p-8 text-center text-rose-500">Ticket not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate('/support')} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium">
        <ArrowLeft size={18} className="mr-2" /> Back to Tickets
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{ticket.title}</h2>
            <p className="text-sm text-gray-500">Ticket ID: {ticket.id}</p>
          </div>
          <span className="px-4 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase">
            {ticket.status}
          </span>
        </div>

        <div className="p-6 h-[400px] overflow-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.is_admin_reply ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${msg.is_admin_reply ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                <p className="text-sm">{msg.message}</p>
                <p className={`text-[10px] mt-2 ${msg.is_admin_reply ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-4">
            <input 
              className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Type your reply to the student..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <button 
              onClick={handleSend}
              disabled={sending}
              className="bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center"
            >
              <Send size={18} className="mr-2" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
