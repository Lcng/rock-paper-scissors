exports = module.exports = gameLogic;

function gameLogic() {
    let shapes = ['石头', '剪刀', '布'];
    let competition; // 当前对局
    let competitionResult; // 当前对局结果

    let user1, user2;


    return {
        // 出招
        play: function (userName, shapeValue) {
            // 如果对局没有开始，那么创建一个对局
            if (!competition) {
                competition = [];
            }

            // 如果玩家已出招，那么阻止他重复出招
            if (exists(competition, userName)) {
                return {
                    success: false,
                    message: '当前对局尚未结束'
                }
            }

            // 记录玩家出招
            let play = {
                userName,
                value: shapeValue,
                shape: shapes[shapeValue]
            };
            competition.push(play);

            console.log('对局人数: ' + competition.length);

            // 如果出招数量少于2，那么等待对手出招
            if (competition.length < 2) {
                return {
                    success: true,
                    message: '等待对手出招'
                };
            }

            // 计算赢家并返回
            let winner = getWinner(competition);
            console.log('all: ');
            console.log(competition);
            competitionResult = {
                success: true,
                winner,
                competition
            };
            competition = undefined;
            return competitionResult;
        },

        // 离开游戏
        leave: function (userName) {
            if (competition) {
                let index = competition.findIndex(x => x.userName == userName);
                competition.splice(index, 1);
            }
        }
    }
}

// 获取一局中的赢家
function getWinner(competition) {
    let play1 = competition[0];
    let play2 = competition[1];

    let difference = play1.value - play2.value;

    if (difference == -1 || difference == 2) {
        return play1.userName;
    }

    if (difference == -2 || difference == 1) {
        return play2.userName;
    }

    console.log('un: none');
    return 'none';
}

// 检查指定的玩家是否已出招
function exists(competition, userName) {
    for (let item of competition) {
        if (item.userName == userName) {
            return true;
        }
    }

    return false;
}