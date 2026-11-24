import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Edit3, Plus, Trash2, 
  Save, Eye, CheckCircle2, AlertCircle, Loader2,
  ChevronRight, ArrowLeft, RefreshCw
} from 'lucide-react';
import adminService from '../services/adminService';

const McqEditor = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('all'); // 'all' or topic object
  const [taskType, setTaskType] = useState('all'); // all, test_question, situational_task
  const [hierarchyLoading, setHierarchyLoading] = useState(true);

  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  // Edit / Add Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMcq, setEditingMcq] = useState(null); // null if adding new
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: ''
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Load course hierarchy
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setHierarchyLoading(true);
        const data = await adminService.getFullAcademicHierarchy();
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
          // Find first course & subject with questions, e.g. "Medical chemistry" or first available
          let defaultCourse = data[0];
          let defaultSub = defaultCourse.subjects?.[0] || null;
          for (const c of data) {
            const found = c.subjects?.find(s => 
              s.title?.toLowerCase().includes('chemistry') || 
              s.title?.toLowerCase().includes('biochemistry') || 
              s.title?.toLowerCase().includes('anatomy') ||
              s.title?.toLowerCase().includes('biology')
            );
            if (found) {
              defaultCourse = c;
              defaultSub = found;
              break;
            }
          }
          setSelectedCourse(defaultCourse);
          setSelectedSubject(defaultSub);
          setSelectedTopic('all');
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setHierarchyLoading(false);
      }
    };
    loadCourses();
  }, []);

  // When subject changes, reset topic to 'all'
  useEffect(() => {
    if (selectedSubject) {
      setSelectedTopic('all');
    }
  }, [selectedSubject]);

  // When topic, subject, or taskType changes, fetch MCQs
  useEffect(() => {
    if (selectedSubject) {
      fetchMcqs();
    }
  }, [selectedSubject, selectedTopic, taskType]);

  const fetchMcqs = async () => {
    if (!selectedSubject) return;
    try {
      setLoading(true);
      let targetTopicId;
      if (selectedTopic === 'all') {
        targetTopicId = (selectedSubject.topics || []).map(t => t.id);
      } else if (selectedTopic?.id) {
        targetTopicId = selectedTopic.id;
      } else {
        setMcqs([]);
        return;
      }
      const data = await adminService.getMcqs(targetTopicId, taskType === 'all' ? null : taskType);
      setMcqs(data || []);
    } catch (err) {
      console.error('Failed to fetch MCQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open Edit Modal
  const handleEditClick = (mcq) => {
    setEditingMcq(mcq);
    setFormData({
      question: mcq.question,
      options: Array.isArray(mcq.options) ? [...mcq.options] : ['', '', '', ''],
      correctIndex: mcq.correct_index || 0,
      explanation: mcq.explanation || ''
    });
    setPreviewMode(false);
    setShowEditModal(true);
  };

  // Open Add Modal
  const handleAddClick = () => {
    setEditingMcq(null);
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    });
    setPreviewMode(false);
    setShowEditModal(true);
  };

  // Save (Create or Update)
  const handleSaveMcq = async (e) => {
    e.preventDefault();
    const targetTopic = selectedTopic === 'all' ? selectedSubject?.topics?.[0] : selectedTopic;
    if (!targetTopic?.id && !editingMcq) {
      showToast('Please select a topic to add this question to.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const typeToSave = taskType === 'all' ? 'test_question' : taskType;
      if (editingMcq) {
        // Update
        const updated = await adminService.saveMcq({
          id: editingMcq.id,
          question: formData.question,
          options: formData.options,
          correct_index: formData.correctIndex,
          explanation: formData.explanation,
          task_type: typeToSave
        });
        setMcqs(mcqs.map(m => m.id === editingMcq.id ? updated : m));
        showToast('MCQ updated live in database!');
      } else {
        // Create
        const created = await adminService.saveMcq({
          topic_id: targetTopic.id,
          question: formData.question,
          options: formData.options,
          correct_index: formData.correctIndex,
          explanation: formData.explanation,
          task_type: typeToSave
        });
        setMcqs([created, ...mcqs]);
        showToast('New MCQ created live!');
      }
      setShowEditModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save MCQ', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete MCQ
  const handleDeleteMcq = async (mcqId) => {
    if (!window.confirm('Are you sure you want to delete this question from the database?')) {
      return;
    }
    try {
      await adminService.deleteMcq(mcqId);
      setMcqs(mcqs.filter(m => m.id !== mcqId));
      showToast('MCQ deleted.');
    } catch (err) {
      showToast(err.message || 'Failed to delete MCQ', 'error');
    }
  };

  const filtered = mcqs.filter(m => 
    (m.question || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold ${notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'} animate-in slide-in-from-top duration-200`}>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live In-App MCQ Editor</h2>
          <p className="text-slate-500 text-sm mt-0.5">Edit questions, choices, and explanations in real time without APK update</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMcqs}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-xs"
            title="Refresh MCQs"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleAddClick}
            disabled={!selectedTopic}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus size={16} />
            <span>Add New Question</span>
          </button>
        </div>
      </div>

      {/* Navigation Cascade: Course -> Subject -> Topic */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {hierarchyLoading ? (
          <div className="p-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
            <Loader2 className="animate-spin text-indigo-600" size={16} />
            <span>Loading academic curriculum (Courses, Subjects, Topics)...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Course Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                1. Select Course
              </label>
              <select
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedCourse?.id || ''}
                onChange={(e) => {
                  const c = courses.find(item => item.id === e.target.value);
                  setSelectedCourse(c || null);
                  setSelectedSubject(c?.subjects?.[0] || null);
                }}
              >
                <option value="">-- Choose Course --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title || c.name}</option>
                ))}
              </select>
            </div>

            {/* 2. Subject Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                2. Select Subject ({(selectedCourse?.subjects || []).length} available)
              </label>
              <select
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedSubject?.id || ''}
                onChange={(e) => {
                  const s = selectedCourse?.subjects?.find(item => item.id === e.target.value);
                  setSelectedSubject(s || null);
                }}
              >
                <option value="">-- Choose Subject --</option>
                {(selectedCourse?.subjects || []).map(s => (
                  <option key={s.id} value={s.id}>{s.title || s.name}</option>
                ))}
              </select>
            </div>

            {/* 3. Topic Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                3. Select Topic
              </label>
              <select
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedTopic === 'all' ? 'all' : (selectedTopic?.id || '')}
                onChange={(e) => {
                  if (e.target.value === 'all') {
                    setSelectedTopic('all');
                  } else {
                    const t = selectedSubject?.topics?.find(item => item.id === e.target.value);
                    setSelectedTopic(t || null);
                  }
                }}
              >
                <option value="all">★ All Topics in this Subject ({(selectedSubject?.topics || []).length} Topics)</option>
                {(selectedSubject?.topics || []).map(t => (
                  <option key={t.id} value={t.id}>{t.title || t.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Task Type Switcher & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTaskType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                taskType === 'all' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Questions ({mcqs.length})
            </button>
            <button
              onClick={() => setTaskType('test_question')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                taskType === 'test_question' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Test Questions
            </button>
            <button
              onClick={() => setTaskType('situational_task')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                taskType === 'situational_task' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Situational Tasks (Clinical Cases)
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search in questions..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* MCQs List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center text-slate-400">
            <Loader2 className="animate-spin text-indigo-600 mx-auto mb-3" size={28} />
            <p className="text-sm font-bold">Loading questions for selected topic...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center text-slate-400">
            <p className="text-sm font-bold">No questions found in this topic and task type.</p>
            <button
              onClick={handleAddClick}
              className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
            >
              + Click here to add the first question
            </button>
          </div>
        ) : (
          filtered.map((mcq, idx) => (
            <div 
              key={mcq.id || idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-bold text-slate-900 leading-snug">{mcq.question}</p>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                  {(mcq.options || []).map((opt, oIdx) => {
                    const isCorrect = oIdx === mcq.correct_index;
                    return (
                      <div 
                        key={oIdx}
                        className={`p-2.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                          isCorrect 
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-bold' 
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="truncate">{opt.replace(/^(\*)?[a-zA-Z][\.\)]\s*/, '')}</span>
                      </div>
                    );
                  })}
                </div>

                {mcq.explanation && (
                  <div className="pl-8 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong className="text-indigo-600">Explanation:</strong> {mcq.explanation}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center md:flex-col gap-2 shrink-0 md:pt-1">
                <button
                  onClick={() => handleEditClick(mcq)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteMcq(mcq.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Question"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── LIVE MCQ EDIT / CREATE MODAL ── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {editingMcq ? 'Edit Live MCQ' : 'Create New MCQ'}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedSubject?.title} • {selectedTopic?.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                <Eye size={14} />
                <span>{previewMode ? 'Back to Edit' : 'Preview Student View'}</span>
              </button>
            </div>

            {previewMode ? (
              /* Preview View */
              <div className="space-y-4 my-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Mobile Student Preview</span>
                <p className="text-base font-bold text-slate-900">{formData.question || 'Question title...'}</p>
                <div className="space-y-2 mt-4">
                  {formData.options.map((opt, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-xl border text-xs font-semibold ${
                        i === formData.correctIndex
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="mr-2 font-black">{String.fromCharCode(65 + i)})</span>
                      <span>{opt || `Option ${String.fromCharCode(65 + i)}`}</span>
                      {i === formData.correctIndex && <span className="ml-2 text-emerald-600 font-black">✓ Correct</span>}
                    </div>
                  ))}
                </div>
                {formData.explanation && (
                  <p className="text-xs text-slate-600 mt-2">
                    <strong>Explanation:</strong> {formData.explanation}
                  </p>
                )}
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={handleSaveMcq} className="space-y-4 mt-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1">Question Text *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter complete clinical / test question text..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-600">
                    Options & Correct Answer Selection (Choose radio for correct choice)
                  </label>
                  {formData.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctIndex === oIdx}
                        onChange={() => setFormData({ ...formData, correctIndex: oIdx })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <span className="w-5 text-center font-black text-slate-500">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}...`}
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...formData.options];
                          newOpts[oIdx] = e.target.value;
                          setFormData({ ...formData, options: newOpts });
                        }}
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOpts = formData.options.filter((_, i) => i !== oIdx);
                            setFormData({
                              ...formData,
                              options: newOpts,
                              correctIndex: Math.min(formData.correctIndex, newOpts.length - 1)
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.options.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, options: [...formData.options, ''] })}
                      className="text-xs font-bold text-indigo-600 hover:underline pl-7"
                    >
                      + Add Option {String.fromCharCode(65 + formData.options.length)}
                    </button>
                  )}
                </div>

                <div>
                  <label className="block mb-1">Explanation (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Provide medical explanation or reference..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>{editingMcq ? 'Save Live Changes' : 'Publish Question'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default McqEditor;
