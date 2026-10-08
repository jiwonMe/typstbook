#!/usr/bin/env python3
"""Audit the Korean page-1 calibration fixture without exporting reference prose.
Usage: python3 SCRIPT SOURCE.pdf CANDIDATE.pdf OUTDIR [--dpi 300]
Requires pdfplumber, pypdfium2, Pillow and numpy. Coordinates: top-left pt.
Raster comparisons use aligned, fixed-position coupons: identical labels / rules
only. Different prose is compared by layout metadata, never by page-wide IoU.
"""
import argparse, ast, hashlib, json, statistics
from collections import Counter, defaultdict
from pathlib import Path
import numpy as np
import pdfplumber
import pypdfium2 as pdfium
from PIL import Image, ImageDraw

P = argparse.ArgumentParser(description=__doc__)
P.add_argument('source', type=Path); P.add_argument('candidate', type=Path)
P.add_argument('out', type=Path); P.add_argument('--dpi', type=int, default=300)
args = P.parse_args(); args.out.mkdir(parents=True, exist_ok=True)
S = args.dpi / 72
rnd = lambda n: round(float(n), 6)

def font_name(s):
    if s.startswith("b'"):
        try: s = ast.literal_eval(s).decode('cp949')
        except (ValueError, UnicodeError): pass
    return s.split('+', 1)[-1]

def chars(p, roi):
    l,t,r,b = roi
    return [c for c in p.chars if l <= c['x0'] < r and t <= c['top'] < b and c['text'].strip()]

def rows(p, roi):
    d = defaultdict(list)
    for c in chars(p,roi): d[round(p.height-c['matrix'][5], 2)].append(c)
    return [dict(baseline_pt=rnd(statistics.median(p.height-c['matrix'][5] for c in cs)),
                 first_x_pt=rnd(min(c['x0'] for c in cs))) for _,cs in sorted(d.items())]

def fonts(p, roi):
    d=Counter((font_name(c['fontname']), rnd(c['size']), rnd(c['matrix'][0]/c['matrix'][3]*100)) for c in chars(p,roi))
    return [dict(family=f,size_pt=s,horizontal_percent=h,count=n) for (f,s,h),n in d.items()]

def bounds(o): return [rnd(o[k]) for k in ('x0','top','x1','bottom')]

def geometry(p):
    ll=p.lines; rr=p.rects
    # Report equivalent centerline extents for segmented paths or filled strips,
    # rather than requiring equal PDF object counts.
    v=[]
    for x in (87.9,405.36):
        a=[o for o in ll if abs(o['x0']-x)<.01 and abs(o['x1']-x)<.01 and 250<o['top']<838]
        if a: v.append([rnd(statistics.median(o['x0'] for o in a)),rnd(min(o['top'] for o in a)),rnd(max(o['bottom'] for o in a)),rnd(a[0]['linewidth'])])
        else:
            o=next(o for o in rr if abs((o['x0']+o['x1'])/2-x)<.01 and o['bottom']-o['top']>500)
            v.append([rnd((o['x0']+o['x1'])/2),rnd(o['top']),rnd(o['bottom']),rnd(o['x1']-o['x0'])])
    caps=[]
    for y in (255.001,835.741):
        o=min((o for o in ll if o['x0']<90 and o['x1']>405 and abs(o['top']-o['bottom'])<.01),key=lambda o:abs(o['top']-y))
        caps.append(bounds(o)+[rnd(o['linewidth'])])
    def rect_or_sides(l,r,t):
        found=[o for o in rr if abs(o['x0']-l)<.01 and abs(o['x1']-r)<.01 and abs(o['top']-t)<.01 and o['stroke']]
        if found: return dict(centerline_bbox_pt=bounds(found[0]),side_stroke_pt=rnd(found[0]['linewidth']),top_stroke_pt=rnd(found[0]['linewidth']))
        sides=[o for o in ll if abs(o['x0']-l)<.01 and abs(o['x1']-l)<.01 and abs(o['top']-t)<.01]
        horizontals=[o for o in ll if abs(o['top']-t)<.01 and abs(o['bottom']-t)<.01 and l-.3<o['x0']<l+.3 and o['x1']>r-.3]
        if not sides:
            strips=[o for o in rr if abs((o['x0']+o['x1'])/2-l)<.01 and abs(o['top']-t)<.01 and o['bottom']-o['top']>50]
            bottom=max(o['bottom'] for o in strips);stroke=strips[0]['x1']-strips[0]['x0']
        else:
            bottom=max(o['bottom'] for o in sides);stroke=sides[0]['linewidth']
        return dict(centerline_bbox_pt=[rnd(l),rnd(t),rnd(r),rnd(bottom)],side_stroke_pt=rnd(stroke),top_stroke_pt=rnd(horizontals[0]['linewidth']) if horizontals else rnd(stroke))
    hr=next(o for o in ll if abs(o['top']-218.341)<.01 and o['x0']<100)
    cr=next(o for o in ll if abs(o['x0']-420.96)<.01)
    period=next(o for o in p.curves if 80<o['x0']<100 and 150<o['top']<170)
    view=rect_or_sides(447.84,753.96,553.261)
    quote=rect_or_sides(458.34,747.48,566.101)
    return dict(paper_pt=[p.width,p.height],header_rule_pt=bounds(hr)+[rnd(hr['linewidth'])],
                column_rule_visible_pt=[rnd(cr['x0']),218.341,rnd(cr['bottom']),rnd(cr['linewidth'])],
                period_capsule_pt=bounds(period)+[rnd(period['linewidth'])],passage_side_centerlines_pt=v,
                passage_caps_pt=caps,view=view,quotation=quote)

ROIS={
    'exam_title':(190,110,655,145),'area_heading':(330,150,515,201),
    'corner_page':(725,105,759,147),'period_capsule_with_letters':(86,156,181,192),
    'period_capsule_outline':(86,156,181,192),
    'period_letters':(95,159,174,189),'instruction_range':(87,226,121,244),
    'instruction_directive':(123,226,285,244),'view_label':(576,544,626,563),
    'header_rule':(86,217,756,220),'column_rule':(420,220,422,1069),
    'passage_left':(87.1,253.8,88.7,837),'passage_right':(404.6,253.8,406.2,837),
    'passage_top':(86.8,254,406.4,256),'passage_bottom':(86.8,834.8,406.4,836.7),
    'view_left':(447.1,552.4,448.6,869.8),'view_right':(753.2,552.4,754.8,869.8),
    'view_top_left':(447,552.4,578.3,554),'view_top_right':(623.6,552.4,755,554),
    'view_bottom':(447,868.1,755,869.8),
    'quotation_left':(457.6,565.3,459.1,668.9),'quotation_right':(746.7,565.3,748.3,668.9),
    'quotation_top':(457.5,565.3,748.3,566.9),'quotation_bottom':(457.5,667.3,748.3,668.9),
    'footer_box':(394.5,1081,447.5,1105.5),
}
META_ROIS={
    'passage':(95,261,400,830),'instruction':(85,225,300,243),
    'q1_choices':(95,879,407,1065),'q2_choices':(445,254,755,435),
    'q3_choices':(445,882,757,1065),'quotation':(465,574,742,663),
    'dialogue':(455,681,748,864),'view_label':(575,545,630,562),
    'title':(180,113,670,141),'period':(95,163,175,189),
}

def metadata(path):
    with pdfplumber.open(path) as d:
        p=d.pages[0]
        instr=[dict(character=c['text'],x_pt=rnd(c['x0']),baseline_pt=rnd(p.height-c['matrix'][5])) for c in chars(p,(87,225,121,243))]
        markers={}
        for name,roi in META_ROIS.items():
            if name.endswith('_choices'):
                markers[name[:2]]=[dict(mark=c['text'],x_pt=rnd(c['x0']),baseline_pt=rnd(p.height-c['matrix'][5])) for c in chars(p,roi) if c['text'] in '①②③④⑤']
        return dict(sha256=hashlib.sha256(path.read_bytes()).hexdigest(),path=str(path),
                    geometry=geometry(p),passage_rows=rows(p,META_ROIS['passage']),
                    instruction_range=instr,choice_markers=markers,
                    fonts={n:fonts(p,roi) for n,roi in META_ROIS.items()},
                    text_role_rows={n:rows(p,META_ROIS[n]) for n in ('title','period','view_label','quotation','dialogue')})

def render(path, name):
    doc=pdfium.PdfDocument(str(path));page=doc[0]
    im=page.render(scale=S).to_pil().convert('RGB')
    if name == 'candidate': im.save(args.out/f'{name}-p01.png')
    # Isolate period glyphs from the capsule without altering either input PDF.
    for o in page.get_objects():
        l,b,r,t=o.get_bounds()
        if o.type==pdfium.raw.FPDF_PAGEOBJ_PATH and 80<l<100 and 990<b<1010 and 160<r<190:
            pdfium.raw.FPDFPageObj_SetIsActive(o.raw,False)
    isolated=page.render(scale=S).to_pil().convert('RGB')
    for o in page.get_objects():
        if o.type==pdfium.raw.FPDF_PAGEOBJ_TEXT: pdfium.raw.FPDFPageObj_SetIsActive(o.raw,False)
        l,b,r,t=o.get_bounds()
        if o.type==pdfium.raw.FPDF_PAGEOBJ_PATH and 80<l<100 and 990<b<1010 and 160<r<190:
            pdfium.raw.FPDFPageObj_SetIsActive(o.raw,True)
    outline=page.render(scale=S).to_pil().convert('RGB')
    return np.asarray(im),np.asarray(isolated),np.asarray(outline)

def inkbox(mask, origin):
    y,x=np.where(mask)
    return [int(x.min()+origin[0]),int(y.min()+origin[1]),int(x.max()+origin[0]+1),int(y.max()+origin[1]+1)] if len(x) else None

def coupon(a,b,roi,name,canvas):
    l,t,r,bt=[round(v*S) for v in roi]
    aa=np.min(a[t:bt,l:r],axis=2)<128;bb=np.min(b[t:bt,l:r],axis=2)<128
    union=aa|bb;common=aa&bb;xor=aa^bb
    ba=inkbox(aa,(l,t));bc=inkbox(bb,(l,t))
    im=np.full((bt-t,r-l,3),255,dtype=np.uint8)
    im[aa & ~bb]=(0,170,225);im[bb & ~aa]=(225,0,170);im[common]=(35,35,35)
    if name in ('exam_title','area_heading','period_letters','period_capsule_with_letters','period_capsule_outline','instruction_range','instruction_directive','view_label','quotation_top','passage_top'):
        Image.fromarray(im).save(args.out/f'{name}-overlay.png')
    if name!='period_capsule_outline':
        canvas[t:bt,l:r][union]=im[union]
    # Translation-only comparison helps distinguish glyph shape from placement.
    norm_iou=None
    if ba and bc:
        sa=aa[ba[1]-t:ba[3]-t,ba[0]-l:ba[2]-l];sb=bb[bc[1]-t:bc[3]-t,bc[0]-l:bc[2]-l]
        ns=np.zeros((max(sa.shape[0],sb.shape[0]),max(sa.shape[1],sb.shape[1])),dtype=bool);nc=ns.copy()
        ns[:sa.shape[0],:sa.shape[1]]=sa;nc[:sb.shape[0],:sb.shape[1]]=sb
        norm_iou=rnd((ns&nc).sum()/(ns|nc).sum())
    return dict(roi_pt=list(roi),source_bbox_px=ba,candidate_bbox_px=bc,
                bbox_delta_px=[y-x for x,y in zip(ba,bc)] if ba and bc else None,
                source_ink_pixels=int(aa.sum()),candidate_ink_pixels=int(bb.sum()),
                xor_pixels=int(xor.sum()),union_pixels=int(union.sum()),top_left_normalized_iou=norm_iou,
                iou=rnd(common.sum()/union.sum()) if union.any() else 1,
                xor_fraction_of_union=rnd(xor.sum()/union.sum()) if union.any() else 0)

source=metadata(args.source);candidate=metadata(args.candidate)
a,ai,ao=render(args.source,'source');b,bi,bo=render(args.candidate,'candidate')
if a.shape!=b.shape: raise RuntimeError('Page sizes differ; no resampling comparison is permitted.')
for q,markers in source['choice_markers'].items():
    for i,m in enumerate(markers,1):
        x,y=m['x_pt'],m['baseline_pt'];ROIS[f'{q}_choice_{i}']=(x-1,y-10.3,x+11.8,y+2.8)
for i,(x,y) in enumerate(((87.9,863.8809),(436.56,239.4009),(436.56,493.7409)),1):
    ROIS[f'q{i}_number']=(x-1,y-12,x+12,y+4)
canvas=np.full_like(a,255)
raster={name:coupon(ai if name=='period_letters' else ao if name=='period_capsule_outline' else a,
                    bi if name=='period_letters' else bo if name=='period_capsule_outline' else b,roi,name,canvas) for name,roi in ROIS.items()}
Image.fromarray(canvas).save(args.out/'aligned-labels-and-boundaries-overlay.png')
delta=[rnd(y['baseline_pt']-x['baseline_pt']) for x,y in zip(source['passage_rows'],candidate['passage_rows'])]
xdelta=[rnd(y['first_x_pt']-x['first_x_pt']) for x,y in zip(source['passage_rows'],candidate['passage_rows'])]
choice_delta={q:[rnd(y['baseline_pt']-x['baseline_pt']) for x,y in zip(source['choice_markers'][q],candidate['choice_markers'][q])] for q in source['choice_markers']}
report=dict(page=1,dpi=args.dpi,one_pixel_pt=72/args.dpi,renderer='PDFium (same settings for both PDFs)',threshold=128,
            source=source,candidate=candidate,
            passage=dict(source_rows=len(source['passage_rows']),candidate_rows=len(candidate['passage_rows']),baseline_delta_pt=delta,
                         mean_absolute_baseline_delta_pt=rnd(statistics.mean(abs(x) for x in delta)),
                         maximum_absolute_baseline_delta_pt=rnd(max(abs(x) for x in delta)),
                         maximum_absolute_baseline_delta_px=rnd(max(abs(x) for x in delta)*S),first_x_delta_pt=xdelta),
            choices=dict(baseline_delta_pt=choice_delta,maximum_absolute_baseline_delta_pt=rnd(max(abs(x) for ds in choice_delta.values() for x in ds))),
            raster=raster,
            limits=['No whole-page pixel identity is asserted: Minecraft prose differs from the reference.',
                    'The source area heading is a bitmap; the candidate area heading is native text.',
                    'Original copyright footer prose is excluded: the candidate is marked as an unofficial creative work.',
                    'IoU is binary ink overlap at fixed page coordinates, not perceptual similarity; stroke/font outlines affect it.',
                    'Metadata bounding boxes / baselines and raster ink boxes use different font metric conventions.',
                    'Native glyph outlines differ: exact baseline/advance positions do not establish identical ink pixels.',
                    'The fixed-height fixture uses stroked passage sides; ordinary split frames retain native filled side strips.',
                    'Only the coordinate fixture repeats the source view-left overprint; ordinary views use one stroke.',
                    'Instruction and view-heading glyphs have a -0.48pt optical offset; their ink alignment is distinct from baseline equality.',
                    'Reference source prose is not exported; reports retain numeric metadata and common labels only.'])
(args.out/'metrics.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
md=['# 국어 1쪽 최종 픽셀 검증','',f'- 원본: `{args.source}`',f'- 후보: `{args.candidate}`',f'- 후보 SHA256: `{candidate["sha256"]}`',f'- {args.dpi}dpi 동일 PDFium 렌더, 흑백 임계값128, 1px={72/args.dpi:g}pt.','',f'지문 {len(delta)}행 기준선 절대오차: 평균 {report["passage"]["mean_absolute_baseline_delta_pt"]}pt, 최대 {report["passage"]["maximum_absolute_baseline_delta_pt"]}pt ({report["passage"]["maximum_absolute_baseline_delta_px"]}px). 모든 행 시작 x 오차는 {max(abs(x) for x in xdelta)}pt.','', '| 지시문 글자 | 원본 x(pt) | 후보 x(pt) | x 차이(pt) | 기준선 차이(pt) |','|---|---:|---:|---:|---:|']
for x,y in zip(source['instruction_range'],candidate['instruction_range']):md.append(f'| {x["character"]} | {x["x_pt"]} | {y["x_pt"]} | {rnd(y["x_pt"]-x["x_pt"])} | {rnd(y["baseline_pt"]-x["baseline_pt"])} |')
md+=['','| 선지 번호 기준선 | ① | ② | ③ | ④ | ⑤ |','|---|---:|---:|---:|---:|---:|']
for q,ds in choice_delta.items():md.append(f'| {q} 오차(pt) | '+' | '.join(map(str,ds))+' |')
md+=['','| 동일 라벨 / 경계 coupon | 고정좌표 IoU | bbox 좌상단 정렬 IoU | XOR 픽셀 | bbox 차이 L/T/R/B(px) |','|---|---:|---:|---:|---|' ]
for n,m in raster.items():md.append(f'| {n} | {m["iou"]} | {m["top_left_normalized_iou"]} | {m["xor_pixels"]} | {m["bbox_delta_px"]} |')
md+=['','| 경계 메타데이터 | 원본(pt) | 후보(pt) |','|---|---|---|']
for n,g in source['geometry'].items(): md.append(f'| {n} | `{g}` | `{candidate["geometry"][n]}` |')
md+=['','원본 인용 상자 윗선 두께는 '+str(source['geometry']['quotation']['top_stroke_pt'])+'pt, 후보는 '+str(candidate['geometry']['quotation']['top_stroke_pt'])+'pt이다. 상세 경계 좌표와 역할별 폰트는 `metrics.json`에 있다.','', '청록=원본만, 자홍=후보만, 짙은 회색=겹치는 잉크. `aligned-labels-and-boundaries-overlay.png`에는 비교 coupon만 남겨 창작 본문의 픽셀 차이가 경계 검증을 덮지 않게 했다.','',*['- '+s for s in report['limits']]]
(args.out/'report.md').write_text('\n'.join(md)+'\n')
print(json.dumps(dict(out=str(args.out),candidate_sha256=candidate['sha256'],passage=report['passage'],choices=report['choices'],iou={n:m['iou'] for n,m in raster.items()}),ensure_ascii=False,indent=2))
