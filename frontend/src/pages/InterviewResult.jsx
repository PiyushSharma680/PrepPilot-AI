import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { AlertCircle, ArrowLeft, Award, CheckCircle, RefreshCw, RotateCcw } from 'lucide-react';

const InterviewResult = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResult = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/interview/${interviewId}`);
      setInterview(response.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load interview result';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResult(); }, [interviewId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <p className="text-sm text-red-500">{error}</p>
        <button className="btn btn-secondary" onClick={fetchResult}>
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const score = interview?.overallScore ?? 0;
  const scoreColor = score >= 75 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link to="/interview" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to interviews
          </Link>
          <h1 className="page-title flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" /> Interview Result
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {interview.type} / {interview.category || 'General'} completed on {new Date(interview.updatedAt || interview.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button className="btn btn-primary self-start sm:self-auto" onClick={() => navigate('/interview')}>
          <RotateCcw className="w-4 h-4" /> Start New Session
        </button>
      </div>

      <div className="card p-6 sm:p-8 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 mx-auto">
          <Award className="w-7 h-7 text-blue-600" />
        </div>
        <div className={`text-5xl font-bold ${scoreColor}`}>
          {score}<span className="text-2xl text-slate-400">/100</span>
        </div>
        <p className="text-sm text-slate-500">Overall score from {interview.questions?.length || 0} answered questions.</p>
      </div>

      {interview.improvementAreas?.length > 0 && (
        <div className="card p-5 space-y-3">
          <p className="section-label">Improvement Areas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {interview.improvementAreas.map((item, index) => (
              <div key={index} className="flex gap-2 text-sm text-slate-600 p-3 bg-slate-50 rounded-md border border-slate-100">
                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="section-label">Question Review</p>
        </div>
        <div className="divide-y divide-slate-100">
          {(interview.questions || []).map((item, index) => (
            <div key={`${item.question}-${index}`} className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-800">Q{index + 1}. {item.question}</h2>
                <span className={`badge ${(item.score || 0) >= 70 ? 'badge-green' : (item.score || 0) >= 50 ? 'badge-amber' : 'badge-red'}`}>
                  {item.score || 0}/100
                </span>
              </div>
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-md p-3 whitespace-pre-wrap">
                {item.userAnswer}
              </p>
              <p className="text-sm text-slate-500">{item.feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewResult;
