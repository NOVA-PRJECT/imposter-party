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

function getRandomWord(categoryId = 'general', customWords = []) {
  const data = loadWords();
  let pool = [];

  if (categoryId === 'custom_only') {
    pool = [...customWords];
  } else {
    const category = data.categories.find(c => c.id === categoryId) || data.categories[0];
    pool = [...category.words, ...customWords];
  }

  if (pool.length === 0) {
    const fallbackCategory = data.categories[0];
    pool = [...fallbackCategory.words];
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

module.exports = {
  loadWords,
  getCategories,
  getRandomWord,
};
