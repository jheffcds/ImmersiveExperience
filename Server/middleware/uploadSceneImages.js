// middleware/uploadSceneImages.js
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// This accepts a sceneId and returns multer middleware
function createSceneUploadMiddleware(sceneId) {
  const scenePath = path.join(__dirname, '..', 'scenes', sceneId);

  // Ensure directory exists
  if (!fs.existsSync(scenePath)) {
    fs.mkdirSync(scenePath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, scenePath),
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + file.originalname;
      cb(null, uniqueName);
    }
  });

  return multer({ storage }).array('images', 10); // max 10 files
}

module.exports = createSceneUploadMiddleware;
