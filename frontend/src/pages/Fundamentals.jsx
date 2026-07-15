import React, { useState } from 'react';
import { BookOpen, HelpCircle, Check, X, AlertTriangle } from 'lucide-react';

const subjectsData = {
  'DBMS': {
    title: 'Database Management Systems',
    summary: 'Essential database constructs: Normalization forms (1NF, 2NF, 3NF, BCNF), indexing metrics, ACID transactions properties, Joins (Inner, Left, Right, Full), and key constraints.',
    cheatSheet: [
      { term: 'ACID Properties', desc: 'Atomicity (all or nothing), Consistency (preserves integrity), Isolation (transactions are independent), Durability (persisted post-crash).' },
      { term: 'Normalization (3NF vs BCNF)', desc: '3NF prevents transitive dependency. BCNF is stronger, ensuring every determinant is a candidate key.' },
      { term: 'Indexing', desc: 'Improves query read performance using B-Trees or Hash buckets at the cost of slower writes (DMLs).' }
    ],
    quizzes: [
      { id: 'db1', q: 'Which normalization form eliminates transitive functional dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], correct: 2 },
      { id: 'db2', q: 'What does the "I" in ACID properties stand for?', options: ['Consistency', 'Isolation', 'Integrity', 'Index'], correct: 1 },
      { id: 'db3', q: 'Which database join returns all rows from the left table and matched rows from the right table?', options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'FULL JOIN'], correct: 2 }
    ]
  },
  'OOP': {
    title: 'Object-Oriented Programming',
    summary: 'Core object paradigm pillars: Abstraction (hiding details), Encapsulation (state boundaries), Inheritance (code reuse), and Polymorphism (dynamic binding).',
    cheatSheet: [
      { term: 'Polymorphism', desc: 'Compile-time (Method Overloading) vs Runtime (Method Overriding via virtual functions).' },
      { term: 'Abstract Class vs Interface', desc: 'Abstract classes can have state and default method code. Interfaces enforce behaviors, specifying public APIs (contract).' },
      { term: 'Encapsulation', desc: 'Restricting direct state access using private modifier, exposing mutations via getter/setter endpoints.' }
    ],
    quizzes: [
      { id: 'oop1', q: 'Which OOP pillar is demonstrated by overriding a method of a parent class in a subclass?', options: ['Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism'], correct: 3 },
      { id: 'oop2', q: 'Can an interface have concrete methods in standard Java 8+?', options: ['No, never', 'Yes, using "default" or "static" keyword', 'Only private methods', 'Only abstract definitions'], correct: 1 },
      { id: 'oop3', q: 'Which keyword prevents a class from being inherited in C++?', options: ['static', 'const', 'final', 'private'], correct: 2 }
    ]
  },
  'OS': {
    title: 'Operating Systems',
    summary: 'Process orchestration: scheduling queues, virtual memory paging, thrashing, deadlocks conditions, and inter-process communication constructs (semaphores, mutexes).',
    cheatSheet: [
      { term: 'Deadlocks', desc: 'Requires Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.' },
      { term: 'Mutex vs Semaphore', desc: 'Mutex is locking mechanism (ownership). Semaphore is signaling mechanism (counter-based resource tracker).' },
      { term: 'Paging & Thrashing', desc: 'Virtual memory mapped to physical blocks. Thrashing is excessive page swapping, slowing execution.' }
    ],
    quizzes: [
      { id: 'os1', q: 'Which of the following is NOT one of Coffman\'s four conditions for deadlock?', options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption allowed', 'Circular Wait'], correct: 2 },
      { id: 'os2', q: 'What is thrashing in operating systems?', options: ['Fast CPU execution', 'Excessive page faults causing constant swap-ins/swap-outs', 'Deleting processes', 'Low memory warning'], correct: 1 },
      { id: 'os3', q: 'Which CPU scheduling algorithm is non-preemptive by definition?', options: ['Round Robin', 'First-Come, First-Served', 'Shortest Remaining Time First', 'Priority Preemptive'], correct: 1 }
    ]
  },
  'Networks': {
    title: 'Computer Networks',
    summary: 'Data transit: OSI 7-layer hierarchy, TCP/IP stack comparison, TCP handshake, IP addressing, DNS resolution, and routing protocols.',
    cheatSheet: [
      { term: 'OSI 7 Layers', desc: 'Physical, Data Link, Network, Transport, Session, Presentation, Application.' },
      { term: 'TCP 3-Way Handshake', desc: 'Client sends SYN. Server replies SYN-ACK. Client sends ACK. Connection established.' },
      { term: 'HTTP vs HTTPS', desc: 'HTTPS encrypts data transit over Transport layer using TLS/SSL protocols.' }
    ],
    quizzes: [
      { id: 'net1', q: 'Which layer of the OSI model handles routing packets across networks?', options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Application Layer'], correct: 1 },
      { id: 'net2', q: 'What is the correct sequence of the TCP three-way handshake?', options: ['SYN -> ACK -> SYN-ACK', 'SYN -> SYN-ACK -> ACK', 'ACK -> SYN -> SYN-ACK', 'SYN-ACK -> SYN -> ACK'], correct: 1 },
      { id: 'net3', q: 'Which port does standard secure HTTPS connection use?', options: ['80', '8080', '22', '443'], correct: 3 }
    ]
  }
};

const Fundamentals = () => {
  const [subject, setSubject] = useState('DBMS');
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleOptionSelect = (qId, optionIdx) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleQuizReset = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  const activeData = subjectsData[subject];
  
  const getScore = () => {
    return activeData.quizzes.reduce((score, q) => {
      return score + (userAnswers[q.id] === q.correct ? 1 : 0);
    }, 0);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" /> CS Fundamentals
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review core computer science topics frequently asked in technical interviews and test your knowledge.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {Object.keys(subjectsData).map((sub) => (
          <button
            key={sub}
            onClick={() => { setSubject(sub); handleQuizReset(); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              subject === sub
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {subjectsData[sub].title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Guide & Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{activeData.title} Guide</h2>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{activeData.summary}</p>
            </div>

            <div className="space-y-3">
              <h3 className="section-label">Crucial Concepts</h3>
              <div className="space-y-2">
                {activeData.cheatSheet.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-md">
                    <p className="text-sm font-semibold text-blue-700">{item.term}</p>
                    <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quiz */}
        <div className="lg:col-span-1">
          <div className="card p-5 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-600" /> Practice Quiz
              </h3>
              {quizSubmitted && (
                <span className="badge badge-blue font-bold px-2 py-0.5">
                  Score: {getScore()} / 3
                </span>
              )}
            </div>

            <div className="space-y-6">
              {activeData.quizzes.map((quiz, qIdx) => (
                <div key={quiz.id} className="space-y-2">
                  <p className="text-sm font-medium text-slate-800 leading-snug">
                    {qIdx + 1}. {quiz.q}
                  </p>
                  <div className="space-y-1.5">
                    {quiz.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[quiz.id] === optIdx;
                      const isCorrect = quiz.correct === optIdx;
                      
                      let btnClass = 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50';
                      if (isSelected) btnClass = 'bg-blue-50 border-blue-200 text-blue-700';
                      
                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnClass = 'bg-green-50 border-green-200 text-green-700 font-medium';
                        } else if (isSelected && !isCorrect) {
                          btnClass = 'bg-red-50 border-red-200 text-red-700 font-medium';
                        } else {
                          btnClass = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleOptionSelect(quiz.id, optIdx)}
                          className={`w-full text-left p-2.5 rounded-md border text-sm transition-colors flex items-center justify-between ${btnClass}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-green-600 shrink-0" />}
                          {quizSubmitted && isSelected && !isCorrect && <X className="w-4 h-4 text-red-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {!quizSubmitted ? (
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(userAnswers).length < 3}
                className="btn btn-primary w-full mt-4"
              >
                Submit Answers
              </button>
            ) : (
              <button
                onClick={handleQuizReset}
                className="btn btn-secondary w-full mt-4"
              >
                Try Again
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Fundamentals;
