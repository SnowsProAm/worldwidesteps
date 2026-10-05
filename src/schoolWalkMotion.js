export const WALK_CYCLE = 0.8;
// During stance, the foot moves backwards in SVG space at exactly the body's
// forward speed. Its position on the pavement therefore stays fixed.
export function walkingLeg(time, speed, offset = 0) {
  const phase = ((time / WALK_CYCLE + offset) % 1 + 1) % 1;
  const stance = 0.58;
  const stride = speed * WALK_CYCLE * stance;
  const swing = (phase - stance) / (1 - stance);
  const x = 29 + (phase < stance ? stride / 2 - speed * WALK_CYCLE * phase : -stride / 2 + stride * (1 - Math.cos(Math.PI * swing)) / 2);
  const y = phase < stance ? 87 : 87 - Math.sin(Math.PI * swing) * 11;
  const hipY = 54 - Math.cos(time / WALK_CYCLE * Math.PI * 4) * 0.8;
  const dx = x - 29, dy = y - hipY, distance = Math.hypot(dx, dy);
  const bend = Math.sqrt(Math.max(0, 20 * 20 - distance * distance / 4));
  return { x, y, hipY, kneeX: 29 + dx / 2 + bend * dy / distance, kneeY: hipY + dy / 2 - bend * dx / distance, planted: phase < stance };
}
