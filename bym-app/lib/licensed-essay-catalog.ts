import { appPath } from '@/lib/app-path';

export type LicensedEssay = {
  slug: string;
  author: string;
  publication: string;
  handle: string;
  title: string;
  originalTitle: string;
  subtitle: string;
  published: string;
  readingTime: string;
  coverImage: string;
  coverAlt: string;
  authorAvatar: string;
  photoCredit: string;
  photoSource: string;
  originalUrl: string;
  paragraphs: string[];
  translationComplete?: boolean;
  medicalNotice?: boolean;
};

const cover = (number: number, extension = 'jpeg') =>
  appPath(`/licensed-essays/essay-${String(number).padStart(2, '0')}.${extension}`);

export const licensedEssays: Record<string, LicensedEssay> = {
  'climate-connections': {
    slug: 'climate-connections', author: 'Emily Atkin', publication: 'HEATED', handle: 'heated-emily-atkin',
    title: '是谁在告诉你：气候变化没什么大不了？', originalTitle: 'Who’s telling you climate change is no big deal?',
    subtitle: '当“最坏情境不再最可能”被偷换成“气候危机已经过去”，谁从中获益？', published: '2026年10月8日', readingTime: '12 分钟',
    coverImage: cover(1, 'png'), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'HEATED / Emily Atkin', photoSource: 'https://heated.world/p/how-good-climate-news-became-fossil', originalUrl: 'https://heated.world/p/how-good-climate-news-became-fossil',
    paragraphs: ['一份关于气候传播、利益网络与“好消息被误读”的授权译文。本文提醒我们：科学情境的更新，不等于风险消失；更要追问一段论述被谁放大、服务于什么样的政治不作为。'],
  },
  'forest-management': {
    slug: 'forest-management', author: 'Emily Atkin、Tracy Wholf、Miranda Green', publication: 'HEATED', handle: 'heated-emily-atkin',
    title: '“森林管理”神话', originalTitle: 'The myth of “forest management”',
    subtitle: '照顾森林可以降低部分风险，但它不能替代应对气候变化。', published: '2026年9月24日', readingTime: '8 分钟',
    coverImage: cover(2), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'HEATED', photoSource: 'https://heated.world/p/the-myth-of-forest-management', originalUrl: 'https://heated.world/p/the-myth-of-forest-management',
    paragraphs: [
      '在 HEATED 播客第一季里，Tracy 和我尝试了很多不同的选题和形式。五个月做了二十多期，从水力压裂废料、化石燃料广告、时尚行业的“漂绿”，一直讲到针对气象科学的攻击。我们一路做，一路摸索。',
      '但最后，有一期的表现远远超过其他节目：那期专门拆解关于电动车的常见迷思。到今天，它的下载量已经超过 9 万次，而其他免费节目的平均下载量大约只有 6400 次。挺不可思议的，对吧？好在我们自己也很喜欢做那一期。所以第二季，Tracy 和我决定多做这种节目，其他形式则大幅减少。我们不再做二十期什么都谈的节目，而是只做六期纯音频内容，每一期都集中反驳一种越来越难以躲开的错误气候论调。',
      '第一期要谈的是：“森林管理”能够解决野火危机。我们经常听到这种说法，尤其是在破坏性野火发生以后，共和党政客总会反复提起它。',
      '老实说，我原以为这一题会很简单。这些年我采访过足够多的科学家，知道更好地照护森林确实有助于降低部分野火风险，但仅靠这一点解决不了问题。我们也必须应对气候变化；共和党政客之所以从来不提，是因为化石燃料行业的资金让他们选择了沉默。我本来以为把这一点解释清楚，节目就可以收尾。',
      '可后来，我采访到一位科学家，他对前半个判断提出了挑战——也就是，森林管理究竟是不是野火解决方案的一部分。他认为，政客口中的大多数“森林管理”，其实只是工业化伐木；这种做法不但没有效果，反而正在让野火变得更严重。我以前几乎没听过这个论点。为了判断他和持相似观点的科学家是否正确，我越查越深，最后掉进了一场激烈的科学争论；在此之前，我甚至不知道这场争论存在。',
      '就在我深陷其中、觉得自己可能永远理不清时，洛杉矶时报播客《Boiling Point》的主持人 Miranda Green 打来电话，问我愿不愿意合作做一期节目。我把自己的困境告诉她，于是一次联合报道就这样开始了。',
      '第二季第一期里，Miranda 和我走进了一场在野火政治讨论中几乎听不到的争论。我们远远没有解决它，甚至没有覆盖它的每一个方面。但我们确实看见，“森林管理”的迷思比我原先以为的更大：人们仿佛相信，这个含混的词代表一种对所有森林都可靠的统一办法，也仿佛只要在林地里做足够多的工作，就能抵消不断变暖的气候。',
      '我知道这期节目会触怒一些人。你可以在本文上方收听，也可以在常用的播客应用里搜索“HEATED”。',
      'HEATED 播客之所以能够存在，完全依靠愿意支持它的个人听众——我们不投放广告，也不接受赞助。如果你的条件允许，成为付费订阅者可以帮助我们继续做这样的工作。',
    ],
    translationComplete: true,
  },
  'postcard-denmark': {
    slug: 'postcard-denmark', author: 'David Roberts、Nate', publication: 'Volts', handle: 'volts-david-roberts',
    title: '来自丹麦的明信片', originalTitle: 'Volts community thread #31: Postcard from Denmark',
    subtitle: '一座高社会信任社会，如何把绿色基础设施变成日常生活。', published: '2026年10月12日', readingTime: '10 分钟',
    coverImage: cover(3), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Volts', photoSource: 'https://www.volts.wtf/p/volts-community-thread-31-postcard', originalUrl: 'https://www.volts.wtf/p/volts-community-thread-31-postcard',
    paragraphs: ['从自行车道、区域供暖到工业共生，作者观察到的并不只是基础设施，而是一种能让长期规划真正发生的公共信任。'],
  },
  'permitting-reform': {
    slug: 'permitting-reform', author: 'David Roberts', publication: 'Volts', handle: 'volts-david-roberts',
    title: '新的联邦许可改革法案，到底改了什么？', originalTitle: 'What’s up with the new federal permitting reform bill?',
    subtitle: '一份对美国许可改革、能源建设与环境保护取舍的深度访谈。', published: '2026年10月9日', readingTime: '18 分钟',
    coverImage: cover(4), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Volts', photoSource: 'https://www.volts.wtf/p/whats-up-with-the-new-federal-permitting', originalUrl: 'https://www.volts.wtf/p/whats-up-with-the-new-federal-permitting',
    paragraphs: ['这篇访谈不把许可改革简化为“支持或反对建设”。它试图把法案的具体机制、不同阵营的担忧，以及速度与程序正义之间的冲突逐一摆上台面。'],
  },
  'decent-and-desperate': {
    slug: 'decent-and-desperate', author: 'Bill McKibben', publication: 'The Crucial Years', handle: 'bill-mckibben',
    title: '别让“还不错”成为“迫在眉睫”的敌人', originalTitle: 'Making the Decent the Enemy of the Desperate',
    subtitle: '关于许可改革、能源排队与气候行动速度的一则思考。', published: '2026年10月13日', readingTime: '10 分钟',
    coverImage: cover(5), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Bill McKibben', photoSource: 'https://billmckibben.substack.com/p/making-the-decent-the-enemy-of-the', originalUrl: 'https://billmckibben.substack.com/p/making-the-decent-the-enemy-of-the',
    paragraphs: ['作者从一项许可改革争议出发，讨论在气候紧急状态下，怎样区分“足够好”的妥协与会让问题继续拖延的让步。'],
  },
  'ai-agent-security': {
    slug: 'ai-agent-security', author: 'Marty Swant、Alex Kantrowitz', publication: 'Big Technology', handle: 'big-technology',
    title: 'AI 代理越界事件：目前我们知道什么', originalTitle: 'Here’s Everything OpenAI’s Bots (And Others) Have Hacked Or Considered Hacking',
    subtitle: '当自主代理开始访问真实系统，能力、授权与责任的边界如何重画？', published: '2026年9月28日', readingTime: '9 分钟',
    coverImage: cover(6), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Big Technology', photoSource: 'https://www.bigtechnology.com/p/heres-everything-openais-bots-and', originalUrl: 'https://www.bigtechnology.com/p/heres-everything-openais-bots-and',
    paragraphs: ['一份持续更新式的事件梳理：当 AI 代理被指控越权访问或尝试访问真实系统时，究竟发生了什么，又有哪些说法仍待验证。'],
  },
  'the-overhang': {
    slug: 'the-overhang', author: 'Ethan Mollick', publication: 'One Useful Thing', handle: 'one-useful-thing',
    title: '能力余量', originalTitle: 'The Overhang',
    subtitle: '在 AI 能力持续上升时，人仍可依靠的四种优势。', published: '2026年9月18日', readingTime: '11 分钟',
    coverImage: cover(7), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'One Useful Thing', photoSource: 'https://www.oneusefulthing.org/p/the-overhang', originalUrl: 'https://www.oneusefulthing.org/p/the-overhang',
    paragraphs: ['作者提出，深度知识、广度知识、品味与行动力并不会因为 AI 变强而失效；相反，它们决定了你能否判断、选择并把工具真正用到有价值的地方。'],
  },
  'twilight-chatbots': {
    slug: 'twilight-chatbots', author: 'Ethan Mollick', publication: 'One Useful Thing', handle: 'one-useful-thing',
    title: '聊天机器人的黄昏', originalTitle: 'The twilight of the chatbots',
    subtitle: '当模型能力沿着指数曲线变化，工作本身会如何被改写？', published: '2026年6月30日', readingTime: '10 分钟',
    coverImage: cover(8), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'One Useful Thing', photoSource: 'https://www.oneusefulthing.org/p/the-twilight-of-the-chatbots', originalUrl: 'https://www.oneusefulthing.org/p/the-twilight-of-the-chatbots',
    paragraphs: ['这篇文章不只讨论“更强的聊天机器人”。它试着描绘当能力升级、成本下降和工作流程重组同时发生时，人如何重新定义自己的任务与协作。'],
  },
  'gelsinger-hardware': {
    slug: 'gelsinger-hardware', author: 'Babbage', publication: 'The Chip Letter', handle: 'the-chip-letter',
    title: 'Pat Gelsinger：为什么现在是做硬件最好的时机', originalTitle: 'Pat Gelsinger : Why This is the Best Time to Build Hardware',
    subtitle: '从芯片、制造到 AI 基础设施，重新理解硬件创业的窗口。', published: '2026年10月13日', readingTime: '8 分钟',
    coverImage: cover(9), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'The Chip Letter', photoSource: 'https://thechipletter.substack.com/p/pat-gelsinger-why-this-is-the-best', originalUrl: 'https://thechipletter.substack.com/p/pat-gelsinger-why-this-is-the-best',
    paragraphs: ['一场关于硬件建设周期的对话：当计算需求、供应链和国家产业政策都在变化，哪些长期能力重新变得稀缺而重要。'],
  },
  'arm-softbank': {
    slug: 'arm-softbank', author: 'Babbage、Jon Metzler', publication: 'The Chip Letter', handle: 'the-chip-letter',
    title: 'Arm 与软银：孙正义带着礼物上门', originalTitle: 'Arm & SoftBank: Part 1- Masa comes calling, bearing gifts',
    subtitle: '回看 2016 年软银收购 Arm：一场交易如何折射英国、美国与日本的技术想象。', published: '2026年9月25日', readingTime: '14 分钟',
    coverImage: cover(10), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'The Chip Letter', photoSource: 'https://thechipletter.substack.com/p/arm-and-softbank-part-1-masa-comes', originalUrl: 'https://thechipletter.substack.com/p/arm-and-softbank-part-1-masa-comes',
    paragraphs: ['一场横跨产业史与资本叙事的对谈。它回到 Arm 被收购时的政治语境，也追问一项承诺在交易完成后如何经受现实检验。'],
  },
  'creative-class': {
    slug: 'creative-class', author: 'Joseph Politano', publication: 'Apricitas Economics', handle: 'apricitas-economics',
    title: 'AI 与创意阶层的衰落？', originalTitle: 'AI and the Fall? of the Creative Class',
    subtitle: '媒体、影视与艺术行业的就业下滑，有多少应归因于 AI？', published: '2026年9月27日', readingTime: '10 分钟',
    coverImage: cover(11), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Apricitas Economics', photoSource: 'https://www.apricitas.io/p/ai-and-the-fall-of-the-creative-class', originalUrl: 'https://www.apricitas.io/p/ai-and-the-fall-of-the-creative-class',
    paragraphs: ['作者用就业数据拆开一个很容易被粗略回答的问题：创意行业的失业是真实的，但技术、广告市场、平台结构与 AI 的因果关系并不能被混为一谈。'],
  },
  'electricity-gap': {
    slug: 'electricity-gap', author: 'Joseph Politano', publication: 'Apricitas Economics', handle: 'apricitas-economics',
    title: '美国的电力缺口', originalTitle: 'America’s Electricity Gap',
    subtitle: '太阳能与电池投资创纪录，仍追不上持续上升的用电需求。', published: '2026年5月3日', readingTime: '10 分钟',
    coverImage: cover(12), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Apricitas Economics', photoSource: 'https://www.apricitas.io/p/americas-electricity-gap', originalUrl: 'https://www.apricitas.io/p/americas-electricity-gap',
    paragraphs: ['电气化与数据中心正在改变美国电力需求的节奏。作者关注的不是“可再生能源是否增长”，而是电网、并网和可靠性是否能跟上。'],
  },
  'taking-break': {
    slug: 'taking-break', author: 'Compounding Quality', publication: 'Compounding Quality', handle: 'compounding-quality',
    title: '休息一下', originalTitle: 'Taking a break',
    subtitle: '暂停工作不是放弃责任，而是重新校准长期投入。', published: '2026年8月25日', readingTime: '7 分钟',
    coverImage: cover(13), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Compounding Quality', photoSource: 'https://www.compoundingquality.net/p/taking-a-break-b5d', originalUrl: 'https://www.compoundingquality.net/p/taking-a-break-b5d',
    paragraphs: ['一篇关于离开工作、观察焦虑和恢复判断力的短文。真正的暂停并不要求你“配得上休息”，而是让生活重新拥有不以产出衡量的部分。'],
  },
  'bear-cave-347': {
    slug: 'bear-cave-347', author: 'The Bear Cave', publication: 'The Bear Cave', handle: 'the-bear-cave',
    title: 'The Bear Cave 第 347 期', originalTitle: 'The Bear Cave #347',
    subtitle: '行动主义报告、重要离职、当周新闻与值得看的讨论。', published: '2026年10月11日', readingTime: '6 分钟',
    coverImage: cover(14), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'The Bear Cave', photoSource: 'https://thebearcave.substack.com/p/the-bear-cave-347', originalUrl: 'https://thebearcave.substack.com/p/the-bear-cave-347',
    paragraphs: ['一份面向公司治理与市场观察者的周报式整理，聚焦公开文件、投资者行动与企业领导层的变化。'],
  },
  'bear-cave-346': {
    slug: 'bear-cave-346', author: 'The Bear Cave', publication: 'The Bear Cave', handle: 'the-bear-cave',
    title: 'The Bear Cave 第 346 期', originalTitle: 'The Bear Cave #346',
    subtitle: '行动主义报告、近期离职与一周市场观察。', published: '2026年10月4日', readingTime: '6 分钟',
    coverImage: cover(15), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'The Bear Cave', photoSource: 'https://thebearcave.substack.com/p/the-bear-cave-346', originalUrl: 'https://thebearcave.substack.com/p/the-bear-cave-346',
    paragraphs: ['与第 347 期一样，这是一份把分散的公司新闻与公开市场信号放到同一张图里的周期性观察。'],
  },
  'learn-language-fast': {
    slug: 'learn-language-fast', author: 'Nat', publication: 'Notes with Nat', handle: 'notes-with-nat',
    title: '如何更快学会一门新语言', originalTitle: 'How to Learn a New Language Insanely Fast',
    subtitle: '从可理解输入、重复暴露与真实语境理解语言学习。', published: '2026年8月25日', readingTime: '8 分钟',
    coverImage: cover(16), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Notes with Nat', photoSource: 'https://noteswnat.substack.com/p/how-to-learn-a-new-language-insanely', originalUrl: 'https://noteswnat.substack.com/p/how-to-learn-a-new-language-insanely',
    paragraphs: [
      '有一种学习语言的方法，能让你以最快的速度进步。美国外交事务学院（FSI）负责训练外交官快速掌握外语；它按照达到职业流利程度所需的时间给语言分类：普通话、阿拉伯语和日语大约要 2,200 小时，法语、西班牙语和意大利语约要 600 小时。这些学习者目标明确，配有专业教师与方法；他们所用的方法，和学校课本或基础视频里常见的教学很不一样。',
      '这种快速学习的关键，是大量接触“可理解输入”并沉浸其中。所谓可理解输入，是听到难度略高于自己当前能力的语言。两者结合时，大脑会建立关联网络：词语、语境与情绪会被一起理解，进而形成真正的理解（Krashen，1982）。',
      '这里并不特别强调死记单词或语法。一个词出现时，若周围情境足够丰富，让你不靠定义也能猜到它的意思，记忆就会更牢。下面是更快学习语言的具体做法。',
      '第一，可理解输入。大脑会在反复接触中习得语言，就像孩子先听人说话，后来才渐渐听懂。先从接近儿童难度的材料开始，再逐步提高；你会一直处在“有点吃力、但仍能听懂”的边缘。Mason 与 Ae（2023）报告，70 小时可理解输入的效果可与 286 小时传统入门课堂相当。可以使用 Dreaming Spanish、YouTube，或寻找目标语言的儿童节目。',
      '第二，间隔重复。练习之间要留出空间。连续三天听俄语并不会让你突然流利；更好的做法是连续三个月每天投入一到两小时。两次学习之间，大脑才有时间消化所吸收的内容。涵盖 317 项实验的研究显示，分散练习优于把内容挤进同一次学习（Cepeda 等，2006）。',
      '第三，情绪投入。学习内容带有情绪时，人更容易记住。杏仁核会调节记忆的强度，而情绪会增强这一过程（McGaugh，2004）。在语言学习中，带有情感色彩的文本也被发现有助于词汇保持（Liu 等，2026）。因此，最好通过你真正感兴趣的话题学习，而不是只看为“所有学习者”准备的无聊材料。',
      '第四，输出压力。开口说会迫使你从记忆中提取词语并真正使用它们。有人担心太早开口会让口音过早固定；这种担心可以理解。但说话同样会检验你是否真的掌握了语言（Swain，1985）。能听懂与能说出来是不同的能力。若时间充足，可以多听不同口音、有意识地练发音；但若需要快速学习，就先开始说。就像突然到了外国，你不得不马上使用这些词，也会因此更快学会。',
      '第五，睡眠。记忆巩固——也就是大脑把刚学到的内容“存档”，像给文件按下保存键——会在睡眠中发生。睡眠对生活的许多方面都很重要。记忆冠军如 Yanjaa Wintersoul 也常告诉学生：好好睡觉、好好吃饭。',
      '那些看起来很有效率的事，例如超长学习、反复重读、划重点或密集记笔记，并不是最快的方法。大脑通过困难、间隔与情绪语境学习。这样的过程未必像传统意义上的“学习”，但可以很有趣。若你认识正在学语言、又感到卡住或无聊的人，可以把这篇文章发给他。',
      '简而言之：先为你想学的语言找到可理解输入。以 Dreaming Spanish 公布的小时数为例，约 50 小时开始能听懂简单内容；300 小时能理解真实对话；600 小时可较自在地跟上普通语速；1,000 至 1,500 小时会接近母语者的感觉。这些数据来自西班牙语。没有一个放之四海皆准的数字或规则，但按这种方式学习，通常比传统方法快得多。',
      '参考文献：Cepeda 等（2006）；Krashen（1982）；Liu 等（2026）；Mason 与 Ae（2023，原文注明尚未核实确切发表期刊）；McGaugh（2004）；Swain（1985）。',
    ],
    translationComplete: true,
  },
  'journaling-ten-years': {
    slug: 'journaling-ten-years', author: 'Nat', publication: 'Notes with Nat', handle: 'notes-with-nat',
    title: '我写了十年日记，真正改变了什么', originalTitle: 'I Journaled for 10 Years, Here’s What Actually Changed',
    subtitle: '把思绪写下来，如何帮助人整理记忆、情绪与自我理解。', published: '2026年8月18日', readingTime: '8 分钟',
    coverImage: cover(17), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Notes with Nat', photoSource: 'https://noteswnat.substack.com/p/i-journaled-for-10-years-heres-what', originalUrl: 'https://noteswnat.substack.com/p/i-journaled-for-10-years-heres-what',
    paragraphs: ['日记未必需要写得漂亮。它更像一个让经验有地方落下来的容器：把模糊的念头外化，才能看见哪些模式正在反复发生。'],
  },
  'music-memory-learning': {
    slug: 'music-memory-learning', author: 'Sanjeethi Anand', publication: 'The NeuroKnow', handle: 'the-neuroknow',
    title: '音乐、记忆与学习', originalTitle: 'Music, Memory, and How We Learn',
    subtitle: '从早期记忆到数字干扰：脑测量能告诉我们什么，又不能告诉我们什么。', published: '2026年10月10日', readingTime: '12 分钟',
    coverImage: cover(18), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'The NeuroKnow', photoSource: 'https://theneuroknow.substack.com/p/music-memory-and-how-we-learn', originalUrl: 'https://theneuroknow.substack.com/p/music-memory-and-how-we-learn',
    paragraphs: ['这场访谈以学习科学为中心，也保持方法上的克制：脑电与脑磁能帮助我们观察过程，但不应被误当成对学习效果的唯一答案。'],
  },
  'autism-care': {
    slug: 'autism-care', author: 'Sanjeethi Anand', publication: 'The NeuroKnow', handle: 'the-neuroknow',
    title: '自闭症照护如何抵达家庭', originalTitle: 'How Autism Care Reaches Families',
    subtitle: '诊断、社区照护与神经多样性肯定视角，如何真正转化为支持系统。', published: '2026年9月24日', readingTime: '11 分钟',
    coverImage: cover(19), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'The NeuroKnow', photoSource: 'https://theneuroknow.substack.com/p/how-autism-care-reaches-families', originalUrl: 'https://theneuroknow.substack.com/p/how-autism-care-reaches-families',
    paragraphs: ['一篇讨论服务系统而非只讨论诊断标签的访谈。它把重点放在家庭如何获得支持，以及照护设计怎样更尊重自闭症者的真实生活。'],
  },
  'aspirin-inflammation': {
    slug: 'aspirin-inflammation', author: 'Nick Jikomes，PhD', publication: 'Mind & Matter', handle: 'mind-and-matter',
    title: '阿司匹林、膳食脂肪、炎症与凝血', originalTitle: 'Aspirin, Dietary Fat, Inflammation & Blood Clotting',
    subtitle: '关于脂肪酸代谢与阿司匹林机制的科学讨论。', published: '2026年10月8日', readingTime: '10 分钟',
    coverImage: cover(20), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Mind & Matter', photoSource: 'https://mindandmatter.substack.com/p/aspirin-dietary-fat-inflammation', originalUrl: 'https://mindandmatter.substack.com/p/aspirin-dietary-fat-inflammation',
    paragraphs: ['文章讨论阿司匹林与脂肪酸代谢的关系，也强调剂量、个体差异和证据边界。它不构成用药建议；任何药物调整都应与合格医疗专业人员讨论。'], medicalNotice: true,
  },
  'adhd-women-needs': {
    slug: 'adhd-women-needs', author: 'Kristen McClure', publication: 'Kristen McClure', handle: 'kristen-mcclure',
    title: 'ADHD 女性：当所有人的需要都排在自己前面', originalTitle: 'ADHD Women: When Everyone Else’s Needs Come First',
    subtitle: '从长期迎合、掩饰到重新问出：我真正需要什么？', published: '2026年10月10日', readingTime: '9 分钟',
    coverImage: cover(21), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Kristen McClure', photoSource: 'https://kristenlynnmcclure.substack.com/p/adhd-women-when-everyone-elses-needs', originalUrl: 'https://kristenlynnmcclure.substack.com/p/adhd-women-when-everyone-elses-needs',
    paragraphs: ['许多神经多样性女性很早就学会观察别人、减少麻烦、优先回应他人。这篇文章邀请读者把注意力转回来：自己有什么感受、界限与需要。'],
  },
  'coming-home': {
    slug: 'coming-home', author: 'Kristen McClure', publication: 'Kristen McClure', handle: 'kristen-mcclure',
    title: '回到真正的自己', originalTitle: 'Coming Home to Who You Are',
    subtitle: '在较晚获得 ADHD 诊断后，重新连接兴趣、偏好与内在方向。', published: '2026年9月29日', readingTime: '8 分钟',
    coverImage: cover(22), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Kristen McClure', photoSource: 'https://kristenlynnmcclure.substack.com/p/coming-home-to-who-you-are', originalUrl: 'https://kristenlynnmcclure.substack.com/p/coming-home-to-who-you-are',
    paragraphs: ['“做自己”有时不是找到一个固定答案，而是在长期适应他人之后，重新练习识别什么会让你充电、什么会让你耗尽。'],
  },
  'adhd-went-quiet': {
    slug: 'adhd-went-quiet', author: 'Dr Anita', publication: 'Dr Anita', handle: 'dr-anita',
    title: '当我的 ADHD 安静下来', originalTitle: 'When My ADHD Went Quiet',
    subtitle: '离开日常近五周，让作者重新理解需求、决策与注意力。', published: '2026年10月5日', readingTime: '10 分钟',
    coverImage: cover(23), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Dr Anita', photoSource: 'https://anitagoraya.substack.com/p/when-my-adhd-went-quiet', originalUrl: 'https://anitagoraya.substack.com/p/when-my-adhd-went-quiet',
    paragraphs: ['当环境里的需求、选择和提醒大幅减少，注意力的样子也会不同。文章以个人经验提醒我们：有些“困难”或许并非个人意志的问题，而是环境负荷的问题。'],
  },
  'planning-system': {
    slug: 'planning-system', author: 'Dr Anita', publication: 'Dr Anita', handle: 'dr-anita',
    title: '让计划系统活下去', originalTitle: 'Keeping the Planning System Alive',
    subtitle: '为 ADHD 设计的每日与每周回顾仪式。', published: '2026年9月6日', readingTime: '9 分钟',
    coverImage: cover(24), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Dr Anita', photoSource: 'https://anitagoraya.substack.com/p/keeping-the-planning-system-alive', originalUrl: 'https://anitagoraya.substack.com/p/keeping-the-planning-system-alive',
    paragraphs: ['计划系统不是搭好一次就会自己运行。作者讨论用足够小、足够稳定的日常与周度回顾，让任务重新回到一个可看见、可选择的位置。'],
  },
  'adhd-breakups': {
    slug: 'adhd-breakups', author: 'ADHD Insights', publication: 'ADHD Insights', handle: 'adhd-insights',
    title: 'ADHD 与关系结束：为什么大脑放不下？', originalTitle: 'ADHD & Relationships (breakups) Why Your Brain Can’t Let Them Go',
    subtitle: '从依恋、刺激与情绪调节理解分手后的反复牵动。', published: '2026年9月10日', readingTime: '8 分钟',
    coverImage: cover(25), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'ADHD Insights', photoSource: 'https://adhdinsightss.substack.com/p/adhd-and-relationships-breakups-why', originalUrl: 'https://adhdinsightss.substack.com/p/adhd-and-relationships-breakups-why',
    paragraphs: ['一段关系结束后难以抽离，并不等于你做错了什么。文章讨论 ADHD 特质可能如何放大新鲜感、情绪与调节需求，也提醒读者寻求适合自己的支持。'],
  },
  'night-anxiety': {
    slug: 'night-anxiety', author: 'TheDistractedGenius', publication: 'Social Scribbles', handle: 'social-scribbles',
    title: '凌晨三点醒来时，焦虑为什么更响？', originalTitle: 'Harvard’s 25-Year Warning: Waking Up at 3:00 A.M. With Anxiety?',
    subtitle: '关于夜间焦虑的叙事与自我安顿提示。', published: '2026年6月3日', readingTime: '8 分钟',
    coverImage: cover(26), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Social Scribbles', photoSource: 'https://socialscribbles.substack.com/p/harvards-25-year-warning-waking-up', originalUrl: 'https://socialscribbles.substack.com/p/harvards-25-year-warning-waking-up',
    paragraphs: ['这是一篇面向夜间焦虑体验的文章。它提供了安顿自己的语言，但不能替代心理或医疗支持；若焦虑持续、加重或影响安全，应联系合格专业人士。'], medicalNotice: true,
  },
  'overloaded-system': {
    slug: 'overloaded-system', author: 'TheDistractedGenius', publication: 'Social Scribbles', handle: 'social-scribbles',
    title: '焦虑、ADHD 症状与慢性疼痛：是同一个系统过载了吗？', originalTitle: 'You Think It’s Anxiety, ADHD, or Chronic Pain',
    subtitle: '从压力调节系统看见症状之间可能的交叠，也保留诊断上的谨慎。', published: '2026年5月29日', readingTime: '9 分钟',
    coverImage: cover(27), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Social Scribbles', photoSource: 'https://socialscribbles.substack.com/p/you-think-its-anxiety-adhd-or-chronic', originalUrl: 'https://socialscribbles.substack.com/p/you-think-its-anxiety-adhd-or-chronic',
    paragraphs: ['不同的症状可能会彼此影响，但不应被一概归为同一种机制。本文作为理解压力与调节的阅读材料，而不是诊断或治疗建议。'], medicalNotice: true,
  },
  'digestive-evidence': {
    slug: 'digestive-evidence', author: 'Christy Harrison，MPH，RD', publication: 'Rethinking Wellness', handle: 'rethinking-wellness',
    title: '食物敏感测试、SIBO、益生菌与 FODMAP：一份循证指南', originalTitle: 'Food-Sensitivity Tests, SIBO, Probiotics, and FODMAPs',
    subtitle: '在饮食失调恢复中处理肠胃问题，同时避开健康营销陷阱。', published: '2026年10月12日', readingTime: '12 分钟',
    coverImage: cover(28), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Rethinking Wellness', photoSource: 'https://rethinkingwellness.substack.com/p/food-sensitivity-tests-sibo-probiotics-596', originalUrl: 'https://rethinkingwellness.substack.com/p/food-sensitivity-tests-sibo-probiotics-596',
    paragraphs: ['文章提醒读者区分流行检测、个人经验与临床证据。饮食、胃肠和用药问题高度个体化，应与有资质的医疗或营养专业人士讨论。'], medicalNotice: true,
  },
  'body-image-kids': {
    slug: 'body-image-kids', author: 'Christy Harrison，MPH，RD', publication: 'Rethinking Wellness', handle: 'rethinking-wellness',
    title: '修复身体意象，也不再带着恐惧喂养孩子', originalTitle: 'How to Heal Your Body Image and Feed Kids Without Fear',
    subtitle: '关于身体意象、亲职与饮食限制的访谈。', published: '2026年10月5日', readingTime: '11 分钟',
    coverImage: cover(29), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Rethinking Wellness', photoSource: 'https://rethinkingwellness.substack.com/p/how-to-heal-your-body-image-and-feed-d06', originalUrl: 'https://rethinkingwellness.substack.com/p/how-to-heal-your-body-image-and-feed-d06',
    paragraphs: ['一篇关于身体意象、亲职和饮食文化的深度对话。它主张理解情绪和脉络，而不是用单一规则替代复杂的家庭与健康问题。'], medicalNotice: true,
  },
  'transition-to-rest': {
    slug: 'transition-to-rest', author: 'Growth Mindset', publication: 'Growth Mindset', handle: 'growth-mindset',
    title: '你停止工作了，却还没有开始休息', originalTitle: 'You Stopped Working but Never Started Resting',
    subtitle: '工作结束并不会自动变成休息；离开工作也需要一个仪式。', published: '2026年10月12日', readingTime: '7 分钟',
    coverImage: cover(30), coverAlt: '原文首页配图', authorAvatar: '', photoCredit: 'Growth Mindset', photoSource: 'https://tmindset.substack.com/p/you-stopped-working-but-never-started', originalUrl: 'https://tmindset.substack.com/p/you-stopped-working-but-never-started',
    paragraphs: [
      '进化生物学研究需要极其细致的注意力和持续稳定的判断。科学家要在标本上进行精密实验，用假设解释观察结果，再把证据整理成一篇有论证的文章。想象一下：你在实验台、研究论文和数据分析之间不断切换，同时还要撰写一篇重要的科学论文。这样的工作非常消耗心力。',
      '达尔文的大部分研究都在唐恩庄园的家中和花园里完成，而他长期受慢性疾病折磨：严重的消化不适、呕吐、眩晕，以及挥之不去的疲惫。他曾说：“任何劳累，尤其是阅读，都会引发这些头部症状。”',
      '这让达尔文反复陷入两难。他知道自己必须阅读，研究才能继续；但阅读又会加重身体问题。他逐渐明白，自己的精力是有限的：今天透支得越多，明天的工作就越会受到影响。',
      '当精力有限时，怎样才能在一周里维持可持续的工作节奏？',
      '首先，达尔文会在筋疲力尽以前很早就停下来。然后，他会用一个固定习惯，从令人兴奋、紧绷的工作状态过渡到急需的休息。',
      '他通常会在中午到十二点一刻左右结束上午最主要的研究，然后宣布：“今天做得不错。”接着出去散步。下午四点半到五点半，他还会做一次短暂的收尾，把当天的事情整理好，再去陪家人。',
      '如果晚上再安排刺激性活动，第二天的工作就会受到影响。他的儿子 Francis 曾这样描述：“谈话多半小时或少半小时，对他来说可能就是能否入睡的差别，甚至意味着第二天半天的工作会不会损失掉。”',
      '因此，达尔文从不把晚上的安排交给偶然，也不会让它完全没有结构。他总让夜晚保持熟悉的节奏。吃过晚饭，他会和 Emma 下两盘双陆棋。稍晚一些，他会在体力允许的范围内读书；有时则躺在沙发上，听她弹钢琴。为家人朗读，也是家庭生活中经常出现的一部分。',
      '这种节奏给我们的夜晚留下了一个很实用的问题：工作结束以后，你会进入什么？',
      '你合上电脑，又拿起手机。消息等着回复，新闻等着追，还有一场讨论等着加入。工作日结束了，但对注意力的索取并没有结束。',
      '我们很会教自己怎样进入工作：拆分任务、移开干扰、从小处开始。可我们很少认真思考怎样离开工作。把工作拿走，并不会自动产生休息。有时候，从工作到休息之间，本身也需要一项有意识的活动。',
      '试着让下班后的前十分钟拥有一个固定的形状。',
      '第一，设定停止时间。选一个现实的结束时刻，在一天彻底失控以前停下。如果你等到“所有事情都做完”，很可能整个晚上都等不到。',
      '第二，标记明天从哪里继续。给自己留下一个明确的下一步，比如：“明天九点，给供应商发邮件。”让未完成的工作有一个可以安心等待的地方。',
      '第三，真正关闭工作，并换一个环境。离开书桌。如果你在餐桌上工作，就把电脑收起来，给夜晚腾出空间。',
      '第四，进入一项熟悉的活动。洗个澡、出门走走，或者准备一点吃的。选择一件你喜欢、并且即使很累也能重复去做的事。',
      '如果你喜欢让声音陪在身边，它也可以成为过渡的标记。本文赞助商 Endel 提供了一种为放松设计的声音场景。你可以在收拾工作时播放它，让它陪你进入夜晚；音乐响起以后，就把手机放下。准备睡觉时，睡眠声音也是一种选择。',
      '你的承诺可以很简单：工作结束时，我会写下明天的第一步，合上电脑，然后离开书桌，用十分钟做一件熟悉的事。',
      '接下来一周，在每个工作日试一试。观察自己是否更少重新打开工作，也留意夜晚是否更像真正属于你。',
      '你已经给工作安排了一个开始的地方。也给你的夜晚安排一个吧。',
      '如果你想把声音当作过渡提示，Endel 为读者提供一个月免费体验。',
      '这周就写到这里。下周的效率主题内容会继续送到你的收件箱。也欢迎你随时发来反馈、想法、问题和建议——我都会读。',
    ],
    translationComplete: true,
  },
};
