export const lessons = [
  {
    id: 'variables', title: 'Python variables', level: 'Starter',
    objective: 'Store a value in a named variable and use it later.',
    explanation: 'A variable gives a name to a value. For example, score = 3 stores the number 3. print(score) displays 3.',
    question: 'What does this print? score = 3; score = score + 2; print(score)',
    answer: '5', hints: ['Start with score equal to 3.', 'Add 2 to the existing score, then print the new value.'],
    explanationAfter: 'score starts at 3. The assignment adds 2, so print(score) displays 5.',
    keywords: ['5', 'five'], source: 'Original lesson written for this prototype; no textbook quotation.'
  },
  {
    id: 'conditionals', title: 'Python decisions', level: 'Next step',
    objective: 'Predict which branch an if statement runs.',
    explanation: 'An if statement runs its indented block when the condition is true. Otherwise, an else block can run.',
    question: 'If temperature = 18, what prints? if temperature > 25: print("hot") else: print("cool")',
    answer: 'cool', hints: ['Compare 18 with 25.', '18 is not greater than 25, so follow else.'],
    explanationAfter: 'The condition 18 > 25 is false, so the else branch prints cool.',
    keywords: ['cool'], source: 'Original lesson written for this prototype; no textbook quotation.'
  },
  {
    id: 'loops', title: 'Python loops', level: 'Practice',
    objective: 'Count iterations of a for loop.',
    explanation: 'range(3) produces 0, 1, and 2. The loop body runs once for each value.',
    question: 'How many times does this print? for i in range(3): print(i)',
    answer: '3', hints: ['List the numbers produced by range(3).', 'It produces 0, 1, and 2: count those values.'],
    explanationAfter: 'The loop runs for 0, 1, and 2, so print runs three times.',
    keywords: ['3', 'three'], source: 'Original lesson written for this prototype; no textbook quotation.'
  }
];

export function grade(lesson, response) {
  const normalized = String(response).trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return lesson.keywords.some(word => normalized === word || normalized.split(' ').includes(word));
}
