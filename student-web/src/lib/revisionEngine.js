/**
 * SAMU MCQs — Revision Engine
 * Tracks quiz attempts in localStorage. No backend required.
 * key: samu_re_v1 = { [qId]: { correct, wrong, lastAttempt, subjectId, topicId, subjectName } }
 */

const KEY = 'samu_re_v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}
function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

/** Call this from QuizPage after every answer */
export function recordAttempt({ questionId, isCorrect, subjectId, topicId, subjectName, questionText }) {
  if (!questionId) return;
  const db = load();
  const prev = db[questionId] || {
    correct: 0, wrong: 0, lastAttempt: null,
    subjectId, topicId, subjectName, questionText,
    interval: 1,   // days until next review
    ease: 2.5,     // SM-2 ease factor
  };
  // Simplified SM-2
  if (isCorrect) {
    prev.correct++;
    prev.interval = Math.round(prev.interval * prev.ease);
    prev.ease = Math.min(prev.ease + 0.1, 3.0);
  } else {
    prev.wrong++;
    prev.interval = 1;
    prev.ease = Math.max(prev.ease - 0.2, 1.3);
  }
  prev.lastAttempt  = Date.now();
  prev.subjectId    = subjectId    || prev.subjectId;
  prev.topicId      = topicId      || prev.topicId;
  prev.subjectName  = subjectName  || prev.subjectName;
  prev.questionText = questionText || prev.questionText;
  db[questionId] = prev;
  save(db);
}

/** Returns list of questions due for revision, sorted by priority (HIGH first) */
export function getRevisionQueue() {
  const db = load();
  const now = Date.now();
  const DAY = 86400000;

  return Object.entries(db).map(([qId, d]) => {
    const daysSince   = d.lastAttempt ? (now - d.lastAttempt) / DAY : 999;
    const daysOverdue = daysSince - (d.interval || 1);
    const total       = (d.correct || 0) + (d.wrong || 0);
    const wrongRatio  = total > 0 ? d.wrong / total : 0;

    // Memory level
    const memLevel = wrongRatio > 0.5  ? 1    // Learning
      : wrongRatio > 0.2               ? 2    // Remembering
      : 3;                                    // Mastered

    // Priority score: overdue + wrong bias
    const priority = daysOverdue * 0.6 + wrongRatio * 10;

    return {
      questionId:  qId,
      questionText: d.questionText || `Question ${qId}`,
      subjectId:   d.subjectId,
      subjectName: d.subjectName || 'General',
      topicId:     d.topicId,
      correct:     d.correct || 0,
      wrong:       d.wrong   || 0,
      memLevel,
      memLabel:    memLevel === 1 ? 'Learning' : memLevel === 2 ? 'Remembering' : 'Mastered',
      daysSince:   Math.round(daysSince),
      interval:    d.interval || 1,
      priority,
      isDue:       daysOverdue >= 0,
    };
  }).sort((a, b) => b.priority - a.priority);
}

/** How many questions are at risk of being forgotten */
export function getForgetRisk() {
  return getRevisionQueue().filter(q => q.isDue && q.memLevel < 3).length;
}

/** Accuracy per subject, sorted worst-first */
export function getWeakSubjects() {
  const db   = load();
  const map  = {};

  for (const d of Object.values(db)) {
    const sid   = d.subjectId    || 'unknown';
    const sname = d.subjectName  || `Subject ${sid}`;
    if (!map[sid]) map[sid] = { id: sid, name: sname, correct: 0, wrong: 0, topics: {} };
    map[sid].correct += d.correct || 0;
    map[sid].wrong   += d.wrong   || 0;

    if (d.topicId) {
      if (!map[sid].topics[d.topicId]) map[sid].topics[d.topicId] = { correct: 0, wrong: 0 };
      map[sid].topics[d.topicId].correct += d.correct || 0;
      map[sid].topics[d.topicId].wrong   += d.wrong   || 0;
    }
  }

  return Object.values(map)
    .filter(s => (s.correct + s.wrong) > 0)
    .map(s => {
      const total    = s.correct + s.wrong;
      const accuracy = Math.round((s.correct / total) * 100);
      // Weak topics within subject
      const weakTopics = Object.entries(s.topics)
        .map(([tid, t]) => {
          const tt = t.correct + t.wrong;
          return { id: tid, accuracy: Math.round((t.correct / tt) * 100), total: tt };
        })
        .filter(t => t.accuracy < 70)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3);
      return { ...s, total, accuracy, weakTopics };
    })
    .sort((a, b) => a.accuracy - b.accuracy);
}

/** Total stats */
export function getStats() {
  const db = load();
  let correct = 0, wrong = 0;
  for (const d of Object.values(db)) {
    correct += d.correct || 0;
    wrong   += d.wrong   || 0;
  }
  const total = correct + wrong;
  return {
    total, correct, wrong,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    questionCount: Object.keys(db).length,
  };
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
