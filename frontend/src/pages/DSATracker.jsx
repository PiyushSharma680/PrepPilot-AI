import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Code2, Plus, ExternalLink, Flame, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';

const TOPICS = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming', 'Backtracking', 'Stack / Queue', 'Sorting', 'Binary Search', 'Greedy', 'Math'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const PLATFORMS = ['LeetCode', 'Codeforces', 'CodeChef', 'HackerRank', 'HackerEarth', 'GeeksForGeeks', 'Other'];

const diffColor = {
  Easy:   { badge: 'badge-green', bar: 'bg-green-500' },
  Medium: { badge: 'badge-amber', bar: 'bg-amber-500' },
  Hard:   { badge: 'badge-red',   bar: 'bg-red-500' },
};

const DSATracker = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    problemName: '',
    difficulty: 'Medium',
    topic: 'Arrays',
    platform: 'LeetCode',
    problemUrl: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [histRes, recRes] = await Promise.all([
        api.get('/dsa'),
        api.get('/dsa/recommendations'),
      ]);
      setHistory(histRes.data);
      setRecommendations(recRes.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load DSA data';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.problemName.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/dsa', form);
      toast.success(`Logged: ${form.problemName}`);
      setForm({ problemName: '', difficulty: 'Medium', topic: 'Arrays', platform: 'LeetCode', problemUrl: '' });
      await fetchData();
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log problem');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (log) => {
    const confirmed = window.confirm(`Delete "${log.problemName}" from your DSA history?`);
    if (!confirmed) return;

    try {
      await api.delete(`/dsa/${log._id}`);
      toast.info('Problem removed');
      await fetchData();
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete problem');
    }
  };

  // Stats
  const easy   = history.filter(h => h.difficulty === 'Easy').length;
  const medium = history.filter(h => h.difficulty === 'Medium').length;
  const hard   = history.filter(h => h.difficulty === 'Hard').length;
  const total  = history.length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner spinner-lg" />
    </div>
  );

  if (error) return (
    <div className="p-6 max-w-md mx-auto py-16 text-center space-y-4">
      <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
      <p className="text-sm text-red-500">{error}</p>
      <button className="btn btn-secondary" onClick={fetchData}>
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-600" /> DSA Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Log solved problems, maintain your streak, and get personalized recommendations.
          </p>
        </div>
        {(user?.dsaStreak || 0) > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-semibold text-amber-700">{user.dsaStreak} day streak</span>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Solved', value: total, color: 'text-slate-800' },
          { label: 'Easy',   value: easy,   color: 'text-green-600' },
          { label: 'Medium', value: medium, color: 'text-amber-600' },
          { label: 'Hard',   value: hard,   color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Log Form */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" /> Log a Problem
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Problem Name *</label>
                <input
                  type="text"
                  required
                  value={form.problemName}
                  onChange={e => setForm({ ...form, problemName: e.target.value })}
                  placeholder="e.g. Two Sum"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Difficulty</label>
                  <select className="input" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Topic</label>
                  <select className="input" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}>
                    {TOPICS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Platform</label>
                <select className="input" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Problem URL <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="url"
                  value={form.problemUrl}
                  onChange={e => setForm({ ...form, problemUrl: e.target.value })}
                  placeholder="https://leetcode.com/problems/..."
                  className="input"
                />
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                {submitting ? <><div className="spinner spinner-sm" /> Saving…</> : 'Log Problem'}
              </button>
            </form>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="card p-5 space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm">Recommended Next</h3>
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-100">
                    <div>
                      <p className="text-xs font-medium text-slate-700">{rec.problemName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`badge ${diffColor[rec.difficulty]?.badge || 'badge-gray'}`}>{rec.difficulty}</span>
                        <span className="text-[10px] text-slate-400">{rec.topic}</span>
                      </div>
                    </div>
                    <a
                      href={`https://leetcode.com/problems/${rec.problemName.toLowerCase().replace(/\s+/g, '-')}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost p-1.5 rounded"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">Solve History</h3>
            <p className="text-xs text-slate-400 mt-0.5">{total} problem{total !== 1 ? 's' : ''} logged</p>
          </div>

          {history.length === 0 ? (
            <div className="empty-state">
              <Code2 className="w-8 h-8" />
              <h3>No problems logged yet</h3>
              <p>Start tracking your solving progress. Log your first problem using the form on the left.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Topic</th>
                    <th>Difficulty</th>
                    <th>Platform</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(log => (
                    <tr key={log._id}>
                      <td className="font-medium text-slate-800">{log.problemName}</td>
                      <td className="text-slate-500">{log.topic}</td>
                      <td>
                        <span className={`badge ${diffColor[log.difficulty]?.badge || 'badge-gray'}`}>
                          {log.difficulty}
                        </span>
                      </td>
                      <td className="text-slate-500">{log.platform}</td>
                      <td className="text-slate-400">
                        {new Date(log.solvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          {log.problemUrl && (
                            <a
                              href={log.problemUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Open problem"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            title="Delete problem"
                            onClick={() => handleDelete(log)}
                            className="text-slate-300 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DSATracker;
