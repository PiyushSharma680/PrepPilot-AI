import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  ArrowRight,
  BarChart2,
  CheckCircle,
  Clock,
  Code2,
  FileText,
  Flame,
  Map,
  RefreshCw,
  TrendingUp,
  Video
} from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const derivePhase = (metrics) => {
  if (!metrics) return { label: 'Loading', color: 'text-slate-500', path: '/', cta: null };

  const dsaTotal = metrics.dsaCount?.total || 0;
  const roadmapComplete = metrics.hasRoadmap && metrics.activeRoadmapProgress >= 100;

  if (!metrics.hasResume) {
    return { label: 'Resume Preparation', color: 'text-amber-600', path: '/resume', cta: 'Upload Resume' };
  }
  if ((metrics.resumeScore || 0) < 75) {
    return { label: 'Resume Improvement', color: 'text-amber-600', path: '/resume', cta: 'Improve Resume' };
  }
  if (metrics.hasActiveInterview || !metrics.hasCompletedInterview) {
    return { label: 'Interview Practice', color: 'text-blue-600', path: '/interview', cta: 'Practice Interview' };
  }
  if (metrics.hasRoadmap && !roadmapComplete) {
    return { label: 'Follow Study Plan', color: 'text-indigo-600', path: '/roadmaps', cta: 'View Roadmap' };
  }
  if (dsaTotal < 30) {
    return { label: 'DSA Revision', color: 'text-green-600', path: '/dsa', cta: 'Track DSA' };
  }

  return { label: 'Placement Ready', color: 'text-green-600', path: '/', cta: null };
};

const StatCard = ({ icon: Icon, label, value, sub, onClick, color = 'text-slate-700', iconBg = 'bg-slate-100' }) => (
  <button
    type="button"
    className="card p-4 flex items-start gap-3 text-left hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
    onClick={onClick}
  >
    <span className={`p-2 rounded-md ${iconBg} shrink-0`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-xs text-slate-500 leading-none">{label}</span>
      <span className={`block text-xl font-bold mt-1 leading-none ${value === '—' ? 'text-slate-300' : 'text-slate-800'}`}>
        {value}
      </span>
      {sub && <span className="block text-[11px] text-slate-400 mt-1">{sub}</span>}
    </span>
    <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-1" />
  </button>
);

const EmptyDashboard = ({ navigate }) => (
  <div className="card p-8 text-center space-y-5">
    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto">
      <BarChart2 className="w-7 h-7 text-blue-500" />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-slate-800">No preparation data yet</h2>
      <p className="text-sm text-slate-500 mt-2">
        Upload a resume, complete your first mock interview, or start solving DSA problems to build your dashboard.
      </p>
    </div>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button className="btn btn-primary" onClick={() => navigate('/resume')}>
        <FileText className="w-4 h-4" /> Upload Resume
      </button>
      <button className="btn btn-secondary" onClick={() => navigate('/dsa')}>
        <Code2 className="w-4 h-4" /> Start DSA Tracker
      </button>
      <button className="btn btn-secondary" onClick={() => navigate('/interview')}>
        <Video className="w-4 h-4" /> Mock Interview
      </button>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/auth/dashboard');
      setMetrics(response.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load dashboard';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const phase = useMemo(() => derivePhase(metrics), [metrics]);
  const resumeScore = metrics?.resumeScore ?? 0;
  const avgInterviewScore = metrics?.avgInterviewScore ?? 0;
  const dsaCount = metrics?.dsaCount ?? { total: 0, easy: 0, medium: 0, hard: 0 };
  const streak = metrics?.dsaStreak ?? 0;
  const recentActivity = metrics?.recentActivity ?? [];
  const dsaActivityByDate = metrics?.dsaActivityByDate ?? {};
  const readiness = metrics?.readinessScore ?? 0;
  const hasAnyData = Boolean(
    metrics?.hasResume ||
    metrics?.hasRoadmap ||
    metrics?.completedInterviewsCount ||
    metrics?.activeInterviewsCount ||
    metrics?.notesCount ||
    dsaCount.total
  );

  const radarData = {
    labels: ['DSA', 'System Design', 'Interview', 'Resume', 'CS Theory', 'Communication'],
    datasets: [{
      label: 'Your Profile',
      data: [
        Math.min(100, Math.round((dsaCount.total / 30) * 100)),
        metrics?.hasRoadmap ? Math.min(100, metrics.activeRoadmapProgress || 0) : 0,
        avgInterviewScore,
        resumeScore,
        0,
        avgInterviewScore
      ],
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      borderColor: '#2563eb',
      borderWidth: 2,
      pointBackgroundColor: '#2563eb',
      pointRadius: 3
    }]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: '#e2e8f0' },
        grid: { color: '#f1f5f9' },
        pointLabels: { color: '#64748b', font: { size: 11, family: 'Inter' } },
        ticks: { display: false },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: { legend: { display: false } }
  };

  const renderHeatmap = () => {
    const cells = [];
    const today = new Date();
    for (let i = 55; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const count = dsaActivityByDate[key] || 0;
      let bg = 'bg-slate-100';
      if (count >= 1) bg = 'bg-blue-200';
      if (count >= 2) bg = 'bg-blue-400';
      if (count >= 3) bg = 'bg-blue-600';

      cells.push(
        <div
          key={key}
          className={`heatmap-cell ${bg}`}
          title={`${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${count} solved`}
        />
      );
    }
    return cells;
  };

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
        <p className="text-sm text-red-500">{error}</p>
        <button className="btn btn-secondary" onClick={fetchData}>
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Your placement readiness overview.</p>
        </div>
        <button className="btn btn-ghost text-xs self-start sm:self-auto" onClick={fetchData}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-l-4 border-l-blue-500">
        <div>
          <p className="section-label">Current Phase</p>
          <p className={`text-base font-semibold mt-0.5 ${phase.color}`}>{phase.label}</p>
        </div>
        {phase.cta && (
          <button className="btn btn-primary text-xs self-start sm:self-auto" onClick={() => navigate(phase.path)}>
            {phase.cta} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {!hasAnyData && <EmptyDashboard navigate={navigate} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Flame}
          label="DSA Streak"
          value={streak > 0 ? `${streak}d` : '—'}
          sub={streak > 0 ? 'Current streak' : 'No streak yet'}
          onClick={() => navigate('/dsa')}
          color="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          icon={FileText}
          label="Resume Score"
          value={resumeScore > 0 ? `${resumeScore}%` : '—'}
          sub={resumeScore > 0 ? 'ATS alignment' : 'No resume uploaded'}
          onClick={() => navigate('/resume')}
          color="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          icon={Video}
          label="Interview Avg"
          value={avgInterviewScore > 0 ? `${avgInterviewScore}%` : '—'}
          sub={avgInterviewScore > 0 ? 'Completed interviews' : 'No interviews completed'}
          onClick={() => navigate('/interview')}
          color="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          icon={Code2}
          label="DSA Solved"
          value={dsaCount.total > 0 ? dsaCount.total : '—'}
          sub={dsaCount.total > 0 ? `${dsaCount.easy}E / ${dsaCount.medium}M / ${dsaCount.hard}H` : 'Start solving'}
          onClick={() => navigate('/dsa')}
          color="text-green-600"
          iconBg="bg-green-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 flex flex-col items-center gap-4">
          <div className="w-full">
            <p className="section-label">Placement Readiness</p>
            <p className="text-xs text-slate-400 mt-0.5">Based on resume, interviews, and DSA progress.</p>
          </div>

          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle className="ring-track" cx="60" cy="60" r="52" strokeWidth="10" fill="none" />
              <circle
                className="ring-fill"
                cx="60"
                cy="60"
                r="52"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - readiness / 100)}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-800">{readiness}%</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Readiness</span>
            </div>
          </div>

          <div className="w-full space-y-2.5">
            {[
              { label: 'Resume ATS', value: resumeScore, color: 'bg-blue-500' },
              { label: 'Mock Interviews', value: avgInterviewScore, color: 'bg-indigo-500' },
              { label: 'DSA Progress', value: Math.min(100, Math.round((dsaCount.total / 30) * 100)), color: 'bg-green-500' }
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-medium text-slate-700">{item.value}%</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-bar-fill ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <p className="section-label mb-3">Skill Breakdown</p>
          {!hasAnyData ? (
            <div className="empty-state py-8">
              <TrendingUp className="w-8 h-8" />
              <h3>No skill data yet</h3>
              <p>Complete interviews, upload a resume, or solve DSA problems to build this view.</p>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <Radar data={radarData} options={radarOptions} />
            </div>
          )}
        </div>

        <div className="card p-5">
          <p className="section-label mb-3">Recent Activity</p>
          {recentActivity.length === 0 ? (
            <div className="empty-state py-8">
              <Clock className="w-8 h-8" />
              <h3>No activity yet</h3>
              <p>Actions you complete in the app will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={`${activity.type}-${activity.date}-${index}`} className="flex gap-2.5 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-700 font-medium leading-snug">{activity.detail}</p>
                    <p className="text-slate-400 mt-0.5">
                      {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <p className="section-label">DSA Activity</p>
            <p className="text-xs text-slate-400 mt-0.5">Last 56 days of solving activity.</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>Less</span>
            {['bg-slate-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600'].map(color => (
              <div key={color} className={`w-3 h-3 rounded-sm ${color}`} />
            ))}
            <span>More</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {renderHeatmap()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
