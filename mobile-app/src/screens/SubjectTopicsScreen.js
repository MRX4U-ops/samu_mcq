import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Book, ChevronRight, FileText, Activity } from 'lucide-react-native';

const SubjectTopicsScreen = ({ route, navigation }) => {
  const { subjectId, subjectName } = route.params || { subjectId: '1', subjectName: 'Anatomy' };
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Standardized 0-indexed topics to match repository
  const topics = Array.from({ length: 15 }, (_, i) => ({
    id: `${i}`,
    title: `Topic ${i + 1}: Comprehensive Review`,
  }));

  const handleTopicPress = (topic) => {
    setSelectedTopic(topic);
    setModalVisible(true);
  };

  const startQuiz = (type) => {
    setModalVisible(false);
    navigation.navigate('MCQ', { 
      topicId: selectedTopic.id, 
      topicName: selectedTopic.title,
      taskType: type,
      subjectId: subjectId
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subjectName}</Text>
      </View>

      <FlatList 
        data={topics}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.topicCard} onPress={() => handleTopicPress(item)}>
            <View style={styles.topicIcon}>
              <Book size={20} color="#6366F1" />
            </View>
            <Text style={styles.topicTitle}>{item.title}</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* Mode Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Question Type</Text>
            <Text style={styles.modalDesc}>{selectedTopic?.title}</Text>
            
            <TouchableOpacity 
              style={[styles.modeBtn, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]} 
              onPress={() => startQuiz('test_question')}
            >
              <FileText size={24} color="#6366F1" />
              <View style={styles.modeTextContainer}>
                <Text style={[styles.modeBtnText, { color: '#4338CA' }]}>Test Questions</Text>
                <Text style={styles.modeSubText}>Classic multiple choice format</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modeBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]} 
              onPress={() => startQuiz('situational_task')}
            >
              <Activity size={24} color="#10B981" />
              <View style={styles.modeTextContainer}>
                <Text style={[styles.modeBtnText, { color: '#065F46' }]}>Situational Task</Text>
                <Text style={styles.modeSubText}>Clinical case studies & scenarios</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginLeft: 15 },
  listContent: { padding: 20 },
  topicCard: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 1 },
  topicIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  topicTitle: { fontSize: 15, fontWeight: '600', color: '#374151', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 5 },
  modalDesc: { fontSize: 14, color: '#6B7280', marginBottom: 25 },
  modeBtn: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1 },
  modeTextContainer: { marginLeft: 15 },
  modeBtnText: { fontSize: 16, fontWeight: 'bold' },
  modeSubText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cancelBtn: { padding: 15, alignItems: 'center', marginTop: 10 },
  cancelText: { color: '#9CA3AF', fontWeight: 'bold' }
});

export default SubjectTopicsScreen;
