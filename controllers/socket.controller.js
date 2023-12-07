
const io = require('socket.io')(http);

exports.emitMessageToAdmin = function (EVENT, module, data) {
    try {
        io.emit(EVENT, { module, data });
    } catch (error) {
        console.log('error emitting message')
    }
};