const path = require('path');

// 파일이 실행될 수 있도록 파일의 경로를 알려줌
module.exports = path.dirname(require.main.filename);