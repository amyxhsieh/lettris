// PixelBackground
// Pixel clouds use 3-layer box-shadow technique:
//   1. Dark outline  (offset +1 pixel down-right)
//   2. Body          (soft purple)
//   3. Top highlight (brighter, top rows only)

function shadow(cells, scale, color, ox = 0, oy = 0) {
  return cells
    .map(([c, r]) => `${c * scale + ox}px ${r * scale + oy}px 0 0 ${color}`)
    .join(',');
}

// ── Cloud shapes ──────────────────────────────────────────────────────────

// Tiny single puff
const C_TINY = [
  [1,0],[2,0],[3,0],
  [0,1],[1,1],[2,1],[3,1],[4,1],
  [0,2],[1,2],[2,2],[3,2],[4,2],
];

// Small 2-bump
const C_SM = [
  [1,0],[2,0],[4,0],[5,0],
  [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],
  [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
  [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],
];

// Medium 3-bump (like reference image)
const C_MD = [
  [2,0],[3,0],[4,0],[6,0],[7,0],[9,0],[10,0],
  [1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],
  [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],
  [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],[11,3],[12,3],
  [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],
];

// Large 3-bump (wide, tall — main hero cloud)
const C_LG = [
  [3,0],[4,0],[5,0],[7,0],[8,0],[9,0],[11,0],[12,0],[13,0],
  [2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],[13,1],[14,1],
  [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],[13,2],[14,2],[15,2],
  [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],[11,3],[12,3],[13,3],[14,3],[15,3],
  [0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],[13,4],[14,4],[15,4],
  [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5],[12,5],[13,5],[14,5],
];

// Wide flat 2-bump
const C_WIDE = [
  [1,0],[2,0],[3,0],[6,0],[7,0],[8,0],
  [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],
  [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],
  [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],
];

// Tall tower cloud
const C_TALL = [
  [3,0],[4,0],
  [2,1],[3,1],[4,1],[5,1],
  [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
  [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],
  [0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],
  [0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],
  [1,6],[2,6],[3,6],[4,6],[5,6],[6,6],
];

// Wispy thin cloud
const C_WISP = [
  [2,0],[3,0],[4,0],
  [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],
  [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
];

// ── Cloud colors ──────────────────────────────────────────────────────────
const COL_OUTLINE = 'rgba(0,15,25,0.45)';
const COL_BODY    = 'rgba(0,120,150,0.18)';
const COL_DARK    = 'rgba(0,50,70,0.22)';     // bottom row shadow
const COL_HI      = 'rgba(0,180,210,0.16)';   // top 2 rows
const COL_HI2     = 'rgba(0,220,255,0.10)';   // very top row

function PixelCloud({ cells, x, y, scale }) {
  const topRows = cells.filter(([, r]) => r <= 1);
  const topRow  = cells.filter(([, r]) => r === 0);
  const maxR    = Math.max(...cells.map(([, r]) => r));
  const botRow  = cells.filter(([, r]) => r === maxR);

  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      {/* dark outline — shifted 1px down-right */}
      <div style={{ position:'absolute', width:scale, height:scale,
        boxShadow: shadow(cells, scale, COL_OUTLINE, scale, scale) }} />
      {/* bottom shadow row */}
      <div style={{ position:'absolute', width:scale, height:scale,
        boxShadow: shadow(botRow, scale, COL_DARK) }} />
      {/* main body */}
      <div style={{ position:'absolute', width:scale, height:scale,
        boxShadow: shadow(cells, scale, COL_BODY) }} />
      {/* top highlight — upper 2 rows */}
      <div style={{ position:'absolute', width:scale, height:scale,
        boxShadow: shadow(topRows, scale, COL_HI) }} />
      {/* brightest highlight — very top row */}
      <div style={{ position:'absolute', width:scale, height:scale,
        boxShadow: shadow(topRow, scale, COL_HI2) }} />
    </div>
  );
}

// ── Plus-shaped stars ─────────────────────────────────────────────────────
function PlusStar({ x, y, size, color, delay, dur }) {
  return (
    <div className="twinkle" style={{ position:'absolute', left:x, top:y,
      animationDuration:`${dur}s`, animationDelay:`${delay}s`, pointerEvents:'none' }}>
      <div style={{ position:'absolute', width:size*3, height:size, background:color, top:size, left:0 }} />
      <div style={{ position:'absolute', width:size, height:size*3, background:color, top:0, left:size }} />
    </div>
  );
}

// ── Shooting star ─────────────────────────────────────────────────────────
function ShootingStar({ x, y, duration, delay }) {
  return (
    <div className="shooting-star" style={{
      position:'absolute', left:x, top:y,
      width:52, height:2,
      background:'linear-gradient(90deg, transparent, #00ddff)',
      transformOrigin:'left center',
      boxShadow:'0 0 4px #00ddff, 0 0 10px #00ddff66',
      animationDuration:`${duration}s`, animationDelay:`${delay}s`,
      pointerEvents:'none', borderRadius:1,
    }} />
  );
}

// ── Stars ─────────────────────────────────────────────────────────────────
const STARS = [
  { x:'8%',  y:'6%',  size:2, color:'rgba(255,255,255,0.55)', delay:0,   dur:2.4 },
  { x:'22%', y:'12%', size:1, color:'rgba(190,150,255,0.6)',  delay:0.7, dur:3.1 },
  { x:'60%', y:'4%',  size:2, color:'rgba(255,255,255,0.45)', delay:1.2, dur:2.8 },
  { x:'80%', y:'15%', size:1, color:'rgba(0,220,255,0.5)',    delay:0.4, dur:2.2 },
  { x:'90%', y:'35%', size:2, color:'rgba(200,160,255,0.45)', delay:1.8, dur:3.5 },
  { x:'5%',  y:'45%', size:1, color:'rgba(0,220,255,0.4)',    delay:2.1, dur:2.6 },
  { x:'45%', y:'8%',  size:1, color:'rgba(255,255,255,0.3)',  delay:0.9, dur:4.0 },
  { x:'72%', y:'55%', size:2, color:'rgba(190,150,255,0.4)',  delay:1.5, dur:2.9 },
  { x:'15%', y:'75%', size:1, color:'rgba(255,255,255,0.25)', delay:3.0, dur:3.3 },
  { x:'88%', y:'70%', size:1, color:'rgba(0,220,255,0.35)',   delay:2.4, dur:2.1 },
  { x:'35%', y:'88%', size:2, color:'rgba(200,160,255,0.3)',  delay:1.1, dur:3.8 },
  { x:'55%', y:'80%', size:1, color:'rgba(255,255,255,0.2)',  delay:2.7, dur:2.5 },
  { x:'30%', y:'55%', size:1, color:'rgba(190,150,255,0.3)',  delay:1.6, dur:3.2 },
];

// ── Main ──────────────────────────────────────────────────────────────────
export default function PixelBackground({ shootingStars = false }) {
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>

      {/* Nebula scatter — deep dark blue glow blobs */}
      <div style={{
        position:'absolute', inset:0,
        background:`
          radial-gradient(ellipse 70% 50% at 10% 20%, rgba(10,20,80,0.45) 0%, transparent 100%),
          radial-gradient(ellipse 45% 55% at 85% 10%, rgba(8,15,70,0.38) 0%, transparent 100%),
          radial-gradient(ellipse 55% 40% at 65% 78%, rgba(12,25,90,0.34) 0%, transparent 100%),
          radial-gradient(ellipse 40% 48% at 2%  82%, rgba(6,12,60,0.28) 0%, transparent 100%),
          radial-gradient(ellipse 35% 32% at 95% 52%, rgba(10,18,75,0.24) 0%, transparent 100%),
          radial-gradient(ellipse 60% 35% at 48% 45%, rgba(5,10,50,0.18)  0%, transparent 100%)
        `,
      }} />

      {/* Bottom horizon stripe — brighter blue-purple band like the reference */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0, height:'22%',
        background:'linear-gradient(180deg, transparent 0%, rgba(30,40,130,0.35) 40%, rgba(40,50,150,0.45) 100%)',
      }} />

      {/* Halftone dither — lower third */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0, height:'35%',
        backgroundImage:'radial-gradient(circle, rgba(80,100,220,0.18) 1px, transparent 1px)',
        backgroundSize:'6px 6px',
      }} />

      {/* Clouds — varied shapes and scales for depth */}
      <PixelCloud cells={C_LG}   x="56px" y="108px" scale={7} />  {/* large  — left, clear of the quit chip */}
      <PixelCloud cells={C_MD}   x="62%"  y="5%"  scale={6} />  {/* medium — right top */}
      <PixelCloud cells={C_TALL} x="78%"  y="42%" scale={6} />  {/* tall   — far right mid */}
      <PixelCloud cells={C_WIDE} x="5%"   y="78%" scale={5} />  {/* wide   — bottom left */}
      <PixelCloud cells={C_SM}   x="30%"  y="3%"  scale={5} />  {/* small  — top center */}
      <PixelCloud cells={C_SM}   x="80%"  y="82%" scale={4} />  {/* small  — bottom right, distant */}
      <PixelCloud cells={C_TINY} x="6%"   y="48%" scale={6} />  {/* tiny   — left mid */}
      <PixelCloud cells={C_WISP} x="48%"  y="18%" scale={4} />  {/* wispy  — center, high */}
      <PixelCloud cells={C_TINY} x="88%"  y="22%" scale={4} />  {/* tiny   — far right */}

      {/* Plus stars */}
      {STARS.map((s, i) => (
        <PlusStar key={i} x={s.x} y={s.y} size={s.size} color={s.color} delay={s.delay} dur={s.dur} />
      ))}

      {/* Shooting stars — start screen only */}
      {shootingStars && <>
        <ShootingStar x="10%" y="8%"  duration={4}   delay={1}   />
        <ShootingStar x="52%" y="4%"  duration={5.5} delay={3.2} />
        <ShootingStar x="78%" y="18%" duration={7}   delay={0.5} />
      </>}
    </div>
  );
}
