const multer = require("multer"); // هذا السطر ناقص عندك

const storage = multer.diskStorage({});
const upload = multer({ storage });

module.exports = upload;