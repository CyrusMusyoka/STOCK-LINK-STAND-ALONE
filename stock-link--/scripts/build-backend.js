const { exec } = require('child_process');
const path = require('path');

const backendPath = path.resolve(__dirname, '..', 'backend');


exec('npm install', { cwd: backendPath, shell: true }, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Error installing backend deps: ${error.message}`);
    return;
  }
  console.log(stdout);
  if (stderr) {
    console.error(stderr);
  }
});
