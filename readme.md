# YanjerTS-FFmpeg-Consoler

一个基于 Node.js 和 FFmpeg 的命令行工具，用于视频剪辑、合并等处理。

## 功能
- **视频剪辑**：通过指定开始时间和结束时间裁剪视频。
- **视频合并**：支持通过输入文件名合并多个视频。
- **音频提取**：将视频文件转换为音频文件（待制作）。
- **历史记录**：记录用户的操作历史，可选择是否保存为文件。(需进一步构思逻辑 优化方案)

## 环境要求
- **Node.js**：>=16.0.0
- **FFmpeg**：需要在系统中安装并配置到环境变量中。

## 安装
1. 克隆项目到本地：
   ```bash
   git clone https://github.com/yjfankui/ffmpeg-project.git
   cd ffmpeg-project
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 运行项目：
   ```bash
   node ffmpeg.js
   ```
   或直接打开start.cmd文件运行。

## 注意事项
- 目前仅支持 Windows 系统。

## 未来规划
- 加入一键把一个视频按照一个时间剪成两段(或多段)的功能
- 优化选择逻辑
- 增加音频提取功能
- 增加音量更改
- 其他功能根据用户需求再添加
- 未来可能发展为GUI版本(预计通过electron)

## 鸣谢
感谢[FFmpeg](https://www.ffmpeg.org/)项目提供的强大功能。

# Translations(English)
This is a command-line tool based on Node.js and FFmpeg, which is used for video editing, such as cutting, merging, etc.

## Features
- **Video cutting**: Crop the video by specifying the start time and end time.
- **Video merging**: Merge multiple videos by inputting file names.
- **Audio extraction**: Convert a video file to an audio file (to be developed).
- **History record**: Record user's operations and choose whether to save as a file. (To be optimized)

## Environment requirements
- **Node.js**: >=16.0.0
- **FFmpeg**: Install and configure it to the system environment variable.

## Installation
1. Clone the project to local:
   ```bash
   git clone https://github.com/yjfankui/ffmpeg-project.git
   cd ffmpeg-project
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the project:
   ```bash
   node ffmpeg.js
   ```
   Or run start.cmd directly.

## Note
- Currently, only Windows system is supported.

## Future planning
- Add a function to cut a video into two or more parts at a specified time (or more)
- Optimize the selection logic
- Add audio extraction function
- Add volume adjustment
- Add other functions as needed
- May develop into a GUI version (expected to be developed by electron)

## Acknowledgements
Thanks to the powerful features provided by the [FFmpeg](https://www.ffmpeg.org/) project.