import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, 
  Loader2, ArrowRight, RefreshCw, Eye
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import adminService from '../services/adminService';

const BulkUpload = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [taskType, setTaskType] = useState('test_question');

  const [rawText, setRawText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await adminService.getFullAcademicHierarchy();
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
          setSelectedCourse(data[0]);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse?.subjects?.length > 0) {
      setSelectedSubject(selectedCourse.subjects[0]);
    } else {
      setSelectedSubject(null);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedSubject?.topics?.length > 0) {
      setSelectedTopic(selectedSubject.topics[0]);
    } else {
      setSelectedTopic(null);
    }
  }, [selectedSubject]);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Parser logic supporting all university formats
  const handleParse = () => {
    if (!rawText.trim()) return;
    setIsParsing(true);

    try {
      const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !/^_{3,}$/.test(l));
      const questions = [];
      let currentQ = null;
      let currentOptions = [];
      let correctIndex = -1;

      const finalize = () => {
        if (!currentQ || currentOptions.length === 0) return;
        questions.push({
          question: currentQ.replace(/^\d+[\.\)]\s*/, '').trim(),
          options: currentOptions,
          correctIndex: correctIndex === -1 ? 0 : correctIndex
        });
        currentQ = null;
        currentOptions = [];
        correctIndex = -1;
      };

      for (const line of lines) {
        // Skip header lines
        if (/^t\.s\/\s*(?:\d+\s*mavzu|mavzu\s*\d+)/i.test(line)) continue;

        // Check option: e.g. "A)", "*A)", "A.", "*A.", "✅ Correct answer: A"
        const optMatch = line.match(/^(\*)?([A-Ea-e])[\)\.]\s*(.*)$/);
        const ansMatch = line.match(/^[✅✔️]?\s*(?:Correct answer|Правильный ответ):\s*([A-Ea-e])/i);

        if (ansMatch) {
          const letter = ansMatch[1].toUpperCase();
          const lIdx = letter.charCodeAt(0) - 65;
          if (lIdx >= 0 && lIdx < currentOptions.length) {
            correctIndex = lIdx;
          }
        } else if (optMatch) {
          const isCorrect = !!optMatch[1];
          const letter = optMatch[2].toUpperCase();
          const text = optMatch[3].trim();
          if (isCorrect) correctIndex = currentOptions.length;
          currentOptions.push(text);
        } else {
          // If we had options collected, next line means next question started!
          if (currentOptions.length > 0) {
            finalize();
          }
          if (!currentQ) currentQ = line;
          else currentQ += ' ' + line;
        }
      }
      finalize();

      setParsedQuestions(questions);
      showToast(`Successfully parsed ${questions.length} questions! Review below.`);
    } catch (err) {
      showToast('Error parsing questions. Please check format.', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  // Publish to Database
  const handlePublish = async () => {
    if (!selectedTopic || parsedQuestions.length === 0) return;
    setIsPublishing(true);
    try {
      await adminService.bulkInsertMcqs(selectedTopic.id, parsedQuestions, taskType);
      showToast(`Published ${parsedQuestions.length} MCQs directly to live database!`);
      setParsedQuestions([]);
      setRawText('');
    } catch (err) {
      showToast(err.message || 'Failed to publish MCQs', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold ${notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'} animate-in slide-in-from-top duration-200`}>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bulk MCQ Import & Parser</h2>
        <p className="text-slate-500 text-sm mt-0.5">Paste raw exam questions in any format (DOCX, TXT, OCR) to parse and batch-publish</p>
      </div>

      {/* Destination Target */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Course</label>
          <select
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            value={selectedCourse?.id || ''}
            onChange={(e) => setSelectedCourse(courses.find(c => c.id == e.target.value))}
          >
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Subject</label>
          <select
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            value={selectedSubject?.id || ''}
            onChange={(e) => setSelectedSubject(selectedCourse?.subjects?.find(s => s.id == e.target.value))}
          >
            {(selectedCourse?.subjects || []).map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Topic</label>
          <select
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            value={selectedTopic?.id || ''}
            onChange={(e) => setSelectedTopic(selectedSubject?.topics?.find(t => t.id == e.target.value))}
          >
            {(selectedSubject?.topics || []).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Task Type</label>
          <select
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
          >
            <option value="test_question">Test Question</option>
            <option value="situational_task">Situational Task</option>
          </select>
        </div>
      </div>

      {/* Paste / Upload Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900">Paste Raw Question Text</label>
          <button
            onClick={handleParse}
            disabled={!rawText.trim() || isParsing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            {isParsing ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
            <span>Parse & Preview Questions</span>
          </button>
        </div>

        <textarea
          rows={10}
          placeholder={`Paste unformatted questions here, for example:
1. What is the most common imaging method for head trauma?
A) MRI
B) Ultrasound
*C) CT
D) PET

Or format with:
✅ Correct answer: C`}
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />
      </div>

      {/* Parsed Preview Section */}
      {parsedQuestions.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Parsed Questions Preview ({parsedQuestions.length} Ready to Publish)
              </h3>
              <p className="text-xs text-slate-500">
                Destination: {selectedCourse?.title} → {selectedSubject?.title} → {selectedTopic?.title}
              </p>
            </div>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              <span>Publish All {parsedQuestions.length} Questions to Database</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {parsedQuestions.map((q, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <p className="font-bold text-slate-900">
                  <span className="text-indigo-600 mr-2">{idx + 1}.</span>
                  {q.question}
                </p>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  {q.options.map((opt, oIdx) => (
                    <div 
                      key={oIdx}
                      className={`p-2 rounded-lg border ${
                        oIdx === q.correctIndex 
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold' 
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="font-bold mr-1.5">{String.fromCharCode(65 + oIdx)})</span>
                      <span>{opt}</span>
                      {oIdx === q.correctIndex && <span className="ml-2 text-emerald-600">✓ Correct</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
