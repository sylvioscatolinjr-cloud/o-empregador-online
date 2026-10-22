import {trainingHandler} from '../src/training-handler.mjs';
import {aiHistoryHandler} from '../src/ai-history-handler.mjs';
import {aiResumeHandler} from '../src/ai-resume-handler.mjs';
import {aiChatHandler} from '../src/ai-chat-handler.mjs';
import {aiBalanceHandler} from '../src/ai-balance-handler.mjs';
import {agentCatalogHandler} from '../src/agent-catalog-handler.mjs';
const training=trainingHandler();
const history=aiHistoryHandler();
const resume=aiResumeHandler();
const chat=aiChatHandler();
const balance=aiBalanceHandler();
const catalog=agentCatalogHandler();
export default function handler(req,res){
 const action=req.query?.action;
 if(typeof action==='string'&&action.startsWith('training-'))return training(req,res);
 if(['resume-source','resume-review','resume-save'].includes(action))return resume(req,res);
 if(['history-list','history-save','history-delete'].includes(action))return history(req,res);
 if(action==='chat')return chat(req,res);
 if(action==='balance')return balance(req,res);
 if(action==='catalog')return catalog(req,res);
 res.setHeader('Cache-Control','private, no-store');
 return res.status(404).json({error:'Recurso de IA não encontrado.'});
}
