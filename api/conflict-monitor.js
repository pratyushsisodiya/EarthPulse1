const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const UCDP_TOKEN = process.env.UCDP_API_TOKEN || process.env.CONFLICT_UCDP_TOKEN;

const CONFIG = [
  { id:'ukraine', name:'Ukraine war', region:'europe', label:'Europe', keywords:['Ukraine','Ukraine (Russia)','Russia - Ukraine'] },
  { id:'israel-palestine', name:'Israel–Palestine conflict', region:'middle-east', label:'Middle East', keywords:['Israel','Palestine','Gaza'] },
  { id:'sudan', name:'Sudan conflict', region:'africa', label:'Africa', keywords:['Sudan'] },
  { id:'myanmar', name:'Myanmar conflict', region:'asia', label:'Asia', keywords:['Myanmar','Burma'] },
  { id:'drc', name:'Eastern Democratic Republic of the Congo', region:'africa', label:'Africa', keywords:['Congo','DRC','Democratic Republic of the Congo'] },
  { id:'sahel', name:'Sahel conflicts', region:'africa', label:'Africa', keywords:['Mali','Burkina Faso','Niger','Sahel','Nigeria'] }
];

async function kv(command) {
  if (!KV_URL || !KV_TOKEN) return null;
  const r = await fetch(KV_URL, {
    method:'POST',
    headers:{Authorization:`Bearer ${KV_TOKEN}`,'Content-Type':'application/json'},
    body:JSON.stringify(command)
  });
  if (!r.ok) throw new Error(`KV_HTTP_${r.status}`);
  return r.json();
}

function matches(name, keywords) {
  const s = String(name || '').toLowerCase();
  return keywords.some(k => s.includes(k.toLowerCase()));
}

function median(values) {
  const a = values.map(Number).filter(Number.isFinite).sort((x,y)=>x-y);
  if (!a.length) return null;
  const m=Math.floor(a.length/2);
  return a.length%2?a[m]:(a[m-1]+a[m])/2;
}

async function ucdp(resource, params={}) {
  if (!UCDP_TOKEN) return null;
  const q = new URLSearchParams({ pagesize:'5000', page:'1', ...params });
  const r = await fetch(`https://ucdpapi.pcr.uu.se/api/${resource}/26.1?${q}`, {
    headers:{'x-ucdp-access-token':UCDP_TOKEN,accept:'application/json'}
  });
  if (!r.ok) throw new Error(`UCDP_HTTP_${r.status}`);
  return r.json();
}

async function getReports() {
  const r = await kv(['LRANGE','conflict:reports','0','199']);
  return (r?.result || []).map(x=>{try{return JSON.parse(x)}catch(_){return null}}).filter(Boolean);
}

module.exports = async function handler(req,res) {
  res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=900');
  if (req.method !== 'GET') return res.status(405).json({message:'Method not allowed.'});

  try {
    const [conflictRows, battleRows, reports] = await Promise.all([
      ucdp('ucdpprioconflict',{Year:'2025'}),
      ucdp('battledeaths',{}),
      getReports()
    ]);

    const conflictData = conflictRows?.Result || [];
    const battleData = battleRows?.Result || [];

    const data = CONFIG.map(c=>{
      const current = conflictData.filter(x=>matches(x.conflict_name,c.keywords));
      const battle = battleData.filter(x=>matches(x.conflict_name,c.keywords) || matches(x.location_inc,c.keywords));
      const ucdpValues = battle.map(x=>({
        source:'UCDP',
        value:Number(x.bdead_best ?? x.best ?? x.battledeaths),
        date:String(x.year || ''),
        metric:'battle-related deaths',
        url:'https://ucdp.uu.se/downloads/'
      })).filter(x=>Number.isFinite(x.value));
      const sourceReports = reports.filter(x=>x.conflictId===c.id && Number.isFinite(Number(x.value))).map(x=>({...x,value:Number(x.value)}));
      const allReports=[...ucdpValues,...sourceReports];
      const m=median(allReports.map(x=>x.value));
      return {
        ...c,
        status: current.length ? 'Active / source-defined' : 'Listed for monitoring',
        lastUpdated: new Date().toISOString(),
        currentMatches: current.slice(0,8).map(x=>({name:x.conflict_name,year:x.year})),
        estimates: allReports,
        median:m,
        estimateStatus: allReports.length>=3?'MEDIAN READY':'INSUFFICIENT REPORTS',
        sourceStatus: UCDP_TOKEN?'UCDP CONNECTED':'UCDP TOKEN REQUIRED'
      };
    });

    return res.status(200).json({
      generatedAt:new Date().toISOString(),
      methodology:'Only comparable, explicitly sourced figures are aggregated. Median is a report aggregation, not an independently verified death toll.',
      ucdp:{connected:Boolean(UCDP_TOKEN),version:'26.1',source:'https://ucdp.uu.se/apidocs/'},
      conflicts:data
    });
  } catch(e) {
    console.error('conflict-monitor error:',e?.message||e);
    return res.status(502).json({message:'Conflict data source temporarily unavailable.',source:'UCDP',configured:Boolean(UCDP_TOKEN)});
  }
};