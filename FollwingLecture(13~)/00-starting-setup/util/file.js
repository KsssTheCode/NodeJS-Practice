const fs = require('fs');

const deleteFile = (filePath) => {
    //unlink('경로') : 해당 경로에 이름으로 연결된 파일을 삭제
    fs.unlink(filePath, (err) => {
        if(err){
            throw (err);
        }
    })
}

exports.deleteFile = deleteFile;