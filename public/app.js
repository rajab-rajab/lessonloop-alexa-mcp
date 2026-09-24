const $ = id => document.getElementById(id);
let sessionId = null;
let lastSpeech = '';
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) $('listen').hidden = false;

async function api(path, method = 'GET', data) {
  const response = await fetch(path, { method, headers: { 'content-type': 'application/json' }, body: data ? JSON.stringify(data) : undefined });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Please try again.');
  return result;
}
function message(speaker, speech, student = false) {
  const div = document.createElement('div');
  div.className = `message ${student ? 'student' : 'guide'}`;
  const label = document.createElement('span');
  label.className = 'speaker'; label.textContent = speaker;
  const p = document.createElement('p'); p.textContent = speech;
  div.append(label, p); $('exchange').append(div); $('exchange').scrollTop = $('exchange').scrollHeight;
  if (!student) lastSpeech = speech;
}
function render(s) {
  const fields = [['Learner', s.learner], ['Lesson', s.lessonTitle], ['Attempts', s.attempts], ['Hints used', s.hints], ['Learning goal', s.objective], ['Suggested next step', s.nextStep]];
  const box = $('summary'); box.replaceChildren();
  const tag = document.createElement('span'); tag.className = 'status'; tag.textContent = s.status;
  const dl = document.createElement('dl');
  for (const [key, value] of fields) {
    const wrap = document.createElement('div'); if (key.includes('step') || key === 'Learning goal') wrap.className = 'wide';
    const dt = document.createElement('dt'); dt.textContent = key;
    const dd = document.createElement('dd'); dd.textContent = value;
    wrap.append(dt, dd); dl.append(wrap);
  }
  box.append(tag, dl);
}
function showError(error) { message('LESSONLOOP', error.message); }
async function refreshHistory() {
  const items = await api('/api/sessions');
  const box = $('history'); box.replaceChildren();
  if (!items.length) { box.textContent = 'No sessions saved yet.'; return; }
  for (const item of items.slice(-8).reverse()) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'historyItem';
    button.textContent = `${item.learner} · ${item.lessonTitle} · ${item.status}`;
    button.addEventListener('click', async () => {
      try {
        const restored = await api(`/api/sessions/${item.id}`);
        sessionId = item.id; $('learner').value = item.learner; $('lesson').value = item.lessonId;
        $('exchange').replaceChildren(); message('LESSONLOOP', `Welcome back, ${item.learner}. ${restored.question}`);
        render(restored.session); $('answerForm').hidden = false; $('actions').hidden = false;
      } catch (error) { showError(error); }
    });
    box.append(button);
  }
}
try {
  const lessons = await api('/api/lessons');
  for (const lesson of lessons) { const option = document.createElement('option'); option.value = lesson.id; option.textContent = `${lesson.title} · ${lesson.level}`; $('lesson').append(option); }
  await refreshHistory();
} catch (error) { showError(error); }
$('start').addEventListener('click', async () => {
  try {
    const data = await api('/api/sessions', 'POST', { learner: $('learner').value, lessonId: $('lesson').value });
    sessionId = data.session.id; $('exchange').replaceChildren(); message('LESSONLOOP', data.speech); render(data.session);
    $('answerForm').hidden = false; $('actions').hidden = false; $('answer').focus(); await refreshHistory();
  } catch (error) { showError(error); }
});
$('answerForm').addEventListener('submit', async event => {
  event.preventDefault(); if (!sessionId) return;
  const answer = $('answer').value.trim(); if (!answer) return;
  try { const data = await api(`/api/sessions/${sessionId}/answer`, 'POST', { answer }); message('YOU', answer, true); message('LESSONLOOP', data.speech); render(data.session); $('answer').value = ''; await refreshHistory(); } catch (error) { showError(error); }
});
$('hint').addEventListener('click', async () => {
  if (!sessionId) return;
  try { const data = await api(`/api/sessions/${sessionId}/hint`, 'POST'); message('LESSONLOOP', data.speech); render(data.session); } catch (error) { showError(error); }
});
$('speak').addEventListener('click', () => {
  if (!('speechSynthesis' in window)) return message('LESSONLOOP', 'Your browser does not support speech playback.');
  speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(lastSpeech); utterance.lang = 'en-US'; utterance.rate = .9; speechSynthesis.speak(utterance);
});
$('listen').addEventListener('click', () => {
  if (!SpeechRecognition) return;
  const recognition = new SpeechRecognition(); recognition.lang = 'en-US'; recognition.interimResults = false;
  $('listen').disabled = true; $('listen').textContent = 'Listening…';
  recognition.onresult = event => { $('answer').value = event.results[0][0].transcript; $('answer').focus(); };
  recognition.onerror = () => message('LESSONLOOP', 'Microphone input was unavailable. You can type your answer instead.');
  recognition.onend = () => { $('listen').disabled = false; $('listen').textContent = '🎙 Speak answer'; };
  try { recognition.start(); } catch { recognition.onend(); }
});
