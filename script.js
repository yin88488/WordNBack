let wordBank = JSON.parse(localStorage.getItem('wordBank')) || [
  { english: 'apple', chinese: '苹果' },
  { english: 'banana', chinese: '香蕉' },
  { english: 'cherry', chinese: '樱桃' },
];

let gameWords = [];
let progress = 0;
let score = 0;
let totalAttempts = 0;
let nValue = 2;

// 修改：增加自定义单词数量逻辑
function startGame() {
  progress = 0;
  score = 0;
  totalAttempts = 0;

  nValue = parseInt(document.getElementById('nValue').value);
  const wordCount = parseInt(document.getElementById('wordCount').value); // 用户设置的单词数量

  gameWords = generateGameWords(wordCount, wordBank); // 生成单词列表
  document.getElementById('score').innerText = 0;
  document.getElementById('totalAttempts').innerText = 0;
  showNextWord();
}

// 修改：新的单词生成机制，确保单词可以重复
function generateGameWords(count, bank) {
  const words = [];
  for (let i = 0; i < count; i++) {
      const randomWord = bank[Math.floor(Math.random() * bank.length)];
      words.push(randomWord);

      // 每隔一定数量插入重复单词以支持 "match"
      if (i >= nValue && Math.random() > 0.1) {
          words.push(words[i - nValue]);
      }
  }
  return words.slice(0, count); // 限制到用户设置的单词数量
}

function showNextWord() {
  if (progress >= gameWords.length) {
      saveHistory(score, totalAttempts);
      alert(`Game Over! Your score is ${score}/${totalAttempts}`);
      return;
  }

  const word = gameWords[progress];
  document.getElementById('currentWord').innerText = word.english;
  document.getElementById('currentDefinition').innerText = word.chinese;
  document.getElementById('progress').innerText = `${progress + 1}/${gameWords.length}`;

  playAudio(word.english);
}

function userAnswer(isMatch) {
  if (progress >= nValue) {
      const previousWord = gameWords[progress - nValue];
      const isCorrect = isMatch === (previousWord.english === gameWords[progress].english);

      if (isCorrect) score++;
      totalAttempts++;
      document.getElementById('score').innerText = score;
      document.getElementById('totalAttempts').innerText = totalAttempts;
  }

  progress++;
  showNextWord();
}

function playAudio(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  speechSynthesis.speak(utterance);
}

function replayAudio() {
  const word = document.getElementById('currentWord').innerText;
  playAudio(word);
}

function addWordToBank() {
  const english = document.getElementById('newEnglishWord').value.trim();
  const chinese = document.getElementById('newChineseWord').value.trim();

  if (english && chinese) {
      wordBank.push({ english, chinese });
      localStorage.setItem('wordBank', JSON.stringify(wordBank));
      alert('Word added successfully!');
  }
}

function displayWordBank() {
  const wordBankList = document.getElementById('wordBankList');
  wordBankList.innerHTML = '';

  wordBank.forEach((word, index) => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
          ${word.english} - ${word.chinese}
          <button onclick="deleteWord(${index})">Delete</button>
      `;
      wordBankList.appendChild(listItem);
  });

  document.getElementById('wordBankModal').style.display = 'block';
}

function deleteWord(index) {
  wordBank.splice(index, 1);
  localStorage.setItem('wordBank', JSON.stringify(wordBank));
  displayWordBank();
}

function closeWordBankModal() {
  document.getElementById('wordBankModal').style.display = 'none';
}

function importWords(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const importedWords = XLSX.utils.sheet_to_json(sheet);

      importedWords.forEach((word) => {
          if (word.english && word.chinese) {
              wordBank.push({ english: word.english, chinese: word.chinese });
          }
      });

      localStorage.setItem('wordBank', JSON.stringify(wordBank));
      alert('Words imported successfully!');
  };
  reader.readAsArrayBuffer(file);
}

function exportWordBank() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(wordBank);
  XLSX.utils.book_append_sheet(wb, ws, 'Word Bank');
  XLSX.writeFile(wb, 'word_bank.xlsx');
}

function resetToDefault() {
  wordBank = [
      { english: 'apple', chinese: '苹果' },
      { english: 'banana', chinese: '香蕉' },
      { english: 'cherry', chinese: '樱桃' },
  ];
  localStorage.setItem('wordBank', JSON.stringify(wordBank));
  localStorage.removeItem('gameHistory');
  alert('Word bank and history have been reset!');
  displayWordBank();
  displayHistory();
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function saveHistory(score, totalAttempts) {
  let history = JSON.parse(localStorage.getItem('gameHistory')) || [];
  history.push({ score, totalAttempts, date: new Date().toLocaleString() });
  localStorage.setItem('gameHistory', JSON.stringify(history));
  displayHistory();
}

function displayHistory() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';
  const history = JSON.parse(localStorage.getItem('gameHistory')) || [];
  history.forEach(record => {
      const li = document.createElement('li');
      li.textContent = `${record.date}: ${record.score}/${record.totalAttempts}`;
      historyList.appendChild(li);
  });
}
