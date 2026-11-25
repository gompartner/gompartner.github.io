# 치과 2027 종이 무대(11-25) 층 만들기. 쓰는 법: 사진과 깊이 지도(Depth Anything V2)가 있는 폴더에서 python3 stage-cut.py <출력 폴더>
# 종이 무대 층 만들기: 사진을 깊이로 3겹(뒤, 가운데, 앞)으로 오리고, 앞 두 겹은 흰 종이 테두리와 그림자를 입힌다.
import sys
from PIL import Image, ImageFilter, ImageChops
import numpy as np
P='photos2'; OUT=sys.argv[1]
SPEC=[('rec','u_ECBg5FQkBXI.jpg','rec-d.png',(0.5,0.55),(0.5,0.5)),
      ('wait','u_pxOQ-clean.jpg','wait-d.png',(0.5,0.78),(0.45,0.5)),
      ('room','p_9062525.jpg','room-d.png',(0.5,0.5),(0.62,0.5)),
      ('mirror','u_rubu_NvklJE.jpg','mirror-d.png',(0.5,0.47),(0.55,0.5))]
def crop(im,aspect,cx,cy):
    W,H=im.size
    if W/H>aspect: w=int(H*aspect);h=H
    else: w=W;h=int(W/aspect)
    x=int(min(max(cx*W-w/2,0),W-w)); y=int(min(max(cy*H-h/2,0),H-h))
    return im.crop((x,y,x+w,y+h))
PAPER=(236,233,228)
def layer(rgb,mask,edge,shadow):
    a=mask.filter(ImageFilter.GaussianBlur(1.2))
    rim=a.filter(ImageFilter.MaxFilter(edge|1)).filter(ImageFilter.GaussianBlur(0.8))
    base=Image.new('RGBA',rgb.size,(0,0,0,0))
    if shadow:
        sh=rim.filter(ImageFilter.GaussianBlur(shadow)).point(lambda v:int(v*0.35))
        sh2=Image.new('L',rgb.size,0); sh2.paste(sh,(0,shadow//2)); s=Image.new('RGBA',rgb.size,(20,20,20,0)); s.putalpha(sh2)
        base=Image.alpha_composite(base,s)
    white=Image.new('RGBA',rgb.size,(255,255,255,0)); white.putalpha(rim)
    base=Image.alpha_composite(base,white)
    fg=rgb.convert('RGBA'); fg.putalpha(a)
    return Image.alpha_composite(base,fg)
for name,src,dep,pcc,mc in SPEC:
    im0=Image.open(f'{P}/{src}').convert('RGB'); d0=Image.open(f'{P}/{dep}').convert('L').resize(im0.size)
    for tag,aspect,c,size in [('',1.5,pcc,(1600,1067)),('-m',0.6,mc,(720,1200))]:
        im=crop(im0,aspect,*c).resize(size,Image.LANCZOS); d=crop(d0,aspect,*c).resize(size,Image.LANCZOS)
        a=np.asarray(d).astype(float)
        # 바닥과 벽(줄마다 고르게 깊어지는 면)은 빼고, 그 줄의 기준보다 튀어나온 물건만 오린다
        base=np.percentile(a,35,axis=1,keepdims=True)
        res=a-base
        lift=np.percentile(res,90)
        r1=max(10,lift*0.35); r2=max(18,lift*0.7)
        m1=Image.fromarray(((res>r1)*255).astype('uint8')).filter(ImageFilter.MedianFilter(9))
        m2=Image.fromarray((((res>r2)&(a>np.percentile(a,60)))*255).astype('uint8')).filter(ImageFilter.MedianFilter(9))
        t1,t2=r1,r2
        if name=='wait':
            # 대기실은 옆벽이 비스듬해 줄 기준이 맞지 않는다. 가까운 깊이 중 화면 아래쪽(의자)만
            yy=np.arange(a.shape[0])[:,None]/a.shape[0]
            low=yy>0.5
            m1=Image.fromarray((((a>np.percentile(a,70))&low)*255).astype('uint8')).filter(ImageFilter.MedianFilter(9))
            m2=Image.fromarray((((a>np.percentile(a,84))&low)*255).astype('uint8')).filter(ImageFilter.MedianFilter(9))
        e=max(5,size[0]//220)
        # 뒤 겹: 앞 물건 자리를 종이색으로 채운다(겹이 벌어지면 종이 무대 뒷벽처럼 보이게)
        hole=m1.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(6))
        paper=Image.new('RGB',size,PAPER)
        back=Image.composite(paper,im,hole)
        back.save(f'{OUT}/{name}-s0{tag}.jpg',quality=80,optimize=True,progressive=True)
        layer(im,m1,e,e*3).save(f'{OUT}/{name}-s1{tag}.webp',quality=82,method=5)
        layer(im,m2,e,e*3).save(f'{OUT}/{name}-s2{tag}.webp',quality=82,method=5)
        print(name,tag,int(t1),int(t2))
