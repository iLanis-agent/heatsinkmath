import json, random
from fractions import Fraction

def hu(num, den):
    return Fraction((2*num + den) - ((2*num + den) % (2*den)), 2*den)

def dec(v, places=2):
    if v < 0: return "-" + dec(-v, places)
    base = 10**places
    n = v.numerator // v.denominator
    s = str(n // base); f = str(n % base).zfill(places).rstrip("0")
    return s + "." + f if f else s

def s100(n):
    w, f = divmod(n, 100)
    return f"{w}.{f:02d}".rstrip("0").rstrip(".")

def junction(pp, a, r1, r2, r3):
    rs = r1 + r2 + r3
    rise = hu(pp*rs, 100); tj = a + rise
    return (f"{dec(Fraction(pp))} W through {dec(Fraction(rs))} °C/W junction-to-air rises {dec(rise)} °C; "
            f"from a {dec(Fraction(a))} °C ambient the junction sits at {dec(tj)} °C.")
def heatsink(j, a, pp, c1, c2):
    c = c1 + c2; rise = j - a; assert rise > 0
    assert pp*c < rise*100
    rsmax = hu(rise*100, pp); rha = rsmax - c
    return (f"To hold a {dec(Fraction(j))} °C junction over a {dec(Fraction(a))} °C ambient at {dec(Fraction(pp))} W, "
            f"the total budget is {dec(rsmax)} °C/W; after {dec(Fraction(c1))} junction-to-case and {dec(Fraction(c2))} case-to-heatsink, "
            f"the heatsink must be at most {dec(rha)} °C/W.")
def headroom(j, a, r1, r2, r3):
    rs = r1 + r2 + r3; rise = j - a; assert rise > 0
    pmax = hu(rise*100, rs)
    return (f"With {dec(Fraction(rs))} °C/W total junction-to-air and {dec(Fraction(rise))} °C of rise to spend, "
            f"the part can dissipate at most {dec(pmax)} W.")

random.seed(733)
cases = [
  dict(fn="junction", args=["10","25","2.5","0.5","8.5"], expect=junction(1000,2500,250,50,850)),
  dict(fn="heatsink", args=["150","25","10","2.5","0.5"], expect=heatsink(15000,2500,1000,250,50)),
  dict(fn="headroom", args=["150","25","2.5","0.5","8.5"], expect=headroom(15000,2500,250,50,850)),
]
for _ in range(30):
    pp = random.randint(1,10000000); a = random.randint(1,30000)
    r = [random.randint(1,100000) for _ in range(3)]
    cases.append(dict(fn="junction", args=[s100(pp),s100(a)]+[s100(x) for x in r], expect=junction(pp,a,*r)))
for _ in range(30):
    while True:
        pp = random.randint(1,3000); c1 = random.randint(1,800); c2 = random.randint(1,800)
        minrise = pp*(c1+c2)//100 + 1
        if minrise > 25000: continue
        rise = random.randint(minrise, 25000)
        a = random.randint(1, 30000 - rise); j = a + rise
        break
    cases.append(dict(fn="heatsink", args=[s100(j),s100(a),s100(pp),s100(c1),s100(c2)], expect=heatsink(j,a,pp,c1,c2)))
for _ in range(30):
    a = random.randint(1,29999); j = random.randint(a+1,30000)
    r = [random.randint(1,100000) for _ in range(3)]
    cases.append(dict(fn="headroom", args=[s100(j),s100(a)]+[s100(x) for x in r], expect=headroom(j,a,*r)))
errcases = [
  ("junction", ["0","25","2.5","0.5","8.5"]), ("junction", ["10","25","0","0.5","8.5"]),
  ("junction", ["10","300.01","2.5","0.5","8.5"]), ("junction", ["10","25","1000.01","0.5","8.5"]),
  ("junction", ["10.005","25","2.5","0.5","8.5"]),
  ("heatsink", ["25","25","10","2.5","0.5"]), ("heatsink", ["24","25","10","2.5","0.5"]),
  ("heatsink", ["50","25","100","2.5","0.5"]), ("heatsink", ["150","25","0","2.5","0.5"]),
  ("heatsink", ["150.001","25","10","2.5","0.5"]),
  ("headroom", ["25","25.5","2.5","0.5","8.5"]), ("headroom", ["150","25","0","0.5","8.5"]),
  ("headroom", ["150","25","2.5","0.5","1000.01"]),
]
json.dump({"cases": cases, "errors": errcases}, open("expected.json","w"), ensure_ascii=False, indent=1)
open("expected.json","a").write("\n")
print("expected.json written:", len(cases), "cases")
