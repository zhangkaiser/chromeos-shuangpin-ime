# 中文双拼输入法
Chinese shuangpin ime for chrome os/chromium os.

一款Chrome／Chromium os系统应用的中文拼音／双拼输入法(以浏览器插件形式实现)。
支持多种常用双拼解析方案（例：小鹤双拼，拼音加加，o键方案等）输入，支持离线／在线拼音解析支持。

基于google-input-tools输入框架二次开发，添加了google-pinyin（c++ lib）库的支持。

`2022-11-02` 支持新的词库支持(约40万+)和用户提交词自学习支持.
`2022-08-23` 添加了对虚拟键盘（触摸键盘）的简单支持。

## 使用说明

当前版本暂未上传至谷歌应用商店,即如需要使用新的版本请自行下载 `release发行版`并解压安装 或者 通过克隆源代码自行编译生产。

当前版本会触发一些错误，所以在安装到扩展后，建议在扩展详情中关闭`收集错误`的选项。

### 源代码编译简单介绍

```shell
# 使用node构建
npm install

export DECODER_ENGINE=wasm # 当前版本仅支持wasm， 如需要旧版本的js decoder可以自行添加将 zh-js-shuangpin 到manifests／manifest_ime的input_component中（不过使用js decoder是没有必要的）
npm run build:split
```
