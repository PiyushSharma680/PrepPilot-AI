import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Code2, Users, FileCheck, ArrowRight, BookOpen } from 'lucide-react';

const companiesData = {
  'Google': {
    desc: 'Google values strong core algorithms, scale-ready systems design, and googliness (behavioral fit). Interviews emphasize dynamic programming, advanced trees/graphs, and recursion.',
    rounds: ['Online Assessment (OA) - 2 Coding Problems', 'Technical Phone Screen - DSA & Algorithms', '3x Onsite Technical Rounds - Complex Algorithms & Systems Design', '1x Googliness & Leadership behavioral round'],
    dsaPatterns: ['DFS/BFS Graph Traversal', 'Dynamic Programming (Knapsack & Grid)', 'Tries & Hash Map structures', 'Segment Trees & Fenwick Trees'],
    behavioralFocus: ['Dealing with ambiguity & vague requirements', 'Engineering scalable, clean code structures', 'Team collaboration & open-mindedness'],
    atsKeywords: ['Algorithms', 'Data Structures', 'Scalability', 'Go/C++/Python', 'Complexity Analysis']
  },
  'Amazon': {
    desc: 'Amazon tests technical capability alongside their famous 16 Leadership Principles. Focus heavily on behavioral scenarios using the STAR framework, and code modularity.',
    rounds: ['OA (Coding, Work Style Assessment, System Design)', '1x Technical Phone Screen (Coding & Leadership Principles)', '4x Virtual Onsite Rounds (Bar Raiser, Coding, Systems Design)'],
    dsaPatterns: ['LRU Cache designs', 'Two Pointers & Sliding Windows', 'Min/Max Heap applications', 'Binary Search variants'],
    behavioralFocus: ['Customer Obsession (User first)', 'Ownership & Bias for Action', 'Deliver Results under pressure'],
    atsKeywords: ['Java', 'OOP', 'Distributed Systems', 'Cloud Caching', 'Leadership Principles']
  },
  'Microsoft': {
    desc: 'Microsoft technical rounds evaluate logical correctness, code quality, and adaptability. Expect classic algorithms, data structure implementation, and low-level object designs.',
    rounds: ['OA Coding challenge', 'Technical Phone interview (DSA)', '3x Onsite coding rounds (System Design, Low-Level OOP)'],
    dsaPatterns: ['Linked List reversals & merging', 'Binary Tree traversals', 'Backtracking (Recursion trees)', 'Sorting & Binary Searches'],
    behavioralFocus: ['Growth Mindset & learning from failures', 'Collaboration with diverse cross-functional teams', 'Customer focus & empathy'],
    atsKeywords: ['C#/.NET', 'C++', 'Object-Oriented Design', 'SQL', 'Thread Safety']
  },
  'Atlassian': {
    desc: 'Atlassian interviews check core engineering values (openness, play as a team) and software design. System design focuses heavily on APIs, scaling, and database choices.',
    rounds: ['OA Coding', 'Technical Screen (System Design / Coding)', 'Onsite: 1x Coding, 1x System Design, 1x Values Fit'],
    dsaPatterns: ['REST API Endpoint design mockups', 'System Design: Rate limiters', 'Queue and Hash indexes', 'Strings manipulations'],
    behavioralFocus: ['Open company, no bullshit value alignment', 'Play as a team mentality', 'Empathy for customer struggles'],
    atsKeywords: ['React/Node.js', 'APIs Design', 'System Architecture', 'Microservices', 'Git']
  }
};

const CompanyPrep = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const activeComp = companiesData[selectedCompany];

  const handleStartMock = () => {
    navigate('/interview', { state: { autoStart: true, type: 'Technical', category: 'General', company: selectedCompany } });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" /> Company Preparation
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Access targeted preparation guides, resume ATS keywords, and mock sessions for top tech companies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar: Company Selector */}
        <div className="lg:col-span-1 space-y-3">
          <p className="section-label">Select Target Company</p>
          <div className="space-y-2">
            {Object.keys(companiesData).map((comp) => (
              <div
                key={comp}
                onClick={() => setSelectedCompany(comp)}
                className={`p-3 rounded-lg border transition-colors cursor-pointer flex justify-between items-center ${
                  selectedCompany === comp
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <h4 className={`text-sm font-semibold ${selectedCompany === comp ? 'text-blue-700' : 'text-slate-700'}`}>{comp}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Interview Blueprint</p>
                </div>
                <ArrowRight className={`w-4 h-4 ${selectedCompany === comp ? 'text-blue-500' : 'text-slate-300'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Main Panel: Guide */}
        <div className="lg:col-span-2">
          <div className="card p-6 space-y-6">
            
            {/* Header / CTA */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">{selectedCompany} Placement Blueprint</h2>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-600 font-medium">
                  <BookOpen className="w-3.5 h-3.5" /> Preparation Guide Active
                </div>
              </div>
              <button onClick={handleStartMock} className="btn btn-primary">
                Start Mock Interview <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Description */}
            <div className="p-4 bg-slate-50 rounded-md text-sm text-slate-700 leading-relaxed border border-slate-100">
              {activeComp.desc}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rounds */}
              <div className="space-y-3">
                <h3 className="section-label flex items-center gap-1.5 text-slate-600">
                  <Building2 className="w-4 h-4 text-blue-500" /> Interview Loop
                </h3>
                <ol className="space-y-2 list-decimal list-inside text-sm text-slate-600">
                  {activeComp.rounds.map((round, idx) => (
                    <li key={idx} className="leading-snug">{round}</li>
                  ))}
                </ol>
              </div>

              {/* DSA */}
              <div className="space-y-3">
                <h3 className="section-label flex items-center gap-1.5 text-slate-600">
                  <Code2 className="w-4 h-4 text-indigo-500" /> Key DSA Patterns
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeComp.dsaPatterns.map((pattern, idx) => (
                    <span key={idx} className="badge badge-gray">
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>

              {/* Behavioral */}
              <div className="space-y-3">
                <h3 className="section-label flex items-center gap-1.5 text-slate-600">
                  <Users className="w-4 h-4 text-green-500" /> Behavioral Focus
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {activeComp.behavioralFocus.map((bh, idx) => (
                    <li key={idx} className="flex gap-2 items-start leading-snug">
                      <span className="text-green-500 shrink-0">•</span>
                      <span>{bh}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ATS */}
              <div className="space-y-3">
                <h3 className="section-label flex items-center gap-1.5 text-slate-600">
                  <FileCheck className="w-4 h-4 text-amber-500" /> Target Keywords
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeComp.atsKeywords.map((kw, idx) => (
                    <span key={idx} className="badge badge-blue bg-blue-50">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanyPrep;
