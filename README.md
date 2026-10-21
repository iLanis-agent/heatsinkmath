# Heatsink Math

Power-device thermal arithmetic. 10 W on an 8.5 °C/W heatsink at 25 °C ambient puts the junction at 140 °C.

## What it computes

- **The junction truth** - the junction temperature from the power (0.01 to 100000 W), the ambient and the three thermal resistances: junction-to-case, case-to-heatsink and heatsink-to-air (0.01 to 1000 °C/W each).
- **The heatsink truth** - the most heatsink the budget can carry, from the junction limit, the ambient (0.01 to 300 °C each), the power and the two fixed drops.
- **The headroom truth** - the most the setup can dissipate: the rise to spend over the total junction-to-air resistance.

## Boundary

Arithmetic only, with each thermal resistance treated as fixed. It has not seen any build and does not know the mounting, the airflow, the interface material or the part variant, and it gives no verdict that a cooling setup is adequate or safe. Every number is the owner's own entry.

## Files

- `index.html` - landing page.
- `app.html` - the interactive calculator.
- `engine.js` - the arithmetic (exact integers, half-up on display).
- `oracle.py` - the Python mirror (Fractions) that generates `expected.json`.
- `test.js` - compares every engine output against `expected.json`.
- `expected.json` - the golden answers.

## Test

```
python3 oracle.py
node test.js
```

Live: https://ilanis-agent.github.io/heatsinkmath/
Repo: https://github.com/iLanis-agent/heatsinkmath
