import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, BookOpen, Pin, Lock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config/Constants';
import useAuthStore from '../store/authStore';

const ACADEMIC_CURRICULUM = {
  "1": [
    "Entering to the profession", "Histology, cytology and embriology moodle 1", "Religious studies",
    "The latest history of Uzbekistan. Bioethics", "Human Anatomy -Moodul 2", "Human Anatomy -Moodul 1",
    "Information technologies in medicine", "Medical and biological physics", "MEDICAL BIOLOGY WITH ELEMENTS OF ECOLOGY",
    "MEDICAL CHEMISTRY",
    "Medical English", "Medical latin terminology", "Microbiology, Virology, Parasitology and Immunology",
    "New medical technology and medical equipments", "Pharmacology", "Physiology module 1", "Physiology module 2",
    "Russian language for the students of medical institute", "Uzbek language"
  ],
  "2": [
    "Biochemistry Module 1", "Biochemistry Module 2", "Clinic anatomy", "Clinical laboratory diagnostics",
    "First Aid", "Histology, Cytology and Embryology Module 1", "Histology, Cytology and Embryology Module 2",
    "Human Anatomy Moodul -3", "Medical genetics", "Microbiology, Virology, Parasitology and Immunology-1",
    "Microbiology, Virology, Parasitology and Immunology-2", "Molecular physiology, Pathophysiology",
    "Pathological physiology module 1", "Pathological physiology module 2", "Pathological Anatomy Moodle One",
    "Pediatrics propedeutics", "Pharmacology Moodle 1", "Pharmacology Moodle 2", "Philosophy",
    "Physiology Module 1", "Physiology Module 2", "Propedeutics of internal disease", "Psychology and pedagogy",
    "Medical Deontology. Doctor-Patient Communication"
  ],
  "3": [
    "Clinical laboratory diagnostics", "Clinical laboratory diagnostics", "Dietology. Nutritionology.",
    "Folk medicine", "General surgery", "Hematology", "Hygiene. Medical Ecology", "Internal medicine",
    "Medical genetics", "Medical radiology", "Molecular Physiology, pathophysiology Module 1",
    "Molecular Physiology, pathophysiology Module 2", "Obstetrics and gynecology Module 1",
    "Obstetrics and gynecology module 2", "Pathological physiology Module 1", "Pathological physiology Module 2",
    "Pathological Anatomy Module 1", "Pathological Anatomy Module 2", "Pediatrics", "Pharmacology Module 1",
    "Pharmacology Module 2", "Propaedeutics of childhood diseases", "Propedeutics of internal disease",
    "Rehabilitology, sport medicine", "Neuroradiology"
  ],
  "4": [
    "Children's surgery", "Clinic Pharmacology", "Clinical allergology and immunology", "Dermatovenerology",
    "Endocrinology", "Forensic medicine", "Internal medicine", "Medical psychology", "Neurology",
    "Neurosurgery", "Obstetrics and gynecology", "Occupational diseases", "Oncology", "Otorhinolaryngology",
    "Pediatrics", "Phthisiology", "Public health", "Scientific research methods and biostatistics",
    "Surgery", "Traumatology and Orthopedics", "Urology", "Dentistry", "Partially removable dentures"
  ],
  "5": [
    "Anesthesiology and resuscitation", "Clinic Pharmacology", "Clinical allergology and immunology",
    "Emergency medicine", "Epidemiology", "Infectious diseases. Children's infectious diseases",
    "Internal medicine", "Neonatolgy", "Neurology", "Neurosurgery", "Obstetrics and gynecology",
    "Occupational diseases", "Oncology", "Ophthalmology", "Otorhinolaryngology", "Phthisiology",
    "Psychiatry, Narcology", "Surgery", "Dentistry", "Fully removable prosthesis", "Periodontology",
    "Traumatology and Orthopedics", "Surgery in familial medicine", "Fundamental endoscopic surgery"
  ],
  "6": [
    "Emergency medicine", "Infectious diseases", "Therapy in family medicine",
    "Therapy in family medicine (subordinature)", "Obstetrics and gynecology",
    "Obstetrics and gynecology in familial medicine", "Obstetrics and gynecology in familial medicine (Subordinature)",
    "Pediatrics in familial medicine (Subordinature)", "Pediatrics in familial medicine- MD (11-semester)",
    "Rheumatology", "Surgery in familial medicine (Subordinature)", "Surgery in familial medicine",
    "Simulation study", "Tropical diseases"
  ]
};

const SubjectScreen = ({ route, navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { courseId, title } = route.params || { courseId: "1", title: '1st Course' };
  const { subscription, profile } = useAuthStore();
  const isSubscribed = !!subscription || profile?.role === 'admin';

  // Map UUID to local index if needed (e.g., if title is "1st Course", we want "1")
  const getInternalId = () => {
    if (["1","2","3","4","5","6"].includes(courseId)) return courseId;
    if (title.toLowerCase().includes('1st')) return "1";
    if (title.toLowerCase().includes('2nd')) return "2";
    if (title.toLowerCase().includes('3rd')) return "3";
    if (title.toLowerCase().includes('4th')) return "4";
    if (title.toLowerCase().includes('5th')) return "5";
    if (title.toLowerCase().includes('6th')) return "6";
    return "1";
  };
  
  const internalId = getInternalId();

  // Use local data as primary to ensure instant loading
  const localSubjects = (ACADEMIC_CURRICULUM[internalId] || []).map((s, idx) => {
    let subjectId = "";
    subjectId = `s-${internalId}-${idx}`;
    
    return {
      _id: subjectId,
      title: s
    };
  });

  const [subjects, setSubjects] = useState(localSubjects);
  const [loading, setLoading] = useState(false); // Never show loading for pre-loaded curriculum
  const [pinnedSubjectIds, setPinnedSubjectIds] = useState([]);
  
  const [showPinTutorial, setShowPinTutorial] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loadPinnedSubjects = async () => {
      try {
        const key = `samu_mcq_pinned_subjects_${internalId}`;
        const value = await AsyncStorage.getItem(key);
        if (value) {
          setPinnedSubjectIds(JSON.parse(value));
        } else {
          setPinnedSubjectIds([]);
        }
      } catch (e) {
        console.log('Error loading pinned subjects:', e.message);
      }
    };
    loadPinnedSubjects();

    const checkTutorial = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem('hasSeenPinTutorial');
        if (!hasSeen) {
          setShowPinTutorial(true);
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnim, { toValue: 1.25, duration: 600, useNativeDriver: true }),
              Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true })
            ])
          ).start();
        }
      } catch (e) {
        console.log('Error checking pin tutorial:', e.message);
      }
    };
    checkTutorial();
  }, [internalId]);

  const togglePin = async (subjectId) => {
    try {
      if (showPinTutorial) {
        setShowPinTutorial(false);
        await AsyncStorage.setItem('hasSeenPinTutorial', 'true');
        pulseAnim.stopAnimation();
      }

      const key = `samu_mcq_pinned_subjects_${internalId}`;
      let updated = [...pinnedSubjectIds];
      if (updated.includes(subjectId)) {
        updated = updated.filter(id => id !== subjectId);
      } else {
        if (updated.length >= 3) {
          Alert.alert(
            "Limit Reached",
            "You can pin up to 3 subjects per course. Please unpin another subject first.",
            [{ text: "OK" }]
          );
          return;
        }
        updated.push(subjectId);
      }
      setPinnedSubjectIds(updated);
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.log('Error toggling pin:', e.message);
    }
  };

  const displayedSubjects = [
    ...subjects.filter(s => pinnedSubjectIds.includes(s._id)),
    ...subjects.filter(s => !pinnedSubjectIds.includes(s._id))
  ];

  // NOTE: We intentionally do NOT fetch subjects from the server.
  // The server returns UUID-based subject IDs that would break the topic/question
  // ID chain which depends on local keys like s-2-1, s-1-10, etc.
  // All subjects are served from the local ACADEMIC_CURRICULUM mapping.

  const handleSubjectPress = (item) => {
    if (!isSubscribed) {
      Alert.alert(
        "Subscription Required",
        "Please subscribe to unlock access to all courses and content.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Subscribe Now", onPress: () => navigation.navigate('Subscription') }
        ]
      );
    } else {
      navigation.navigate('Topic', { 
        subjectId: item._id,      // local repo key (e.g. s-2-1)
        localSubjectId: item._id, // explicitly pass local key
        title: item.title, 
        courseTitle: title 
      });
    }
  };

  const renderItem = ({ item, index }) => {
    const originalIndex = localSubjects.findIndex(s => s._id === item._id);
    const isPinned = pinnedSubjectIds.includes(item._id);
    const isFirstItem = index === 0;

    return (
      <View style={[styles.subjectCard, isPinned && styles.subjectCardPinned]}>
        <TouchableOpacity 
          style={styles.subjectCardMain}
          onPress={() => handleSubjectPress(item)}
        >
          <View style={styles.subjectInfo}>
            <View style={[styles.numberBadge, isPinned && styles.numberBadgePinned]}>
              <Text style={[styles.numberText, isPinned && styles.numberTextPinned]}>
                {(originalIndex + 1).toString().padStart(2, '0')}
              </Text>
            </View>
            <Text style={styles.subjectTitle} numberOfLines={2}>{item.title}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.rightActions}>
          <TouchableOpacity 
            style={[styles.pinButton, isPinned && styles.pinButtonActive]} 
            onPress={() => togglePin(item._id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPinTutorial && isFirstItem ? (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pin size={16} color={isPinned ? "#2563EB" : "#EF4444"} fill={isPinned ? "#2563EB" : "none"} />
              </Animated.View>
            ) : (
              <Pin size={16} color={isPinned ? "#2563EB" : "#94A3B8"} fill={isPinned ? "#2563EB" : "none"} />
            )}
            
            {showPinTutorial && isFirstItem && (
               <View style={styles.tutorialPopup}>
                  <Text style={styles.tutorialText}>You can pin subject from here</Text>
                  <View style={styles.tutorialArrow} />
               </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.arrowCircle}
            onPress={() => handleSubjectPress(item)}
          >
            {isSubscribed ? (
              <ChevronRight size={18} color="#2563EB" />
            ) : (
              <Lock size={16} color="#EF4444" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{title.toUpperCase()}</Text>
          </View>
          <Text style={styles.headerTitle}>Curriculum Library</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Syncing Subject Data...</Text>
        </View>
      ) : (
        <FlatList
          data={displayedSubjects}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <BookOpen size={64} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Module Empty</Text>
              <Text style={styles.emptySubtitle}>We are currently updating the clinical repository for this module.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  headerTitleContainer: { flex: 1 },
  badge: { 
    backgroundColor: '#EFF6FF', 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6, 
    alignSelf: 'flex-start', 
    marginBottom: 4 
  },
  badgeText: { fontSize: 10, color: '#2563EB', fontWeight: '900', letterSpacing: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  listContent: { padding: 20, paddingBottom: 40 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 15, color: '#64748B', fontWeight: '700', fontSize: 15 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 25 },
  emptySubtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 10, lineHeight: 24, paddingHorizontal: 20 },
  subjectCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 30, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 16, 
    elevation: 3, 
    shadowColor: '#64748B', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  subjectCardPinned: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
  },
  subjectCardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 10,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
    gap: 12,
  },
  pinButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  pinButtonActive: {
    backgroundColor: '#DBEAFE',
  },
  numberBadgePinned: {
    backgroundColor: '#2563EB',
  },
  numberTextPinned: {
    color: '#FFF',
  },
  subjectInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 15 },
  numberBadge: { 
    width: 44, 
    height: 44, 
    borderRadius: 15, 
    backgroundColor: '#F1F5F9', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 18 
  },
  numberText: { color: '#2563EB', fontWeight: '900', fontSize: 16 },
  subjectTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', flex: 1, lineHeight: 24 },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tutorialPopup: {
    position: 'absolute',
    bottom: 45,
    right: -20,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    width: 140,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  tutorialText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18
  },
  tutorialArrow: {
    position: 'absolute',
    bottom: -6,
    right: 32,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1E293B'
  }
});

export default SubjectScreen;
