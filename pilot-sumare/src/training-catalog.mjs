import courses from './training-content/catalog.json' with {type:'json'};
export const trainingRoles=['learner','recruiter','school_staff'];
export function trainingCatalog(role,tier){return courses.filter(c=>c.role===role).map(c=>({id:c.id,title:c.title,objective:c.objective,tier:c.tier,lessonCount:c.lessons.length,format:c.format,available:tier>=c.tier}));}
export function findTraining(id,role){return courses.find(c=>c.id===id&&c.role===role)||null;}
export function trainingContent(course){const {quiz,...content}=course;return {...content,quiz:quiz.map(({question,options})=>({question,options}))};}
export function gradeTraining(course,answers){
 if(!Array.isArray(answers)||answers.length!==course.quiz.length||answers.some((v,i)=>!Number.isInteger(v)||v<0||v>=course.quiz[i].options.length))throw Error('Responda todas as perguntas.');
 const feedback=course.quiz.map((q,i)=>({question:q.question,correct:answers[i]===q.correct,explanation:q.explanation}));
 return {score:Math.round(feedback.filter(f=>f.correct).length*100/feedback.length),feedback};
}
