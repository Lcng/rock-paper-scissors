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

    // 接收服务端的登录响应通知
    socket.on('logIn', (data) => {
        if (!data.success) {
            alert(data.message);
            return;
        }

        userName = data.userName;
        authenticate();
    })

    // 接收服务端的出招响应通知
    socket.on('play', (data) => {
        if (!data.success) { // 服务端通知自己出招失败
            alert(data.message);
            return;
        }

        // 显式出招结果
        let shapeDiv = document.createElement('div');
        shapeDiv.className = data.userName == userName ? 'me' : 'opponent';
        shapeDiv.innerText = data.shape;
        let historyDiv = document.querySelector('#gamePanel .history');
        historyDiv.appendChild(shapeDiv);

        // 服务端返回了赢家，那么显式它
        if (data.winner) {
            let resultDiv = document.createElement('div');
            resultDiv.className = 'result';
            resultDiv.innerText = (data.winner == 'none' ? '平局' : (data.winner == userName ? '赢了' : '输了'));
            historyDiv.appendChild(resultDiv);
        }

        // alert(data);
    })
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
    socket.emit('play');
})