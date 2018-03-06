exports = module.exports = gameLogic;

function gameLogic() {
    let shapes = ['石头', '剪刀', '布'];
    let competition; // 当前对局

    return {
        pay: function (userName) {
            if (!competition) { // 如果对局没有开始，那么创建一个对局
                competition = new Map();
            }

            if (competition.get(userName)) {
                return {
                    success: false,
                    message: '当前对局尚未结束'
                }
            }

            let value = Math.floor(Math.random() * 3); // 获得0~2之间的随机数
            let handShape = {
                success: true,
                userName,
                value,
                shape: shapes[value]
            };

            competition.set(userName, handShape);

            console.log('对局人数: ' + competition.size);
            if (competition.size >= 2) {
                competition = undefined;
            }
            
            return handShape;
        }
    }
}
