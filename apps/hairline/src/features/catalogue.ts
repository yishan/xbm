import * as Hairline from '@lucasmarkes/hairline/react'

export const categories = [
  { id: 'interfaces', name: '界面', en: 'Interfaces' },
  { id: 'data', name: '数据', en: 'Data' },
  { id: 'machines', name: '机器', en: 'Machines' },
  { id: 'devices', name: '设备', en: 'Devices' },
  { id: 'coding', name: '开发', en: 'Coding' },
  { id: 'security', name: '安全', en: 'Security' },
  { id: 'connectivity', name: '连接', en: 'Connectivity' },
] as const
export type Category = typeof categories[number]['id']

type Entry = { id: string; name: keyof Pick<typeof Hairline, 'Exploded'|'Terrain'|'Phosphor'|'Riffle'|'Slow'|'Turntable'|'Elevator'|'Keyboard'|'Phone'|'Laptop'|'Terminal'|'Cabinet'|'Branches'|'Vault'|'Lockers'|'Padlock'|'Patch'|'Dish'|'Router'>; zh: string; category: Category; hint: string; stronger: string; scene: string }
export const figures: Entry[] = [
  { id:'exploded', name:'Exploded', zh:'分层窗口', category:'interfaces', hint:'左右移动打开间距，上下移动选择图层。', stronger:'图层间距更大', scene:'适合解释一个界面由哪些层构成。' },
  { id:'terrain', name:'Terrain', zh:'起伏地形', category:'data', hint:'移动指针，让周围的柱体浮起。', stronger:'影响范围更广', scene:'用空间起伏表达数据热点。' },
  { id:'phosphor', name:'Phosphor', zh:'荧光点阵', category:'data', hint:'划过点阵，留下渐隐的轨迹。', stronger:'余辉停留更久', scene:'展示信号经过后留下的痕迹。' },
  { id:'riffle', name:'Riffle', zh:'卡片涟漪', category:'data', hint:'划过卡片，或聚焦图形后按左右方向键。', stronger:'卡片联动延迟更明显', scene:'把一组信息变成可逐项浏览的卡片。' },
  { id:'slow', name:'Slow', zh:'慢速传送', category:'machines', hint:'悬停在传送带上，观察运输速度。', stronger:'悬停时减速更多', scene:'解释队列处理和吞吐速度。' },
  { id:'turntable', name:'Turntable', zh:'惯性转台', category:'machines', hint:'快速划过转台，观察旋转与回稳。', stronger:'惯性旋转更久', scene:'展示物体的角度和旋转惯性。' },
  { id:'elevator', name:'Elevator', zh:'楼层电梯', category:'machines', hint:'上下移动指针，选择目标楼层。', stronger:'楼层间移动更快', scene:'把状态迁移映射为楼层切换。' },
  { id:'keyboard', name:'Keyboard', zh:'联动键盘', category:'devices', hint:'划过按键，观察相邻按键的下沉。', stronger:'更多相邻按键响应', scene:'表达输入如何影响周围区域。' },
  { id:'phone', name:'Phone', zh:'手机拆解', category:'devices', hint:'左右拉开层间距，上下选择零件。', stronger:'零件间距更大', scene:'说明玻璃、电路板、电池与外壳。' },
  { id:'laptop', name:'Laptop', zh:'笔记本铰链', category:'devices', hint:'上下移动指针，控制屏幕开合。', stronger:'最大开合角度更大', scene:'展示硬件结构的连续变化。' },
  { id:'terminal', name:'Terminal', zh:'终端历史', category:'coding', hint:'上下移动浏览历史，让当前行浮起。', stronger:'更多历史行一起浮起', scene:'让日志与上下文的关系可见。' },
  { id:'cabinet', name:'Cabinet', zh:'服务器机柜', category:'coding', hint:'沿机柜上下移动，拉出邻近刀片。', stronger:'更多刀片响应', scene:'解释服务器资源的邻近关系。' },
  { id:'branches', name:'Branches', zh:'提交分支', category:'coding', hint:'划过提交节点，观察历史链路浮起。', stronger:'更多历史提交浮起', scene:'解释任务分支、审阅与合流。' },
  { id:'vault', name:'Vault', zh:'保险库转盘', category:'security', hint:'绕转盘移动指针；刻度到 40 时锁栓打开。', stronger:'转盘惯性持续更久', scene:'呈现解锁前后的结构变化。' },
  { id:'lockers', name:'Lockers', zh:'储物柜', category:'security', hint:'划过柜门，打开当前柜子。', stronger:'柜门打开角度更大', scene:'把互斥选择表达为柜门开合。' },
  { id:'padlock', name:'Padlock', zh:'弹簧挂锁', category:'security', hint:'靠近锁体，观察锁梁弹起。', stronger:'锁梁摆动角度更大', scene:'表达接近触发的解锁反馈。' },
  { id:'patch', name:'Patch', zh:'配线面板', category:'connectivity', hint:'划过线缆，观察相邻端口的让位。', stronger:'更多邻近线缆响应', scene:'展示连接关系与局部联动。' },
  { id:'dish', name:'Dish', zh:'信号天线', category:'connectivity', hint:'移动指针，控制天线的方向与俯仰。', stronger:'可转动范围更大', scene:'让信号方向可见。' },
  { id:'router', name:'Router', zh:'无线路由', category:'connectivity', hint:'划过天线，观察天线向指针倾斜。', stronger:'更多天线跟随', scene:'表达信号源与邻近响应。' },
]
export function translateRead(text: string, id: string): string {
  if (!text || text === 'rest') return '待机 · 移动指针开始探索'
  if (id === 'riffle' && /^\d+$/.test(text)) return `当前卡片 ${text}`
  if (id === 'keyboard') return `当前按键 ${text.replace(/^key /, '')}`
  const words: Record<string,string> = { afterglow:'余辉', paint:'绘制中', loop:'循环', ground:'底层', floor:'楼层', glass:'玻璃', board:'电路板', battery:'电池', shell:'外壳', shut:'闭合', open:'打开', locked:'锁定', prompt:'命令提示', gap:'间距', cell:'单元', rate:'速度', az:'方位', el:'仰角', lid:'屏幕角度', line:'历史行', blade:'刀片', dial:'刻度', locker:'柜门', port:'端口', antenna:'天线', main:'主线', branch:'分支', chrome:'外框', surface:'界面层', sidebar:'侧栏', card:'卡片', popover:'浮层', content:'内容', base:'底座', shadow:'阴影', glasspane:'玻璃层' }
  return text.replace(/[a-z]+/gi, word => words[word.toLowerCase()] ?? word).replace(/\bz\b/g,'高度')
}
