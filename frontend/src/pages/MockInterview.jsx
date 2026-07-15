import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  AlertCircle,
  Award,
  ChevronRight,
  Clock,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Send,
  Video
} from 'lucide-react';

const PHASE = {
  SETUP: 'setup',
  QUESTIONING: 'questioning',
  REVIEWING: 'reviewing',
  COMPLETING: 'completing'
};

const MAX_QUESTIONS = 3;

const gradeFromQuestion = (question) => {
  if (!question?.userAnswer) return null;
  return {
    score: question.score ?? 0,
    feedback: question.feedback || 'Answer recorded.'
  };
};

const QuestionPanel = ({
  question,
  questionIndex,
  sessionType,
  sessionCategory,
  phase,
  answer,
  setAnswer,
  grade,
  submitting,
  onSubmit,
  onNextQuestion,
  onComplete,
  onVoice,
  isRecording,
  recordingSeconds
}) => (
  <div className="card p-5 sm:p-6 space-y-5 lg:col-span-2">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <span className="badge badge-blue">Q{questionIndex || 1} / {MAX_QUESTIONS}</span>
        <span className="text-xs text-slate-500">{sessionType} / {sessionCategory}</span>
      </div>
      <Clock className="w-4 h-4 text-slate-300" />
    </div>

    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <p className="text-sm font-medium text-slate-800 leading-relaxed">
        {question || 'Loading question...'}
      </p>
    </div>

    {phase === PHASE.QUESTIONING && (
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <div className="flex items-center justify-between gap-3 mb-2">
            <label className="section-label">Your Answer</label>
            <button
              type="button"
              onClick={onVoice}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium transition-colors ${
                isRecording
                  ? 'bg-red-50 border-red-300 text-red-600'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
              }`}
            >
              {isRecording
                ? <><MicOff className="w-3 h-3" /> Stop ({recordingSeconds}s)</>
                : <><Mic className="w-3 h-3" /> Voice</>
              }
            </button>
          </div>
          <textarea
            rows={7}
            required
            value={answer}
            onChange={event => setAnswer(event.target.value)}
            placeholder="Write a structured answer. Explain your reasoning, tradeoffs, and concrete examples."
            className="input resize-none leading-relaxed text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!answer.trim() || submitting}
          className="btn btn-primary w-full"
        >
          {submitting
            ? <><div className="spinner spinner-sm" /> Evaluating...</>
            : <><Send className="w-4 h-4" /> Submit Answer</>
          }
        </button>
      </form>
    )}

    {[PHASE.REVIEWING, PHASE.COMPLETING].includes(phase) && grade && (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="text-center bg-white border border-blue-100 rounded-lg px-4 py-2 min-w-[64px]">
            <span className="text-2xl font-bold text-blue-600">{grade.score}</span>
            <p className="text-[10px] text-slate-400 uppercase font-medium">/ 100</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Feedback</p>
            <p className="text-sm text-slate-600 leading-relaxed">{grade.feedback}</p>
          </div>
        </div>

        {phase === PHASE.REVIEWING ? (
          <button onClick={onNextQuestion} disabled={submitting} className="btn btn-primary w-full">
            {submitting ? <><div className="spinner spinner-sm" /> Loading...</> : <>Next Question <ChevronRight className="w-4 h-4" /></>}
          </button>
        ) : (
          <button onClick={onComplete} disabled={submitting} className="btn btn-primary w-full">
            {submitting
              ? <><div className="spinner spinner-sm" /> Generating Score...</>
              : <><Award className="w-4 h-4" /> Finish Interview</>
            }
          </button>
        )}
      </div>
    )}
  </div>
);

const SidePanel = ({ questions }) => (
  <div className="card p-4 space-y-3">
    <p className="section-label">Session Progress</p>
    {questions.length === 0 && (
      <p className="text-xs text-slate-400">Your questions will appear here as the session progresses.</p>
    )}
    {questions.map((item, index) => (
      <div key={`${item.question}-${index}`} className="p-3 bg-slate-50 rounded-md border border-slate-100 text-xs space-y-1">
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-600">Q{index + 1}</span>
          {item.userAnswer
            ? <span className={`font-bold ${(item.score || 0) >= 70 ? 'text-green-600' : 'text-amber-600'}`}>{item.score || 0}/100</span>
            : <span className="text-slate-300">Pending</span>
          }
        </div>
        <p className="text-slate-500 line-clamp-2">{item.question}</p>
      </div>
    ))}
  </div>
);

const MockInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const autoStartedRef = useRef(false);
  const recognitionRef = useRef(null);

  const [type, setType] = useState('Technical');
  const [category, setCategory] = useState('General');
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [grade, setGrade] = useState(null);
  const [phase, setPhase] = useState(PHASE.SETUP);
  const [booting, setBooting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState(null);

  async function fetchSession(id) {
    const response = await api.get(`/interview/${id}`);
    return response.data;
  }

  function hydrateSession(session) {
    if (!session || session.status === 'completed') {
      if (session?._id) navigate(`/interview/${session._id}/result`, { replace: true });
      return;
    }

    const sessionQuestions = session.questions || [];
    const answeredCount = sessionQuestions.filter(item => item.userAnswer).length;
    const lastQuestion = sessionQuestions[sessionQuestions.length - 1];

    setSessionId(session._id);
    setType(session.type || 'Technical');
    setCategory(session.category || 'General');
    setQuestions(sessionQuestions);
    setError(null);

    if (!lastQuestion) {
      setQuestion('');
      setQuestionIndex(1);
      setAnswer('');
      setGrade(null);
      setPhase(PHASE.QUESTIONING);
      fetchQuestion(session._id);
      return;
    }

    setQuestion(lastQuestion.question);
    setQuestionIndex(sessionQuestions.length);

    if (!lastQuestion.userAnswer) {
      setAnswer('');
      setGrade(null);
      setPhase(PHASE.QUESTIONING);
      return;
    }

    setAnswer(lastQuestion.userAnswer);
    setGrade(gradeFromQuestion(lastQuestion));
    setPhase(answeredCount >= MAX_QUESTIONS ? PHASE.COMPLETING : PHASE.REVIEWING);
  }

  async function startSession(config = {}) {
    const nextType = config.type || type;
    const nextCategory = config.category || category;

    setSubmitting(true);
    setError(null);
    try {
      const response = await api.post('/interview', { type: nextType, category: nextCategory });
      const id = response.data._id;
      setSessionId(id);
      setType(nextType);
      setCategory(nextCategory);
      setQuestions([]);
      setQuestion('');
      setQuestionIndex(1);
      setAnswer('');
      setGrade(null);
      setPhase(PHASE.QUESTIONING);
      await fetchQuestion(id);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start interview';
      setError(msg);
      toast.error(msg);
      setPhase(PHASE.SETUP);
    } finally {
      setSubmitting(false);
    }
  }

  async function fetchQuestion(id = sessionId) {
    if (!id) return;

    setSubmitting(true);
    setError(null);
    setGrade(null);
    setAnswer('');
    try {
      const response = await api.post(`/interview/${id}/question`);
      setQuestion(response.data.question);
      setQuestionIndex(response.data.questionIndex);
      setPhase(PHASE.QUESTIONING);

      const session = await fetchSession(id);
      setQuestions(session.questions || []);
    } catch (err) {
      if (err.response?.data?.readyToComplete) {
        const session = await fetchSession(id);
        hydrateSession(session);
        return;
      }
      const msg = err.response?.data?.message || 'Failed to load question';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      const state = location.state;
      if (state?.autoStart && !autoStartedRef.current) {
        autoStartedRef.current = true;
        await startSession({
          type: state.type || 'Technical',
          category: state.category || state.company || 'General'
        });
        if (mounted) setBooting(false);
        return;
      }

      try {
        const response = await api.get('/interview/active');
        if (mounted) hydrateSession(response.data);
      } catch (err) {
        if (err.response?.status !== 404) {
          const msg = err.response?.data?.message || 'Failed to check active interview';
          setError(msg);
        }
      } finally {
        if (mounted) setBooting(false);
      }
    };

    boot();
    return () => { mounted = false; };
  }, []);

  useEffect(() => () => {
    if (recordingTimer) clearInterval(recordingTimer);
    recognitionRef.current?.stop?.();
  }, [recordingTimer]);

  const handleSubmitAnswer = async (event) => {
    event.preventDefault();
    if (!answer.trim() || submitting || !sessionId) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await api.post(`/interview/${sessionId}/answer`, { answer });
      setGrade({ score: response.data.score, feedback: response.data.feedback });

      const session = await fetchSession(sessionId);
      const updatedQuestions = session.questions || [];
      setQuestions(updatedQuestions);

      const answeredCount = response.data.answeredCount ?? updatedQuestions.filter(item => item.userAnswer).length;
      setPhase(answeredCount >= MAX_QUESTIONS ? PHASE.COMPLETING : PHASE.REVIEWING);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit answer';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!sessionId || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/interview/${sessionId}/complete`);
      navigate(`/interview/${sessionId}/result`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete interview';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setSessionId(null);
    setQuestions([]);
    setQuestion('');
    setQuestionIndex(0);
    setAnswer('');
    setGrade(null);
    setError(null);
    setPhase(PHASE.SETUP);
  };

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.warning('Voice input is not supported in this browser. Please type your answer.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0]?.transcript)
        .filter(Boolean)
        .join(' ');
      if (transcript) {
        setAnswer(prev => `${prev}${prev ? ' ' : ''}${transcript}`.trim());
      }
    };

    recognition.onerror = () => {
      toast.error('Could not capture audio. Please try again or type your answer.');
    };

    recognition.onend = () => {
      setIsRecording(false);
      setRecordingTimer(current => {
        if (current) clearInterval(current);
        return null;
      });
    };

    setRecordingSeconds(0);
    setIsRecording(true);
    const timer = setInterval(() => setRecordingSeconds(seconds => seconds + 1), 1000);
    setRecordingTimer(timer);
    recognition.start();
  };

  if (booting) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" /> Mock Interview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Practice technical, HR, or behavioral rounds with structured scoring.
          </p>
        </div>
        {phase !== PHASE.SETUP && (
          <button onClick={handleRestart} className="btn btn-secondary self-start">
            <RotateCcw className="w-4 h-4" /> New Session
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button className="ml-auto text-xs underline cursor-pointer" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {phase === PHASE.SETUP && (
        <div className="card p-5 sm:p-6 max-w-lg mx-auto space-y-5">
          <h2 className="font-semibold text-slate-800 text-base">Configure Session</h2>

          <div>
            <p className="section-label mb-2">Interview Type</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {['Technical', 'HR', 'Behavioral'].map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setType(item)}
                  className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    type === item
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {type === 'Technical' && (
            <div>
              <p className="section-label mb-2">Focus Area</p>
              <select value={category} onChange={event => setCategory(event.target.value)} className="input">
                <option value="General">System Design & Algorithms</option>
                <option value="React">React & Frontend</option>
                <option value="Node.js">Node.js & Backend</option>
              </select>
            </div>
          )}

          <button onClick={() => startSession()} disabled={submitting} className="btn btn-primary w-full">
            {submitting
              ? <><div className="spinner spinner-sm" /> Starting...</>
              : <><Play className="w-4 h-4 fill-white" /> Start Interview</>
            }
          </button>
        </div>
      )}

      {[PHASE.QUESTIONING, PHASE.REVIEWING, PHASE.COMPLETING].includes(phase) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <QuestionPanel
            question={question}
            questionIndex={questionIndex}
            sessionType={type}
            sessionCategory={category}
            phase={phase}
            answer={answer}
            setAnswer={setAnswer}
            grade={grade}
            submitting={submitting}
            onSubmit={handleSubmitAnswer}
            onNextQuestion={() => fetchQuestion(sessionId)}
            onComplete={handleComplete}
            onVoice={toggleVoice}
            isRecording={isRecording}
            recordingSeconds={recordingSeconds}
          />
          <SidePanel questions={questions} />
        </div>
      )}
    </div>
  );
};

export default MockInterview;
