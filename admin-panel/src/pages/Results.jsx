import React, { useState, useMemo } from 'react';
import { 
  Search, FileSpreadsheet, Download, Award, Clock, 
  Users, CheckCircle2, XCircle, ChevronRight, BookOpen, GraduationCap
} from 'lucide-react';
import biochemistryResults from '../data/biochemistry_results.json';

const Results = () => {
  const [selectedSubject, setSelectedSubject] = useState('biochem_2026');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterGroup, setFilterGroup] = useState('all');

  // List of subjects
  const subjects = [
    {
      id: 'biochem_2026',
      name: 'Biochemistry 2026',
      faculty: 'Faculty of International Students',
      course: '2 course',
      examType: 'YAKUNIY NAZORAT',
      language: 'English',
      qaydnoma: '7059 / 19.05.2026',
      date: '19.05.2026',
      active: true
    },
    {
      id: 'anatomy_2026',
      name: 'Clinical Anatomy 2026',
      faculty: 'Faculty of International Students',
      course: '2 course',
      examType: 'YAKUNIY NAZORAT',
      language: 'English',
      qaydnoma: 'Pending',
      date: 'TBD',
      active: false
    },
    {
      id: 'physio_2026',
      name: 'Physiology 2026',
      faculty: 'Faculty of International Students',
      course: '2 course',
      examType: 'YAKUNIY NAZORAT',
      language: 'English',
      qaydnoma: 'Pending',
      date: 'TBD',
      active: false
    }
  ];

  // Groups list for filter dropdown
  const groups = useMemo(() => {
    if (selectedSubject !== 'biochem_2026') return [];
    const allGroups = biochemistryResults.map(r => r.group);
    return ['all', ...new Set(allGroups)].sort();
  }, [selectedSubject]);

  // Statistics
  const stats = useMemo(() => {
    if (selectedSubject !== 'biochem_2026') return null;
    const total = biochemistryResults.length;
    const scores = biochemistryResults.map(r => r.score).filter(s => s !== null);
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const highest = Math.max(...scores);
    const passed = biochemistryResults.filter(r => r.score >= 60).length;
    const failed = total - passed;
    const passRate = (passed / total) * 100;

    return {
      total,
      avg: avg.toFixed(1),
      highest,
      passed,
      failed,
      passRate: passRate.toFixed(1)
    };
  }, [selectedSubject]);

  // Handle Sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and Sort results
  const filteredResults = useMemo(() => {
    if (selectedSubject !== 'biochem_2026') return [];
    
    return biochemistryResults
      .filter(row => {
        const matchesSearch = row.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            row.group.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGroup = filterGroup === 'all' || row.group === filterGroup;
        return matchesSearch && matchesGroup;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'string') {
          return sortDirection === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        } else {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
      });
  }, [selectedSubject, searchTerm, sortField, sortDirection, filterGroup]);

  const activeSubjectInfo = subjects.find(s => s.id === selectedSubject);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <GraduationCap className="text-indigo-500 w-9 h-9" />
            Exam Results
          </h2>
          <p className="text-slate-500 font-medium mt-1">View and filter subject-wise academic performance records</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <FileSpreadsheet size={18} />
            Export Excel
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download size={18} />
            Download Report
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar: Subject List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Published Subjects</h3>
          <div className="space-y-2">
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-start justify-between border ${
                  selectedSubject === sub.id
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10'
                    : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className={selectedSubject === sub.id ? 'text-indigo-400' : 'text-slate-400'} />
                    <span className="font-bold text-sm">{sub.name}</span>
                  </div>
                  <p className={`text-[11px] font-medium ${selectedSubject === sub.id ? 'text-slate-400' : 'text-slate-400'}`}>
                    {sub.faculty}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                      sub.active 
                        ? (selectedSubject === sub.id ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600')
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {sub.active ? 'Published' : 'Pending'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">{sub.course}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="mt-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-8">
          {selectedSubject === 'biochem_2026' ? (
            <>
              {/* Exam Info Card */}
              <div className="glass-card p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">Exam Name</p>
                    <h4 className="text-xl font-extrabold mt-1">{activeSubjectInfo.examType}</h4>
                    <p className="text-xs text-slate-400 mt-1">{activeSubjectInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">Faculty / Course</p>
                    <h4 className="text-sm font-bold mt-2">{activeSubjectInfo.faculty}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{activeSubjectInfo.course} ({activeSubjectInfo.language})</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">Qaydnoma (Record ID)</p>
                    <h4 className="text-sm font-bold mt-2 font-mono">{activeSubjectInfo.qaydnoma}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Official Registry Date</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">Published On</p>
                    <h4 className="text-sm font-bold mt-2">{activeSubjectInfo.date}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Automatic DB Sync</p>
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-5 bg-white border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Users size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Students</p>
                      <h4 className="text-xl font-bold text-slate-900 mt-0.5">{stats.total}</h4>
                    </div>
                  </div>

                  <div className="glass-card p-5 bg-white border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pass Rate</p>
                      <h4 className="text-xl font-bold text-emerald-600 mt-0.5">{stats.passRate}%</h4>
                    </div>
                  </div>

                  <div className="glass-card p-5 bg-white border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                      <Award size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Average Score</p>
                      <h4 className="text-xl font-bold text-slate-900 mt-0.5">{stats.avg} / 100</h4>
                    </div>
                  </div>

                  <div className="glass-card p-5 bg-white border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Award size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Highest Score</p>
                      <h4 className="text-xl font-bold text-slate-900 mt-0.5">{stats.highest} / 100</h4>
                    </div>
                  </div>
                </div>
              )}

              {/* Table Toolbar */}
              <div className="glass-card bg-white border border-slate-100">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/30">
                  
                  {/* Search Box */}
                  <div className="relative w-full md:w-80">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search student name or group..." 
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Filter Group */}
                  <div className="flex gap-3 w-full md:w-auto">
                    <select
                      className="bg-white border border-slate-200 rounded-xl text-sm font-bold p-2 focus:outline-none focus:ring-2 focus:ring-slate-900 w-full md:w-44"
                      value={filterGroup}
                      onChange={(e) => setFilterGroup(e.target.value)}
                    >
                      <option value="all">All Groups</option>
                      {groups.filter(g => g !== 'all').map(g => (
                        <option key={g} value={g}>{g.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/10">
                        <th 
                          onClick={() => handleSort('name')}
                          className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors"
                        >
                          Ism / Familiya {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th 
                          onClick={() => handleSort('group')}
                          className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors"
                        >
                          Guruh (Group) {sortField === 'group' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th 
                          onClick={() => handleSort('startTime')}
                          className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors"
                        >
                          Boshlangan {sortField === 'startTime' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th 
                          className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest"
                        >
                          Tugatilgan
                        </th>
                        <th 
                          className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest"
                        >
                          Sarflangan vaqt
                        </th>
                        <th 
                          onClick={() => handleSort('score')}
                          className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors"
                        >
                          Baho/100 {sortField === 'score' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">
                          Natija (Status)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.length > 0 ? (
                        filteredResults.map((row, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center font-bold text-sm">
                                  {row.name.charAt(0)}
                                </div>
                                <span className="font-bold text-slate-900">{row.name}</span>
                              </div>
                            </td>
                            <td className="p-5">
                              <span className="font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                {row.group}
                              </span>
                            </td>
                            <td className="p-5 text-sm font-medium text-slate-600">
                              {row.startTime}
                            </td>
                            <td className="p-5 text-sm font-medium text-slate-600">
                              {row.endTime}
                            </td>
                            <td className="p-5 text-sm font-medium text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Clock size={14} className="text-slate-400" />
                                {row.duration}
                              </div>
                            </td>
                            <td className="p-5">
                              <span className="font-extrabold text-sm text-slate-900">
                                {row.score !== null ? row.score.toFixed(1) : '-'}
                              </span>
                            </td>
                            <td className="p-5 text-right">
                              {row.score !== null ? (
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  row.score >= 60 
                                    ? 'bg-emerald-100 text-emerald-600' 
                                    : 'bg-rose-100 text-rose-600'
                                }`}>
                                  {row.score >= 60 ? 'Passed' : 'Failed'}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-400">
                                  N/A
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="p-10 text-center text-slate-400 font-medium">
                            No student results found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-12 text-center bg-white border border-slate-100 space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Clock size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-950">Natijalar tayyorlanmoqda (Results Pending)</h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  The exam results for {activeSubjectInfo.name} are currently being processed. Once the Qaydnoma is official, results will be published here.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Results;
