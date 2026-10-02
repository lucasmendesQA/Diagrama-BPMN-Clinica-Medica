// Converte o diagrama BPMN (public/index.html) em XML do draw.io.
// Executa a lógica renderVals() do próprio HTML para obter nós/arestas e emite mxGraph.
import { readFileSync, writeFileSync } from 'node:fs';

const [, , htmlPath, outPath] = process.argv;
const html = readFileSync(htmlPath, 'utf8');
const m = /<script type="text\/x-dc" data-dc-script>([\s\S]*?)<\/script>/.exec(html);
if (!m) throw new Error('script data-dc-script não encontrado');
let code = m[1];

// Expor dados semânticos (nós, arestas, rótulos de aresta com índice)
code = code.replace('edgeLabels.push({ x: e.at[0]', 'edgeLabels.push({ ei: i, x: e.at[0]');
code = code.replace('edgeLabels.push({ x: x + e.lx', 'edgeLabels.push({ ei: i, x: x + e.lx');
code = code.replace('return { lanes, pools, npool,', 'return { nodes, edges, edgeLabels, LANES, nodes, lanes, pools, npool,');
if (!/ei: i/.test(code) || !/return \{ nodes, edges/.test(code)) throw new Error('patch falhou');

const Component = new Function('DCLogic', code + '\nreturn Component;')(class DCLogic {});
const D = new Component().renderVals();

// ---------- helpers ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const txt = s => esc(s.replace(/\n/g, '<br>'));
const r1 = n => Math.round(n * 10) / 10;
const cells = [];
let idn = 10;
const nid = () => 'c' + (idn++);
const cell = (id, value, style, parent, geom, extra = '') => {
  cells.push(`<mxCell id="${id}" value="${value}" style="${style}" vertex="1" parent="${parent}"${extra}><mxGeometry x="${r1(geom.x)}" y="${r1(geom.y)}" width="${r1(geom.w)}" height="${r1(geom.h)}" as="geometry"/></mxCell>`);
};

const FONT = 'fontFamily=Nunito Sans;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DNunito%2BSans;';
const POOL_X = 40, POOL_Y = 170, HDR = 30;

// ---------- Título ----------
cell(nid(), esc('Gestão de Atendimento e Agendamento de uma Clínica Médica'),
  `text;html=1;align=left;verticalAlign=middle;fontSize=24;fontStyle=1;fontColor=#1d2327;${FONT}`, '1', { x: 40, y: 30, w: 900, h: 36 });
cell(nid(), esc('Diagrama BPMN 2.0 · Sistema 3 · fluxo da esquerda para a direita'),
  `text;html=1;align=left;verticalAlign=middle;fontSize=14;fontStyle=1;fontColor=#6a7981;${FONT}`, '1', { x: 40, y: 68, w: 900, h: 24 });

// ---------- Pool principal + lanes ----------
const POOL = 'pool_clinica';
const laneH = 220, poolW = 8160, poolH = 5 * laneH;
cell(POOL, esc('CLÍNICA MÉDICA'),
  `swimlane;html=1;horizontal=0;childLayout=stackLayout;resizeParent=1;resizeParentMax=0;horizontalStack=0;startSize=${HDR};fillColor=#2e393f;fontColor=#fbfcfc;strokeColor=#4d5a61;fontStyle=1;fontSize=15;swimlaneFillColor=#ffffff;${FONT}`,
  '1', { x: POOL_X, y: POOL_Y, w: poolW, h: poolH });
const laneId = {};
D.LANES.forEach((l, i) => {
  const id = 'lane_' + l[0];
  laneId[l[0]] = id;
  cell(id, esc(l[1]),
    `swimlane;html=1;horizontal=0;startSize=${HDR};fillColor=${l[3]};swimlaneFillColor=${l[2]};strokeColor=#4d5a61;fontColor=#2e393f;fontStyle=1;fontSize=13;${FONT}`,
    POOL, { x: HDR, y: i * laneH, w: poolW - HDR, h: laneH });
});

// ---------- Pools externos ----------
const extPool = (id, name, p) => cell(id, esc(name),
  `swimlane;html=1;horizontal=0;startSize=${HDR};fillColor=#b9dce7;swimlaneFillColor=#daebf0;strokeColor=#4d5a61;fontColor=#1a4958;fontStyle=1;fontSize=11.5;${FONT}`,
  '1', { x: p.x, y: p.y, w: p.w, h: p.h });
const extId = {};
D.pools.forEach(p => {
  const key = p.name.startsWith('Laborat') ? 'L' : 'O';
  extId[key] = 'pool_' + key;
  extPool(extId[key], p.name, p);
});
// Serviço de Notificação (pool fechado)
cell('pool_N', esc('Serviço de Notificação'),
  `swimlane;html=1;horizontal=1;startSize=60;fillColor=#daebf0;strokeColor=#4d5a61;fontColor=#1a4958;fontStyle=1;fontSize=14;${FONT}`,
  '1', { x: D.npool.x, y: D.npool.y, w: D.npool.w, h: 60 });

// origem (x,y absolutos) de cada container
const origin = {};
D.LANES.forEach((l, i) => origin[l[0]] = { id: laneId[l[0]], x: POOL_X + HDR, y: POOL_Y + i * laneH });
D.pools.forEach(p => { const k = p.name.startsWith('Laborat') ? 'L' : 'O'; origin[k] = { id: extId[k], x: p.x, y: p.y }; });

// ---------- Nós ----------
const EV = 'shape=mxgraph.bpmn.event;perimeter=ellipsePerimeter;outlineConnect=0;aspect=fixed;html=1;labelBackgroundColor=none;fontSize=10.5;fontStyle=1;fontColor=#2e393f;' + FONT;
const labelPos = n => {
  // mapeia a posição do rótulo do HTML para o draw.io
  const above = n.type === 'xor' || n.lab === 'above';
  if (n.lab === 'right') return 'labelPosition=right;verticalLabelPosition=middle;align=left;verticalAlign=middle;spacingLeft=6;';
  if (n.lab && typeof n.lab === 'object') {
    const below = n.lab.dy != null ? n.lab.dy > 0 : !above;
    const al = n.lab.anchor === 'start' ? 'left' : n.lab.anchor === 'end' ? 'right' : 'center';
    const sp = al === 'left' ? `spacingLeft=${r1(n.hw + n.lab.dx)};` : al === 'right' ? `spacingRight=${r1(n.hw - n.lab.dx)};` : '';
    return `verticalLabelPosition=${below ? 'bottom' : 'top'};verticalAlign=${below ? 'top' : 'bottom'};align=${al};labelPosition=center;${sp}`;
  }
  if (above) return 'verticalLabelPosition=top;verticalAlign=bottom;align=center;';
  return 'verticalLabelPosition=bottom;verticalAlign=top;align=center;';
};
const styleFor = n => {
  switch (n.type) {
    case 'user': return `shape=mxgraph.bpmn.task;taskMarker=user;rounded=1;arcSize=16;whiteSpace=wrap;html=1;spacingTop=7;spacingLeft=4;fillColor=#ffffff;strokeColor=#4d5a61;strokeWidth=1.4;fontSize=11;fontStyle=1;fontColor=#2e393f;${FONT}`;
    case 'service': return `shape=mxgraph.bpmn.task;taskMarker=service;rounded=1;arcSize=16;whiteSpace=wrap;html=1;spacingTop=7;spacingLeft=4;fillColor=#ffffff;strokeColor=#4d5a61;strokeWidth=1.4;fontSize=11;fontStyle=1;fontColor=#2e393f;${FONT}`;
    case 'task': return `shape=mxgraph.bpmn.task;taskMarker=abstract;rounded=1;arcSize=16;whiteSpace=wrap;html=1;spacingTop=7;spacingLeft=4;fillColor=#ffffff;strokeColor=#4d5a61;strokeWidth=1.4;fontSize=11;fontStyle=1;fontColor=#2e393f;${FONT}`;
    case 'xor': return `shape=mxgraph.bpmn.gateway2;gwType=exclusive;html=1;fillColor=#fdf5d4;strokeColor=#927c19;strokeWidth=1.4;fontSize=10.5;fontStyle=1;fontColor=#2e393f;labelBackgroundColor=none;${FONT}` + labelPos(n);
    case 'start': return EV + 'outline=standard;symbol=general;fillColor=#e1faf4;strokeColor=#189c7b;strokeWidth=1.5;' + labelPos(n);
    case 'end': return EV + 'outline=end;symbol=general;fillColor=#facecf;strokeColor=#df1517;strokeWidth=2;' + labelPos(n);
    case 'imsg': return EV + 'outline=catching;symbol=message;fillColor=#e8f4fb;strokeColor=#007ddd;strokeWidth=1.3;' + labelPos(n);
    case 'itimer': return EV + 'outline=catching;symbol=timer;fillColor=#e8f4fb;strokeColor=#007ddd;strokeWidth=1.3;' + labelPos(n);
    case 'inter': return EV + 'outline=catching;symbol=general;fillColor=#e8f4fb;strokeColor=#007ddd;strokeWidth=1.3;' + labelPos(n);
  }
  throw new Error('tipo desconhecido ' + n.type);
};
const box = {};
D.nodes.forEach(n => {
  const o = origin[n.lane];
  const x = n.cx - n.hw, y = n.cy - n.hh, w = 2 * n.hw, h = 2 * n.hh;
  box[n.id] = { x, y, w, h };
  cell(n.id, txt(n.label), styleFor(n), o.id, { x: x - o.x, y: y - o.y, w, h });
});

// ---------- Arestas ----------
const labelsByEdge = {};
D.edgeLabels.forEach(l => (labelsByEdge[l.ei] ||= []).push(l));
const pathLen = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
const pathMid = pts => { const half = pathLen(pts) / 2; let acc = 0; for (let i = 1; i < pts.length; i++) { const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + seg >= half) { const t = seg ? (half - acc) / seg : 0; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]; } acc += seg; } return pts[pts.length - 1]; };
const nodeAt = (p, exclude) => D.nodes.find(n => n.id !== exclude && Math.abs(p[0] - n.cx) <= n.hw + 0.5 && Math.abs(p[1] - n.cy) <= n.hh + 0.5);
const anchor = (n, p, prefix) => {
  const b = box[n.id];
  const fx = Math.min(1, Math.max(0, (p[0] - b.x) / b.w)), fy = Math.min(1, Math.max(0, (p[1] - b.y) / b.h));
  return `${prefix}X=${r1(fx)};${prefix}Y=${r1(fy)};${prefix}Dx=0;${prefix}Dy=0;${prefix}Perimeter=0;`;
};

D.edges.forEach((e, i) => {
  const pts = e.pts;
  const first = pts[0], last = pts[pts.length - 1];
  const src = nodeAt(first);
  let tgt = nodeAt(last, src?.id);
  // mensagens que terminam no pool fechado "Serviço de Notificação"
  if (!tgt && e.msg && last[0] >= D.npool.x && last[0] <= D.npool.x + D.npool.w && Math.abs(last[1] - D.npool.y) < 1) {
    tgt = { id: 'pool_N', cx: D.npool.x + D.npool.w / 2, cy: D.npool.y + 30, hw: D.npool.w / 2, hh: 30 };
    box['pool_N'] = { x: D.npool.x, y: D.npool.y, w: D.npool.w, h: 60 };
  }
  const id = 'e' + i;
  let style = e.msg
    ? `edgeStyle=none;html=1;dashed=1;dashPattern=6 4;strokeColor=#4d5a61;strokeWidth=1.4;startArrow=oval;startFill=0;startSize=5;endArrow=block;endFill=0;endSize=7;rounded=0;${FONT}`
    : `edgeStyle=none;html=1;strokeColor=#2e393f;strokeWidth=1.4;endArrow=block;endFill=1;endSize=7;jumpStyle=arc;jumpSize=10;rounded=0;${FONT}`;
  if (src) style += anchor(src, first, 'exit');
  if (tgt) style += anchor(tgt, last, 'entry');
  const attrs = `${src ? ` source="${src.id}"` : ''}${tgt ? ` target="${tgt.id}"` : ''}`;
  const way = pts.slice(src ? 1 : 0, tgt ? pts.length - 1 : pts.length);
  let geo = '<mxGeometry relative="1" as="geometry">';
  if (!src) geo += `<mxPoint x="${r1(first[0])}" y="${r1(first[1])}" as="sourcePoint"/>`;
  if (!tgt) geo += `<mxPoint x="${r1(last[0])}" y="${r1(last[1])}" as="targetPoint"/>`;
  if (way.length) geo += '<Array as="points">' + way.map(p => `<mxPoint x="${r1(p[0])}" y="${r1(p[1])}"/>`).join('') + '</Array>';
  geo += '</mxGeometry>';
  cells.push(`<mxCell id="${id}" style="${style}" edge="1" parent="1"${attrs}>${geo}</mxCell>`);

  // rótulos da aresta (Sim/Não/…) posicionados como no HTML, ancorados ao meio do caminho
  (labelsByEdge[i] || []).forEach(l => {
    const mid = pathMid(pts);
    const w = l.t.length * 5.6, h = 12;
    const cxl = l.end ? l.x - w / 2 : l.x + w / 2, cyl = l.y - 3 - h / 2;
    cells.push(`<mxCell id="${nid()}" value="${esc(l.t)}" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;fontSize=10;fontStyle=3;fontColor=#4d5a61;labelBackgroundColor=none;${FONT}" vertex="1" connectable="0" parent="${id}"><mxGeometry x="0" y="0" relative="1" as="geometry"><mxPoint x="${r1(cxl - mid[0])}" y="${r1(cyl - mid[1])}" as="offset"/></mxGeometry></mxCell>`);
  });
});

// ---------- Legenda ----------
const LEG = 'legend';
cell(LEG, esc('LEGENDA'), `swimlane;html=1;startSize=24;fillColor=#ffffff;strokeColor=#d6dee2;fontColor=#1d2327;fontStyle=1;fontSize=12;rounded=1;arcSize=6;${FONT}`, '1', { x: 48, y: 1330, w: 980, h: 118 });
const legItems = [
  ['Evento de início', EV + 'outline=standard;symbol=general;fillColor=#e1faf4;strokeColor=#189c7b;', 24],
  ['Evento intermediário', EV + 'outline=catching;symbol=general;fillColor=#e8f4fb;strokeColor=#007ddd;', 24],
  ['Evento de fim', EV + 'outline=end;symbol=general;fillColor=#facecf;strokeColor=#df1517;strokeWidth=2;', 24],
  ['Gateway exclusivo (XOR)', 'shape=mxgraph.bpmn.gateway2;gwType=exclusive;html=1;fillColor=#fdf5d4;strokeColor=#927c19;', 28],
  ['Tarefa de usuário', 'shape=mxgraph.bpmn.task;taskMarker=user;rounded=1;arcSize=16;html=1;fillColor=#ffffff;strokeColor=#4d5a61;', 34, 52],
  ['Tarefa de serviço', 'shape=mxgraph.bpmn.task;taskMarker=service;rounded=1;arcSize=16;html=1;fillColor=#ffffff;strokeColor=#4d5a61;', 34, 52],
];
legItems.forEach((it, k) => {
  const col = k % 4, row = Math.floor(k / 4);
  const bx = 14 + col * 240, by = 32 + row * 44;
  const [name, st, h, w = h] = it;
  cell(nid(), '', st, LEG, { x: bx, y: by + (36 - h) / 2, w, h });
  cell(nid(), esc(name), `text;html=1;align=left;verticalAlign=middle;fontSize=11.5;fontColor=#2e393f;${FONT}`, LEG, { x: bx + w + 8, y: by, w: 170, h: 36 });
});
// fluxos na legenda
const legEdge = (k, name, style) => {
  const col = k % 4, row = Math.floor(k / 4);
  const bx = 48 + 14 + col * 240, by = 1330 + 32 + row * 44 + 18;
  cells.push(`<mxCell id="${nid()}" style="${style}" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="${bx}" y="${by}" as="sourcePoint"/><mxPoint x="${bx + 60}" y="${by}" as="targetPoint"/></mxGeometry></mxCell>`);
  cell(nid(), esc(name), `text;html=1;align=left;verticalAlign=middle;fontSize=11.5;fontColor=#2e393f;${FONT}`, '1', { x: bx + 68, y: by - 18, w: 170, h: 36 });
};
legEdge(6, 'Fluxo de sequência', 'edgeStyle=none;html=1;strokeColor=#2e393f;strokeWidth=1.4;endArrow=block;endFill=1;');
legEdge(7, 'Fluxo de mensagem', 'edgeStyle=none;html=1;dashed=1;dashPattern=6 4;strokeColor=#4d5a61;strokeWidth=1.4;startArrow=oval;startFill=0;startSize=5;endArrow=block;endFill=0;');

// ---------- Documento ----------
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" type="device" version="24.0.0">
  <diagram id="bpmn-clinica-medica" name="BPMN Clínica Médica">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="8260" pageHeight="1500" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
writeFileSync(outPath, xml);
console.log(`nós: ${D.nodes.length}, arestas: ${D.edges.length}, células: ${cells.length + 2}, bytes: ${xml.length}`);
