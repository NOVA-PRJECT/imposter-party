const fs = require('fs');
const path = require('path');

let wordsCache = null;

function loadWords() {
  if (!wordsCache) {
    const filePath = path.join(__dirname, '..', '..', 'data', 'words.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    wordsCache = JSON.parse(rawData);
  }
  return wordsCache;
}

function getCategories() {
  const data = loadWords();
  return data.categories.map(cat => ({
    id: cat.id,
    label: cat.label,
  }));
}

/**
 * Returns a random word guaranteeing no adjacent rounds use words from the same department/category
 */
function getRandomWord(categoryId = 'general', customWords = [], roomState = {}) {
  const data = loadWords();

  const lastCategory = roomState?.lastCategory || null;
  const lastWord = roomState?.lastWord || null;
  const usedWords = roomState?.usedWords || new Set();

  let selectedCategoryObj = null;
  let wordPool = [];

  if (categoryId === 'custom_only') {
    wordPool = customWords.map(w => ({ ...w, categoryId: 'custom_only' }));
  } else if (categoryId !== 'general') {
    selectedCategoryObj = data.categories.find(c => c.id === categoryId) || data.categories[0];
    wordPool = selectedCategoryObj.words.map(w => ({ ...w, categoryId: selectedCategoryObj.id }));
    if (customWords.length > 0) {
      wordPool.push(...customWords.map(w => ({ ...w, categoryId: 'custom_only' })));
    }
  } else {
    // GENERAL / MIX MODE: Pick a random category DIFFERENT from lastCategory
    let candidateCategories = data.categories.filter(c => c.id !== 'general' && c.id !== lastCategory);
    
    // Fallback if filtering removed all candidate categories
    if (candidateCategories.length === 0) {
      candidateCategories = data.categories.filter(c => c.id !== 'general');
    }

    // Pick random category from candidates
    const randCatIdx = Math.floor(Math.random() * candidateCategories.length);
    selectedCategoryObj = candidateCategories[randCatIdx];

    wordPool = selectedCategoryObj.words.map(w => ({ ...w, categoryId: selectedCategoryObj.id }));
    if (customWords.length > 0) {
      wordPool.push(...customWords.map(w => ({ ...w, categoryId: 'custom_only' })));
    }
  }

  // Filter out recent words to avoid duplicate adjacent words
  let availableWords = wordPool.filter(w => w.word !== lastWord && !usedWords.has(w.word));

  // If pool exhausted, reset and filter out only the single last word
  if (availableWords.length === 0) {
    availableWords = wordPool.filter(w => w.word !== lastWord);
  }
  if (availableWords.length === 0) {
    availableWords = wordPool;
  }

  const selectedWordEntry = availableWords[Math.floor(Math.random() * availableWords.length)];

  // Update room state history
  if (roomState) {
    roomState.lastCategory = selectedWordEntry.categoryId || categoryId;
    roomState.lastWord = selectedWordEntry.word;
    if (!roomState.usedWords) {
      roomState.usedWords = new Set();
    }
    roomState.usedWords.add(selectedWordEntry.word);

    // Keep history manageable
    if (roomState.usedWords.size > 50) {
      roomState.usedWords.clear();
    }
  }

  return selectedWordEntry;
}

module.exports = {
  loadWords,
  getCategories,
  getRandomWord,
};
