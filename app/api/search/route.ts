type SearchItem={code:string;name:string;exchange:"SH"|"SZ"|"BJ";market:string};
const decodeName=(value:string)=>{try{return JSON.parse(`"${value.replace(/"/g,'\\"')}"`)}catch{return value}};
export async function GET(request:Request){
  const q=new URL(request.url).searchParams.get("q")?.trim().slice(0,30)??"";
  if(!q)return Response.json({results:[]});
  try{
    const response=await fetch(`https://smartbox.gtimg.cn/s3/?q=${encodeURIComponent(q)}&t=all`,{headers:{"User-Agent":"Mozilla/5.0",Referer:"https://gu.qq.com/"}});
    if(!response.ok)throw new Error();
    const raw=new TextDecoder("gbk").decode(await response.arrayBuffer());
    const body=raw.slice(raw.indexOf('"')+1,raw.lastIndexOf('"'));
    const results:SearchItem[]=body.split("^").map(row=>row.split("~")).filter(x=>x.length>=3&&/^\d{6}$/.test(x[1])&&["sh","sz","bj"].includes(x[0])).slice(0,12).map(x=>({code:x[1],name:decodeName(x[2]),exchange:x[0].toUpperCase() as SearchItem["exchange"],market:x[4]||"A股"}));
    return Response.json({results},{headers:{"Cache-Control":"public, max-age=60, s-maxage=300"}});
  }catch{return Response.json({results:[],error:"搜索服务暂时不可用"},{status:502})}
}
