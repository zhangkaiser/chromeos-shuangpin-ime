
var Module = {
  onRuntimeInitialized() {

    let decoder = new this.Decoder();
    let tokens = "chuang|shuang|zhuang|zhang|zhong|chuan|zheng|chuai|huang|niang|qiong|qiang|sheng|chong|liang|cheng|chang|shuan|shuai|shang|xiong|jiang|kuang|zhuai|guang|zhuan|xiang|jiong|gong|hang|ling|lang|teng|ping|guai|long|geng|tang|feng|pang|quan|wang|ruan|peng|fang|pian|piao|gang|fiao|tuan|luan|tong|ting|kang|tiao|tian|huai|sang|juan|leng|seng|jing|qiao|shai|jiao|jian|shan|shao|shei|shen|huan|guan|lian|shou|hong|shua|heng|shui|keng|shun|shuo|song|liao|suan|qian|qing|chao|cang|zhao|zhan|ceng|zhai|niao|chai|chan|zhei|zeng|chen|kuan|chou|kuai|chua|chui|chun|zhua|zuan|nang|zong|zhuo|zhun|zhui|bang|beng|weng|bian|biao|neng|zhou|bing|nian|zhen|chuo|rong|xian|xiao|mang|duan|xing|dong|ding|reng|xuan|diao|dian|kong|deng|meng|yang|ning|cong|zang|rang|cuan|ming|nong|yuan|miao|yong|ying|dang|mian|nuan|qun|pao|qiu|que|qin|pai|zuo|nen|nie|nin|niu|nou|nue|nun|nuo|qie|pan|nei|pei|pen|pie|pin|pou|qia|yue|wan|wei|wen|xia|xie|xin|xiu|xue|xun|yan|yao|yin|you|wai|yun|zai|zan|zao|zei|zen|zha|zhe|zhi|zhu|zou|zui|zun|shu|rao|ren|rou|rui|run|ruo|sai|san|sao|sen|sha|she|shi|ran|sou|sui|sun|suo|tai|tan|tao|tei|tie|tou|tui|tun|tuo|cun|gen|jiu|dao|dan|jue|jun|gei|dai|kai|kan|kao|cuo|jin|kei|ken|gao|cui|kou|dui|cou|kua|kui|kun|gan|gai|hen|gui|gun|guo|gua|die|dia|hai|han|hao|diu|hei|kuo|den|hou|dei|hua|hui|hun|huo|dou|gou|jia|jie|bai|bin|mai|man|mao|bie|fen|ben|bei|bao|ban|mei|men|chu|fei|mie|min|miu|fan|mou|ang|nai|eng|nan|nao|luo|chi|che|lai|lan|lao|dun|lei|cha|lia|lie|lin|duo|cen|fou|lun|lue|cai|lou|can|cao|liu|du|ei|en|xi|wo|ne|wu|er|zh|ai|an|zu|ao|zi|ba|bi|bo|bu|ca|ce|ch|xu|ze|ci|cu|za|yu|da|yo|yi|ye|de|ya|di|ou|nu|ka|sa|mi|me|ke|ru|nv|ri|re|ku|ra|se|la|qu|le|li|qi|pu|po|lu|pi|pa|lv|ma|ju|fa|wa|fo|tu|fu|ni|na|ga|ti|ge|te|gu|ta|su|mu|ha|si|ji|he|hu|mo|a|o|weixin|yigeren|jiazhitixi|weixindadianhua|weixinshurufa|sougou|baidu|pianyidian|tixiwenti|yinghanzi|ganzhiji|maopaofa|paixufa|zuoyong|shuangpinshurufa|yunzaide|zhiweilai|xi'an|tuhuoguo|jiadizi|gaoxiaoxing|gongjuge|guangshawanjian|guanmendagou|meidameixiao|zuidaxiandudeshixian|xiaoshihou|wodemengxiang|tahenhao|kenenghuiyudaobaocuo|yudao|huiyu|laowupeichang|bufuzhongwang".split("|");
    for (let token of tokens) {
      try {
        let candidates = decoder.decode(token, -1);
        if (!candidates) {
          console.error('Get candidates error!', token);
        } else {
          console.log('tokens', token, candidates);
        }
      } catch (e) {
        console.error(e);
        console.error(token);
      }
    }

    let sentences =  [
      ["杨利伟|乘由|长征二号|火箭|运载的|神舟五号|飞船|首次进入|太空|象征着|中国|太空事业|向前迈进|一大步|起到了里程碑的|作用", 
      " yang li wei | cheng you | chang zheng er hao | huo jian | yun zai de | shen zhou wu hao | fei chuan | shou ci jin ru | tai kong | xiang zheng zhe | zhong guo | tai kong shi ye | xiang qian mai jin | yi da bu | qi dao liao li cheng bei de | zuo yong "],
      ["科学发展观|马克思主义|把自己困在笼子里|实践中发现自我|成立于中国|春节联欢晚会|春有百花秋有月|聪明反被聪明误|狗不理包子|走向云原生化|从食物生鲜场景", 
      "ke xue fa zhan guan|ma ke si zhu yi|ba zi ji kun zai long zi li|shi jian zhong fa xian zi wo|cheng li yu zhong guo|chun jie lian huan wan hui|chun you bai hua qiu you yue|cong ming fan bei cong ming wu|gou bu li bao zi|zou xiang yun yuan sheng hua|cong shi wu sheng xian chang jing"]
    ]


    for (let sentence of sentences) {
      let segments = sentence[0].split("|");
      let pinyinSegments = sentence[1].split("|").map((segment) => segment.trim().split(" "));
      segments = segments.map((segment, index) => {
        // let pinyins = pinyin(segment, {
        //   style: "normal",
        //   heteronym: true,
        //   segment: true
        // });
        let pinyins = pinyinSegments[index];
        let pinyin = pinyins.join("'");

        let candidates = decoder.decode(pinyin, -1);

        let isNotChoice = new RegExp(segment).test(candidates);
        return segment + ':' + pinyin + ">" + (isNotChoice ? 'Y' : `N(${candidates})\n`);
      });

      console.log(segments.join(","));

    }

    console.log(decoder.decode("pinduoduo", -1));
    // decoder.decode("pinduoduo", 3);
    // decoder.decode("pinduoduo", -1)
    // console.log(decoder.decode("pinduoduo", 0));


    decoder.clear();

    // pinyinCandNum = decoder.search(token);
    // let hanziList = [];
    // for (let i = 0; i < pinyinCandNum; i++) {
    //   hanziList[i] = decoder.getCandidate(i);
    // }
    // pinyinCandNum = decoder.choose(2);
    // decoder.choose(4);

    // decoder.choose(0);
    // hanziList = [];
    // for(let i = 0; i < pinyinCandNum; i++) {
    //   hanziList[i] = decoder.getCandidate(i);
    // }
    // console.log("choose", hanziList);
    // console.log("choose", decoder.getCandidate(0));
  }
}