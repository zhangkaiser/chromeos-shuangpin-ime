# 中文双拼输入法
Chinese shuangpin ime for Chrome OS/Chromium OS/Fyde OS.

无法单独使用（需要与`zhime`一起安装配置交互使用。）

chromium os官方从`M108` 开始添加了对Linux(Constini) IME的支持，支持`GTK3`应用程序（包含`基于Electron`的程序）运行Chrome OS上的IME。详情>> [platform2>vm_tools>cros_im](https://chromium.googlesource.com/chromiumos/platform2/+/f7d8d74636f5a5a6cf9d4e6cf044ff2286f9e1c6/vm_tools/cros_im)


一款Chrome OS／Chromium os／Fyde OS系统应用的中文拼音／双拼输入法(以浏览器插件形式实现)。
支持多种常用双拼解析方案（例：小鹤双拼，拼音加加，o键方案等）输入，支持离线／在线拼音解析支持。

基于google-input-tools输入框架二次开发，添加了google-pinyin（c++ lib）库的支持。
- `2022-01-09` 与`zhime`的交互基本成型，测试版本已发布至[测试下载](https://github.com/zhangkaiser/zhime/releases/tag/0.0.1)。
- `2022-12-31` 重构将UI与后端分离成两个项目,IME UI交互层迁移至[zhime](https://github.com/zhangkaiser/zhime)。
- `2022-11-02` 支持新的词库支持(约40万+)和用户提交词自学习支持。
- `2022-08-23` 添加了对虚拟键盘（触摸键盘）的简单支持。

## 使用说明

使用谷歌应用商店安装:
  - [IME UI控件](https://chrome.google.com/webstore/detail/%E5%8F%8C%E6%8B%BC/enmcjlgogceppnhfkaimbjlcmcnmihbo) － 输入法前端，用来对接chrome os api.
  - [IME Decoder(chrome > 102)](https://chrome.google.com/webstore/detail/ime-decoderbackground-new/fifkgdfgcgfejffmmmnmmkhckkojpdom) － 输入法后端
  - [IME Decoder老版本支持(88<chrome< 02)](https://chrome.google.com/webstore/detail/ime-decoderbackground/gfkldacpjcglnhedhcpdfggejghcphck) － 输入法后端

* 必须先安装`IME UI控件`，然后再安装`IME Decoder`，并且两者缺一不可。
* 当前使用`百度`的云候选词进行云端预测（防止频繁拉取数据被禁，将请求延迟提高到了0.5秒，意味着在输入一个词时可能需要等待>0.5秒的时间才能获取云候选词，这样就造成了一些输入上的不便），所以正常是建议关闭`在线预测词`【快捷键切换：shift + 空格】。

### 源代码编译简单介绍

```shell
git clone --depth 1 https://github.com/zhangkaiser/chromeos-shuangpin-ime.git
# 使用node构建

npm install
npm run build-new
```
