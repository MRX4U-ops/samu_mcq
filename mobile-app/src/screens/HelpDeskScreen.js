import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, MessageSquare, Send, CircleCheck, AlertCircle, ChevronRight, HelpCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config/Constants';
import useAuthStore from '../store/authStore';

const HelpDeskScreen = ({ route, navigation }) => {
  const { user } = useAuthStore();
  const { colors, isDarkMode } = useTheme();
  const { category: preCategory, title: preTitle, mcqId } = route.params || {};
  
  const [title, setTitle] = useState(preTitle || '');
  const [category, setCategory] = useState(preCategory || 'General Support');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'General Support',
    'MCQ Error',
    'Payment Issue',
    'Content Suggestion',
    'Technical Bug'
  ];

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert("Authentication Error", "You must be logged in to submit a ticket.");
      return;
    }
    if (!title || !description) {
      Alert.alert("Missing Information", "Please provide a title and detailed description.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/support/ticket`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'user-id': user.id 
        },
        body: JSON.stringify({ title, category, description, mcqId })
      });
      
      if (response.ok) {
        setSubmitted(true);
      } else {
        let errorMessage = "Server Error (Status " + response.status + ")";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Non-JSON error response received");
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      Alert.alert("Submission Error", error.message || "Could not reach support server. Please make sure the backend server is running and reachable.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContent}>
           <View style={styles.successIconBox}>
              <CircleCheck size={60} color="#10B981" />
           </View>
           <Text style={[styles.successTitle, { color: colors.text }]}>Ticket Submitted</Text>
           <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
             Our medical support team has received your request. We'll respond within 24 clinical hours.
           </Text>
           <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.doneBtnText}>Return to Dashboard</Text>
           </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Clinical Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: '#EEF2FF' }]}>
           <HelpCircle size={24} color="#6366F1" />
           <Text style={styles.infoText}>How can we assist your medical studies today?</Text>
        </View>

        <View style={styles.formGroup}>
           <Text style={[styles.label, { color: colors.textSecondary }]}>ISSUE CATEGORY</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categories.map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.catTag, category === cat ? { backgroundColor: '#6366F1' } : { backgroundColor: colors.surface }]}
                  onPress={() => setCategory(cat)}
                >
                   <Text style={[styles.catText, category === cat ? { color: '#FFF' } : { color: colors.text }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
           </ScrollView>
        </View>

        <View style={styles.formGroup}>
           <Text style={[styles.label, { color: colors.textSecondary }]}>TICKET TITLE</Text>
           <TextInput 
             style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
             placeholder="e.g. Error in Pathology MCQ #402"
             placeholderTextColor={colors.textSecondary}
             value={title}
             onChangeText={setTitle}
           />
        </View>

        <View style={styles.formGroup}>
           <Text style={[styles.label, { color: colors.textSecondary }]}>DETAILED DESCRIPTION</Text>
           <TextInput 
             style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
             placeholder="Please provide clinical details or technical steps to reproduce the issue..."
             placeholderTextColor={colors.textSecondary}
             multiline
             numberOfLines={6}
             textAlignVertical="top"
             value={description}
             onChangeText={setDescription}
           />
        </View>

        {mcqId && (
          <View style={[styles.metaBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
             <AlertCircle size={16} color="#94A3B8" />
             <Text style={styles.metaText}>Attached MCQ ID: {mcqId}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.submitBtn, submitting && styles.disabledBtn]} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Submit Support Ticket</Text>
              <Send size={18} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        <MyTicketsSection user={user} navigation={navigation} colors={colors} />

        <Text style={styles.footerInfo}>Support Team Status: Online</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const MyTicketsSection = ({ user, navigation, colors }) => {
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const loadTickets = () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    fetch(`${API_URL}/support/my-tickets`, { headers: { 'user-id': user.id } })
      .then(res => {
        if (!res.ok) throw new Error("Status " + res.status);
        return res.json();
      })
      .then(data => {
        setTickets(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.warn('Error loading support tickets:', err.message);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    loadTickets();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.ticketSection}>
        <ActivityIndicator size="small" color="#6366F1" />
        <Text style={{ textAlign: 'center', fontSize: 12, color: colors.textSecondary, marginTop: 8 }}>Loading active tickets...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.ticketSection}>
        <Text style={{ color: '#EF4444', fontSize: 12, textAlign: 'center', fontWeight: 'bold' }}>Could not load active tickets</Text>
        <TouchableOpacity onPress={loadTickets} style={{ marginTop: 8, alignSelf: 'center', backgroundColor: '#6366F120', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
          <Text style={{ color: '#6366F1', fontSize: 11, fontWeight: 'bold' }}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (tickets.length === 0) return null;

  return (
    <View style={styles.ticketSection}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>MY ACTIVE TICKETS</Text>
      {tickets.map(ticket => (
        <TouchableOpacity 
          key={ticket.id} 
          style={[styles.ticketItem, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('SupportChat', { ticketId: ticket.id, ticketTitle: ticket.title })}
        >
          <View style={styles.ticketInfo}>
            <Text style={[styles.ticketTitleSmall, { color: colors.text }]}>{ticket.title}</Text>
            <Text style={styles.ticketDate}>{new Date(ticket.created_at).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.statusSmall, { backgroundColor: ticket.status === 'RESOLVED' ? '#10B98115' : '#F59E0B15' }]}>
            <Text style={[styles.statusTextSmall, { color: ticket.status === 'RESOLVED' ? '#10B981' : '#F59E0B' }]}>{ticket.status}</Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', height: 80, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 20 },
  infoCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, marginBottom: 25 },
  infoText: { flex: 1, marginLeft: 15, fontSize: 14, fontWeight: '500', color: '#4338CA' },
  formGroup: { marginBottom: 25 },
  label: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10 },
  catScroll: { flexDirection: 'row', marginBottom: 10 },
  catTag: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  catText: { fontSize: 13, fontWeight: 'bold' },
  input: { height: 56, borderRadius: 16, paddingHorizontal: 15, fontSize: 15, borderWidth: 1 },
  textArea: { borderRadius: 16, padding: 15, fontSize: 15, borderWidth: 1, height: 150 },
  metaBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 20 },
  metaText: { fontSize: 12, color: '#94A3B8', marginLeft: 8 },
  submitBtn: { backgroundColor: '#2563EB', height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 12 },
  disabledBtn: { backgroundColor: '#93C5FD' },
  footerInfo: { textAlign: 'center', color: '#94A3B8', fontSize: 11, marginTop: 25 },
  successContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  successIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  successTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  successDesc: { fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 35 },
  doneBtn: { backgroundColor: '#10B981', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 18 },
  doneBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  ticketSection: { marginTop: 30 },
  ticketItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, marginBottom: 10, elevation: 1 },
  ticketInfo: { flex: 1 },
  ticketTitleSmall: { fontSize: 14, fontWeight: '700' },
  ticketDate: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  statusSmall: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 10 },
  statusTextSmall: { fontSize: 10, fontWeight: '900' },
});

export default HelpDeskScreen;
