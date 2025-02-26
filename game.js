class WordNBack {
    constructor() {
        this.nLevel = 1;
        this.sequence = [];
        this.currentIndex = 0;
        this.stats = {
            total: 0,
            correct: 0,
            streak: 0,
            maxStreak: 0
        };
        this.words = this.loadWordList();
        
        this.init();
        this.newGame();
    }

    init() {
        this.bindEvents();
        this.loadProgress();
    }

    bindEvents() {
        document.getElementById('yesBtn').addEventListener('click', () => this.checkAnswer(true));
        document.getElementById('noBtn').addEventListener('click', () => this.checkAnswer(false));
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.checkAnswer(true);
            if (e.code === 'Enter') this.checkAnswer(false);
        });
    }

    loadWordList() {
        const defaultWords = [
            { word: "vivid", meaning: "生动的" },
            { word: "ambiguity", meaning: "歧义" },
            { word: "paradox", meaning: "悖论" },
            { word: "empirical", meaning: "经验主义的" }
        ];
        
        try {
            const customWords = JSON.parse(localStorage.getItem('wordList')) || [];
            return [...defaultWords, ...customWords];
        } catch {
            return defaultWords;
        }
    }

    generateSequence(length = 25) {
        const sequence = [];
        for (let i = 0; i < length; i++) {
            if (i >= this.nLevel && Math.random() < 0.3) {
                sequence.push(sequence[i - this.nLevel]);
            } else {
                sequence.push(this.getRandomWord());
            }
        }
        return sequence;
    }

    getRandomWord() {
        return this.words[Math.floor(Math.random() * this.words.length)];
    }

    checkAnswer(userAnswer) {
        const correctAnswer = this.isNBackMatch();
        this.stats.total++;
        
        if (userAnswer === correctAnswer) {
            this.handleCorrect();
        } else {
            this.handleIncorrect();
        }

        this.updateProgress();
        this.moveToNext();
        this.adjustDifficulty();
    }

    isNBackMatch() {
        return this.currentIndex >= this.nLevel && 
               this.sequence[this.currentIndex] === 
               this.sequence[this.currentIndex - this.nLevel];
    }

    handleCorrect() {
        this.stats.correct++;
        this.stats.streak++;
        this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.streak);
        this.showFeedback('✓', 'correct');
    }

    handleIncorrect() {
        this.stats.streak = 0;
        this.showFeedback('✕', 'incorrect');
    }

    showFeedback(symbol, type) {
        const display = document.getElementById('wordDisplay');
        display.textContent = symbol;
        display.style.color = type === 'correct' ? '#27ae60' : '#c0392b';
        display.style.opacity = '1';
        
        setTimeout(() => {
            display.style.opacity = '0';
            setTimeout(() => {
                display.textContent = this.sequence[this.currentIndex]?.word || '完成！';
                display.style.color = '#2c3e50';
                display.style.opacity = '1';
            }, 200);
        }, 500);
    }

    updateProgress() {
        document.getElementById('currentN').textContent = this.nLevel;
        document.getElementById('accuracy').textContent = 
            `${Math.round((this.stats.correct / this.stats.total) * 100 || 0)}%`;
        document.getElementById('streak').textContent = this.stats.streak;
        
        localStorage.setItem('gameProgress', JSON.stringify({
            stats: this.stats,
            nLevel: this.nLevel
        }));
    }

    adjustDifficulty() {
        const accuracy = this.stats.correct / this.stats.total;
        const progress = document.getElementById('difficultyProgress');

        if (accuracy > 0.85 && this.stats.streak >= 3) {
            this.nLevel = Math.min(this.nLevel + 1, 4);
            this.stats.streak = 0;
        } else if (accuracy < 0.4) {
            this.nLevel = Math.max(this.nLevel - 1, 1);
        }

        progress.style.width = `${(this.nLevel / 4) * 100}%`;
    }

    newGame() {
        this.sequence = this.generateSequence();
        this.currentIndex = this.nLevel;
        this.updateDisplay();
    }

    moveToNext() {
        this.currentIndex++;
        if (this.currentIndex >= this.sequence.length) {
            this.newGame();
        } else {
            this.updateDisplay();
        }
    }

    updateDisplay() {
        document.getElementById('wordDisplay').textContent = 
            this.sequence[this.currentIndex]?.word || '完成！';
    }

    loadProgress() {
        const saved = JSON.parse(localStorage.getItem('gameProgress'));
        if (saved) {
            this.stats = saved.stats;
            this.nLevel = saved.nLevel;
            this.updateProgress();
        }
    }
}

// 自定义词库功能
function addCustomWord() {
    const wordInput = document.getElementById('newWord');
    const meaningInput = document.getElementById('newMeaning');
    
    if (wordInput.value && meaningInput.value) {
        const customWords = JSON.parse(localStorage.getItem('wordList')) || [];
        customWords.push({
            word: wordInput.value.trim(),
            meaning: meaningInput.value.trim()
        });
        localStorage.setItem('wordList', JSON.stringify(customWords));
        
        wordInput.value = '';
        meaningInput.value = '';
        alert('单词已添加！请刷新页面生效');
    }
}

function resetProgress() {
    localStorage.removeItem('gameProgress');
    location.reload();
}

// 初始化游戏
const game = new WordNBack();