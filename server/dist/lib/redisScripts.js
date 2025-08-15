"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLAIM_PAIR_LUA = void 0;
exports.loadClaimScript = loadClaimScript;
// src/lib/redisScripts.ts
const redisClient_1 = __importDefault(require("./redisClient"));
exports.CLAIM_PAIR_LUA = `
-- ARGV: myId, candidateId, myTeachSkillKey..., myLearnSkillKey..., candidateTeachSkillKey..., candidateLearnSkillKey...
-- For simplicity we expect:
-- KEYS: none
-- ARGV: [myId, candidateId, teachKeyForCandidate, learnKeyForCandidate, teachKeyForMe, learnKeyForMe]
local myId = ARGV[1]
local candidateId = ARGV[2]
local teachKeyForCandidate = ARGV[3]
local learnKeyForCandidate = ARGV[4]
local teachKeyForMe = ARGV[5]
local learnKeyForMe = ARGV[6]

-- Check candidate still in both required sets
local inTeach = redis.call("SISMEMBER", teachKeyForCandidate, candidateId)
local inLearn = redis.call("SISMEMBER", learnKeyForCandidate, candidateId)
local meInTeach = redis.call("SISMEMBER", teachKeyForMe, myId)
local meInLearn = redis.call("SISMEMBER", learnKeyForMe, myId)

if inTeach == 1 and inLearn == 1 and meInTeach == 1 and meInLearn == 1 then
  -- Remove both from involved sets import { loadClaimScript } from "../lib/redisScripts";so they cannot be matched by others
  redis.call("SREM", teachKeyForCandidate, candidateId)
  redis.call("SREM", learnKeyForCandidate, candidateId)
  redis.call("SREM", teachKeyForMe, myId)
  redis.call("SREM", learnKeyForMe, myId)
  return { "OK" }
end
return nil
`;
async function loadClaimScript() {
    const sha = await redisClient_1.default.script("LOAD", exports.CLAIM_PAIR_LUA);
    return sha;
}
