import sys, numpy as np
from PIL import Image
from scipy import ndimage as nd
D='art/v9-lotes6b-9/'
SHEETS={
 'lote6b':['trabalho_lanchonete','trabalho_entregas','trabalho_seguranca','icone_casa','icone_treinar','icone_arena','icone_mestres','icone_lutador','icone_trabalho','icone_loja'],
 'lote7':['lona_f_menu','lona_f_personalizacao','lona_f_perfil','lona_f_vs','lona_f_guarda','lona_f_soco','lona_f_chute_alto','lona_f_golpe','lona_f_defesa','lona_f_nocaute'],
 'lote8':['lona_f_vitoria','lona_f_derrota','lona_f_nivel','lona_f_energia','lona_f_fome','lona_f_joinha','lona_f_loja','lona_f_mestres','lona_f_treino_saco','lona_f_treino_corda'],
 'lote9':['lona_f_treino_abdominal','lona_f_treino_manopla','lona_f_treino_esteira','lona_f_dormindo','lona_f_comendo','lona_f_descansando','lona_f_protetor','lona_f_trabalho_lanchonete','lona_f_trabalho_entregas','lona_f_trabalho_seguranca'],
}
T=float(sys.argv[2]) if len(sys.argv)>2 else 9
HALO=float(sys.argv[3]) if len(sys.argv)>3 else 22
def process(sheet):
    im=np.asarray(Image.open(D+f'folha_{sheet}.png').convert('RGB')).astype(np.int16)
    H,W,_=im.shape
    if sheet=='lote7':
        mn=im.min(2); mx=im.max(2)
        passable=(mn>=200)&((mx-mn)<=14)
    else:
        g=np.zeros((H,W),np.int16)
        for dy,dx in ((0,1),(1,0),(0,-1),(-1,0)):
            sh=np.roll(im,(dy,dx),(0,1))
            g=np.maximum(g,np.abs(im-sh).max(2))
        passable=g<T
    lab,n=nd.label(passable)
    border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    bg=np.isin(lab,list(border))
    # grow into halo: pixels next to bg with color close to neighbouring bg
    for _ in range(3):
        ring=nd.binary_dilation(bg)&~bg
        cnt=nd.convolve(bg.astype(np.float32),np.ones((3,3)),mode='constant')
        mean=np.stack([nd.convolve((im[...,c]*bg).astype(np.float32),np.ones((3,3)),mode='constant')/np.maximum(cnt,1) for c in range(3)],2)
        close=np.abs(im-mean).max(2)<(30 if sheet=='lote7' else HALO)
        bg|=ring&close
    fg=~bg
    fg=nd.binary_opening(fg,iterations=1)|(fg&~nd.binary_erosion(fg))  # keep thin lines
    lab,n=nd.label(fg,structure=np.ones((3,3)))
    sizes=nd.sum(fg,lab,range(1,n+1))
    cms=nd.center_of_mass(fg,lab,range(1,n+1))
    names=SHEETS[sheet]; groups={k:[] for k in range(10)}
    for i,(s,(cy,cx)) in enumerate(zip(sizes,cms)):
        if s<60: continue
        groups[int(cy//(H/2))*5+int(min(cx,W-1)//(W/5))].append(i+1)
    rgba=np.dstack([im.astype(np.uint8),np.zeros((H,W),np.uint8)])
    prev=Image.new('RGBA',(10*170,520),(58,23,160,255))
    for k,name in enumerate(names):
        m=np.isin(lab,groups[k])
        ys,xs=np.where(m)
        y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
        out=rgba[y0:y1,x0:x1].copy(); out[...,3]=m[y0:y1,x0:x1]*255
        if name=='lona_f_perfil':  # busto cortado reto embaixo: a camiseta encosta no fundo sem contorno
            h=out.shape[0]
            for r in range(int(h*0.55),h):
                xs_=np.where(out[r,:,3]>0)[0]
                if len(xs_): out[r,xs_.min():xs_.max()+1,3]=255
        o=Image.fromarray(out,'RGBA'); o.save(D+name+'.png',optimize=True)
        t=o.copy(); t.thumbnail((240,240) if not name.startswith('icone') else (96,96),Image.LANCZOS)
        t.save('src/assets/img/'+name+'.png',optimize=True)
        th=o.copy(); th.thumbnail((165,250))
        prev.alpha_composite(th,(k*170+2,5))
        bgw=Image.new('RGBA',th.size,(255,235,240,255)); bgw.alpha_composite(th); prev.paste(bgw,(k*170+2,262))
        print(sheet,name,o.size,len(groups[k]),flush=True)
    prev.save(f'/tmp/claude-0/-home-user-Punch/f78c175a-7c52-5cef-bbb9-d16e4610c887/scratchpad/prev_{sheet}.png')
process(sys.argv[1])
