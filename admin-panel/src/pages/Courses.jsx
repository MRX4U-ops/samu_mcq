import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Plus, Search } from 'lucide-react';
import { fetchCourses } from '../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCourses = async () => {
      const data = await fetchCourses();
      setCourses(data);
      setLoading(false);
    };
    getCourses();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Courses & Subjects</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your academic content structure</p>
        </div>
        <button className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={20} className="mr-2" />
          Add New Course
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter courses..." 
              className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {courses.length} Total Courses
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading courses...</div>
          ) : courses.map((course) => (
            <div key={course._id} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg">
                  {course.title.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.subjectCount || 0} Subjects available</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">ACTIVE</span>
                <ChevronRight className="text-gray-300 group-hover:text-indigo-400 transition-colors" size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
