import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  FileText, UploadCloud, AlertCircle, RefreshCw,
  CheckCircle, AlertTriangle, Search, ChevronRight
} from 'lucide-react';

const ScoreRing = ({ score }) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} strokeWidth="6" fill="none" className="ring-track" />
        <circle
          cx="42" cy="42" r={r} strokeWidth="6" fill="none"
          stroke={color} strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-800">{score}</span>
        <span className="text-[9px] text-slate-400 uppercase">ATS</span>
      </div>
    </div>
  );
};

const ResumeAnalyzer = () => {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fetchHistory = async () => {
    setFetching(true);
    try {
      const res = await api.get('/resume');
      setHistory(res.data);
      if (res.data.length > 0 && !analysis) {
        setAnalysis(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load resume history', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysis(res.data);
      setFile(null);
      toast.success('Resume analyzed successfully!');
      await fetchHistory();
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') {
      setFile(f);
    } else {
      toast.warning('Please upload a PDF file');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> Resume Analyzer
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your resume for ATS scoring, missing skills detection, and improvement suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Upload + History */}
        <div className="space-y-4">
          {/* Upload card */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm">Upload Resume</h3>

            {error && (
              <div className="flex gap-2 items-start p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-3">
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${dragOver ? 'text-blue-500' : 'text-slate-300'}`} />
                <p className="text-xs font-medium text-slate-600">
                  {file ? file.name : 'Click or drag PDF here'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">PDF only · Max 10MB</p>
              </div>

              {file && (
                <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-md text-xs">
                  <span className="text-blue-700 font-medium truncate">{file.name}</span>
                  <span className="text-blue-400 shrink-0 ml-2">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              )}

              <button type="submit" disabled={!file || loading} className="btn btn-primary w-full">
                {loading
                  ? <><div className="spinner spinner-sm" /> Analyzing…</>
                  : 'Analyze Resume'
                }
              </button>
            </form>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="card p-4 space-y-2">
              <p className="section-label">Previous Scans</p>
              <div className="space-y-1.5">
                {history.map(h => (
                  <div
                    key={h._id}
                    onClick={() => setAnalysis(h)}
                    className={`flex items-center justify-between p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                      analysis?._id === h._id
                        ? 'bg-blue-50 border-blue-200'
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-slate-700 font-medium truncate">{h.filename}</span>
                    <span className={`font-bold shrink-0 ml-2 ${
                      h.atsScore >= 75 ? 'text-green-600' :
                      h.atsScore >= 50 ? 'text-amber-600' : 'text-red-500'
                    }`}>{h.atsScore}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Analysis Result */}
        <div className="lg:col-span-2">
          {fetching && (
            <div className="card flex items-center justify-center h-64">
              <div className="spinner spinner-lg" />
            </div>
          )}

          {!fetching && !analysis && (
            <div className="card">
              <div className="empty-state">
                <FileText className="w-10 h-10" />
                <h3>No resume analyzed</h3>
                <p>Upload a PDF resume to get your ATS score, missing skills, and tailored improvement suggestions.</p>
              </div>
            </div>
          )}

          {!fetching && analysis && (
            <div className="card p-6 space-y-6">
              {/* Score header */}
              <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
                <ScoreRing score={analysis.atsScore} />
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-800 text-base truncate">{analysis.filename}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Scanned {new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`badge ${
                      analysis.atsScore >= 75 ? 'badge-green' :
                      analysis.atsScore >= 50 ? 'badge-amber' : 'badge-red'
                    }`}>
                      {analysis.atsScore >= 75 ? 'Good ATS Fit' : analysis.atsScore >= 50 ? 'Needs Work' : 'Low Match'}
                    </span>
                    <span className="text-xs text-slate-400">ATS alignment score</span>
                  </div>
                </div>
              </div>

              {/* Two-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Missing Skills */}
                <div>
                  <p className="section-label flex items-center gap-1.5 mb-3">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Missing Skills
                  </p>
                  {analysis.missingSkills?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missingSkills.map((s, i) => (
                        <span key={i} className="badge badge-amber">+ {s}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No missing skills detected.</p>
                  )}
                </div>

                {/* Keyword Optimization */}
                <div>
                  <p className="section-label flex items-center gap-1.5 mb-3">
                    <Search className="w-3.5 h-3.5 text-blue-500" /> Keyword Tips
                  </p>
                  <ul className="space-y-1.5">
                    {analysis.keywordOptimization?.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Improvements */}
              {analysis.improvements?.length > 0 && (
                <div>
                  <p className="section-label flex items-center gap-1.5 mb-3">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Improvements
                  </p>
                  <ul className="space-y-2">
                    {analysis.improvements.map((imp, i) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600 p-2.5 bg-slate-50 rounded-md border border-slate-100">
                        <span className="text-green-500 shrink-0">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Grammar */}
              {analysis.grammarSuggestions?.length > 0 && (
                <div>
                  <p className="section-label flex items-center gap-1.5 mb-3">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Language & Grammar
                  </p>
                  <ul className="space-y-2">
                    {analysis.grammarSuggestions.map((s, i) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600 p-2.5 bg-red-50 rounded-md border border-red-100">
                        <span className="text-red-400 shrink-0">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
