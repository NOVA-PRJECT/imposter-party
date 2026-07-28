const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateRoomCode(existingCodes = new Set()) {
  let code = '';
  let attempts = 0;
  
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
      code += CHARACTERS[randomIndex];
    }
    attempts++;
    if (attempts > 1000) {
      throw new Error('Failed to generate unique room code');
    }
  } while (existingCodes.has(code));

  return code;
}

module.exports = { generateRoomCode };
