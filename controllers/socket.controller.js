
const io = require('socket.io')(http);

exports.emitMessageToAdmin = function (UPDATE_EVENT, module, data) {
    try {
        io.emit(UPDATE_EVENT, { module, data });
    } catch (error) {
        console.log('error emitting message')
    }
};