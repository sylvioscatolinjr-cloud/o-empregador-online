// The owner uses their own candidate workspace and paid candidate subscription.
// Never accepts a requested role from the browser or changes a database membership.
export const personalAgentRole=role=>role==='pilot_owner'?'learner':role;
