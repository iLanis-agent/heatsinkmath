const fs = require("fs");
eval(fs.readFileSync("engine.js", "utf8"));
const exp = JSON.parse(fs.readFileSync("expected.json", "utf8"));
const fns = { junction: junctionTruth, heatsink: heatsinkTruth, headroom: headroomTruth };
let fail = 0;
for (const c of exp.cases) {
  const got = fns[c.fn](...c.args);
  if (got !== c.expect) { fail++; console.log("MISMATCH", c.fn, c.args, "\n got:", got, "\n exp:", c.expect); }
}
const ERRS = ["each temperature must be from 0.01 to 300 °C with at most two decimal places",
  "the power must be from 0.01 to 100000 W with at most two decimal places",
  "each thermal resistance must be from 0.01 to 1000 °C/W with at most two decimal places",
  "the junction limit must be above ambient so there is a rise to spend",
  "the junction-to-case and case-to-heatsink drops alone use up the whole temperature budget"];
for (const [fn, args] of exp.errors) {
  let threw = null;
  try { fns[fn](...args); } catch (e) { threw = e.message; }
  if (!threw || !ERRS.includes(threw)) { fail++; console.log("ERRCASE FAIL", fn, args, "->", threw); }
}
console.log(fail ? `${fail} FAILURES` : "all green");
process.exit(fail ? 1 : 0);
