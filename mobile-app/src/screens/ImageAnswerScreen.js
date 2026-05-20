import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ArrowLeft, Camera, Image as ImageIcon, Sparkles, CircleCheck, Info, ChevronRight, RotateCw, FlipHorizontal, FlipVertical, Trash2, Zap } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { API_URL, ENDPOINTS } from '../config/Constants';

const ImageAnswerScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [manipulating, setManipulating] = useState(false);
  const [result, setResult] = useState(null);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera access to scan medical diagrams.');
      return false;
    }
    return true;
  };

  const pickImage = async (useCamera = false) => {
    let result;
    try {
      if (useCamera) {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.8,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setResult(null);
      }
    } catch (e) {
      Alert.alert("Picker Error", "Could not open camera or gallery.");
    }
  };

  const rotateImage = async () => {
    if (!image) return;
    setManipulating(true);
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        image,
        [{ rotate: 90 }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      setImage(manipResult.uri);
    } catch (error) {
      Alert.alert("Error", "Could not rotate image.");
    } finally {
      setManipulating(false);
    }
  };

  const flipImage = async (horizontal = true) => {
    if (!image) return;
    setManipulating(true);
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        image,
        [{ flip: horizontal ? ImageManipulator.FlipType.Horizontal : ImageManipulator.FlipType.Vertical }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      setImage(manipResult.uri);
    } catch (error) {
      Alert.alert("Error", "Could not flip image.");
    } finally {
      setManipulating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setAnalyzing(true);
    setResult(null);
    
    try {
      const finalManip = await ImageManipulator.manipulateAsync(
        image,
        [],
        { compress: 0.2, base64: true }
      );
      
      const base64 = finalManip.base64;
      const url = ENDPOINTS.AI_SCAN || `${API_URL}/ai/analyze-image`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      setResult({
        ...data,
        source: data.source || 'Medical Brain v1',
        path: data.path || 'Clinical Diagnostic'
      });
    } catch (error) {
      Alert.alert("Analysis Error", "Could not process image. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Clinical Scanner</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!image && !analyzing && (
          <>
            <View style={[styles.introCard, { backgroundColor: isDarkMode ? '#1E293B' : '#EEF2FF' }]}>
              <View style={styles.sparkleBox}>
                <Sparkles size={28} color="#6366F1" />
              </View>
              <Text style={[styles.introTitle, { color: colors.text }]}>Medical AI Vision</Text>
              <Text style={[styles.introDesc, { color: colors.textSecondary }]}>
                Snap a photo of any diagram, scan, or question for professional clinical analysis.
              </Text>
            </View>

            <View style={[styles.actionGrid]}>
              <TouchableOpacity style={[styles.scanBtn, { backgroundColor: colors.surface }]} onPress={() => pickImage(true)}>
                <View style={[styles.iconCirc, { backgroundColor: '#F0FDF4' }]}>
                  <Camera size={28} color="#10B981" />
                </View>
                <Text style={[styles.btnLabel, { color: colors.text }]}>Launch Camera</Text>
                <Text style={styles.btnSub}>Capture diagram</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.scanBtn, { backgroundColor: colors.surface }]} onPress={() => pickImage(false)}>
                <View style={[styles.iconCirc, { backgroundColor: '#EFF6FF' }]}>
                  <ImageIcon size={28} color="#3B82F6" />
                </View>
                <Text style={[styles.btnLabel, { color: colors.text }]}>Open Gallery</Text>
                <Text style={styles.btnSub}>Select from storage</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {image && !analyzing && (
          <View style={styles.previewCard}>
            <View style={styles.imageHeader}>
               <Text style={[styles.imageHeaderText, { color: colors.textSecondary }]}>SCAN PREVIEW</Text>
               <TouchableOpacity onPress={() => setImage(null)}>
                  <Trash2 size={20} color="#EF4444" />
               </TouchableOpacity>
            </View>
            
            <Image source={{ uri: image }} style={styles.previewImg} />
            
            <View style={[styles.toolsBar, { borderTopColor: colors.border }]}>
               <TouchableOpacity style={styles.toolBtn} onPress={rotateImage}>
                  <RotateCw size={20} color="#6366F1" />
                  <Text style={styles.toolLabel}>Rotate</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.toolBtn} onPress={() => flipImage(true)}>
                  <FlipHorizontal size={20} color="#3B82F6" />
                  <Text style={styles.toolLabel}>Flip H</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.toolBtn} onPress={() => flipImage(false)}>
                  <FlipVertical size={20} color="#8B5CF6" />
                  <Text style={styles.toolLabel}>Flip V</Text>
               </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.analyzeBtn, { backgroundColor: colors.primary }]} 
              onPress={handleAnalyze}
              disabled={manipulating}
            >
              <Zap size={22} color="#FFF" />
              <Text style={styles.analyzeBtnText}>START CLINICAL ANALYSIS</Text>
            </TouchableOpacity>
          </View>
        )}

        {analyzing && (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Clinical Brain is analyzing image data...</Text>
            <Text style={styles.loaderSubText}>Extracting text and searching medical database...</Text>
          </View>
        )}

        {result && (
          <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
            <View style={styles.resultHeader}>
               <CircleCheck size={20} color="#10B981" />
               <Text style={styles.resultStatus}>ANALYSIS COMPLETE</Text>
            </View>

            <View style={[styles.pathTag, { backgroundColor: isDarkMode ? '#334155' : '#F8FAFC' }]}>
               <Text style={[styles.pathText, { color: colors.textSecondary }]}>{result.path}</Text>
            </View>

            {result.course && (
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>COURSE</Text>
                  <Text style={[styles.metaVal, { color: colors.text }]}>{result.course}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>SUBJECT</Text>
                  <Text style={[styles.metaVal, { color: colors.text }]}>{result.subject}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>TOPIC NO.</Text>
                  <Text style={[styles.metaVal, { color: colors.text }]}>{result.topicNo}</Text>
                </View>
              </View>
            )}

            <View style={[{ backgroundColor: colors.questionBg, padding: 16, borderRadius: 16, marginBottom: 20 }]}>
              <Text style={[styles.questionFound, { color: colors.questionText, marginBottom: 0 }]}>{result.question}</Text>
            </View>

            <View style={styles.answerSection}>
               <Text style={styles.answerLabel}>SUGGESTED ANSWER</Text>
               <Text style={styles.answerVal}>{result.answer}</Text>
            </View>

            <View style={[styles.rationaleBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F0F9FF' }]}>
               <View style={styles.rationaleHead}>
                  <Info size={16} color="#0EA5E9" />
                  <Text style={styles.rationaleTitle}>Clinical Rationale</Text>
               </View>
               <Text style={[styles.rationaleText, { color: colors.textSecondary }]}>{result.explanation}</Text>
            </View>
            
            <TouchableOpacity style={styles.saveBtn}>
               <Text style={styles.saveBtnText}>Save to Study Vault</Text>
               <ChevronRight size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', height: 80, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 20 },
  introCard: { padding: 30, borderRadius: 32, alignItems: 'center', marginBottom: 25 },
  sparkleBox: { width: 60, height: 60, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  introTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  introDesc: { fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  scanBtn: { width: '47%', padding: 20, borderRadius: 24, alignItems: 'center', elevation: 3, shadowOpacity: 0.1 },
  iconCirc: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  btnLabel: { fontSize: 14, fontWeight: 'bold' },
  btnSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  previewCard: { marginBottom: 25, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFF', elevation: 4 },
  imageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#F8FAFC' },
  imageHeaderText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  previewImg: { width: '100%', height: 350, resizeMode: 'contain', backgroundColor: '#000' },
  toolsBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 15, borderTopWidth: 1 },
  toolBtn: { alignItems: 'center', gap: 5 },
  toolLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748B' },
  analyzeBtn: { margin: 15, height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 2 },
  analyzeBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  loaderBox: { alignItems: 'center', padding: 40 },
  loaderText: { marginTop: 15, fontSize: 13, fontWeight: '500' },
  loaderSubText: { marginTop: 5, fontSize: 11, color: '#94A3B8' },
  resultCard: { padding: 25, borderRadius: 32, elevation: 4, shadowOpacity: 0.1, marginBottom: 30 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  resultStatus: { color: '#10B981', fontSize: 12, fontWeight: 'bold', marginLeft: 10, letterSpacing: 1 },
  pathTag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 15 },
  pathText: { fontSize: 11, fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 10 },
  metaItem: { flex: 1, backgroundColor: '#F8FAFC', padding: 10, borderRadius: 12, alignItems: 'center' },
  metaLabel: { fontSize: 8, fontWeight: 'bold', color: '#94A3B8', marginBottom: 4 },
  metaVal: { fontSize: 11, fontWeight: 'bold' },
  questionFound: { fontSize: 16, fontWeight: 'bold', lineHeight: 24, marginBottom: 20 },
  answerSection: { backgroundColor: '#DCFCE7', padding: 20, borderRadius: 20, marginBottom: 20 },
  answerLabel: { fontSize: 10, fontWeight: 'bold', color: '#166534', marginBottom: 5 },
  answerVal: { fontSize: 22, fontWeight: 'bold', color: '#166534' },
  rationaleBox: { padding: 20, borderRadius: 20, marginBottom: 25 },
  rationaleHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rationaleTitle: { fontSize: 14, fontWeight: 'bold', color: '#0EA5E9', marginLeft: 10 },
  rationaleText: { fontSize: 14, lineHeight: 22 },
  saveBtn: { backgroundColor: '#6366F1', height: 56, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', marginRight: 10 }
});

export default ImageAnswerScreen;
