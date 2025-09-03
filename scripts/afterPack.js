const fs = require('fs');
const path = require('path');

exports.default = async function(context) {
  const { appOutDir } = context;
  const rendererSrc = path.join(__dirname, '..', 'dist', 'renderer');
  const rendererDest = path.join(appOutDir, 'resources', 'app', 'dist', 'renderer');
  
  if (fs.existsSync(rendererSrc)) {
    fs.mkdirSync(path.dirname(rendererDest), { recursive: true });
    fs.cpSync(rendererSrc, rendererDest, { recursive: true });
    console.log('Copied renderer files to:', rendererDest);
  }
};