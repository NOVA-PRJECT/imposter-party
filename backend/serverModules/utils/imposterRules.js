function getMaxImposters(totalPlayers) {
  return Math.max(1, Math.ceil(totalPlayers / 5));
}

module.exports = { getMaxImposters };
