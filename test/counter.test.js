import assert from "node:assert/strict";
import test from "node:test";

import { renderCounterSvg } from "../dashboard-worker.js";

test("renders seven digits with leading zeroes", () => {
  const svg = renderCounterSvg(111);

  assert.match(svg, /width="298"/);
  assert.match(svg, /height="40"/);
  assert.match(svg, /Visitor count: 111/);
  assert.equal((svg.match(/<rect /g) ?? []).length, 7);
  assert.equal((svg.match(/<text /g) ?? []).length, 7);
  assert.match(svg, />0<\/text>.*>0<\/text>.*>0<\/text>.*>0<\/text>.*>1<\/text>.*>1<\/text>.*>1<\/text>/);
});

test("clamps invalid and negative values to zero", () => {
  assert.match(renderCounterSvg(-5), /Visitor count: 0/);
  assert.match(renderCounterSvg("not-a-number"), /Visitor count: 0/);
});

test("keeps the seven least-significant digits", () => {
  const svg = renderCounterSvg(123456789);

  assert.match(svg, /Visitor count: 123456789/);
  assert.match(svg, />3<\/text>.*>4<\/text>.*>5<\/text>.*>6<\/text>.*>7<\/text>.*>8<\/text>.*>9<\/text>/);
});
