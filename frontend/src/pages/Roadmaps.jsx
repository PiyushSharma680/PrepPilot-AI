import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Map, Plus, CheckCircle2, Circle } from 'lucide-react';

const Roadmaps = () => {
  const toast = useToast();
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [targetCompany, setTargetCompany] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeWeek, setActiveWeek] = useState(1);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roadmap');
      setRoadmaps(res.data);
      if (res.data.length > 0 && !activeRoadmap) {
        const first = res.data[0];
        setActiveRoadmap(first);
        setActiveWeek(first.currentWeek || 1);
      }
    } catch (err) {
      toast.error('Failed to load roadmaps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!targetCompany.trim() || generating) return;
    setGenerating(true);
    try {
      const res = await api.post('/roadmap', { targetCompany });
      toast.success(`Roadmap created for ${targetCompany}`);
      setActiveRoadmap(res.data);
      setActiveWeek(1);
      setTargetCompany('');
      await fetchRoadmaps();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const updateRoadmapState = (updatedRoadmap) => {
    setActiveRoadmap(updatedRoadmap);
    setRoadmaps(prev => prev.map(item => item._id === updatedRoadmap._id ? updatedRoadmap : item));
  };

  const taskKey = (roadmapId, weekNum, task) => `${roadmapId}_w${weekNum}_${task}`;

  const toggleTask = async (roadmapId, weekNum, task) => {
    if (!activeRoadmap) return;
    const key = `${roadmapId}_w${weekNum}_${task}`;
    const currentTasks = activeRoadmap.completedTasks || [];
    const completedTasks = currentTasks.includes(key)
      ? currentTasks.filter(item => item !== key)
      : [...currentTasks, key];

    const optimistic = { ...activeRoadmap, completedTasks };
    updateRoadmapState(optimistic);

    try {
      const res = await api.put(`/roadmap/${activeRoadmap._id}`, { completedTasks });
      updateRoadmapState(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update roadmap task');
      updateRoadmapState(activeRoadmap);
    }
  };

  const handleWeekChange = async (weekNum) => {
    if (!activeRoadmap) return;
    const previousRoadmap = activeRoadmap;
    const optimistic = { ...activeRoadmap, currentWeek: weekNum };
    setActiveWeek(weekNum);
    updateRoadmapState(optimistic);
    try {
      const res = await api.put(`/roadmap/${activeRoadmap._id}`, { currentWeek: weekNum });
      updateRoadmapState(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update roadmap week');
      setActiveWeek(previousRoadmap.currentWeek || 1);
      updateRoadmapState(previousRoadmap);
    }
  };

  const getProgress = () => {
    if (!activeRoadmap) return 0;
    let total = 0, done = 0;
    activeRoadmap.weeks.forEach(w => {
      w.dailyTasks.forEach(task => {
        total++;
        if ((activeRoadmap.completedTasks || []).includes(taskKey(activeRoadmap._id, w.weekNumber, task))) done++;
      });
    });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner spinner-lg" />
    </div>
  );

  const progress = getProgress();

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Map className="w-5 h-5 text-blue-600" /> Study Roadmaps
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate AI-powered week-by-week preparation plans for your target company.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sidebar: generator + list */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" /> Generate Roadmap
            </h3>
            <form onSubmit={handleGenerate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Target Company</label>
                <input
                  type="text"
                  required
                  value={targetCompany}
                  onChange={e => setTargetCompany(e.target.value)}
                  placeholder="e.g. Google, Atlassian, Amazon"
                  className="input"
                />
              </div>
              <button type="submit" disabled={generating || !targetCompany.trim()} className="btn btn-primary w-full">
                {generating
                  ? <><div className="spinner spinner-sm" /> Generating…</>
                  : 'Generate Plan'
                }
              </button>
            </form>
          </div>

          {roadmaps.length > 0 && (
            <div className="card p-4 space-y-1.5">
              <p className="section-label mb-2">Your Roadmaps</p>
              {roadmaps.map(r => (
                <div
                  key={r._id}
                  onClick={() => { setActiveRoadmap(r); setActiveWeek(r.currentWeek || 1); }}
                  className={`flex items-center justify-between p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                    activeRoadmap?._id === r._id
                      ? 'bg-blue-50 border-blue-200'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <span className="font-medium text-slate-700">{r.targetCompany}</span>
                  <span className="text-slate-400">{r.durationWeeks}w</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main: roadmap detail */}
        <div className="lg:col-span-2">
          {!activeRoadmap ? (
            <div className="card">
              <div className="empty-state">
                <Map className="w-10 h-10" />
                <h3>No roadmap selected</h3>
                <p>Generate your first personalized study plan by entering a target company name.</p>
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-slate-800 text-base">{activeRoadmap.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeRoadmap.durationWeeks}-week plan · Week {activeWeek} of {activeRoadmap.durationWeeks} active
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500 mb-1">{progress}% complete</p>
                    <div className="progress-bar w-32">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                {/* Week tabs */}
                <div className="flex gap-1.5 mt-4 overflow-x-auto pb-0.5">
                  {activeRoadmap.weeks.map(w => (
                    <button
                      key={w.weekNumber}
                      onClick={() => handleWeekChange(w.weekNumber)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer border transition-colors ${
                        activeWeek === w.weekNumber
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      Week {w.weekNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Week detail */}
              {activeRoadmap.weeks.filter(w => w.weekNumber === activeWeek).map(w => (
                <div key={w.weekNumber} className="p-5 space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-0.5">Weekly Goal</p>
                    <p className="text-sm text-slate-700">{w.weeklyGoal}</p>
                  </div>

                  <div>
                    <p className="section-label mb-3">Daily Tasks</p>
                    <div className="space-y-2">
                      {w.dailyTasks.map((task, i) => {
                        const key = `${activeRoadmap._id}_w${w.weekNumber}_${task}`;
                        const done = (activeRoadmap.completedTasks || []).includes(key);
                        return (
                          <div
                            key={i}
                            onClick={() => toggleTask(activeRoadmap._id, w.weekNumber, task)}
                            className={`flex gap-3 items-start p-3 rounded-md border cursor-pointer transition-colors ${
                              done ? 'bg-green-50 border-green-100' : 'bg-white border-slate-100 hover:bg-slate-50'
                            }`}
                          >
                            {done
                              ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                              : <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                            }
                            <span className={`text-sm ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                              {task}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Roadmaps;
