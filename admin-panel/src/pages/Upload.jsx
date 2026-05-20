import React, { useState, useEffect } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { fetchCourses } from '../services/api';

const Upload = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'

  useEffect(() => {
    fetchCourses().then(setCourses);
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedCourse) return;

    setUploading(true);
    setStatus(null);

    // Mocking the upload process for now
    setTimeout(() => {
      setUploading(false);
      setStatus('success');
      setFile(null);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Bulk MCQ Upload</h2>
        <p className="text-sm text-gray-500 mt-1">Upload DOCX or PDF files to automatically import questions</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <form onSubmit={handleUpload} className="space-y-6">
          {/* Course Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Select Target Course</label>
            <select 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              required
            >
              <option value="">-- Choose a Course --</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
          </div>

          {/* File Upload Zone */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Upload File (DOCX / PDF)</label>
            <div className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors ${file ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
              <UploadIcon size={48} className={file ? 'text-indigo-500' : 'text-gray-300'} />
              <div className="mt-4 text-center">
                <label className="cursor-pointer">
                  <span className="text-indigo-600 font-bold hover:underline">Click to upload</span>
                  <input type="file" className="hidden" onChange={handleFileChange} accept=".docx,.pdf" />
                </label>
                <p className="text-xs text-gray-400 mt-1">Supported formats: .docx, .pdf (Max 10MB)</p>
              </div>
              {file && (
                <div className="mt-4 flex items-center p-2 bg-white rounded-lg border border-indigo-100">
                  <FileText size={18} className="text-indigo-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={!file || !selectedCourse || uploading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${(!file || !selectedCourse || uploading) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
          >
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Processing File...</span>
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                <span>Start Import</span>
              </>
            )}
          </button>
        </form>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg flex items-center text-green-700">
            <CheckCircle size={20} className="mr-3" />
            <span className="text-sm font-medium">Successfully imported 45 MCQs to the database!</span>
          </div>
        )}
        {status === 'error' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center text-red-700">
            <AlertCircle size={20} className="mr-3" />
            <span className="text-sm font-medium">Failed to parse the file. Please check the PDF format guide.</span>
          </div>
        )}
      </div>

      {/* Guide Link */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
        <h4 className="font-bold text-gray-700 mb-2">💡 Pro Tip:</h4>
        <p className="text-sm text-gray-500 leading-relaxed">
          Ensure your questions are formatted correctly in the document. The system looks for questions followed by options starting with <code className="bg-white px-1 rounded border">=</code> for correct and <code className="bg-white px-1 rounded border">~</code> for wrong.
        </p>
      </div>
    </div>
  );
};

export default Upload;
