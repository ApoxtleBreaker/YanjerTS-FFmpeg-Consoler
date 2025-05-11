// 导入模块
const exec = require('child_process').exec;
const inquirer = require('inquirer').default;
const { log } = require('console');
const fs = require('fs');
const path = require('path');

//日志功能
// let msg = '';
// logAdd = (message) => {
//     //获得当前时间
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = (now.getMonth() + 1).toString().padStart(2, '0');
//     const day = now.getDate().toString().padStart(2, '0');
//     const hour = now.getHours().toString().padStart(2, '0');
//     const minute = now.getMinutes().toString().padStart(2, '0');
//     const second = now.getSeconds().toString().padStart(2, '0');
//     const time = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
//     //添加到日志
//     msg += `[${time}] ${message}\n`;
//     fs.writeFile(path.join(__dirname, 'log.txt'), msg, { flag: 'a+' }, (err) => {
//         if (err) {
//             console.log(err);
//         }
//     });
// }
//  [bug]内容会重复加入msg中  这种写法会导致有的内容被反复push(应该是) 用下面的替代方案
//  ↓好像还存在问题 但是起码能记录了 回头再改吧
logAdd = (message) => {
    fs.readFile(path.join(__dirname, 'log.txt'), (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        const msg = data.toString();
        fs.writeFile(path.join(__dirname, 'log.txt'), msg + `[${new Date().toLocaleString()}] ${message}\n`, (err) => {});
    
    });
}
// 默认初始值
let historySave = false; // 是否保存历史记录
//尝试失败就直接跳过读取
    try{
        fs.readFile(path.join(__dirname, 'history.json'), (err, data) => {
        if (err) {
            return;
        }
        userHistory = JSON.parse(data);
        historySave = userHistory.saveHistory;
    });//初始化读取(如果存在)
    }
    catch(err){
        logAdd(`读取历史记录失败: ${err.message}`);
    }
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
        logAdd(`文件路径记录${iFilePath}已保存`);
    }else{
        logAdd(`文件路径记录${iFilePath}已存在,跳过保存`);
    }
    if(!userHistory.fileName.includes(iFileName)){
        userHistory.fileName.push(iFileName);
        logAdd(`文件名记录${iFileName}已保存`);
    }else{
        logAdd(`文件名记录${iFileName}已存在,跳过保存`);
    }
    if(!userHistory.startTime.includes(iStartTime)){
        userHistory.startTime.push(iStartTime);
        logAdd(`开始时间记录${iStartTime}已保存`);     
    }else{
        logAdd(`开始时间记录${iStartTime}已存在,跳过保存`);
    }
    if(!userHistory.endTime.includes(iEndTime)){
        userHistory.endTime.push(iEndTime);
        logAdd(`结束时间记录${iEndTime}已保存`);
    }else{
        logAdd(`结束时间记录${iEndTime}已存在,跳过保存`);
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
    logAdd(`重置默认值: 文件路径=${filePath}, 文件名=${fileName}, 开始时间=${startTime}, 结束时间=${endTime}`);
}
// 格式化时间
function formatTime(time) {
    if(!String(time).includes('.')){
        // time = '00'.split(2-Number(String(time).length)) + String(time);
        if(String(time).length === 1){
            time = '0'+String(time);
        }else if (String(time).length === 2) {
            time = '0'+String(time);
        }else{
            logAdd(`时间格式不正确:${time}`);
            return
        }
        return `00:00:${time}`;   
    }else{
        const parts = time.split('.').map((item) => item.padStart(2, '0'));
        if (parts.length === 2) {
            // 如果只有分钟和秒，补充小时为 00
            return `00:${parts[0]}:${parts[1]}`;
        } else if (parts.length === 3) {
            // 如果有小时、分钟和秒，直接拼接
            return `${parts[0]}:${parts[1]}:${parts[2]}`;
        } else {
            logAdd(`时间格式不正确:${time}`);
            throw new Error('时间格式不正确，应为 hh.mm.ss 或 mm.ss');
        }
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
        logAdd(`结束时间必须大于开始时间: 你输入的${startTime} > ${endTime}`);
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
            logAdd(`接受参数: 文件路径=${answers.filePath}, 文件名=${answers.fileName}, 开始时间=${answers.startTime}, 结束时间=${answers.endTime}`);
            addHistory(answers.filePath, answers.fileName, answers.startTime, answers.endTime);
            logAdd(`写入历史成功`);
            reloadDefaultPrompts(answers.filePath, answers.fileName, answers.startTime, answers.endTime);
            logAdd(`重置初始值成功`);
            filePath = answers.filePath;
            const inputFile = answers.fileName;
            const outputFile = inputFile.split('.').slice(0, -1).join('.') + '-cut.mp4';
            const startTime = formatTime(answers.startTime);
            const endTime = formatTime(answers.endTime);
            try {
                const duration = calculateDuration(startTime, endTime);
                fCut(inputFile, outputFile, startTime, duration)
                    .then(() => logAdd('视频裁剪成功！'))
                    .catch((err) => {
                    logAdd(`视频裁剪失败: ${err.message}`);
                    });
            } catch (error) {
                console.error(error.message);
            }
            finally{
                //不知道怎么异步
                setTimeout(() => {
                    mainMenu();
                }, 2000);
            }
        });
}
//调用cut
function fCut(input, output, startTime, duration) {
    logAdd(`开始裁剪: 输入=${input}, 输出=${output}, 开始时间=${startTime}, 持续时间=${duration}`);
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
    logAdd(`连-对话 触发`);
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
                logAdd(`手动书写模式`);
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
                    logAdd(`输入文件: ${inputFiles}`);
                    let formattedData = '';
                    inputFiles.forEach(item => {
                        formattedData += `file '${item}'\n`;
                    });
                    fs.writeFile(folderPath+'/video.txt', formattedData, (err) => {
                        logAdd(`剪辑参数文件写入失败: ${err.message}`);
                    })
                    const outputFile = answers.output;
                    fcontent(folderPath,outputFile)
                });
            } else if (answers.input === '编辑txt文件') {
                logAdd(`编辑txt文件模式`);
                console.log(`
                    请在${filePath}\\>video.txt<中按顺序写入所有连接视频\n
                    格式:\n
                    file '文件名1.xxx'\n
                    file '文件名2.xxx'\n
                    注意: 请尽量避免使用a-z,A-Z,0-9和常用合法符号以外的字符
                    不要忘记保存[ctrl+s]
                `)
                let folderPath = filePath; // 目标目录
                fs.writeFile(folderPath+'\\video.txt', '', (err) => {
                    logAdd(`剪辑参数文件创建失败: ${err.message}`);
                })
                exec(`start ${filePath}\\video.txt`);
                logAdd(`对话-判断-视频配置是否完成(Y)`);
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'ready',
                        name: '请检查txt内容是否输入完成(Y)',
                        choices: ['Y'],
                    },
                ]).then((answers) => {
                    if (answers.ready === 'Y') {
                        logAdd(`对话-判断-视频配置是否完成-接受(Y)`);
                        inquirer.prompt([
                            {
                                type: 'input',
                                name: 'output',
                                message: '请输入输出文件名',
                                default: `concat_${Math.floor(Date.now() / 1000)}.mp4`, // 使用默认输出文件名
                            },
                        ]).then((answers) => {
                            logAdd(`接受参数:输出文件名: ${answers.output}`);
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
        logAdd(`执行失败: ${error.message}`);
        console.error(`执行失败: ${error.message}`);
    } else {
        logAdd(`执行成功:\n ${stdout}\n`);
        console.log(`执行成功: ${stdout}`);
    }
    });
    logAdd(`执行命令: ${command}`);
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
                logAdd(`程序退出`);
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
            logAdd(`历史记录已保存`);
            console.log('历史记录已保存'+ path.join(__dirname) + '\>history.json\<');
            mainMenu();
        }else{
            historySave = false;
            logAdd(`历史记录取消保存`);
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
                logAdd(`写入历史记录文件失败: ${err.message}`);
            }
        });
};
//读取历史记录文件
function readHistoryFile(){
    fs.readFile(path.join(__dirname, 'history.json'), (err, data) => {
        if (err) {
            logAdd(`读取历史记录文件失败: ${err.message}`);
            return;
        }
        userHistory = JSON.parse(data);
    });
}
