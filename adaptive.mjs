import { lessons, topicOrder } from './curriculum.mjs';

export function masteryFor(session) {
  if (!session.correct) {
    if ((session.attempts || 0) >= 3 || (session.hints || 0) >= 2) return 'Needs support';
    return 'In progress';
  }
  if ((session.attempts || 0) <= 1 && (session.hints || 0) === 0) return 'Strong';
  if ((session.attempts || 0) <= 2 && (session.hints || 0) <= 1) return 'Developing';
  return 'Needs support';
}

function lessonById(id) { return lessons.find(lesson => lesson.id === id); }

export function recommendNext(session) {
  const lesson = lessons[session.lessonIndex];
  if (!lesson) throw new Error('Lesson not found for this session.');
  const mastery = masteryFor(session);
  const sameTopic = lessons.filter(item => item.topic === lesson.topic);
  const currentPosition = sameTopic.findIndex(item => item.id === lesson.id);
  let recommended;
  let reason;

  if (!session.correct) {
    recommended = sameTopic[Math.max(0, currentPosition - 1)] || sameTopic[0];
    reason = mastery === 'Needs support'
      ? `The learner has ${session.attempts || 0} attempts and ${session.hints || 0} hints, so reinforce the same concept before moving on.`
      : 'The learner is still working on this concept, so continue with targeted support.';
  } else if (mastery === 'Strong') {
    recommended = sameTopic[currentPosition + 1];
    if (recommended) {
      reason = 'The learner completed this question quickly without hints, so move to a more challenging question in the same topic.';
    } else {
      const topicIndex = topicOrder.indexOf(lesson.topic);
      const nextTopic = topicOrder[topicIndex + 1];
      recommended = lessons.find(item => item.topic === nextTopic) || sameTopic[currentPosition];
      reason = nextTopic
        ? 'The learner showed strong mastery at the challenge level, so move to the next Python topic.'
        : 'The learner completed the final challenge with strong mastery; review or extend the learning independently.';
    }
  } else if (mastery === 'Developing') {
    recommended = sameTopic[Math.min(currentPosition + 1, sameTopic.length - 1)] || lesson;
    reason = recommended.id === lesson.id
      ? 'The learner completed this concept with some support; review once before extending further.'
      : 'The learner completed the concept with limited support, so continue to the next practice question in the same topic.';
  } else {
    recommended = sameTopic[Math.max(0, currentPosition - 1)] || sameTopic[0];
    if (recommended.id === lesson.id && currentPosition + 1 < sameTopic.length) recommended = sameTopic[currentPosition + 1];
    reason = `The learner completed the question after ${session.attempts || 0} attempts and ${session.hints || 0} hints, so use reinforcement before advancing to a new topic.`;
  }

  return {
    mastery,
    recommendedLessonId: recommended?.id || lesson.id,
    recommendedLessonTitle: recommended?.title || lesson.title,
    recommendedLevel: recommended?.level || lesson.level,
    reason
  };
}
