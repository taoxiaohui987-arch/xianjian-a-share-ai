type Point={time:number;date:string;open:number;high:number;low:number;close:number;volume:number};
const suffix=(code:string)=>/^(4|8|9)/.test(code)?`${code}.BJ`:/^(5|6)/.test(code)?`${code}.SS`:`${code}.SZ`;
const configs:Record<string,{range:string;interval:string}>={"分时":{range:"1d",interval:"5m"},"日K":{range:"6mo",interval:"1d"},"周K":{range:"2y",interval:"1wk"},"月K":{range:"5y",interval:"1mo"}};
const average=(items:Point[],period:number)=>items.length<period?null:items.slice(-period).reduce((sum,p)=>sum+p.close,0)/period;
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, OPTIONS","Access-Control-Allow-Headers":"Content-Type"};
export async function OPTIONS(){return new Response(null,{status:204,headers:cors})}
export async function GET(request:Request){
  const url=new URL(request.url),code=url.searchParams.get("code")??"",kind=url.searchParams.get("range")??"日K";
  if(!/^\d{6}$/.test(code))return Response.json({error:"股票代码格式不正确"},{status:400});
  const config=configs[kind]??configs["日K"];
  try{
    const upstream=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${suffix(code)}?range=${config.range}&interval=${config.interval}&events=div%2Csplits`,{headers:{"User-Agent":"Mozilla/5.0"}});
    if(!upstream.ok)throw new Error("upstream");
    const json:any=await upstream.json(),result=json?.chart?.result?.[0],q=result?.indicators?.quote?.[0],timestamps:number[]=result?.timestamp??[];
    const points:Point[]=timestamps.map((time,i)=>({time,date:new Date(time*1000).toLocaleDateString("zh-CN",{month:"2-digit",day:"2-digit",timeZone:"Asia/Shanghai"}),open:Number(q.open?.[i]),high:Number(q.high?.[i]),low:Number(q.low?.[i]),close:Number(q.close?.[i]),volume:Number(q.volume?.[i]??0)})).filter(p=>[p.open,p.high,p.low,p.close].every(Number.isFinite)).slice(-60);
    if(points.length<2)throw new Error("empty");
    const closes=points.map(p=>p.close),returns=closes.slice(1).map((v,i)=>(v-closes[i])/closes[i]),volatility=Math.sqrt(returns.reduce((s,v)=>s+v*v,0)/Math.max(1,returns.length));
    const last=closes.at(-1)!,trend=(last-closes[Math.max(0,closes.length-6)])/Math.min(5,closes.length-1);
    return Response.json({points,ma5:average(points,5),ma10:average(points,10),ma20:average(points,20),forecast:{mid:last+trend*5,low:last*(1-volatility*Math.sqrt(5)),high:last*(1+volatility*Math.sqrt(5))},source:"Yahoo Finance",kind},{headers:{...cors,"Cache-Control":kind==="分时"?"public, max-age=30, s-maxage=60":"public, max-age=600, s-maxage=1800"}});
  }catch{return Response.json({error:"历史行情暂时不可用"},{status:502})}
}
