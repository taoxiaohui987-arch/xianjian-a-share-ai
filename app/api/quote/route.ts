type Quote = { code:string; name:string; price:number; preClose:number; open:number; high:number; low:number; change:number; changePct:number; volume:number; amount:number; turnover:number; pe:number|null; pb:number|null; marketCap:number|null; floatMarketCap:number|null; amplitude:number; updatedAt:string; source:string };
const marketCode=(code:string)=>/^(5|6|9)/.test(code)?`sh${code}`:`sz${code}`;
const num=(value:string)=>{const n=Number(value);return Number.isFinite(n)?n:0};
export async function GET(request:Request){
  const code=new URL(request.url).searchParams.get("code")?.trim()??"";
  if(!/^\d{6}$/.test(code))return Response.json({error:"股票代码格式不正确"},{status:400});
  try{
    const response=await fetch(`https://qt.gtimg.cn/q=${marketCode(code)}`,{headers:{"User-Agent":"Mozilla/5.0",Referer:"https://gu.qq.com/"}});
    if(!response.ok)throw new Error("upstream");
    const raw=new TextDecoder("gbk").decode(await response.arrayBuffer());
    const x=raw.slice(raw.indexOf('"')+1,raw.lastIndexOf('"')).split("~");
    if(x.length<60||!x[1])throw new Error("empty");
    const quote:Quote={name:x[1],code:x[2],price:num(x[3]),preClose:num(x[4]),open:num(x[5]),volume:num(x[36])*100,amount:num(x[57])*10000,turnover:num(x[38]),pe:x[39]?num(x[39]):null,high:num(x[33]),low:num(x[34]),change:num(x[31]),changePct:num(x[32]),amplitude:num(x[43]),marketCap:x[44]?num(x[44])*1e8:null,floatMarketCap:x[45]?num(x[45])*1e8:null,pb:x[46]?num(x[46]):null,updatedAt:x[30],source:"腾讯行情"};
    return Response.json({quote},{headers:{"Cache-Control":"public, max-age=10, s-maxage=15, stale-while-revalidate=60"}});
  }catch{return Response.json({error:"免费行情源暂时不可用，请稍后刷新"},{status:502})}
}
