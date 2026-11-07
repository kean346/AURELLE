import { test } from "node:test";
import assert from "node:assert/strict";
import { createSeekController } from "../src/lib/media.ts";
class Video extends EventTarget {
  duration = 10;
  readyState = 2;
  _time = 0;
  writes = [];
  get currentTime() {
    return this._time;
  }
  set currentTime(t) {
    this.writes.push(t);
    this._time = t;
  }
  finish() {
    this.dispatchEvent(new Event("seeked"));
  }
}
test("seeks never flood; only the latest pending request is applied", () => {
  const v = new Video(),
    q = createSeekController(v);
  q.seek(1);
  q.seek(3);
  q.seek(5);
  assert.deepEqual(v.writes, [1]);
  v.finish();
  assert.deepEqual(v.writes, [1, 5]);
  v.finish();
  assert.equal(q.seeks, 2);
  q.dispose();
});
test("reverse, clamp and cleanup preserve a single in-flight seek", () => {
  const v = new Video(),
    q = createSeekController(v);
  q.seek(20);
  v.finish();
  assert.equal(v.currentTime, 9.999);
  q.seek(-20);
  assert.equal(v.currentTime, 0);
  q.dispose();
  v.finish();
  q.seek(5);
  assert.equal(v.currentTime, 0);
});
test("waits for real metadata and does not seek invalid durations", () => {
  const v = new Video();
  v.readyState = 0;
  v.duration = NaN;
  const q = createSeekController(v);
  q.seek(4);
  assert.equal(v.writes.length, 0);
  v.duration = 8;
  v.readyState = 1;
  v.dispatchEvent(new Event("loadedmetadata"));
  assert.deepEqual(v.writes, [4]);
  q.dispose();
});
test("a decoder landing on a different frame does not cause a seek feedback loop", () => {
  const v = new Video(),
    q = createSeekController(v);
  q.seek(2);
  v._time = 0;
  v.finish();
  v.finish();
  assert.equal(v.writes.length, 1);
  q.seek(3);
  assert.equal(v.writes.length, 2);
  q.dispose();
});
