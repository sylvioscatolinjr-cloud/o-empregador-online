import Anthropic from '@anthropic-ai/sdk';
// Single place that talks to the AI provider, so agents never depend on a vendor SDK directly.
export const DEFAULT_MODEL='claude-opus-5-5';
export class ProviderError extends Error{}
const fail=m=>{throw new ProviderError(m);};
function request({system,user,model,maxTokens,schema}){
 return {model:model||DEFAULT_MODEL,max_tokens:maxTokens,betas:['server-side-fallback-2026-07-01'],fallbacks:'default',
  system:[{type:'text',text:system,cache_control:{type:'ephemeral'}}],
  output_config:{effort:'low',...(schema?{format:{type:'json_schema',schema}}:{})},
  messages:[{role:'user',content:user}]};
}
async function call(params,{apiKey,client=new Anthropic({apiKey,timeout:55000,maxRetries:1}),messages={}}){
 const response=await client.beta.messages.create(params);
 if(response.stop_reason==='refusal')fail(messages.refusal||'A IA não pôde atender este pedido. Revise o texto e tente de novo.');
 if(response.stop_reason==='max_tokens')fail(messages.truncated||'A resposta ficou longa demais. Resuma o texto e tente de novo.');
 const u=response.usage||{};
 return {text:response.content.filter(b=>b.type==='text').map(b=>b.text).join('').trim(),model:response.model||params.model,usage:{input_tokens:u.input_tokens||0,output_tokens:u.output_tokens||0,cache_read_input_tokens:u.cache_read_input_tokens||0}};
}
export function structuredRequest({system,user,schema,model,maxTokens=8000}){return request({system,user,schema,model,maxTokens});}
export async function generateStructured({system,user,schema,model,maxTokens=8000},options={}){
 const out=await call(structuredRequest({system,user,schema,model,maxTokens}),options);
 try{return {...out,value:JSON.parse(out.text)};}catch{fail(options.messages?.format||'A IA retornou uma resposta fora do formato. Tente novamente.');}
}
export async function generateText({system,user,model,maxTokens=3000},options={}){
 const out=await call(request({system,user,model,maxTokens}),options);
 if(!out.text)fail('A IA não retornou texto. Tente novamente.');
 return out;
}
