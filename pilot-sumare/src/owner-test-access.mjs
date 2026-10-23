import {personalAgentRole} from './personal-agent-role.mjs';
export const ownerTestRoles=['learner','recruiter','school_staff'];
// Call only after verified Auth and active, non-fictitious membership in configured cohort.
export function ownerTestAccess(env,userId,membership,requested){
 const enabled=!!env.OEO_OWNER_TEST_USER_ID&&env.OEO_OWNER_TEST_USER_ID===userId&&membership?.role==='pilot_owner'&&membership.status==='active'&&!membership.is_fictitious;
 const role=enabled&&ownerTestRoles.includes(requested)?requested:personalAgentRole(membership?.role);
 return {enabled,role};
}
export const requestedTestRole=req=>req.method==='GET'?req.query?.profile:req.body?.profile;
