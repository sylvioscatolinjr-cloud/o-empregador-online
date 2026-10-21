import test from 'node:test';
import assert from 'node:assert/strict';
import {agentCatalogHandler} from '../api/agent-catalog.mjs';
const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEY:'test-only',PILOT_COHORT_ID:'test-cohort'};
function fixture({role='school_staff',status='active',verified=true}={}){
 const queries=[];
 const clientFactory=()=>({auth:{async getUser(){return {data:{user:{id:'user1',email_confirmed_at:verified?'today':null}},error:null}}},from(name){queries.push(name);const q={select(){return q},eq(){return q},async maybeSingle(){return {data:{role,status},error:null}}};return q}});
 const handler=agentCatalogHandler({env,clientFactory});
 const response={headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(v){this.body=v;return this}};
 return {handler,response,queries};
}
test('requires bearer auth',async()=>{const f=fixture();await f.handler({method:'GET',headers:{}},f.response);assert.equal(f.response.code,401);assert.equal(f.queries.length,0)});
test('rejects unsupported HTTP methods',async()=>{const f=fixture();await f.handler({method:'POST',headers:{}},f.response);assert.equal(f.response.code,405)});
test('institution receives its own planned capabilities',async()=>{const f=fixture();await f.handler({method:'GET',headers:{authorization:'Bearer abc'}},f.response);assert.equal(f.response.code,200);assert.equal(f.response.body.agent.profile,'institution');assert.equal(f.response.body.available,false);assert.equal(f.response.body.agent.capabilities[0].status,'planned')});
test('inactive and owner accounts cannot impersonate a profile',async()=>{for(const input of [{status:'suspended'},{role:'pilot_owner'},{verified:false}]){const f=fixture(input);await f.handler({method:'GET',headers:{authorization:'Bearer abc'}},f.response);assert.ok([401,403].includes(f.response.code))}});
