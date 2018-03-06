let io = require('socket.io-client'); // 导入Socket.IO客户端
let socket; // 与服务端通信的Socket
let userName; // 登录用户的用户名

// 监听文档加载事件
document.addEventListener('DOMContentLoaded', () => {
    initialize();
    authenticate();
})

// 处理必要的初始化工作
function initialize() {
    socket = io('http://localhost:3000');

    receiveMessage();
}

// 验证登录状态
function authenticate() {
    if (userName) {
        document.querySelector('#logInDiv').style.display = 'none';
        document.querySelector('#gamePanel').style.display = 'block';
    }
    else {
        document.querySelector('#logInDiv').style.display = 'block';
        document.querySelector('#gamePanel').style.display = 'none';
    }
}

// 登录
document.querySelector('#logInButton').addEventListener('click', () => {
    let _userName = document.querySelector('#userNameInput').value;
    if (!_userName) {
        alert('Please input a user name.');
    }
    // 向服务端发送登录请求
    socket.emit('logIn', _userName);
});

// 出招
document.querySelector('#gamePanel .action button').addEventListener('click', () => {
    // socket.emit('play');
    let shapeInput = document.querySelector('#gamePanel .action input:checked');
    if (!shapeInput) {
        alert('请选择招式');
        return;
    }

    socket.emit('play', shapeInput.value);

    document.querySelector('#gamePanel .action span').style.display = 'inline';
})

// 接收服务端通知消息
function receiveMessage() {
    // 接收服务端的登录响应通知
    socket.on('logIn', (data) => {
        if (!data.success) {
            alert(data.message);
            return;
        }

        userName = data.userName;
        authenticate();

        // 维持登录
        setInterval(() => {
            socket.emit('heartbeat');
        }, 10 * 1000);

        // 监听连接断开事件
        socket.on('disconnect', () => {
            alert('断开连接');
            userName = undefined;
            authenticate();
        });
    })

    // 接收服务端的出招响应通知
    socket.on('play', (data) => {
        if (!data) {
            return;
        }

        if (!data.success) { // 服务端通知自己出招失败
            alert(data.message);
            return;
        }

        // 显示出招
        let historyDiv = document.querySelector('#gamePanel .history');
        data.competition.forEach(play => {
            let shapeDiv = document.createElement('div');
            shapeDiv.className = play.userName == userName ? 'me' : 'opponent';
            shapeDiv.innerText = play.userName == userName ? (play.shape + ' :' + play.userName) : (play.userName + ': ' + play.shape);
            historyDiv.appendChild(shapeDiv);
        });

        // 显示结果
        let resultDiv = document.createElement('div');
        resultDiv.className = 'result';
        resultDiv.innerText = (data.winner == 'none' ? '平局' : (data.winner == userName ? '赢了' : '输了'));
        historyDiv.appendChild(resultDiv);

        let hr = document.createElement('hr');
        historyDiv.appendChild(hr);

        document.querySelector('#gamePanel .action span').style.display = 'none';
    })
}