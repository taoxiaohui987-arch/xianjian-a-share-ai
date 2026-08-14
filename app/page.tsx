"use client";

import { useMemo, useState } from "react";

const stocks = [
  { code: "600519", exchange: "SH", name: "贵州茅台", price: 1588.50, change: 1.82, score: 78, signal: "偏多" },
  { code: "300750", exchange: "SZ", name: "宁德时代", price: 268.36, change: 2.41, score: 82, signal: "偏多" },
  { code: "601318", exchange: "SH", name: "中国平安", price: 47.82, change: -0.64, score: 55, signal: "中性" },
  { code: "000858", exchange: "SZ", name: "五粮液", price: 131.20, change: 1.16, score: 71, signal: "关注" },
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

  const filtered = useMemo(() => stocks.filter(s => `${s.code}${s.name}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const selectStock = (stock: typeof stocks[0]) => { setActiveStock(stock); setQuery(""); setNotice(`已切换至 ${stock.name}`); setTimeout(() => setNotice(""), 1800); };

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
            <Icon>⌕</Icon><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索股票 / 代码" aria-label="搜索股票或代码" />
            {query && <div className="search-results">{filtered.map(s => <button key={s.code} onClick={() => selectStock(s)}><span>{s.name}<small>{s.code}.{s.exchange}</small></span><b>{s.price.toFixed(2)}</b></button>)}</div>}
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
          <div className="side-foot"><p>数据更新时间</p><strong>2026-08-14 15:10</strong><small>演示数据 · 延时行情</small></div>
        </aside>

        <section className="workspace">
          <div className="stock-heading">
            <div><div className="title-line"><h1>{activeStock.name}</h1><span>{activeStock.code}.{activeStock.exchange}</span><button onClick={() => setWatching(!watching)} className={watching ? "watching" : ""}>{watching ? "★ 已自选" : "☆ 加自选"}</button></div><p>白酒 · 沪深300成分 · 大盘价值</p></div>
            <div className="quote"><strong>{activeStock.price.toFixed(2)}</strong><span className={activeStock.change >= 0 ? "up" : "down"}>+28.40　+{activeStock.change.toFixed(2)}%</span><small>今开 1,561.00　最高 1,596.80　最低 1,552.31</small></div>
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
        </section>
      </div>
      {notice && <div className="toast">✓ {notice}</div>}
    </main>
  );
}
