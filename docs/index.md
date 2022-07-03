## chromeos双拼输入法

一款适用于chromeos／chromiumos的双拼输入法（SHUANGPIN IME），基于google-input-tools二次开发，支持在线／离线输入。

由于 __谷歌应用商店__ 后续将暂停对 `MV2` 扩展程序的支持，后续此主分支将不再更新，现相关更新将提交到其他分支内，如有需求可查看其他分支。

后续 `MV2` 版本更新将不再上传到 __应用商店__，但现此版本可以正常使用，也可在应用商店正常下载。

## 主要功能描述
- 支持拼音加加/小鹤双拼/微软双拼/中文之星等双拼解决方案。
- 使用o键来引导零声母
- 支持切换简体/繁体输出
- 支持纵向/横向显示候选词(横向展示时在新的OS版本可能会有显示BUG)
- 支持多种在线解析引擎

经过现实场景使用及测试，可用性可达到95%以上，但依然有部分BUG需要等待修复(例如:虚拟键盘上的Bug,用户词库储存上的Bug,交互上的Bug)。

###　下载与安装方式

__源代码安装__
```shell
git clone --depth 1 https://github.com/zhangkaiser/chromeos-shuangpin-ime.git

# 请确保已经安装了Node
cd chromeos-shuangpin-ime
npm install # 安装依赖

npm run build # 构建项目 默认生成在`dist`目录
```


[安装包](https://github.com/zhangkaiser/chromeos-shuangpin-ime/releases) `现安装包未更新至最新`

[谷歌应用商店](https://chrome.google.com/webstore/detail/enmcjlgogceppnhfkaimbjlcmcnmihbo)
1. 应用安装成功
2. 打开`系统设置>语言和输入法>输入法>添加输入法`
3. 列表中找到 __双拼输入法__ 并添加

默认使用`拼音加加`双拼解决方案，可以在`此扩展的选项页面`选择其它解决方案。
