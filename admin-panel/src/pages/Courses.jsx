import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Search, Layers, RefreshCw, Folder } from 'lucide-react';
import adminService from '../services/adminService';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const data = await adminService.getFullAcademicHierarchy();
      if (Array.isArray(data) && data.length > 0) {
        setCourses(data);
        setSelectedCourse(data[0]);
        if (data[0].subjects?.length > 0) {
          setSelectedSubject(data[0].subjects[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Academic Content Hierarchy</h2>
          <p className="text-slate-500 text-sm mt-0.5">Explore 6 Courses, 128 Subjects, and 1,930 Verified Topics</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/mcq-editor"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-xs transition-colors"
          >
            <span>Open Live MCQ Editor →</span>
          </Link>
          <button
            onClick={fetchHierarchy}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-xs"
            title="Refresh"
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
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">1. Courses (Years 1–6)</span>
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
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              2. Subjects ({selectedCourse?.subjects?.length || 0})
            </span>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 p-2 space-y-1">
            {(selectedCourse?.subjects || []).map(subject => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject)}
                className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
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
                <ChevronRight size={14} className={selectedSubject?.id === subject.id ? 'text-white' : 'text-slate-400'} />
              </button>
            ))}
          </div>
        </div>

        {/* Column 3: Topics */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[70vh]">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              3. Topics ({selectedSubject?.topics?.length || 0})
            </span>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 p-2 space-y-1">
            {(selectedSubject?.topics || []).map((topic, tIdx) => (
              <div
                key={topic.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs font-semibold text-slate-800 flex items-center justify-between"
              >
                <div className="truncate pr-2">
                  <span className="text-slate-400 mr-2 text-[11px] font-bold">#{tIdx + 1}</span>
                  <span>{topic.title}</span>
                </div>
                <Link
                  to="/mcq-editor"
                  className="px-2 py-1 bg-white border border-slate-200 hover:border-indigo-400 text-indigo-600 rounded-md text-[10px] font-bold shrink-0 transition-colors"
                >
                  Edit MCQs
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
