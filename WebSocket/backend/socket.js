let io;

module.exports = {
    init: httpServer => { //서버와 socket연결을 위한 메소드
        io = require('socket.io')(httpServer);
        return io;
    },
    getIO: () => { //socket실행여부 확인을 위한 메소드
        if(!io){
            throw new Error('Socket.io not initialized');
        }
        return io;
    }
};