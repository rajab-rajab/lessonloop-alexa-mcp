export const topicOrder = ['variables', 'conditionals', 'loops'];

export const lessons = [
  {
    id: 'variables', topic: 'variables', title: 'Python variables · Starter', level: 'Starter', difficulty: 1,
    objective: 'Store a value in a named variable and use it later.',
    explanation: 'A variable gives a name to a value. For example, score = 3 stores the number 3. print(score) displays 3.',
    question: 'What does this print? score = 3; score = score + 2; print(score)',
    answer: '5', hints: ['Start with score equal to 3.', 'Add 2 to the existing score, then print the new value.'],
    explanationAfter: 'score starts at 3. The assignment adds 2, so print(score) displays 5.',
    keywords: ['5', 'five'], source: 'Original lesson written for this prototype; no textbook quotation.'
  },
  {
    id: 'variables-practice', topic: 'variables', title: 'Python variables · Practice', level: 'Practice', difficulty: 2,
    objective: 'Track how a variable changes across more than one assignment.',
    explanation: 'Python executes assignments from top to bottom, and each new assignment can use the current value.',
    question: 'What does this print? points = 4; points = points * 2; points = points - 1; print(points)',
    answer: '7', hints: ['First double 4.', 'After doubling 4 to get 8, subtract 1.'],
    explanationAfter: 'points becomes 8 after multiplication, then 7 after subtracting 1.',
    keywords: ['7', 'seven'], source: 'Original lesson written for this prototype; no textbook quotation.'
  },
  {
    id: 'variables-challenge', topic: 'variables', title: 'Python variables · Challenge', level: 'Challenge', difficulty: 3,
    objective: 'Reason about two variables that exchange and combine values.',
    explanation: 'Expressions use the current values of variables at the time each assignment runs.',
    question: 'What does this print? a = 2; b = 5; a = a + b; b = a - 1; print(b)',
    answer: '6', hints: ['After a = a + b, a is 7.', 'Then b becomes the current a minus 1.'],
    explanationAfter: 'a becomes 7, then b becomes 6, so print(b) displays 6.',
    keywords: ['6', 'six'], source: 'Original lesson written for this prototype; no textbook quotation.'
  },
  {
    id: 'conditionals', topic: 'conditionals', title: 'Python decisions · Starter', level: 'Starter', difficulty: 1,
    objective: 'Predict which branch an if statement runs.',
    explanation: 'An if statement runs its indented block when the condition is true. Otherwise, an else block can run.',
    question: 'If temperature = 18, what prints? if temperature > 25: print("hot") else: print("cool")',
    answer: 'cool', hints: ['Compare 18 with 25.', '18 is not greater than 25, so follow else.'],
    explanationAfter: 'The condition 18 > 25 is false, so the else branch prints cool.',
    keywords: ['cool'], source: 'Original lesson written for this prototype; no textbook quotation.'
  },
  {
    id: 'conditionals-practice', topic: 'conditionals', title: 'Python decisions · Practice', level: 'Practice', difficulty: 2,
    objective: 'Evaluate an equality condition and choose the matching branch.',
    explanation: 'The == operator tests whether two values are equal.',
    question: 'If score = 10, what prints? if score == 10: print("perfect") else: print("retry")',
    answer: 'perfect', hints: ['Check whether score equals 10.', 'The condition is true, so follow the if branch.'],
    explanationAfter: 'score equals 10, so the if branch prints perfect.',
    keywords: ['perfect'], source: 'Original lesson written for this prototype; no textbook quotation.'
  },
  {
    id: 'conditionals-challenge', topic: 'conditionals', title: 'Python decisions · Challenge', level: 'Challenge', difficulty: 3,
    objective: 'Reason through an if/elif/else chain.',
    explanation: 'Python checks if/elif conditions from top to bottom and runs the first true branch.',
    question: 'If marks = 72, what prints? if marks >= 80: print("A") elif marks >= 60: print("B") else: print("C")',
    answer: 'B', hints: ['72 is not at least 80.', '72 is at least 60, so the elif branch runs.'],
    explanationAfter: 'The first condition is false, but marks >= 60 is true, so B is printed.',
    keywords: ['b'], source: 'Original lesson written for this prototype; no textbook quotation.'
  },
  {
    id: 'loops', topic: 'loops', title: 'Python loops · Starter', level: 'Starter', difficulty: 1,
    objective: 'Count iterations of a for loop.',
    explanation: 'range(3) produces 0, 1, and 2. The loop body runs once for each value.',
    question: 'How many times does this print? for i in range(3): print(i)',
    answer: '3', hints: ['List the numbers produced by range(3).', 'It produces 0, 1, and 2: count those values.'],
    explanationAfter: 'The loop runs for 0, 1, and 2, so print runs three times.',
    keywords: ['3', 'three'], source: 'Original lesson written for this prototype; no textbook quotation.'
  },
  {
    id: 'loops-practice', topic: 'loops', title: 'Python loops · Practice', level: 'Practice', difficulty: 2,
    objective: 'Predict the final value of an accumulator changed in a loop.',
    explanation: 'An accumulator stores a running total that changes on each loop iteration.',
    question: 'What prints? total = 0; for i in range(4): total = total + 1; print(total)',
    answer: '4', hints: ['range(4) has four values.', 'total increases by 1 on each of the four iterations.'],
    explanationAfter: 'The loop runs four times and total increases from 0 to 4.',
    keywords: ['4', 'four'], source: 'Original lesson written for this prototype; no textbook quotation.'
  },
  {
    id: 'loops-challenge', topic: 'loops', title: 'Python loops · Challenge', level: 'Challenge', difficulty: 3,
    objective: 'Combine a range sequence with accumulation.',
    explanation: 'range(1, 4) produces 1, 2, and 3. An accumulator can add each value.',
    question: 'What prints? total = 0; for i in range(1, 4): total = total + i; print(total)',
    answer: '6', hints: ['range(1, 4) gives 1, 2, and 3.', 'Add 1 + 2 + 3.'],
    explanationAfter: 'The accumulator adds 1, 2, and 3, so total becomes 6.',
    keywords: ['6', 'six'], source: 'Original lesson written for this prototype; no textbook quotation.'
  }
];

export function grade(lesson, response) {
  const normalized = String(response).trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return lesson.keywords.some(word => normalized === word || normalized.split(' ').includes(word.toLowerCase()));
}
