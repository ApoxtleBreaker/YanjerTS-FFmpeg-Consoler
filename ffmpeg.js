// 导入模块
const exec = require('child_process').exec;
const inquirer = require('inquirer').default;
const fs = require('fs');
const path = require('path');

// 默认初始值
let historySave = false; // 是否保存历史记录
    fs.readFile(path.join(__dirname, 'history.json'), (err, data) => {
        if (err) {
            return;
        }
        userHistory = JSON.parse(data);
        historySave = userHistory.saveHistory;
    });//初始化读取(如果存在)
let filePath = 'G:/剪辑/素材/';
let fileName = '2025-05-02_13-00-31.mp4';
let startTime = 32.11; // 默认开始时间
let endTime = 99.99;   // 默认结束时间
startTime = String(startTime).padStart(5, '0'); // 补全为 00:00.00 格式
endTime = String(endTime).padStart(5, '0'); // 补全为 00:00.00 格式
//历史记录存储变量
let userHistory = {
    saveHistory: true,
    filePath: [],
    fileName: [],
    startTime: [],
    endTime: []
}
//刷新历史记录
function addHistory(iFilePath, iFileName, iStartTime, iEndTime) {
    //如果存在则忽略
    if(!userHistory.filePath.includes(iFilePath)){
        userHistory.filePath.push(iFilePath);
    }
    if(!userHistory.fileName.includes(iFileName)){
        userHistory.fileName.push(iFileName);
    }
    if(!userHistory.startTime.includes(iStartTime)){
        userHistory.startTime.push(iStartTime);
    }
    if(!userHistory.endTime.includes(iEndTime)){
        userHistory.endTime.push(iEndTime);
    }
    if(historySave){
        writeHistoryFile();
    }
}
// 重置默认值
function reloadDefaultPrompts(iFilePath, iFileName, iStartTime, iEndTime) {
    if (iFilePath !== undefined && iFilePath !== '' && iFilePath !== ' '&& iFilePath !== null) {
        filePath = iFilePath;
    }
    if (iFileName !== undefined && iFileName !== '' && iFileName !== ' '&& iFileName !== null) {
        fileName = iFileName;
    }
    if (iStartTime !== undefined && iStartTime !== '' && iStartTime !== ' '&& iStartTime !== null) {
        startTime = iStartTime;
    }
    if (iEndTime !== undefined && iEndTime !== '' && iEndTime !== ' '&& iEndTime !== null) {
        endTime = iEndTime;
    }
}
// 格式化时间
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
// 接受cut {路径 输入 输出 开始时间 持续时间}
function cut() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'filePath',
                message: '请输入文件路径',
                default: filePath, // 使用默认文件路径
            },
            {
                type: 'input',
                name: 'fileName',
                message: '请输入文件名',
                default: fileName, // 使用默认文件名
            },
            {
                type: 'input',
                name: 'startTime',
                message: '请输入开始时间（格式：hh.mm.ss 或 mm.ss）',
                default: startTime, // 使用默认开始时间
            },
            {
                type: 'input',
                name: 'endTime',
                message: '请输入结束时间（格式：hh.mm.ss 或 mm.ss）',
                default: endTime, // 使用默认结束时间
            },
        ])
        .then((answers) => {
            addHistory(answers.filePath, answers.fileName, answers.startTime, answers.endTime);
            reloadDefaultPrompts(answers.filePath, answers.fileName, answers.startTime, answers.endTime);
            filePath = answers.filePath;
            const inputFile = answers.fileName;
            const outputFile = inputFile.split('.').slice(0, -1).join('.') + '-cut.mp4';
            const startTime = formatTime(answers.startTime);
            const endTime = formatTime(answers.endTime);
            try {
                const duration = calculateDuration(startTime, endTime);
                fCut(inputFile, outputFile, startTime, duration)
                    .then(() => console.log('视频裁剪成功！'))
                    .catch((err) => console.error('视频裁剪失败！', err));
            } catch (error) {
                console.error(error.message);
            }
            finally{
                setTimeout(() => {
                    mainMenu();
                }, 2000);
            }
        });
}
//调用cut
function fCut(input, output, startTime, duration) {
    const folderPath = filePath; // 目标目录
    return new Promise((resolve, reject) => {
        // 切换到目标目录后执行 ffmpeg 命令
        const command = `cd "${folderPath}" && ffmpeg -ss ${startTime} -i "${input}" -t ${duration} -c:v copy -c:a copy "${output}"`;
        console.log(`执行命令: ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`执行失败: ${error.message}`);
                reject(error);
            } else {
                console.log(`执行成功: ${stdout}`);
                resolve(stdout);
            }
        });
    });
}
// 接受concat {路径 输入[] 输出 }
function concat() {
    inquirer.prompt([
            {
                type: 'input',
                name: 'filePath',
                message: '请输入文件路径',
                default: filePath, // 使用默认文件路径
            },
            {
                type: 'list',
                name: 'input',
                message: '请选择模式',
                choices: ['手动书写', '编辑txt文件'],
            }
        ]).then((answers) => {
            const folderPath = answers.filePath; // 目标目录
            if (answers.input === '手动书写') {
                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'input',
                        message: '请输入输入文件名: 文件名1|文件名2|文件名3',
                        default: '1.mp4|2.mp4|3.mp4', // 使用默认输入文件名
                    },
                    {
                        type: 'input',
                        name: 'output',
                        message: '请输入输出文件名',
                        default: `concat_${Math.floor(Date.now() / 1000)}.mp4`, // 使用默认输出文件名
                    },
                ]).then((answers) => {
                    const inputFiles = answers.input.split('|');
                    let formattedData = '';
                    inputFiles.forEach(item => {
                        formattedData += `file '${item}'\n`;
                    });
                    fs.writeFile(folderPath+'/video.txt', formattedData, (err) => {})
                    const outputFile = answers.output;
                    fcontent(folderPath,outputFile)
                });
            } else if (answers.input === '编辑txt文件') {
                console.log(`
                    请在${filePath}\\>video.txt<中按顺序写入所有连接视频\n
                    格式:\n
                    file '文件名1.xxx'\n
                    file '文件名2.xxx'\n
                    注意: 请尽量避免使用a-z,A-Z,0-9和常用合法符号以外的字符
                    不要忘记保存[ctrl+s]
                `)
                let folderPath = filePath; // 目标目录
                fs.writeFile(folderPath+'\\video.txt', '', (err) => {})
                exec(`start ${filePath}\\video.txt`);
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'ready',
                        name: '请检查txt内容是否输入完成(Y)',
                        choices: ['Y'],
                    },
                ]).then((answers) => {
                    if (answers.ready === 'Y') {
                        inquirer.prompt([
                            {
                                type: 'input',
                                name: 'output',
                                message: '请输入输出文件名',
                                default: `concat_${Math.floor(Date.now() / 1000)}.mp4`, // 使用默认输出文件名
                            },
                        ]).then((answers) => {
                            const folderPath = filePath; // 目标目录
                            const outputFile = answers.output;
                            fcontent(folderPath,outputFile)
                        })
                    }
                });
            }
        });
}
// 调用concat
function fcontent(ifolderPath,ioutputFile){
    const command = `cd "${ifolderPath}" && ffmpeg -f concat -i video.txt -c copy ${ioutputFile}`;
    exec(command, (error,stdout,) => {
    if (error) {
    console.error(`执行失败: ${error.message}`);
    } else {
    console.log(`执行成功: ${stdout}`);
    }
    });
    console.log(`执行命令: ${command}`);
}
//

// 主菜单
function mainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'type',
            message: '欢迎使用YanjerTS-ffmpeg-Consoler',
            choices: ['视频处理', '设置','退出'],
        },
    ])
    .then((answers) => {
        switch (answers.type) {
            case '视频处理':
                editor();
                break;
            case '设置':
                setting();
                break;
            case '退出':{
                console.log('退出程序');
                process.exit(0); // 退出程序
                break;
            }
            default:{}
        }
    });
}
mainMenu();
readHistoryFile()
// 剪辑选择
function editor() {
        inquirer
    .prompt([
        {
            type: 'list',
            name: 'type',
            message: '选择功能区',
            choices: ['剪', '连', '返回'],
        },
    ])
    .then((answers) => {
        switch (answers.type) {
            case '剪':
                cut();
                break;
            case '连':
                concat();
                break;
            case '视频转音频':
                mp4ToMp3();
                break;
            case '返回':
                mainMenu();
            default:{}
        }
    });
}
// 设置选择
function setting(){
        inquirer.prompt([
        {
            type: 'list',
            name: 'type',
            message: 'Yanjer-ffmpeg-Consoler',
            choices: ['历史记录', '是否保存历史记录为文件(默认不保存，缓存在关闭后清除)','返回'],
        },
    ])
    .then((answers) => {
        switch (answers.type) {
            case '历史记录':
                history();
                break;
            case '是否保存历史记录为文件(默认不保存，缓存在关闭后清除)':
                ifSaveHistory();
                break;
            case '返回':
                mainMenu();
            default:{}
        }
    });
}
//显示历史记录
function history(){
    console.log('===历史记录===');
    console.log('文件路径：');
    userHistory.filePath.forEach(item => console.log(item))
    console.log('文件名：');
    userHistory.fileName.forEach(item => console.log(item))
    console.log('开始时间：');
    userHistory.startTime.forEach(item => console.log(item))
    console.log('结束时间：');
    userHistory.endTime.forEach(item => console.log(item))
    inquirer.prompt([
        {
            type: 'list',
            name: 'type',
            message: '回到主菜单',
            choices: ['返回'],
        },
    ])        
    .then((answers) => {
            switch (answers.type) {
                case '返回':
                    mainMenu();
                    break;
                default:{}
            }
        });
}
//选择是否保存历史记录
function ifSaveHistory(){
    inquirer.prompt([
        {
            type: 'list',
            name: 'type',
            message: '是否保存历史记录',
            choices: ['Yes', 'No'],
        },
    ])
    .then((answers) => {
        if(answers.type === 'Yes'){
            historySave = true;
            writeHistoryFile();
            console.log('历史记录已保存'+ path.join(__dirname) + '\>history.json\<');
            mainMenu();
        }else{
            historySave = false;
            console.log('历史记录未保存');
            mainMenu();
        }
    });
};
// 写入历史记录文件
function writeHistoryFile(){
    fs.writeFile(path.join(__dirname, 'history.json'), JSON.stringify(userHistory), (err) => {
            //把对象history写入文件
            if (err) {
                console.error(err);
            }
        });
};
//读取历史记录文件
function readHistoryFile(){
    fs.readFile(path.join(__dirname, 'history.json'), (err, data) => {
        if (err) {
            return;
        }
        userHistory = JSON.parse(data);
    });
}
