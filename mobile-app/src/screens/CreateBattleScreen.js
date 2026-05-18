import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, BookOpen, Layers, Target, HelpCircle, ChevronRight, Play } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBattleStore } from '../store/battleStore';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import { API_URL } from '../config/Constants';

const QUESTION_TYPES = [
  { value: 'task_question', name: 'Test Questions' },
  { value: 'situational_task', name: 'Situational Case Tasks' }
];

const CreateBattleScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { createRoom, roomCode, status, error } = useBattleStore();
  
  const [phase, setPhase] = useState(1); // 1: Course, 2: Subject, 3: Topic, 4: Type
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (status === 'lobby' && roomCode) {
      navigation.replace('Lobby', { roomCode });
    }
    if (error) {
      Alert.alert('Error', error);
      useBattleStore.setState({ error: null });
    }
  }, [status, roomCode, error]);

  const loadCourses = async () => {
    try {
      setIsFetching(true);
      const res = await axios.get(`${API_URL}/courses`, { timeout: 5000 });
      setCourses(res.data.map(c => ({ id: c._id, name: c.title })));
    } catch (e) {
      console.warn('Fallback to local courses', e.message);
      setCourses([
        { id: '662b92131f4a9b5f3d8a9b1c', name: '1st Course' },
        { id: '662b92131f4a9b5f3d8a9b1d', name: '2nd Course' }
      ]);
    } finally {
      setIsFetching(false);
    }
  };

  const loadSubjects = async (course) => {
    try {
      setSelectedCourse(course);
      setIsFetching(true);
      const res = await axios.get(`${API_URL}/courses/${course.id}/subjects`, { timeout: 5000 });
      setSubjects(res.data.map(s => ({ id: s._id, name: s.title })));
      setPhase(2);
    } catch (e) {
      Alert.alert('Error', 'Failed to load subjects. Please check network.');
    } finally {
      setIsFetching(false);
    }
  };

  const loadTopics = async (subject) => {
    try {
      setSelectedSubject(subject);
      setIsFetching(true);
      const res = await axios.get(`${API_URL}/subjects/${subject.id}/topics`, { timeout: 5000 });
      setTopics(res.data.map(t => ({ id: t._id, name: t.title })));
      setPhase(3);
    } catch (e) {
      Alert.alert('Error', 'Failed to load topics.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleCreate = async (typeValue) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const hostId = user?.id || 'temp_host';
      const hostName = user?.email?.split('@')[0] || 'Host';
      
      await createRoom({
        courseId: selectedCourse.id,
        subjectId: selectedSubject.id,
        topicId: selectedTopic.id,
        taskType: typeValue,
        maxPlayers: 16
      }, hostId, hostName);
    } catch (e) {
      Alert.alert('Error', 'Failed to generate battle room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (phase > 1) {
      setPhase(phase - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderProgress = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.stepText}>Step {phase} of 4</Text>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${(phase / 4) * 100}%` }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1E1B4B', '#2A0845']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Host Battle</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderProgress()}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isFetching ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loaderText}>Loading Curriculum...</Text>
          </View>
        ) : (
          <View style={styles.stepBox}>
            {phase === 1 && (
              <>
                <Text style={styles.phaseTitle}>Select Course</Text>
                {courses.map(item => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.card}
                    onPress={() => loadSubjects(item)}
                  >
                    <BookOpen size={22} color="#10B981" />
                    <Text style={styles.cardText}>{item.name}</Text>
                    <ChevronRight size={20} color="#6B7280" />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {phase === 2 && (
              <>
                <Text style={styles.phaseTitle}>Select Subject</Text>
                {subjects.map(item => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.card}
                    onPress={() => loadTopics(item)}
                  >
                    <Layers size={22} color="#10B981" />
                    <Text style={styles.cardText}>{item.name}</Text>
                    <ChevronRight size={20} color="#6B7280" />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {phase === 3 && (
              <>
                <Text style={styles.phaseTitle}>Select Topic</Text>
                {topics.map(item => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.card}
                    onPress={() => { setSelectedTopic(item); setPhase(4); }}
                  >
                    <Target size={22} color="#10B981" />
                    <Text style={styles.cardText}>{item.name}</Text>
                    <ChevronRight size={20} color="#6B7280" />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {phase === 4 && (
              <>
                <Text style={styles.phaseTitle}>Question Type</Text>
                <Text style={styles.summaryText}>
                  {selectedCourse?.name} ➔ {selectedSubject?.name.substring(0, 25)}... ➔ {selectedTopic?.name.substring(0, 25)}...
                </Text>
                {QUESTION_TYPES.map(item => (
                  <TouchableOpacity 
                    key={item.value} 
                    style={styles.card}
                    onPress={() => handleCreate(item.value)}
                    disabled={isLoading}
                  >
                    <HelpCircle size={22} color="#10B981" />
                    <Text style={styles.cardText}>{item.name}</Text>
                    {isLoading ? (
                      <ActivityIndicator color="#10B981" />
                    ) : (
                      <Play size={20} color="#10B981" fill="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  progressContainer: { paddingHorizontal: 24, marginTop: 20 },
  stepText: { color: '#C7D2FE', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
  progressBarFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  scrollContent: { padding: 24 },
  loaderContainer: { alignItems: 'center', marginTop: 100 },
  loaderText: { color: '#A5B4FC', fontSize: 14, fontWeight: '600', marginTop: 15 },
  stepBox: { width: '100%' },
  phaseTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  summaryText: { color: '#A5B4FC', fontSize: 12, fontWeight: '600', marginBottom: 20, lineHeight: 18 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.06)', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 18, 
    padding: 20, 
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  cardText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#FFF', marginLeft: 16, marginRight: 10 }
});

export default CreateBattleScreen;
