"""Original Meridian continuity sculpture. Offline mesh projection; no runtime dependency."""
import math
from pathlib import Path
from PIL import Image, ImageDraw

S = 1800
TAU = math.pi * 2
def spow(v, p): return math.copysign(abs(v) ** p, v)
def add(a,b): return tuple(x+y for x,y in zip(a,b))
def mul(a,k): return tuple(x*k for x in a)
def norm(a): return mul(a,1/math.sqrt(sum(x*x for x in a)))
def dot(a,b): return sum(x*y for x,y in zip(a,b))
def rotate(p, ax=0, ay=0, az=0):
    x,y,z=p
    y,z=y*math.cos(ax)-z*math.sin(ax),y*math.sin(ax)+z*math.cos(ax)
    x,z=x*math.cos(ay)+z*math.sin(ay),-x*math.sin(ay)+z*math.cos(ay)
    return x*math.cos(az)-y*math.sin(az),x*math.sin(az)+y*math.cos(az),z
def center(t): return (.86*spow(math.cos(t),.6),1.17*spow(math.sin(t),.6),0)
def cross(t,u):
    c=center(t); ca=center(t-.0001); cb=center(t+.0001)
    tangent=norm(tuple(b-a for a,b in zip(ca,cb)))
    outward=(tangent[1],-tangent[0],0)
    return add(c,add(mul(outward,.215*spow(math.cos(u),.68)),(0,0,.16*spow(math.sin(u),.68))))
def transform(p,ring):
    p=rotate(p,ay=math.radians(-35 if ring==0 else 53))
    p=add(p,(-.57 if ring==0 else .57,.06 if ring==0 else -.06,0))
    return rotate(p,ax=math.radians(20),az=math.radians(-31))
def point(t,u,ring): return transform(cross(t,u),ring)
def project(p):
    x,y,z=p; scale=425*(6/(6-z))
    return (S/2+x*scale,S/2-y*scale)
def shade(p,n,ring):
    # Broad soft boxes produce silver faces, sharp edge lights and deep blue reflections.
    view=norm((-p[0]*.055,-p[1]*.055,1))
    reflection=add(mul(n,2*dot(n,view)),mul(view,-1))
    lights=[(norm((-1,1.5,2.8)),1),(norm((1.6,.3,1)),.50),(norm((-.3,-1.2,2)),.14)]
    diffuse=sum(max(0,dot(n,l))*power for l,power in lights)
    top=math.exp(-((reflection[1]-.63)/.19)**2)*.6
    stripe=math.exp(-((reflection[0]+.46)/.10)**2)*1.0
    rim=math.exp(-((reflection[0]-.69)/.18)**2)*.49
    val=.08+.19*diffuse+top+stripe+rim
    fresnel=(1-abs(dot(n,view)))**3*.27
    silver=min(1,val+fresnel)
    blue=max(0,reflection[0])*.16
    return tuple(int(max(0,min(255,v))) for v in (silver*212,silver*226+blue*25,silver*244+blue*70))

faces=[]; NT=640; NU=160
for ring in range(2):
    for i in range(NT):
        t=i*TAU/NT
        for j in range(NU):
            u=j*TAU/NU
            pts=[point(t,u,ring),point(t+TAU/NT,u,ring),point(t+TAU/NT,u+TAU/NU,ring),point(t,u+TAU/NU,ring)]
            mid=point(t+TAU/NT/2,u+TAU/NU/2,ring)
            dt=tuple(b-a for a,b in zip(point(t-.0001,u,ring),point(t+.0001,u,ring)))
            du=tuple(b-a for a,b in zip(point(t,u-.0001,ring),point(t,u+.0001,ring)))
            n=norm((dt[1]*du[2]-dt[2]*du[1],dt[2]*du[0]-dt[0]*du[2],dt[0]*du[1]-dt[1]*du[0]))
            faces.append((sum(p[2] for p in pts)/4,[project(p) for p in pts],shade(mid,n,ring)))
canvas=Image.new('RGBA',(S,S),(0,0,0,0)); draw=ImageDraw.Draw(canvas)
for depth,poly,color in sorted(faces,key=lambda f:f[0]): draw.polygon(poly,fill=(*color,255))
canvas.resize((1100,1100),Image.Resampling.LANCZOS).save(Path(__file__).parent/'continuity.webp',quality=94,method=6)
