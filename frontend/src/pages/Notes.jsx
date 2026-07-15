import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Notebook, 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  Bot,
  User,
  HelpCircle,
  FileText,
  Search
} from 'lucide-react';

const Notes = () => {
  const toast = useToast();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');

  // Notes Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('personal'); 
  const [savingNote, setSavingNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Chat Mentor State
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your AI Career Mentor. Ask me anything about placement strategies, resume optimization, salary negotiations, or coding roadmaps.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef(null);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes');
      setNotes(response.data);
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || savingNote) return;

    setSavingNote(true);
    try {
      const response = await api.post('/notes', { title, content, type });
      setNotes([response.data, ...notes]);
      setTitle('');
      setContent('');
      toast.success('Note saved successfully');
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (id) => {
    const confirmed = window.confirm('Delete this note?');
    if (!confirmed) return;

    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(n => n._id !== id));
      toast.info('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const userMessage = chatInput;
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setChatInput('');
    setSendingChat(true);

    const history = messages.slice(-5).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text
    }));

    try {
      const response = await api.post('/chat', { message: userMessage, history });
      setMessages(prev => [...prev, { sender: 'bot', text: response.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an issue. Please try querying again.' }]);
    } finally {
      setSendingChat(false);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeBadge = (noteType) => {
    switch (noteType) {
      case 'revision': return <span className="badge badge-amber">Revision</span>;
      case 'flashcard': return <span className="badge badge-blue">Flashcard</span>;
      default: return <span className="badge badge-gray">Personal</span>;
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="spinner spinner-lg" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Notebook className="w-5 h-5 text-blue-600" /> Revision Hub & Mentor
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Organize placement notes, create flashcards, and chat live with an AI mentor.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'notes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Notes & Flashcards
        </button>
        <button
          onClick={() => setActiveTab('mentor')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'mentor' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          AI Career Mentor
        </button>
      </div>

      {activeTab === 'notes' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Note Creator Form */}
          <div className="lg:col-span-1">
            <div className="card p-5 space-y-4 sticky top-6">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" /> New Note
              </h3>

              <form onSubmit={handleCreateNote} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. JS Closures"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input"
                  >
                    <option value="personal">Personal Note</option>
                    <option value="revision">Revision Guide</option>
                    <option value="flashcard">Flashcard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Content</label>
                  <textarea
                    rows="5"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write details..."
                    className="input resize-none"
                  />
                </div>

                <button type="submit" disabled={savingNote} className="btn btn-primary w-full mt-2">
                  {savingNote ? <><div className="spinner spinner-sm" /> Saving…</> : 'Save Note'}
                </button>
              </form>
            </div>
          </div>

          {/* Notes List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="section-label">Your Notes</p>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search notes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 h-8 text-xs"
                />
              </div>
            </div>

            {filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNotes.map((note) => (
                  <div key={note._id} className="card p-4 flex flex-col hover:border-blue-200 transition-colors group relative h-48">
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="absolute top-3 right-3 p-1.5 rounded bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all border border-slate-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="mb-2">{getTypeBadge(note.type)}</div>
                    <h4 className="text-sm font-semibold text-slate-800 pr-8 line-clamp-1">{note.title}</h4>
                    <div className="text-sm text-slate-600 mt-2 line-clamp-4 flex-1 whitespace-pre-wrap text-ellipsis overflow-hidden">
                      {note.content}
                    </div>

                    <div className="text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                      <FileText className="w-3 h-3" />
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state card py-12">
                <Notebook className="w-10 h-10 mb-2" />
                <h3>No notes found</h3>
                <p>Create a note using the form to get started.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Mentor Chatbot Tab */
        <div className="card max-w-3xl mx-auto flex flex-col h-[calc(100vh-170px)] min-h-[420px]">
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white rounded-t-lg">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">AI Placement Mentor</h3>
              <p className="text-[11px] text-slate-500">Live assistance for interviews, resumes & strategy</p>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div 
                key={idx}
                className={`flex gap-3 max-w-[85%] ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {sendingChat && (
              <div className="flex gap-3 mr-auto max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-12">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-slate-100 rounded-b-lg">
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                required
                disabled={sendingChat}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask your mentor a question..."
                className="input h-10"
              />
              <button
                type="submit"
                disabled={sendingChat || !chatInput.trim()}
                className="btn btn-primary h-10 px-4"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
