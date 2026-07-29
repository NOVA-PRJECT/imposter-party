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
 * Returns a random word from the host's ticked categories guaranteeing no adjacent rounds use words from the same category
 */
function getRandomWord(categoryParam = 'general', customWords = [], roomState = {}) {
  const data = loadWords();

  const lastCategory = roomState?.lastCategory || null;
  const lastWord = roomState?.lastWord || null;
  const usedWords = roomState?.usedWords || new Set();

  let targetCategoryIds = [];

  if (Array.isArray(categoryParam) && categoryParam.length > 0) {
    targetCategoryIds = categoryParam.filter(id => id !== 'custom_only');
  } else if (typeof categoryParam === 'string' && categoryParam !== 'general' && categoryParam !== 'custom_only') {
    targetCategoryIds = [categoryParam];
  } else {
    // All categories
    targetCategoryIds = data.categories.map(c => c.id);
  }

  // Handle custom words only mode
  if (categoryParam === 'custom_only' || (Array.isArray(categoryParam) && categoryParam.includes('custom_only') && targetCategoryIds.length === 0)) {
    const pool = customWords.map(w => ({ ...w, categoryId: 'custom_only' }));
    const filtered = pool.filter(w => w.word !== lastWord);
    return (filtered.length > 0 ? filtered : pool)[Math.floor(Math.random() * pool.length)];
  }

  // Find candidate category objects from dataset matching host's ticked categories
  let candidateCategories = data.categories.filter(c => targetCategoryIds.includes(c.id));
  if (candidateCategories.length === 0) {
    candidateCategories = data.categories;
  }

  // ANTI-ADJACENCY: Exclude lastCategory if there are multiple ticked categories
  let nextCategories = candidateCategories.filter(c => c.id !== lastCategory);
  if (nextCategories.length === 0) {
    nextCategories = candidateCategories;
  }

  // Pick random category from candidate list
  const selectedCategoryObj = nextCategories[Math.floor(Math.random() * nextCategories.length)];

  let wordPool = selectedCategoryObj.words.map(w => ({ ...w, categoryId: selectedCategoryObj.id }));

  // Include custom words if checked
  if (Array.isArray(categoryParam) && categoryParam.includes('custom_only') && customWords.length > 0) {
    wordPool.push(...customWords.map(w => ({ ...w, categoryId: 'custom_only' })));
  }

  // Filter out recent words to avoid duplicate adjacent words
  let availableWords = wordPool.filter(w => w.word !== lastWord && !usedWords.has(w.word));
  if (availableWords.length === 0) {
    availableWords = wordPool.filter(w => w.word !== lastWord);
  }
  if (availableWords.length === 0) {
    availableWords = wordPool;
  }

  const selectedWordEntry = availableWords[Math.floor(Math.random() * availableWords.length)];

  // Update room state history
  if (roomState) {
    roomState.lastCategory = selectedWordEntry.categoryId || selectedCategoryObj.id;
    roomState.lastWord = selectedWordEntry.word;
    if (!roomState.usedWords) {
      roomState.usedWords = new Set();
    }
    roomState.usedWords.add(selectedWordEntry.word);

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
