'use strict';

/* =====================================================
   PASSWORD STRENGTH ANALYZER — SIMPLE ENGINE
   Runs entirely in the browser. The password is never
   logged, stored, or sent anywhere.
   ===================================================== */

// A small, non-exhaustive list of common/weak passwords.
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', '123456789', 'qwerty',
  'admin', 'password123', 'welcome', 'letmein', 'abc123',
  'iloveyou', 'monkey', 'dragon', 'football', '111111',
  '000000', 'qazwsx', 'trustno1', 'starwars', 'master',
  'login', 'princess', 'sunshine', 'freedom', 'whatever'
]);

// Keyboard rows used for simple keyboard-pattern detection.
const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890'];

/* -----------------------------------------------------
   Character-set helpers
   ----------------------------------------------------- */
function hasLower(pw) { return /[a-z]/.test(pw); }
function hasUpper(pw) { return /[A-Z]/.test(pw); }
function hasNumber(pw) { return /[0-9]/.test(pw); }
function hasSpecial(pw) { return /[^a-zA-Z0-9\s]/.test(pw); }
function hasSpace(pw) { return /\s/.test(pw); }

function isCommonPassword(pw) {
  return COMMON_PASSWORDS.has(pw.toLowerCase());
}

/* -----------------------------------------------------
   Pattern detection (kept simple on purpose)
   ----------------------------------------------------- */

// 4 or more of the same character in a row, e.g. "aaaa".
function hasRepeatedCharacters(pw) {
  return /(.)\1{3,}/.test(pw);
}

// 4+ ascending or descending characters, e.g. "1234" or "dcba".
function hasSequentialPattern(pw) {
  const lower = pw.toLowerCase();
  for (let i = 0; i < lower.length - 3; i++) {
    const a = lower.charCodeAt(i);
    const b = lower.charCodeAt(i + 1);
    const c = lower.charCodeAt(i + 2);
    const d = lower.charCodeAt(i + 3);
    const ascending = (b - a === 1) && (c - b === 1) && (d - c === 1);
    const descending = (a - b === 1) && (b - c === 1) && (c - d === 1);
    if (ascending || descending) return true;
  }
  return false;
}

// 4+ characters that sit next to each other on a QWERTY keyboard.
function hasKeyboardPattern(pw) {
  const lower = pw.toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i <= row.length - 4; i++) {
      const chunk = row.slice(i, i + 4);
      const reversed = chunk.split('').reverse().join('');
      if (lower.includes(chunk) || lower.includes(reversed)) return true;
    }
  }
  return false;
}

/* -----------------------------------------------------
   Scoring
   -----------------------------------------------------
   Simple point-based scoring, as requested:
   +1  8 or more characters
   +1  12 or more characters
   +1  contains a lowercase letter
   +1  contains an uppercase letter
   +1  contains a number
   +1  contains a special character
   +1  is not a common password

   Maximum score = 7
     0-2 -> Weak
     3-4 -> Medium
     5-6 -> Strong
     7   -> Very Strong

   Repeated / sequential / keyboard patterns do not change
   the numeric score directly (to keep the algorithm easy to
   follow) — instead they are shown as separate warnings, so
   the user always understands exactly why a point was or
   wasn't awarded.
   ----------------------------------------------------- */
function calculateScore(pw) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (hasLower(pw)) score += 1;
  if (hasUpper(pw)) score += 1;
  if (hasNumber(pw)) score += 1;
  if (hasSpecial(pw)) score += 1;
  if (!isCommonPassword(pw)) score += 1;
  return score;
}

function scoreToLevel(score, length) {
  if (length === 0) return { level: 'none', label: 'Enter a password above' };
  if (score <= 2) return { level: 'weak', label: 'Weak' };
  if (score <= 4) return { level: 'medium', label: 'Medium' };
  if (score <= 6) return { level: 'strong', label: 'Strong' };
  return { level: 'very-strong', label: 'Very Strong' };
}

/* -----------------------------------------------------
   Full analysis for one password
   ----------------------------------------------------- */
function analyzePassword(pw) {
  const score = calculateScore(pw);
  const level = scoreToLevel(score, pw.length);
  return {
    password: pw,
    length: pw.length,
    score,
    level,
    common: isCommonPassword(pw),
    lower: hasLower(pw),
    upper: hasUpper(pw),
    number: hasNumber(pw),
    special: hasSpecial(pw),
    space: hasSpace(pw),
    repeated: hasRepeatedCharacters(pw),
    sequential: hasSequentialPattern(pw),
    keyboard: hasKeyboardPattern(pw)
  };
}

/* -----------------------------------------------------
   Requirements checklist
   ----------------------------------------------------- */
function buildRequirements(a) {
  return [
    { label: 'At least 8 characters', met: a.length >= 8 },
    { label: 'At least 12 characters for stronger security', met: a.length >= 12 },
    { label: 'Contains an uppercase letter', met: a.upper },
    { label: 'Contains a lowercase letter', met: a.lower },
    { label: 'Contains a number', met: a.number },
    { label: 'Contains a special character', met: a.special },
    { label: 'Does not contain spaces', met: !a.space },
    { label: 'Not a commonly used password', met: !a.common }
  ];
}

/* -----------------------------------------------------
   Pattern warnings
   ----------------------------------------------------- */
function buildPatternWarnings(a) {
  const warnings = [];
  if (a.length === 0) return warnings;

  if (a.length < 8) warnings.push('This password is very short and easy to guess.');
  if (a.repeated) warnings.push('Contains repeated characters in a row, such as "aaaa".');
  if (a.sequential) warnings.push('Contains a predictable sequence, such as "1234" or "abcd".');
  if (a.keyboard) warnings.push('Contains a simple keyboard pattern, such as "qwerty".');
  if (a.space) warnings.push('Contains spaces, which can cause problems on some sites.');

  return warnings;
}

/* -----------------------------------------------------
   Suggestions
   ----------------------------------------------------- */
function buildSuggestions(a) {
  if (a.length === 0) return [];

  const suggestions = [];

  if (a.length < 12) suggestions.push('Increase the password length — aim for 12 or more characters.');
  if (!a.upper) suggestions.push('Add uppercase letters (A-Z).');
  if (!a.lower) suggestions.push('Add lowercase letters (a-z).');
  if (!a.number) suggestions.push('Add numbers (0-9).');
  if (!a.special) suggestions.push('Add special characters, such as ! @ # $ %.');
  if (a.common) suggestions.push('Avoid commonly used passwords and their simple variations.');
  if (a.repeated || a.sequential || a.keyboard) {
    suggestions.push('Avoid predictable patterns like repeated, sequential, or keyboard-based characters.');
  }
  suggestions.push('Avoid using personal information such as your name, birthday, or pet\'s name.');

  if (suggestions.length === 1) {
    // Only the generic personal-info reminder is left, meaning
    // everything else already passed — show a positive message instead.
    return ['Great job! This password meets all major strength criteria. Still, use it for only one account, and consider a password manager.'];
  }

  return suggestions;
}

/* =====================================================
   SECURE PASSWORD GENERATOR
   Uses crypto.getRandomValues() — never Math.random().
   ===================================================== */
const CHAR_SETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  number: '0123456789',
  special: '!@#$%^&*()-_=+?'
};

function secureRandomInt(max) {
  const array = new Uint32Array(1);
  const limit = Math.floor(0xFFFFFFFF / max) * max;
  let value;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);
  return value % max;
}

function secureShuffle(arr) {
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generatePassword(length) {
  const categories = [CHAR_SETS.upper, CHAR_SETS.lower, CHAR_SETS.number, CHAR_SETS.special];
  const combined = categories.join('');

  // Guarantee one character from each category so the result is
  // never accidentally missing a category, even at short lengths.
  const guaranteed = categories.map((set) => set[secureRandomInt(set.length)]);

  const rest = [];
  for (let i = guaranteed.length; i < length; i++) {
    rest.push(combined[secureRandomInt(combined.length)]);
  }

  const full = secureShuffle([...guaranteed, ...rest]);
  return full.slice(0, length).join('');
}

/* =====================================================
   DOM WIRING
   ===================================================== */
const el = {
  input: document.getElementById('password-input'),
  toggleBtn: document.getElementById('toggle-btn'),
  clearBtn: document.getElementById('clear-btn'),

  strengthLabel: document.getElementById('strength-label'),
  scoreText: document.getElementById('score-text'),
  strengthBarFill: document.getElementById('strength-bar-fill'),
  commonWarning: document.getElementById('common-warning'),

  requirementsList: document.getElementById('requirements-list'),
  patternWarnings: document.getElementById('pattern-warnings'),
  suggestionsList: document.getElementById('suggestions-list'),

  genLength: document.getElementById('gen-length'),
  genLengthValue: document.getElementById('gen-length-value'),
  generateBtn: document.getElementById('generate-btn'),
  generatedRow: document.getElementById('generated-row'),
  generatedOutput: document.getElementById('generated-output'),
  copyBtn: document.getElementById('copy-btn'),
  copyFeedback: document.getElementById('copy-feedback')
};

const BAR_COLORS = {
  none: '#3a4a63',
  weak: 'var(--red)',
  medium: 'var(--orange)',
  strong: 'var(--yellow)',
  'very-strong': 'var(--green)'
};

function renderRequirements(items) {
  el.requirementsList.innerHTML = '';
  for (const item of items) {
    const li = document.createElement('li');
    li.className = item.met ? 'met' : '';

    const mark = document.createElement('span');
    mark.className = 'mark';
    mark.textContent = item.met ? '✅' : '⬜';

    const text = document.createElement('span');
    text.textContent = item.label;

    li.appendChild(mark);
    li.appendChild(text);
    el.requirementsList.appendChild(li);
  }
}

function renderPatternWarnings(warnings) {
  el.patternWarnings.innerHTML = '';
  if (warnings.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = '✅ No obvious weak patterns detected.';
    el.patternWarnings.appendChild(li);
    return;
  }
  for (const w of warnings) {
    const li = document.createElement('li');
    li.textContent = `⚠ ${w}`;
    el.patternWarnings.appendChild(li);
  }
}

function renderSuggestions(suggestions) {
  el.suggestionsList.innerHTML = '';
  for (const s of suggestions) {
    const li = document.createElement('li');
    li.textContent = s;
    el.suggestionsList.appendChild(li);
  }
}

function renderAnalysis(a) {
  el.strengthLabel.textContent = a.level.label;
  el.strengthLabel.dataset.level = a.level.level;
  el.scoreText.textContent = `Score: ${a.score} / 7`;

  const percent = (a.score / 7) * 100;
  el.strengthBarFill.style.width = `${percent}%`;
  el.strengthBarFill.style.background = BAR_COLORS[a.level.level];

  el.commonWarning.hidden = !a.common;

  renderRequirements(buildRequirements(a));
  renderPatternWarnings(buildPatternWarnings(a));
  renderSuggestions(buildSuggestions(a));
}

/* Real-time analysis — no submit button needed.
   The password value is only read in-memory to compute
   these results; it is never logged, stored, or sent. */
el.input.addEventListener('input', () => {
  renderAnalysis(analyzePassword(el.input.value));
});

/* Show / hide password */
el.toggleBtn.addEventListener('click', () => {
  const showing = el.input.type === 'text';
  el.input.type = showing ? 'password' : 'text';
  el.toggleBtn.textContent = showing ? '👁️' : '🙈';
  el.toggleBtn.setAttribute('aria-pressed', String(!showing));
  el.toggleBtn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
});

/* Clear */
el.clearBtn.addEventListener('click', () => {
  el.input.value = '';
  el.input.focus();
  renderAnalysis(analyzePassword(''));
});

/* Generator length slider label */
function updateLengthLabel() {
  el.genLengthValue.textContent = el.genLength.value;
}
el.genLength.addEventListener('input', updateLengthLabel);
updateLengthLabel();

/* Generate button */
el.generateBtn.addEventListener('click', () => {
  const length = parseInt(el.genLength.value, 10);
  const generated = generatePassword(length);
  el.generatedOutput.textContent = generated;
  el.generatedRow.hidden = false;
  el.copyFeedback.textContent = '';

  // Load the generated password into the analyzer so the user can
  // see its strength immediately.
  el.input.value = generated;
  el.input.type = 'text';
  el.toggleBtn.textContent = '🙈';
  el.toggleBtn.setAttribute('aria-pressed', 'true');
  el.toggleBtn.setAttribute('aria-label', 'Hide password');
  renderAnalysis(analyzePassword(generated));
});

/* Copy generated password */
el.copyBtn.addEventListener('click', async () => {
  const text = el.generatedOutput.textContent;
  if (!text) {
    el.copyFeedback.textContent = 'Generate a password first.';
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    el.copyFeedback.textContent = 'Copied to clipboard!';
  } catch (err) {
    el.copyFeedback.textContent = 'Copy failed — please copy it manually.';
  }
});

/* Initial render */
renderAnalysis(analyzePassword(''));
