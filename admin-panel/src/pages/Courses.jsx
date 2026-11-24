import React, { useState, useEffect } from 'react';
import { 
  BookOpen, ChevronRight, Search, Layers, RefreshCw, Folder,
  Plus, Edit2, Trash2, RotateCcw, AlertTriangle, CheckCircle2,
  AlertCircle, X, ShieldAlert, Sparkles, FolderPlus, FilePlus
} from 'lucide-react';
import adminService from '../services/adminService';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [notification, setNotification] = useState(null);

  // Recycle Bin State
  const [showBinModal, setShowBinModal] = useState(false);
  const [binItems, setBinItems] = useState([]);
  const [binLoading, setBinLoading] = useState(false);

  // Add / Edit Modal State
  const [modalType, setModalType] = useState(null); // 'addSubject' | 'editSubject' | 'addTopic' | 'editTopic'
  const [modalData, setModalData] = useState({ title: '', courseId: '', subjectId: '', id: '' });
  const [modalLoading, setModalLoading] = useState(false);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const data = await adminService.getFullAcademicHierarchy();
      if (Array.isArray(data) && data.length > 0) {
        setCourses(data);
        const currCourse = selectedCourse ? data.find(c => c.id === selectedCourse.id) || data[0] : data[0];
        setSelectedCourse(currCourse);
        if (currCourse.subjects?.length > 0) {
          const currSub = selectedSubject ? currCourse.subjects.find(s => s.id === selectedSubject.id) || currCourse.subjects[0] : currCourse.subjects[0];
          setSelectedSubject(currSub);
        } else {
          setSelectedSubject(null);
        }
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
      showToast('Failed to load academic curriculum', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBinItems = async () => {
    try {
      setBinLoading(true);
      const items = await adminService.getRecycleBinItems();
      setBinItems(items || []);
    } catch (err) {
      console.error('Failed to load recycle bin:', err);
    } finally {
      setBinLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
    fetchBinItems();
  }, []);

  // ── Subject Handlers ──
  const handleOpenAddSubject = () => {
    setModalData({ title: '', courseId: selectedCourse?.id || courses[0]?.id || '' });
    setModalType('addSubject');
  };

  const handleOpenEditSubject = (subject, e) => {
    e.stopPropagation();
    setModalData({ id: subject.id, title: subject.title || subject.name, courseId: selectedCourse?.id });
    setModalType('editSubject');
  };

  const handleMoveSubjectToBin = async (subject, e) => {
    e.stopPropagation();
    if (!window.confirm(`Move Subject '${subject.title || subject.name}' to Recycle Bin?\n\nIt will be hidden from students, but you can restore it from the Recycle Bin at any time.`)) {
      return;
    }
    try {
      await adminService.moveSubjectToBin(subject.id, subject.title || subject.name);
      showToast(`Subject '${subject.title || subject.name}' moved to Recycle Bin.`);
      fetchHierarchy();
      fetchBinItems();
    } catch (err) {
      showToast(err.message || 'Failed to move subject to bin', 'error');
    }
  };

  // ── Topic Handlers ──
  const handleOpenAddTopic = () => {
    if (!selectedSubject) {
      showToast('Please select a subject first.', 'error');
      return;
    }
    setModalData({ title: '', subjectId: selectedSubject.id });
    setModalType('addTopic');
  };

  const handleOpenEditTopic = (topic, e) => {
    e.stopPropagation();
    setModalData({ id: topic.id, title: topic.title || topic.name, subjectId: selectedSubject?.id });
    setModalType('editTopic');
  };

  const handleMoveTopicToBin = async (topic, e) => {
    e.stopPropagation();
    if (!window.confirm(`Move Topic '${topic.title || topic.name}' to Recycle Bin?\n\nYou can restore it from the Recycle Bin at any time.`)) {
      return;
    }
    try {
      await adminService.moveTopicToBin(topic.id, topic.title || topic.name);
      showToast(`Topic '${topic.title || topic.name}' moved to Recycle Bin.`);
      fetchHierarchy();
      fetchBinItems();
    } catch (err) {
      showToast(err.message || 'Failed to move topic to bin', 'error');
    }
  };

  // ── Submit Add / Edit Form ──
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalData.title.trim()) {
      showToast('Title is required.', 'error');
      return;
    }

    try {
      setModalLoading(true);
      if (modalType === 'addSubject') {
        await adminService.createSubject({ courseId: modalData.courseId, title: modalData.title });
        showToast('Subject created successfully!');
      } else if (modalType === 'editSubject') {
        await adminService.updateSubject(modalData.id, { title: modalData.title });
        showToast('Subject updated successfully!');
      } else if (modalType === 'addTopic') {
        await adminService.createTopic({ subjectId: modalData.subjectId, title: modalData.title });
        showToast('Topic created successfully!');
      } else if (modalType === 'editTopic') {
        await adminService.updateTopic(modalData.id, { title: modalData.title });
        showToast('Topic updated successfully!');
      }
      setModalType(null);
      fetchHierarchy();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // ── Recycle Bin Actions ──
  const handleRestoreItem = async (item) => {
    try {
      if (item.itemType === 'subject') {
        await adminService.restoreSubjectFromBin(item.id, item.title);
        showToast(`Subject '${item.cleanTitle}' restored to active curriculum!`);
      } else {
        await adminService.restoreTopicFromBin(item.id, item.title);
        showToast(`Topic '${item.cleanTitle}' restored to active curriculum!`);
      }
      fetchBinItems();
      fetchHierarchy();
    } catch (err) {
      showToast(err.message || 'Failed to restore item', 'error');
    }
  };

  const handleDeletePermanently = async (item) => {
    const warning = item.itemType === 'subject'
      ? `PERMANENTLY DELETE Subject '${item.cleanTitle}'?\n\n⚠️ WARNING: This will permanently purge this subject, all its topics, and all associated MCQs from the database! This action CANNOT be undone.`
      : `PERMANENTLY DELETE Topic '${item.cleanTitle}'?\n\n⚠️ WARNING: This will permanently purge this topic and all its MCQs from the database! This action CANNOT be undone.`;

    if (!window.confirm(warning)) {
      return;
    }

    try {
      if (item.itemType === 'subject') {
        await adminService.deleteSubjectPermanently(item.id);
        showToast(`Subject '${item.cleanTitle}' permanently deleted.`);
      } else {
        await adminService.deleteTopicPermanently(item.id);
        showToast(`Topic '${item.cleanTitle}' permanently deleted.`);
      }
      fetchBinItems();
      fetchHierarchy();
    } catch (err) {
      showToast(err.message || 'Failed to permanently delete item', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold ${
          notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
        } animate-in slide-in-from-top duration-200`}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="text-indigo-600" size={28} />
            Academic Content Hierarchy
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Full control to Add, Edit, Move to Bin, Restore, and Delete Subjects & Topics
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Add Subject Button */}
          <button
            onClick={handleOpenAddSubject}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-xs transition-colors"
          >
            <FolderPlus size={15} />
            <span>+ Add Subject</span>
          </button>

          {/* Add Topic Button */}
          <button
            onClick={handleOpenAddTopic}
            disabled={!selectedSubject}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-xs transition-colors"
          >
            <FilePlus size={15} />
            <span>+ Add Topic</span>
          </button>

          {/* Recycle Bin Button */}
          <button
            onClick={() => {
              setShowBinModal(true);
              fetchBinItems();
            }}
            className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-colors"
            title="Open Recycle Bin"
          >
            <Trash2 size={15} />
            <span>Recycle Bin ({binItems.length})</span>
          </button>

          <button
            onClick={() => {
              fetchHierarchy();
              fetchBinItems();
            }}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-xs"
            title="Refresh Curriculum"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 3-Column Explorer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Courses */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[70vh]">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              1. Courses (Years 1–6)
            </span>
            <span className="text-xs font-bold text-indigo-600">{courses.length}</span>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 p-2 space-y-1">
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => {
                  setSelectedCourse(course);
                  setSelectedSubject(course.subjects?.[0] || null);
                }}
                className={`w-full text-left p-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  selectedCourse?.id === course.id 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    selectedCourse?.id === course.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {course.title.charAt(0)}
                  </div>
                  <span className="truncate">{course.title}</span>
                </div>
                <ChevronRight size={14} className={selectedCourse?.id === course.id ? 'text-white' : 'text-slate-400'} />
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Subjects */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[70vh]">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                2. Subjects ({selectedCourse?.subjects?.length || 0})
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate block">
                In {selectedCourse?.title}
              </span>
            </div>
            <button
              onClick={handleOpenAddSubject}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg"
            >
              <Plus size={13} /> Add
            </button>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 p-2 space-y-1">
            {(selectedCourse?.subjects || []).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                No subjects in this course yet.<br />
                <button onClick={handleOpenAddSubject} className="mt-2 text-indigo-600 font-bold hover:underline">
                  + Add the first subject
                </button>
              </div>
            ) : (
              (selectedCourse?.subjects || []).map(subject => (
                <div
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer group ${
                    selectedSubject?.id === subject.id 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="block truncate">{subject.title}</span>
                    <span className={`text-[10px] font-medium ${selectedSubject?.id === subject.id ? 'text-slate-300' : 'text-slate-400'}`}>
                      {subject.topics?.length || 0} Topics
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Edit Subject */}
                    <button
                      onClick={(e) => handleOpenEditSubject(subject, e)}
                      className={`p-1.5 rounded-lg opacity-80 hover:opacity-100 transition-opacity ${
                        selectedSubject?.id === subject.id ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200 text-slate-600'
                      }`}
                      title="Rename Subject"
                    >
                      <Edit2 size={13} />
                    </button>

                    {/* Move to Bin */}
                    <button
                      onClick={(e) => handleMoveSubjectToBin(subject, e)}
                      className={`p-1.5 rounded-lg opacity-80 hover:opacity-100 transition-opacity text-rose-500 ${
                        selectedSubject?.id === subject.id ? 'hover:bg-rose-500/30' : 'hover:bg-rose-100'
                      }`}
                      title="Move Subject to Bin"
                    >
                      <Trash2 size={13} />
                    </button>

                    <ChevronRight size={14} className={selectedSubject?.id === subject.id ? 'text-white ml-1' : 'text-slate-400 ml-1'} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Topics */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[70vh]">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                3. Topics ({selectedSubject?.topics?.length || 0})
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate block">
                In {selectedSubject?.title || 'No Subject Selected'}
              </span>
            </div>
            <button
              onClick={handleOpenAddTopic}
              disabled={!selectedSubject}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-40 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg"
            >
              <Plus size={13} /> Add
            </button>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 p-2 space-y-1">
            {!selectedSubject ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                Please select a subject to view and manage its topics.
              </div>
            ) : (selectedSubject.topics || []).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                No topics in this subject yet.<br />
                <button onClick={handleOpenAddTopic} className="mt-2 text-indigo-600 font-bold hover:underline">
                  + Add the first topic
                </button>
              </div>
            ) : (
              (selectedSubject.topics || []).map((topic, tIdx) => (
                <div
                  key={topic.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs font-semibold text-slate-800 flex items-center justify-between group hover:border-indigo-200 transition-all"
                >
                  <div className="truncate pr-2">
                    <span className="text-slate-400 mr-2 text-[11px] font-bold">#{tIdx + 1}</span>
                    <span className="truncate">{topic.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      to="/mcq-editor"
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-indigo-400 text-indigo-600 rounded-md text-[10px] font-bold shrink-0 transition-colors"
                      title="Edit MCQs in this topic"
                    >
                      MCQs
                    </Link>

                    {/* Edit Topic */}
                    <button
                      onClick={(e) => handleOpenEditTopic(topic, e)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                      title="Rename Topic"
                    >
                      <Edit2 size={13} />
                    </button>

                    {/* Move to Bin */}
                    <button
                      onClick={(e) => handleMoveTopicToBin(topic, e)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 transition-colors"
                      title="Move Topic to Bin"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL: ADD / EDIT SUBJECT OR TOPIC ── */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                {modalType.startsWith('add') ? <Plus size={18} className="text-indigo-600" /> : <Edit2 size={18} className="text-indigo-600" />}
                {modalType === 'addSubject' && 'Add New Subject'}
                {modalType === 'editSubject' && 'Edit Subject Name'}
                {modalType === 'addTopic' && 'Add New Topic'}
                {modalType === 'editTopic' && 'Edit Topic Name'}
              </h3>
              <button 
                onClick={() => setModalType(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 pt-4">
              {modalType === 'addSubject' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Target Course
                  </label>
                  <select
                    value={modalData.courseId}
                    onChange={(e) => setModalData({ ...modalData, courseId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {modalType.includes('Subject') ? 'Subject Title' : 'Topic Title'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={modalType.includes('Subject') ? 'e.g. Clinical Pharmacology' : 'e.g. Valvular Heart Diseases'}
                  value={modalData.title}
                  onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || !modalData.title.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {modalLoading ? 'Saving...' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RECYCLE BIN (RESTORE & PERMANENT DELETE) ── */}
      {showBinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Academic Recycle Bin</h3>
                  <p className="text-xs text-slate-500">Deleted subjects & topics stay here until permanently deleted</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBinModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
              {binLoading ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-indigo-600" />
                  <span>Loading Recycle Bin items...</span>
                </div>
              ) : binItems.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Trash2 size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-bold text-slate-600">Recycle Bin is Empty</p>
                  <p className="text-xs text-slate-400 mt-1">No deleted subjects or topics.</p>
                </div>
              ) : (
                binItems.map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        item.itemType === 'subject' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.itemType}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">{item.cleanTitle}</div>
                        <div className="text-[10px] text-slate-400 font-medium">In {item.parentName}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Restore Button */}
                      <button
                        onClick={() => handleRestoreItem(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
                        title="Restore item back to curriculum"
                      >
                        <RotateCcw size={13} />
                        <span>Restore</span>
                      </button>

                      {/* Permanent Delete Button */}
                      <button
                        onClick={() => handleDeletePermanently(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
                        title="Delete permanently from database"
                      >
                        <Trash2 size={13} />
                        <span>Delete Permanently</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>{binItems.length} item{binItems.length !== 1 ? 's' : ''} in Bin</span>
              <button
                onClick={() => setShowBinModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;