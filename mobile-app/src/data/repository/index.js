import { s_1_0 } from './course1/s-1-0.js';
import { s_1_10 } from './course1/s-1-10.js';
import { s_1_11 } from './course1/s-1-11.js';
import { s_2_0 } from './course2/s-2-0.js';
import { s_2_0_situational } from './course2/s-2-0-situational.js';
import { s_2_1 } from './course2/s-2-1.js';
import { s_2_1_situational } from './course2/s-2-1-situational.js';
import { s_2_2 } from './course2/s-2-2.js';
import { s_2_2_situational } from './course2/s-2-2-situational.js';
import { s_2_8 } from './course2/s-2-8.js';
import { s_2_9 } from './course2/s-2-9.js';
import { s_2_9_situational } from './course2/s-2-9-situational.js';
import { s_2_10 } from './course2/s-2-10.js';
import { s_2_10_situational } from './course2/s-2-10-situational.js';

// Merge test and situational data for structured subjects
const s_2_0_merged = Object.fromEntries(
  Object.keys(s_2_0).map(tKey => [
    tKey,
    { test: s_2_0[tKey], situational: s_2_0_situational[tKey] || [] }
  ])
);

const s_2_1_merged = Object.fromEntries(
  Object.keys(s_2_1).map(tKey => [
    tKey,
    { test: s_2_1[tKey], situational: s_2_1_situational[tKey] || [] }
  ])
);

const s_2_2_merged = Object.fromEntries(
  Object.keys(s_2_2).map(tKey => [
    tKey,
    { test: s_2_2[tKey], situational: s_2_2_situational[tKey] || [] }
  ])
);

const s_2_9_merged = Object.fromEntries(
  Object.keys(s_2_9).map(tKey => [
    tKey,
    { test: s_2_9[tKey], situational: s_2_9_situational[tKey] || [] }
  ])
);

const s_2_10_merged = Object.fromEntries(
  Object.keys(s_2_10).map(tKey => [
    tKey,
    { test: s_2_10[tKey], situational: s_2_10_situational[tKey] || [] }
  ])
);

export const MCQ_REPOSITORY = {
  "s-1-0": s_1_0,
  "s-1-10": s_1_10,
  "s-1-11": s_1_11,
  "s-2-0": s_2_0_merged,
  "s-2-1": s_2_1_merged,
  "s-2-2": s_2_2_merged,
  "s-2-8": s_2_8,
  "s-2-9": s_2_9_merged,
  "s-2-10": s_2_10_merged,
};
