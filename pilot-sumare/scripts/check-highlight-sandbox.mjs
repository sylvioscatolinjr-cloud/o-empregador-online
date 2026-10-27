import {checkHighlightSandbox} from '../src/highlight-sandbox-check.mjs';

if(process.env.VERCEL_ENV==='production') throw Error('O teste Sandbox não pode ser executado no ambiente de produção.');
try {
 const result=await checkHighlightSandbox({key:process.env.ASAAS_SANDBOX_API_KEY,origin:process.env.HIGHLIGHT_SANDBOX_ORIGIN});
 console.log(JSON.stringify(result));
} catch(error) {
 console.error('Teste de checkout Sandbox não concluído:',error.message);
 process.exitCode=1;
}
