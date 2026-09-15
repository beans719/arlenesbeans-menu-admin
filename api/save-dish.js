// Vercel serverless endpoint for controlled writes to Arlene's Beans TEST Menu_Master.
// Required environment variables (never commit their values):
// GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEETS_ID,
// CMS_WRITE_TOKEN

const crypto = require('crypto');

const ALLOWED_FIELDS = [
  'Active','Display_Category','Display_Name','Description','Base_Price','Price_Display',
  'Variant_Group','Variant_or_Size','Dietary','Display_Order','Screen_Suggestion',
  'Needs_Verification','Source_Raw_IDs','Editor_Notes'
];
const HEADERS = ['Menu_ID',...ALLOWED_FIELDS];
const SHEET_NAME = 'Menu_Master';

function json(res,status,body){res.status(status).setHeader('Content-Type','application/json');res.end(JSON.stringify(body))}
function safeEqual(a,b){const aa=Buffer.from(String(a||'')),bb=Buffer.from(String(b||''));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb)}
function base64url(input){return Buffer.from(input).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}
async function accessToken(){
  const email=process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,key=(process.env.GOOGLE_PRIVATE_KEY||'').replace(/\\n/g,'\n');
  if(!email||!key)throw new Error('Google service account is not configured');
  const now=Math.floor(Date.now()/1000),header=base64url(JSON.stringify({alg:'RS256',typ:'JWT'})),claim=base64url(JSON.stringify({iss:email,scope:'https://www.googleapis.com/auth/spreadsheets',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600}));
  const unsigned=`${header}.${claim}`,signer=crypto.createSign('RSA-SHA256');signer.update(unsigned);const assertion=`${unsigned}.${base64url(signer.sign(key))}`;
  const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion});
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});const data=await r.json();if(!r.ok)throw new Error(data.error_description||'Google authentication failed');return data.access_token;
}
async function sheets(path,token,options={}){const r=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}${path}`,{...options,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',...(options.headers||{})}});const data=await r.json();if(!r.ok)throw new Error(data.error?.message||'Google Sheets request failed');return data}
module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{ok:false,error:'Method not allowed'});
  if(!process.env.CMS_WRITE_TOKEN||!safeEqual(req.headers['x-cms-write-token'],process.env.CMS_WRITE_TOKEN))return json(res,401,{ok:false,error:'Unauthorized'});
  try{
    const {menuId,changes,expected={}}=req.body||{};if(!menuId||!/^M\d+(?:\.\d+)?$/.test(menuId))return json(res,400,{ok:false,error:'Invalid Menu_ID'});if(!changes||typeof changes!=='object'||Array.isArray(changes))return json(res,400,{ok:false,error:'Invalid changes'});
    const bad=Object.keys(changes).filter(k=>!ALLOWED_FIELDS.includes(k));if(bad.length)return json(res,400,{ok:false,error:`Unsupported fields: ${bad.join(', ')}`});
    const token=await accessToken();const range=encodeURIComponent(`'${SHEET_NAME}'!A1:O500`);const current=await sheets(`/values/${range}`,token);const rows=current.values||[],headers=rows[0]||[];if(HEADERS.some(h=>!headers.includes(h)))throw new Error('Menu_Master schema changed; write blocked');
    const rowIndex=rows.findIndex((r,i)=>i>0&&String(r[0]||'').trim()===menuId);if(rowIndex<1)return json(res,404,{ok:false,error:'Menu_ID not found'});
    const row=rows[rowIndex],before={};headers.forEach((h,i)=>before[h]=row[i]??'');
    const conflicts=Object.keys(expected).filter(k=>ALLOWED_FIELDS.includes(k)&&String(before[k]??'')!==String(expected[k]??''));if(conflicts.length)return json(res,409,{ok:false,error:'Record changed since it was loaded',conflicts});
    const after={...before};Object.entries(changes).forEach(([k,v])=>after[k]=v==null?'':String(v));after.Menu_ID=menuId;
    const values=[headers.map(h=>after[h]??'')],target=encodeURIComponent(`'${SHEET_NAME}'!A${rowIndex+1}:O${rowIndex+1}`);await sheets(`/values/${target}?valueInputOption=USER_ENTERED`,token,{method:'PUT',body:JSON.stringify({range:`${SHEET_NAME}!A${rowIndex+1}:O${rowIndex+1}`,majorDimension:'ROWS',values})});
    return json(res,200,{ok:true,menuId,row:rowIndex+1,before:Object.fromEntries(Object.keys(changes).map(k=>[k,before[k]??''])),after:Object.fromEntries(Object.keys(changes).map(k=>[k,after[k]??'']))});
  }catch(e){return json(res,500,{ok:false,error:e.message||'Write failed'})}
};