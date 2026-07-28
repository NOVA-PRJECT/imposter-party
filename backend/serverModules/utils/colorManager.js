const ALL_COLORS = [
  'red', 'blue', 'green', 'purple', 'yellow', 'black',
  'white', 'orange', 'pink', 'brown', 'cyan', 'lime',
  'maroon', 'rose', 'banana', 'coral', 'gray', 'tan'
];

function getNextAvailableColor(usedColors) {
  const usedSet = new Set(usedColors);
  for (const color of ALL_COLORS) {
    if (!usedSet.has(color)) {
      return color;
    }
  }
  return ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)];
}

function isColorAvailable(colorId, usedColors) {
  return ALL_COLORS.includes(colorId) && !usedColors.includes(colorId);
}

module.exports = {
  ALL_COLORS,
  getNextAvailableColor,
  isColorAvailable,
};
