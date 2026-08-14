"use client";

import { useEffect, useMemo, useState } from "react";

const stocks = [
  { code: "600519", exchange: "SH", name: "贵州茅台", price: 1588.50, change: 1.82, score: 78, signal: "偏多", sector: "食品饮料" },
  { code: "300750", exchange: "SZ", name: "宁德时代", price: 268.36, change: 2.41, score: 82, signal: "偏多", sector: "电力设备" },
  { code: "601318", exchange: "SH", name: "中国平安", price: 47.82, change: -0.64, score: 55, signal: "中性", sector: "非银金融" },
  { code: "000858", exchange: "SZ", name: "五粮液", price: 131.20, change: 1.16, score: 71, signal: "关注", sector: "食品饮料" },
  { code: "600036", exchange: "SH", name: "招商银行", price: 42.64, change: 0.92, score: 69, signal: "关注", sector: "银行" },
  { code: "002594", exchange: "SZ", name: "比亚迪", price: 326.80, change: 2.08, score: 76, signal: "偏多", sector: "汽车" },
  { code: "000333", exchange: "SZ", name: "美的集团", price: 76.18, change: -0.22, score: 63, signal: "中性", sector: "家用电器" },
  { code: "688981", exchange: "SH", name: "中芯国际", price: 86.45, change: 3.16, score: 81, signal: "偏多", sector: "电子" },
];

const contentIndex = [
  { tab: "估值", title: "估值与历史分位", keys: "PE PB 市盈率 市净率 估值 股息率" },
  { tab: "财务", title: "盈利质量与成长", keys: "ROE 营收 净利润 毛利率 现金流 财报" },
  { tab: "资金", title: "主力与北向资金", keys: "北向资金 主力 融资融券 大单 资金流向" },
  { tab: "技术", title: "技术指标与趋势", keys: "MACD RSI KDJ 均线 MA 技术面 支撑 压力" },
  { tab: "事件", title: "公告、研报与风险", keys: "公告 新闻 研报 机构观点 舆情 解禁 分红 风险" },
];

const candles = [58,62,59,65,68,66,72,75,70,77,81,79,84,87,83,89,92,88,94,97,95,101,99,104,108,106,111,115,113,119,123,120,126,129,125,132,136,134,140,145];

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="icon" aria-hidden="true">{children}</span>;
}

export default function Home() {
  const [activeStock, setActiveStock] = useState(stocks[0]);
  const [range, setRange] = useState("日K");
  const [tab, setTab] = useState("AI预测");
  const [watching, setWatching] = useState(true);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [dataTab, setDataTab] = useState("总览");
  const [liveQuote, setLiveQuote] = useState<null | { price:number; open:number; high:number; low:number; change:number; changePct:number; turnover:number; pe:number|null; pb:number|null; marketCap:number|null; amount:number; source:string }>(null);
  const [quoteState, setQuoteState] = useState<"loading"|"live"|"fallback">("loading");
  const loadQuote = async () => { setQuoteState("loading"); try { const r=await fetch(`/api/quote?code=${activeStock.code}`); if(!r.ok)throw new Error(); const p=await r.json(); setLiveQuote(p.quote); setQuoteState("live"); } catch { setLiveQuote(null); setQuoteState("fallback"); } };
  useEffect(()=>{loadQuote();const timer=setInterval(loadQuote,30000);return()=>clearInterval(timer)},[activeStock.code]);

  const filtered = useMemo(() => stocks.filter(s => `${s.code}${s.name}${s.sector}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6), [query]);
  const contentMatches = useMemo(() => contentIndex.filter(x => `${x.title}${x.keys}`.toLowerCase().includes(query.toLowerCase())).slice(0, 4), [query]);
  const selectStock = (stock: typeof stocks[0]) => { setActiveStock(stock); setQuery(""); setNotice(`已切换至 ${stock.name}`); setTimeout(() => setNotice(""), 1800); };
  const openContent = (target: string, title: string) => { setDataTab(target); setQuery(""); setNotice(`已打开：${title}`); setTimeout(() => setNotice(""), 1800); };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="先见量化首页"><span className="brand-mark">先</span><span>先见量化<small>AI STOCK LAB</small></span></a>
        <nav aria-label="主导航">
          <button className="nav-active">行情分析</button><button>机会雷达</button><button>策略回测</button><button>研究中心</button>
        </nav>
        <div className="header-tools">
          <div className="market-status"><span></span>沪深市场 · 已收盘</div>
          <button className="circle-button" aria-label="消息">◌</button><button className="avatar" aria-label="个人账户">TX</button>
        </div>
      </header>

      <div className="page-grid">
        <aside className="sidebar">
          <div className="search-wrap">
            <Icon>⌕</Icon><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜股票、指标或研报" aria-label="搜索股票、指标或分析内容" />
            {query && <div className="search-results">
              {filtered.length > 0 && <label>股票</label>}{filtered.map(s => <button key={s.code} onClick={() => selectStock(s)}><span>{s.name}<small>{s.code}.{s.exchange} · {s.sector}</small></span><b>{s.price.toFixed(2)}</b></button>)}
              {contentMatches.length > 0 && <label>分析内容</label>}{contentMatches.map(x => <button key={x.tab} onClick={() => openContent(x.tab, x.title)}><span>{x.title}<small>{x.keys.split(" ").slice(0,4).join(" · ")}</small></span><b className="search-arrow">→</b></button>)}
              {filtered.length === 0 && contentMatches.length === 0 && <p>未找到结果，试试“ROE”“北向资金”或股票代码</p>}
            </div>}
          </div>
          <div className="side-title"><span>我的自选</span><button aria-label="添加自选">＋</button></div>
          <div className="watchlist">
            {stocks.map(stock => <button key={stock.code} onClick={() => selectStock(stock)} className={activeStock.code === stock.code ? "active" : ""}>
              <span><strong>{stock.name}</strong><small>{stock.code}.{stock.exchange}</small></span>
              <span className={stock.change >= 0 ? "up" : "down"}><strong>{stock.price.toFixed(2)}</strong><small>{stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%</small></span>
            </button>)}
          </div>
          <div className="side-title"><span>市场温度</span><small>08/14</small></div>
          <div className="temperature-card">
            <div className="gauge"><div><b>67</b><span>偏热</span></div></div>
            <div className="breadth"><span><i className="dot up-bg"></i>上涨 3,286</span><span><i className="dot down-bg"></i>下跌 1,746</span></div>
          </div>
          <div className="side-foot"><p>数据状态</p><strong>{quoteState === "live" ? "免费行情已连接" : quoteState === "loading" ? "正在更新行情" : "使用备用展示数据"}</strong><small>{quoteState === "live" ? "每 30 秒自动刷新" : "可稍后手动刷新"}</small></div>
        </aside>

        <section className="workspace">
          <div className="stock-heading">
            <div><div className="title-line"><h1>{activeStock.name}</h1><span>{activeStock.code}.{activeStock.exchange}</span><button onClick={() => setWatching(!watching)} className={watching ? "watching" : ""}>{watching ? "★ 已自选" : "☆ 加自选"}</button></div><p>白酒 · 沪深300成分 · 大盘价值</p></div>
            <div className="quote"><strong>{(liveQuote?.price ?? activeStock.price).toFixed(2)}</strong><span className={(liveQuote?.changePct ?? activeStock.change) >= 0 ? "up" : "down"}>{(liveQuote?.change ?? 0) >= 0 ? "+" : ""}{(liveQuote?.change ?? 0).toFixed(2)}　{(liveQuote?.changePct ?? activeStock.change) >= 0 ? "+" : ""}{(liveQuote?.changePct ?? activeStock.change).toFixed(2)}%</span><small>今开 {(liveQuote?.open ?? 1561).toFixed(2)}　最高 {(liveQuote?.high ?? 1596.8).toFixed(2)}　最低 {(liveQuote?.low ?? 1552.31).toFixed(2)}　<button className="refresh-quote" onClick={loadQuote}>{quoteState === "loading" ? "更新中…" : "刷新"}</button></small></div>
          </div>

          <div className="index-strip">
            {[['上证指数','3,214.68','+0.74%'],['深证成指','10,598.12','+1.21%'],['创业板指','2,182.45','+1.86%'],['沪深300','3,782.26','+0.92%']].map((x,i) => <div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><em className="up">{x[2]}</em><i className={`mini-line l${i}`}></i></div>)}
          </div>

          <div className="analysis-grid">
            <section className="chart-card card">
              <div className="card-head">
                <div className="range-tabs">{["分时","日K","周K","月K"].map(x => <button key={x} onClick={() => setRange(x)} className={range===x?"active":""}>{x}</button>)}</div>
                <div className="indicators"><button className="active">MA</button><button>EMA</button><button>MACD</button><button>更多⌄</button></div>
              </div>
              <div className="legend"><span>MA5 <b>1,575.62</b></span><span>MA10 <b>1,552.80</b></span><span>MA20 <b>1,528.36</b></span></div>
              <div className="chart" aria-label={`${activeStock.name}${range}价格走势图`}>
                <div className="price-axis"><span>1,620</span><span>1,580</span><span>1,540</span><span>1,500</span><span>1,460</span></div>
                <div className="grid-lines">{[0,1,2,3,4].map(x=><i key={x}></i>)}</div>
                <div className="candles">{candles.map((v,i) => <div className={`candle ${i%4===0||i%7===0?'fall':'rise'}`} key={i} style={{height:`${22+(v%31)}px`,bottom:`${12+(v-55)*1.22}px`}}><i></i></div>)}</div>
                <div className="forecast-zone"><span>AI 预测区间</span><div className="forecast-line"></div><b>1,642</b></div>
                <div className="date-axis"><span>07/01</span><span>07/11</span><span>07/22</span><span>08/01</span><span>08/14</span><span>08/21</span></div>
              </div>
              <div className="volume"><span>VOL 18.6万</span>{candles.map((v,i)=><i key={i} className={i%4===0||i%7===0?'down-bg':'up-bg'} style={{height:`${6+v%25}px`}}></i>)}</div>
            </section>

            <aside className="signal-card card">
              <div className="panel-title"><div><span className="ai-dot">AI</span><h2>量化信号</h2></div><span className="live-dot">模型已更新</span></div>
              <div className="score-ring" style={{"--score": `${activeStock.score * 3.6}deg`} as React.CSSProperties}><div><b>{activeStock.score}</b><span>/ 100</span><small>综合评分</small></div></div>
              <div className="signal-label"><b>{activeStock.signal}</b><span>趋势延续概率较高</span></div>
              <div className="probability"><div><span>未来 5 日上涨概率</span><b>68.4%</b></div><i><em style={{width:'68.4%'}}></em></i><small>模型置信度：中高</small></div>
              <div className="price-levels"><div><span>目标区间</span><b className="up">1,620 — 1,665</b></div><div><span>关键支撑</span><b>1,548.20</b></div><div><span>止损参考</span><b className="down">1,512.00</b></div></div>
              <button className="report-button" onClick={() => {setTab('AI预测'); setNotice('完整研报已展开')}}>查看完整 AI 研报 <span>→</span></button>
            </aside>
          </div>

          <div className="lower-grid">
            <section className="insight-card card">
              <div className="content-tabs">{["AI预测","技术面","基本面","资金面","事件舆情"].map(x=><button key={x} onClick={()=>setTab(x)} className={tab===x?'active':''}>{x}{x==='事件舆情'&&<i>3</i>}</button>)}</div>
              {tab === "AI预测" ? <div className="insight-content">
                <div className="summary"><span>模型结论</span><p><b>短期动能转强，价格站稳 20 日均线。</b>量价配合改善，但临近前高压力区，预计未来 5 个交易日呈震荡上行结构。</p></div>
                <div className="factors"><h3>核心驱动因子</h3><div className="factor-row"><span>趋势动量</span><i><em style={{width:'86%'}}></em></i><b className="up">强</b></div><div className="factor-row"><span>资金流向</span><i><em style={{width:'72%'}}></em></i><b className="up">偏多</b></div><div className="factor-row"><span>估值位置</span><i><em className="amber" style={{width:'54%'}}></em></i><b>中性</b></div><div className="factor-row"><span>市场情绪</span><i><em style={{width:'66%'}}></em></i><b className="up">回暖</b></div></div>
                <div className="risk-note"><Icon>!</Icon><p><b>风险观察</b>若放量跌破 1,548 元，短期上涨结构可能失效；消费板块整体资金强度仍需持续确认。</p></div>
              </div> : <div className="tab-placeholder"><span>{tab}</span><h3>{tab}指标正在持续跟踪</h3><p>该模块已接入分析框架。连接实时数据源后，将展示与 {activeStock.name} 相关的多维指标和归因结论。</p></div>}
            </section>
            <section className="backtest-card card">
              <div className="panel-title"><div><h2>模型近期表现</h2></div><button>近 90 日⌄</button></div>
              <div className="performance"><div><span>方向准确率</span><b>64.8%</b><small className="up">高于基准 8.2%</small></div><div><span>预测覆盖</span><b>87</b><small>个交易信号</small></div></div>
              <div className="accuracy-bars"><div><span>5日预测</span><i><em style={{width:'65%'}}></em></i><b>64.8%</b></div><div><span>10日预测</span><i><em style={{width:'59%'}}></em></i><b>58.6%</b></div><div><span>20日预测</span><i><em style={{width:'53%'}}></em></i><b>52.9%</b></div></div>
              <p className="disclaimer">历史回测不代表未来收益。预测结果仅供研究参考，不构成任何投资建议。</p>
            </section>
          </div>

          <section className="data-center card" id="data-center">
            <div className="data-center-head"><div><span>DATA</span><div><h2>个股数据中心</h2><p>{activeStock.name} · 核心分析数据一站式查看</p></div></div><small>演示口径 · 2026-08-14</small></div>
            <div className="data-tabs">{["总览","估值","财务","资金","技术","事件"].map(x => <button key={x} onClick={() => setDataTab(x)} className={dataTab === x ? "active" : ""}>{x}</button>)}</div>
            {dataTab === "总览" && <div className="data-overview">
              <div className="metric-grid">{[["总市值",liveQuote?.marketCap ? `${(liveQuote.marketCap/1e12).toFixed(2)}万亿` : "1.98万亿",quoteState === "live" ? "实时行情" : "备用数据"],["市盈率 TTM",liveQuote?.pe ? `${liveQuote.pe.toFixed(2)} 倍` : "24.6 倍","动态估值"],["市净率",liveQuote?.pb ? `${liveQuote.pb.toFixed(2)} 倍` : "8.7 倍","最新行情口径"],["换手率",liveQuote ? `${liveQuote.turnover.toFixed(2)}%` : "0.82%","盘中更新"],["成交额",liveQuote ? `${(liveQuote.amount/1e8).toFixed(2)}亿` : "—","盘中累计"],["行情状态",quoteState === "live" ? "已连接" : "备用模式",quoteState === "live" ? liveQuote?.source ?? "免费源" : "点击刷新重试"]].map(x => <article key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><small>{x[2]}</small></article>)}</div>
              <div className="overview-bottom"><div><h3>分析快照</h3><p>盈利能力突出，估值处于历史中低位；短期资金与趋势信号共振，但需关注前高附近抛压。</p><div className="tags"><span>高ROE</span><span>现金流稳健</span><span>机构重仓</span><span>估值合理</span></div></div><div className="radar-list"><h3>六维评分</h3>{[["盈利",92],["成长",68],["估值",74],["资金",76],["趋势",84]].map(x=><div key={x[0]}><span>{x[0]}</span><i><em style={{width:`${x[1]}%`}}></em></i><b>{x[1]}</b></div>)}</div></div>
            </div>}
            {dataTab === "估值" && <div className="data-detail"><div className="detail-lead"><span>估值结论</span><h3>当前估值处于近 5 年偏低区间</h3><p>PE-TTM 为 24.6 倍，低于近 5 年中位数 31.8 倍；结合盈利稳定性，估值安全边际较去年改善。</p></div><div className="history-table"><div><span>指标</span><span>当前</span><span>5年分位</span><span>行业中位</span></div>{[["PE-TTM","24.6x","32%","27.8x"],["PB-MRQ","8.7x","28%","5.4x"],["PS-TTM","8.3x","35%","4.7x"],["股息率","3.12%","78%","2.36%"]].map(r=><div key={r[0]}>{r.map((v,i)=><b key={i}>{v}</b>)}</div>)}</div></div>}
            {dataTab === "财务" && <div className="data-detail"><div className="growth-cards">{[["营业收入","1,502.6亿","+15.7%"],["归母净利润","747.3亿","+17.1%"],["毛利率","91.8%","+0.3pct"],["经营现金流","665.2亿","+21.4%"]].map(x=><article key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><em>{x[2]}</em></article>)}</div><div className="quality-note"><h3>盈利质量</h3><p>营收与利润保持双位数增长，经营现金流增速高于净利润增速，利润含金量较高；合同负债变化是下一期业绩的重要先行指标。</p></div></div>}
            {dataTab === "资金" && <div className="data-detail"><div className="fund-flow">{[["今日主力净流入","+4.26亿","净占比 3.8%"],["近5日主力净流入","+8.70亿","连续3日流入"],["北向持股估算","5.82%","周环比 +0.12pct"],["融资余额","152.4亿","日增 +1.8亿"]].map(x=><article key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><small>{x[2]}</small></article>)}</div><div className="flow-bars"><h3>分时资金强度</h3>{[42,58,51,72,68,84,76,91,83,88,79,86].map((v,i)=><i key={i} style={{height:`${v}%`}}></i>)}</div></div>}
            {dataTab === "技术" && <div className="data-detail"><div className="tech-table">{[["MA趋势","多头排列","强"],["MACD","金叉后扩张","偏多"],["RSI(14)","63.8","中性偏强"],["KDJ","J=81.2","短线偏热"],["成交量","1.24倍均量","温和放量"],["波动率","18.6%","中低"]].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><em>{x[2]}</em></div>)}</div><div className="key-level"><h3>关键价位</h3><p><span>压力二</span><b>1,665</b></p><p><span>压力一</span><b>1,620</b></p><p><span>现价</span><b className="up">1,588.50</b></p><p><span>支撑一</span><b>1,548</b></p></div></div>}
            {dataTab === "事件" && <div className="event-list">{[["08-13","机构调研","近一周获 34 家机构关注，核心议题为渠道库存与分红规划","中性偏多"],["08-12","公司公告","发布半年度主要经营数据，收入与利润增速符合预期","正面"],["08-09","行业数据","高端白酒批价保持稳定，终端动销环比改善","正面"],["08-07","风险提醒","消费复苏节奏仍有不确定性，关注渠道库存变化","关注"]].map(x=><article key={x[0]+x[1]}><time>{x[0]}</time><span>{x[1]}</span><p>{x[2]}</p><b>{x[3]}</b></article>)}</div>}
            <div className="data-source-note">数据说明：报价、开高低、涨跌幅、成交额、换手率、PE、PB 与市值来自免费行情接口并每 30 秒刷新；财务、资金和事件模块正在分阶段接入，暂保留演示口径。免费数据仅供个人研究。</div>
          </section>
        </section>
      </div>
      {notice && <div className="toast">✓ {notice}</div>}
    </main>
  );
}
