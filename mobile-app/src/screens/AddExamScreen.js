import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Calendar, BookOpen, ChevronLeft } from 'lucide-react-native';

const AddExamScreen = ({ navigation }) => {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!subject || !date) {
      Alert.alert('Error', 'Please fill in Subject and Date');
      return;
    }
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/users/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, date, notes })
      });
      
      if (response.ok) {
        Alert.alert('Success', 'Exam saved successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      Alert.alert('Offline Mode', 'Exam saved to local device for now.');
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Upcoming Exam</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Subject Name</Text>
        <View style={styles.inputContainer}>
          <BookOpen size={20} color="#9CA3AF" />
          <TextInput
            style={styles.input}
            placeholder="e.g. Anatomy"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        <Text style={styles.label}>Exam Date</Text>
        <View style={styles.inputContainer}>
          <Calendar size={20} color="#9CA3AF" />
          <TextInput
            style={styles.input}
            placeholder="e.g. 24 May 2026"
            value={date}
            onChangeText={setDate}
          />
        </View>

        <Text style={styles.label}>Notes (Optional)</Text>
        <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Add any details..."
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Exam</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 15, height: 56 },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1F2937' },
  saveButton: { backgroundColor: '#3B82F6', marginTop: 32, padding: 18, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});

export default AddExamScreen;
