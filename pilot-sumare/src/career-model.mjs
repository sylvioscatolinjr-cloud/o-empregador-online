export function careerSeries(jobs,today=new Date().toISOString().slice(0,10)){
 const dates=new Set();for(const j of jobs){dates.add(j.starts_on);for(const e of j.events)dates.add(e.date);if(j.ends_on){const d=new Date(j.ends_on+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);if(d.toISOString().slice(0,10)<=today)dates.add(d.toISOString().slice(0,10));}}if(dates.size)dates.add(today);
 return [...dates].filter(d=>d<=today).sort().map(date=>{const active=jobs.filter(j=>j.starts_on<=date&&(!j.ends_on||j.ends_on>=date)).map(j=>{const events=j.events.filter(e=>e.date<=date).sort((a,b)=>a.date.localeCompare(b.date));return events.at(-1)||j;});return {date,salary:active.reduce((n,j)=>n+Number(j.salary),0),level:active.length?Math.max(...active.map(j=>Number(j.level))):0};});
}
