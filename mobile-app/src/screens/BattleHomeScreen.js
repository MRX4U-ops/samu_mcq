import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, Trophy, Users, Sword, Play, ChevronRight, BookOpen, Layers, Target, HelpCircle } from 'lucide-react-native';
import { useBattleStore } from '../store/battleStore';
import axios from 'axios';
import { API_URL } from '../config/Constants';
import useAuthStore from '../store/authStore';
import useSubscriptionStore from '../store/subscriptionStore';

const MOCK_TYPES = [{ value: 'task_question', name: 'Test Questions' }, { value: 'situational_task', name: 'Situational Task' }];

const BattleHomeScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { fetchSubscriptionStatus } = useSubscriptionStore();
  const [phase, setPhase] = useState(0); // 0: Home, 1: Course, 2: Subject, 3: Topic, 4: Type
  const [roomCodeInput, setRoomCodeInput] = useState('');
  
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [userProfile, setUserProfile] = useState({ _id: 'temp_id', name: 'Player' });

  const { initSocket, createRoom, joinRoom, status, roomCode, error } = useBattleStore();

  useEffect(() => {
    const checkAccess = async () => {
      if (user) {
        const sub = await fetchSubscriptionStatus(user.id);
        if (!sub) {
          Alert.alert(
            "Premium Required",
            "Multiplayer Battles are only available to Premium members. Please subscribe to enter the arena.",
            [{ text: "Plans", onPress: () => navigation.navigate('Subscription') }]
          );
          navigation.goBack();
          return;
        }
      }
      initSocket();
      loadProfile();
    };
    checkAccess();
  }, []);

  const loadProfile = async () => {
    try {
      setUserProfile({ _id: Math.random().toString(36).substring(7), name: 'Player ' + Math.floor(Math.random() * 100) });
    } catch (e) {
      console.log('Error loading profile', e);
    }
  }

  useEffect(() => {
    if (status === 'lobby' && roomCode) {
      setPhase(0);
      navigation.navigate('Lobby', { roomCode });
    }
    if (error) {
      Alert.alert('Error', error);
      useBattleStore.setState({ error: null });
    }
  }, [status, roomCode, error]);

  const loadCourses = async () => {
    try {
      console.log('Fetching courses from:', `${API_URL}/courses`);
      setIsFetchingData(true);
      const res = await axios.get(`${API_URL}/courses`, { timeout: 5000 });
      console.log('Courses received:', res.data);
      if (!res.data || res.data.length === 0) {
        Alert.alert('Info', 'No courses found in database.');
      }
      setCourses(res.data.map(c => ({ id: c._id, name: c.title })));
      setPhase(1);
    } catch (e) {
      console.error('Load courses error:', e);
      // Fallback to local data
      const fallbackCourses = [
        { id: '662b92131f4a9b5f3d8a9b1c', name: '1st Course' },
        { id: '662b92131f4a9b5f3d8a9b1d', name: '2nd Course' },
        { id: '662b92131f4a9b5f3d8a9b1e', name: '3rd Course' },
        { id: '662b92131f4a9b5f3d8a9b1f', name: '4th Course' },
        { id: '662b92131f4a9b5f3d8a9b20', name: '5th Course' },
        { id: '662b92131f4a9b5f3d8a9b21', name: '6th Course' },
      ];
      setCourses(fallbackCourses);
      setPhase(1);
      Alert.alert('Offline Mode', 'Could not reach server. Using local curriculum. You can still set up the room, but starting the battle requires a connection.');
    } finally {
      setIsFetchingData(false);
    }
  };

  const loadSubjects = async (course) => {
    try {
      console.log('Fetching subjects for course:', course.id);
      setSelectedCourse(course);
      setIsFetchingData(true);
      const res = await axios.get(`${API_URL}/courses/${course.id}/subjects`, { timeout: 5000 });
      console.log('Subjects received:', res.data);
      setSubjects(res.data.map(s => ({ id: s._id, name: s.title })));
      setPhase(2);
    } catch (e) {
      console.error('Load subjects error:', e);
      Alert.alert('Error', 'Failed to load subjects: ' + e.message);
    } finally {
      setIsFetchingData(false);
    }
  };

  const loadTopics = async (subject) => {
    try {
      console.log('Fetching topics for subject:', subject.id);
      setSelectedSubject(subject);
      setIsFetchingData(true);
      const res = await axios.get(`${API_URL}/subjects/${subject.id}/topics`, { timeout: 5000 });
      console.log('Topics received:', res.data);
      setTopics(res.data.map(t => ({ id: t._id, name: t.title })));
      setPhase(3);
    } catch (e) {
      console.error('Load topics error:', e);
      Alert.alert('Error', 'Failed to load topics: ' + e.message);
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleCreateRoom = async (typeValue) => {
    setIsLoading(true);
    await createRoom({
      courseId: selectedCourse.id,
      subjectId: selectedSubject.id,
      topicId: selectedTopic.id,
      taskType: typeValue,
      maxPlayers: 16
    }, userProfile._id, userProfile.name);
    setIsLoading(false);
  };

  const handleJoinRoom = () => {
    if (roomCodeInput.length === 6) {
      joinRoom(roomCodeInput.toUpperCase(), userProfile._id, userProfile.name);
    }
  };

  const renderPhaseHeader = (title) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => setPhase(phase > 0 ? phase - 1 : 0)}>
        <ArrowLeft size={24} color="#1F2937" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );

  const renderSelectionList = (data, onSelect, selectedItem, iconType) => (
    <ScrollView contentContainerStyle={styles.listContent}>
      <Text style={styles.phaseInstructions}>Choose an option to continue</Text>
      {isFetchingData ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 50 }} />
      ) : (
        data.map((item, idx) => {
          const isSelected = selectedItem?.id === item.id || selectedItem?.value === item.value;
          return (
            <TouchableOpacity 
              key={idx} 
              style={[styles.listItem, isSelected && styles.listItemSelected]}
              onPress={() => onSelect(item)}
            >
              <View style={styles.listItemLeft}>
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                  {iconType === 'course' && <BookOpen size={20} color={isSelected ? '#FFF' : '#6B7280'} />}
                  {iconType === 'subject' && <Layers size={20} color={isSelected ? '#FFF' : '#6B7280'} />}
                  {iconType === 'topic' && <Target size={20} color={isSelected ? '#FFF' : '#6B7280'} />}
                  {iconType === 'type' && <HelpCircle size={20} color={isSelected ? '#FFF' : '#6B7280'} />}
                </View>
                <Text style={[styles.listItemText, isSelected && styles.listItemTextSelected]}>
                  {item.name}
                </Text>
              </View>
              <ChevronRight size={20} color={isSelected ? '#6366F1' : '#D1D5DB'} />
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );

  if (phase === 1) {
    return (
      <SafeAreaView style={styles.container}>
        {renderPhaseHeader('Select Course')}
        {renderSelectionList(courses, loadSubjects, selectedCourse, 'course')}
      </SafeAreaView>
    );
  }

  if (phase === 2) {
    return (
      <SafeAreaView style={styles.container}>
        {renderPhaseHeader('Select Subject')}
        {renderSelectionList(subjects, loadTopics, selectedSubject, 'subject')}
      </SafeAreaView>
    );
  }

  if (phase === 3) {
    return (
      <SafeAreaView style={styles.container}>
        {renderPhaseHeader('Select Topic')}
        {renderSelectionList(topics, (item) => { setSelectedTopic(item); setPhase(4); }, selectedTopic, 'topic')}
      </SafeAreaView>
    );
  }

  if (phase === 4) {
    return (
      <SafeAreaView style={styles.container}>
        {renderPhaseHeader('Select Question Type')}
        <ScrollView contentContainerStyle={styles.listContent}>
          <Text style={styles.phaseInstructions}>Final step! Choose the type of questions.</Text>
          {MOCK_TYPES.map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.listItem}
              onPress={() => {
                setSelectedType(item);
                handleCreateRoom(item.value);
              }}
              disabled={isLoading}
            >
              <View style={styles.listItemLeft}>
                <View style={styles.iconContainer}>
                  <HelpCircle size={20} color={'#6B7280'} />
                </View>
                <Text style={styles.listItemText}>{item.name}</Text>
              </View>
              {isLoading && selectedType?.value === item.value ? (
                <ActivityIndicator color="#6366F1" />
              ) : (
                <Sword size={20} color="#6366F1" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Phase 0: Home
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Battle Arena</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.trophyContainer}>
             <Trophy size={60} color="#F59E0B" />
          </View>
          <Text style={styles.heroTitle}>Multiplayer Battle</Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.cardTitle}>Host a Room</Text>
          <Text style={styles.cardDesc}>Create a custom battle room and challenge your friends.</Text>

          <TouchableOpacity style={styles.createButton} onPress={loadCourses} disabled={isFetchingData}>
            {isFetchingData ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Sword size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Start New Quiz Setup</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.line} /><Text style={styles.dividerText}>OR JOIN</Text><View style={styles.line} />
        </View>

        <View style={styles.actionCard}>
          <TextInput 
            style={styles.input}
            placeholder="Enter 6-digit Room Code"
            value={roomCodeInput}
            onChangeText={setRoomCodeInput}
            maxLength={6}
            autoCapitalize="characters"
          />
          <TouchableOpacity 
            style={[styles.joinButton, roomCodeInput.length < 6 && styles.disabledButton]}
            onPress={handleJoinRoom}
            disabled={roomCodeInput.length < 6}
          >
            <Users size={20} color="#FFFFFF" />
            <Text style={styles.joinButtonText}>Join Battle</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginLeft: 15 },
  scrollContent: { padding: 20 },
  heroSection: { alignItems: 'center', marginBottom: 25 },
  trophyContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  actionCard: { backgroundColor: '#FFF', padding: 25, borderRadius: 24, elevation: 3, marginBottom: 20 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 20 },
  createButton: { backgroundColor: '#10B981', height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  createButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 15, color: '#9CA3AF', fontWeight: 'bold', fontSize: 12 },
  input: { backgroundColor: '#F3F4F6', height: 56, borderRadius: 12, paddingHorizontal: 15, fontSize: 18, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 15 },
  joinButton: { backgroundColor: '#6366F1', height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  joinButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  disabledButton: { backgroundColor: '#C7D2FE' },
  listContent: { padding: 20 },
  phaseInstructions: { fontSize: 16, color: '#6B7280', marginBottom: 20 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6', elevation: 1 },
  listItemSelected: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconContainerSelected: { backgroundColor: '#6366F1' },
  listItemText: { fontSize: 16, fontWeight: '600', color: '#374151', flexShrink: 1 },
  listItemTextSelected: { color: '#4338CA' }
});

export default BattleHomeScreen;
