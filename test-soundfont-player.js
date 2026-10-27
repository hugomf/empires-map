const fs = require('fs');
const path = require('path');

try {
  console.log('Testing soundfont-player installation...');
  
  // Check if we can require it
  const SoundfontPlayer = require('soundfont-player');
  console.log('SoundfontPlayer module found:', typeof SoundfontPlayer);
  
  // Check package.json
  const pkg = require('soundfont-player/package.json');
  console.log('Package version:', pkg.version);
  console.log('Package name:', pkg.name);
  
  // Check if soundfont.sf2 exists
  const soundfontPath = path.join(__dirname, 'node_modules/soundfont-player', 'lib', 'soundfont.json');
  
  if (fs.existsSync(soundfontPath)) {
    console.log('Soundfont data file found:', soundfontPath);
  } else {
    console.log('Soundfont data file not found at:', soundfontPath);
  }
  
  console.log('Soundfont-player installation appears to be working.');
  
} catch (error) {
  console.error('Error testing soundfont-player:', error.message);
  console.error('Stack trace:', error.stack);
}
