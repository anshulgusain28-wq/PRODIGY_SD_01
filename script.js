const tempInput = document.getElementById('temp-input');
const inputUnitBadge = document.getElementById('input-unit-badge');
const inputWrapper = document.querySelector('.input-field-wrapper');
const errorMsg = document.getElementById('error-msg');

// Result elements
const resultCard = document.getElementById('result-card');
const resultLabel = document.getElementById('result-label');
const resultVal = document.getElementById('result-val');
const resultSymbol = document.getElementById('result-symbol');
const formulaDisplay = document.getElementById('formula-display');

let activeFromScale = 'celsius'; // default starting scale
let activeToScale = 'fahrenheit'; // default target scale

const UNIT_SYMBOLS = {
  celsius: '°C',
  fahrenheit: '°F',
  kelvin: 'K'
};

const ABSOLUTE_ZERO = {
  celsius: -273.15,
  fahrenheit: -459.67,
  kelvin: 0
};

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.add('visible');
  inputWrapper.classList.add('error');
  inputWrapper.classList.remove('shake');
  void inputWrapper.offsetWidth; // force layout reflow
  inputWrapper.classList.add('shake');
}

function clearError() {
  errorMsg.textContent = '';
  errorMsg.classList.remove('visible');
  inputWrapper.classList.remove('error');
  inputWrapper.classList.remove('shake');
}

function performConversion(value, from, to) {
  if (from === to) {
    return value;
  }

  // Convert source unit to Celsius base
  let celsius;
  if (from === 'celsius') {
    celsius = value;
  } else if (from === 'fahrenheit') {
    celsius = (value - 32) * 5 / 9;
  } else {
    celsius = value - 273.15;
  }

  // Convert Celsius base to target unit
  if (to === 'celsius') {
    return celsius;
  } else if (to === 'fahrenheit') {
    return (celsius * 9 / 5) + 32;
  } else {
    return celsius + 273.15;
  }
}

function getFormulaString(valStr, from, to, resStr) {
  if (from === to) {
    const symbol = UNIT_SYMBOLS[from];
    return `No conversion needed: ${valStr}${symbol} = ${resStr}${symbol}`;
  }

  if (from === 'celsius' && to === 'fahrenheit') {
    return `(${valStr}°C × 9/5) + 32 = ${resStr}°F`;
  }
  if (from === 'celsius' && to === 'kelvin') {
    return `${valStr}°C + 273.15 = ${resStr} K`;
  }
  if (from === 'fahrenheit' && to === 'celsius') {
    return `(${valStr}°F − 32) × 5/9 = ${resStr}°C`;
  }
  if (from === 'fahrenheit' && to === 'kelvin') {
    return `(${valStr}°F − 32) × 5/9 + 273.15 = ${resStr} K`;
  }
  if (from === 'kelvin' && to === 'celsius') {
    return `${valStr} K − 273.15 = ${resStr}°C`;
  }
  if (from === 'kelvin' && to === 'fahrenheit') {
    return `(${valStr} K − 273.15) × 9/5 + 32 = ${resStr}°F`;
  }
  return '';
}

function checkInvalidInput(rawValue) {
  const s = rawValue.trim();
  if (s === '') return null;

  // Regex for a clean valid decimal number (including optional leading +/- and scientific notation)
  const validNumberRegex = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
  if (validNumberRegex.test(s)) {
    return null; // It's a valid number, no error
  }

  const lowerStr = s.toLowerCase();

  // 1. Math operators check (excluding leading +/- or scientific notation e+/-)
  const hasInnerOperator = lowerStr.split('').some((char, idx) => {
    return (char === '+' || char === '-') && idx > 0 && lowerStr[idx - 1] !== 'e';
  });

  const hasMathOperators = /[\*\/÷%\^=]/.test(lowerStr) || /\d\s*[xX]\s*\d/.test(s);

  if (hasInnerOperator || hasMathOperators) {
    return "I am a thermometer, not a calculator. Please leave the math homework to your school teacher.";
  }

  // 2. Mathematical words / words that indicate math operations
  const mathWords = ['plus', 'minus', 'times', 'divided', 'multiply', 'add', 'subtract', 'sum'];
  const words = lowerStr.split(/\s+/);
  if (words.some(w => mathWords.includes(w))) {
    return "Nice try, but I only speak temperatures, not algebra. Keep it simple and enter a single number.";
  }

  // 3. Conversion words or unit words check
  const conversionKeywords = ['to', 'into', 'convert', 'equals', 'in'];
  const unitKeywords = ['celsius', 'fahrenheit', 'kelvin', 'meter', 'feet', 'inch', 'yard', 'mile', 'gram', 'pound', 'kg', 'lbs', 'cm', 'mm', 'km'];
  
  const hasConversionWord = words.some(w => conversionKeywords.includes(w));
  const hasUnitWord = words.some(w => unitKeywords.some(unit => w.includes(unit)));

  if (hasConversionWord || hasUnitWord) {
    return "I only convert temperatures using the tabs below. Typing full sentences here is beyond my pay grade.";
  }

  // 4. Default fallback for general invalid strings (like "abc")
  return "Please enter a valid number. Alphabet soup does not have a boiling point.";
}

function convert() {
  clearError();
  const rawValue = tempInput.value.trim();

  // If input is empty, show placeholders
  if (rawValue === '') {
    resultVal.textContent = '—';
    formulaDisplay.textContent = 'Enter a value to see the formula';
    return;
  }

  const invalidMsg = checkInvalidInput(rawValue);
  if (invalidMsg) {
    showError(invalidMsg);
    resultVal.textContent = '—';
    formulaDisplay.textContent = 'Invalid input';
    return;
  }

  const value = parseFloat(rawValue);
  if (isNaN(value)) {
    showError('Please enter a valid number.');
    resultVal.textContent = '—';
    formulaDisplay.textContent = 'Invalid input';
    return;
  }

  // Absolute zero check based on activeFromScale
  if (value < ABSOLUTE_ZERO[activeFromScale]) {
    const symbol = UNIT_SYMBOLS[activeFromScale];
    showError(`⚠ Cannot be below absolute zero (${ABSOLUTE_ZERO[activeFromScale]}${symbol}).`);
    return;
  }

  // Convert
  const result = performConversion(value, activeFromScale, activeToScale);

  // Format helper to strip floating point imprecision
  const format = num => parseFloat(num.toFixed(4)).toString();
  const formattedResult = format(result);

  // Update result card elements
  resultVal.textContent = formattedResult;
  resultLabel.textContent = activeToScale.charAt(0).toUpperCase() + activeToScale.slice(1);
  resultSymbol.textContent = UNIT_SYMBOLS[activeToScale];

  // Update formula display
  formulaDisplay.textContent = `Formula: ${getFormulaString(format(value), activeFromScale, activeToScale, formattedResult)}`;
}

// Select From Scale
function selectFromScale(scale) {
  activeFromScale = scale;
  
  // Update badge next to the input
  inputUnitBadge.textContent = UNIT_SYMBOLS[scale];

  // Update segmented control buttons for From Unit
  ['celsius', 'fahrenheit', 'kelvin'].forEach(s => {
    document.getElementById(`tab-from-${s}`).classList.remove('active');
  });
  document.getElementById(`tab-from-${scale}`).classList.add('active');

  // Recalculate
  convert();
}

// Select To Scale
function selectToScale(scale) {
  activeToScale = scale;

  // Update segmented control buttons for Convert To
  ['celsius', 'fahrenheit', 'kelvin'].forEach(s => {
    document.getElementById(`tab-to-${s}`).classList.remove('active');
  });
  document.getElementById(`tab-to-${scale}`).classList.add('active');

  // Recalculate
  convert();
}

// Presets click handler (uses Celsius)
function applyPreset(celsiusValue) {
  // Set source to Celsius
  selectFromScale('celsius');
  // Set input value
  tempInput.value = celsiusValue;
  // Recalculate
  convert();
}

// Up/Down custom spin buttons
function stepInput(amount) {
  const current = parseFloat(tempInput.value) || 0;
  // Step by 1
  tempInput.value = parseFloat((current + amount).toFixed(2));
  convert();
}

// Live calculation triggers
tempInput.addEventListener('input', convert);

// Clear error status while typing
tempInput.addEventListener('keydown', () => {
  if (errorMsg.classList.contains('visible')) {
    clearError();
  }
});

// Auto-run on load
window.addEventListener('DOMContentLoaded', () => {
  tempInput.focus();
  convert();
});
