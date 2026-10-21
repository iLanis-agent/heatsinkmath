// Heatsink Math engine: junction temperature from power and thermal resistances, the heatsink a temperature budget calls for, and the most a setup can dissipate. Exact integers (hundredths of a °C, hundredths of a W, hundredths of a °C/W), half-up on display only.
function _p(t, err, intDigits, places, lo, hi) {
  t = typeof t === "string" ? t.trim() : "";
  var m = new RegExp("^([0-9]{1," + intDigits + "})(?:\\.([0-9]{1," + places + "}))?$").exec(t);
  if (!m) throw new Error(err);
  var v = parseInt(m[1], 10) * Math.pow(10, places) + (m[2] ? parseInt(m[2].padEnd(places, "0"), 10) : 0);
  if (v < lo || v > hi) throw new Error(err);
  return v;
}
var _T = "each temperature must be from 0.01 to 300 °C with at most two decimal places";
var _P = "the power must be from 0.01 to 100000 W with at most two decimal places";
var _R = "each thermal resistance must be from 0.01 to 1000 °C/W with at most two decimal places";
var _HEAD = "the junction limit must be above ambient so there is a rise to spend";
var _BUDGET = "the junction-to-case and case-to-heatsink drops alone use up the whole temperature budget";
function _hu(n, d) { return Math.floor((2 * n + d) / (2 * d)); }
function _dec(v, places) {
  if (v < 0) return "-" + _dec(-v, places);
  var base = Math.pow(10, places);
  var s = String(Math.floor(v / base)), f = String(v % base).padStart(places, "0").replace(/0+$/, "");
  return f ? s + "." + f : s;
}
function _temp(t) { return _p(t, _T, 3, 2, 1, 30000); }
function _pow(t) { return _p(t, _P, 6, 2, 1, 10000000); }
function _res(t) { return _p(t, _R, 4, 2, 1, 100000); }

function junctionTruth(p, ta, rjc, rch, rha) {
  var pp = _pow(p), a = _temp(ta);
  var rs = _res(rjc) + _res(rch) + _res(rha);
  var rise = _hu(pp * rs, 100), tj = a + rise;
  return _dec(pp, 2) + " W through " + _dec(rs, 2) + " °C/W junction-to-air rises " + _dec(rise, 2) + " °C; from a " + _dec(a, 2) + " °C ambient the junction sits at " + _dec(tj, 2) + " °C.";
}
function heatsinkTruth(tj, ta, p, rjc, rch) {
  var j = _temp(tj), a = _temp(ta), pp = _pow(p);
  var c1 = _res(rjc), c2 = _res(rch), c = c1 + c2;
  var rise = j - a;
  if (rise <= 0) throw new Error(_HEAD);
  if (pp * c >= rise * 100) throw new Error(_BUDGET);
  var rsmax = _hu(rise * 100, pp), rha = rsmax - c;
  return "To hold a " + _dec(j, 2) + " °C junction over a " + _dec(a, 2) + " °C ambient at " + _dec(pp, 2) + " W, the total budget is " + _dec(rsmax, 2) + " °C/W; after " + _dec(c1, 2) + " junction-to-case and " + _dec(c2, 2) + " case-to-heatsink, the heatsink must be at most " + _dec(rha, 2) + " °C/W.";
}
function headroomTruth(tj, ta, rjc, rch, rha) {
  var j = _temp(tj), a = _temp(ta);
  var rs = _res(rjc) + _res(rch) + _res(rha);
  var rise = j - a;
  if (rise <= 0) throw new Error(_HEAD);
  var pmax = _hu(rise * 100, rs);
  return "With " + _dec(rs, 2) + " °C/W total junction-to-air and " + _dec(rise, 2) + " °C of rise to spend, the part can dissipate at most " + _dec(pmax, 2) + " W.";
}
