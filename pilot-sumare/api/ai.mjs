import {aiChatHandler} from '../src/ai-chat-handler.mjs';
import {aiBalanceHandler} from '../src/ai-balance-handler.mjs';
import {agentCatalogHandler} from '../src/agent-catalog-handler.mjs';
const chat=aiChatHandler();
const balance=aiBalanceHandler();
const catalog=agentCatalogHandler();
export default function handler(req,res){
 const action=req.query?.action;
 if(action==='chat')return chat(req,res);
 if(action==='balance')return balance(req,res);
 if(action==='catalog')return catalog(req,res);
 res.setHeader('Cache-Control','private, no-store');
 return res.status(404).json({error:'Recurso de IA não encontrado.'});
}
