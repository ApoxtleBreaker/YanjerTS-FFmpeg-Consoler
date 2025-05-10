// 旧的测试文件  无需继续作为主要开发项目
// old test file, no need to continue as the main development project

let fileName = '2025-05-02_13-00-31.mp4';
let startTime = 32.11
let endTime = 99.99
// 导入模块
const inquirer = require('inquirer').default; // 使用最新版的语法
const { exec } = require('child_process');

// 执行 ffmpeg 命令
function fCut(input, output, startTime, duration) {
    const command = `ffmpeg -ss ${startTime} -i ${input} -to ${duration} -c:v copy -c:a copy ${output}`;
    exec(`echo ${command} | clip`, (error) => {
        if (error) {
            console.error('复制失败:', error);
        } else {
            console.log('内容已复制到剪贴板！');
        }
    });
    return command;
}

//格式化
function formatTime(time) {
    const parts = time.split('.').map((item) => item.padStart(2, '0'));

    if (parts.length === 2) {
        // 如果只有分钟和秒，补充小时为 00
        return `00:${parts[0]}:${parts[1]}`;
    } else if (parts.length === 3) {
        // 如果有小时、分钟和秒，直接拼接
        return `${parts[0]}:${parts[1]}:${parts[2]}`;
    } else {
        throw new Error('时间格式不正确，应为 hh.mm.ss 或 mm.ss');
    }
}
// 计算持续时间
function calculateDuration(startTime, endTime) {
    const toSeconds = (time) => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0); // 转换为总秒数
    };

    const fromSeconds = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // 确保格式正确，小时为 0 时省略小时部分
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    };

    const startSeconds = toSeconds(startTime);
    const endSeconds = toSeconds(endTime);
    const durationSeconds = endSeconds - startSeconds;

    if (durationSeconds <= 0) {
        throw new Error('结束时间必须大于开始时间');
    }

    return fromSeconds(durationSeconds);
}

startTime = formatTime(String(startTime));
endTime = formatTime(String(endTime));

// 输入开始和终止时间
inquirer.prompt([
    {
        type: 'input',
        name: 'input',
        message: '请输入视频文件路径',
        default: fileName,
    },
    {
        type: 'input',
        name: 'startTime',
        message: '请输入开始时间',
        default: startTime,
    },
    {
        type: 'input',
        name: 'endTime',
        message: '请输入结束时间',
        default: endTime, // 修正为结束时间，而不是持续时间
    },
]).then((answers) => {
    const { input, startTime, endTime } = answers;
    const output = input.replace('.mp4', '_cut.mp4');
    const duration = calculateDuration(startTime, endTime); // 重新计算持续时间
    //输出结果
    let command = fCut(input, output, startTime, duration); // 使用持续时间
    console.log(command);
});