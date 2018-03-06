// Setup basic express server
let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io')(server);
let port = 3000;

// 导入游戏逻辑
let gameLogic = require('./gameLogic');
let game = gameLogic();


app.get('/', function (req, res) {
    res.send('test..');
});

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Number of logged-in users
let numUsers = 0;

io.on('connection', function (socket) {
    let loggedIn = false;

    // when the client emits 'play', this listens and executes
    socket.on('play', function () {
        // 验证登录
        if (!socket.userName) {
            socket.emit('play', {
                success: false,
                message: '请先登录'
            });

            return;
        }

        // 判断是否所有玩家都已登录
        if (numUsers < 2) {
            socket.emit('play', {
                success: false,
                message: '请等待所有玩家登录'
            });

            return;
        }

        // 出招
        let handShape = game.play(socket.userName);
        if (!handShape.success) { // 通知当前玩家，在一局结束前不能重复出招
            socket.emit('play', {
                success: false,
                message: handShape.message
            });

            return;
        }

        // 通知所有玩家当前玩家的出招
        io.emit('play', handShape);
    });

    // when the client emits 'logIn', this listens and executes
    socket.on('logIn', function (userName) {
        // Prevent repeated log-in
        if (loggedIn) {
            socket.emit('logIn', {
                success: false,
                message: 'Log in repeatedly.'
            })
            return;
        }

        // At most 2 users are allowed.
        if (numUsers >= 2) {
            socket.emit('logIn', {
                success: false,
                message: 'The server is full.'
            })
            return;
        }

        // we store the userName in the socket session for this client
        socket.userName = userName;
        ++numUsers;
        loggedIn = true;
        
        socket.emit('logIn', {
            success: true,
            message: 'OK.',
            userName
        })
    });



    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        if (loggedIn) {
            --numUsers;

            game.leave(socket.userName);

            // echo globally that this client has left
            socket.broadcast.emit('userLeft', {
                userName: socket.userName,
                numUsers: numUsers
            });
        }
    });
});