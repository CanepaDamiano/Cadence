import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adjustBlockDuration,
  autoResolveOverlaps,
  calculateBalanceMetrics,
  detectOverlaps,
  findNextAvailableSlot,
  formatDuration,
  minutesToTimeStr,
  timeStrToMinutes,
} from './scheduleMath';
import { createInitialBlocks } from './seedData';
import { TimeBlock } from '../types/schedule';

test('time string and minutes conversion roundtrips accurately', () => {
  assert.equal(minutesToTimeStr(0), '00:00');
  assert.equal(minutesToTimeStr(510), '08:30');
  assert.equal(minutesToTimeStr(1440), '24:00');
  assert.equal(timeStrToMinutes('08:30'), 510);
  assert.equal(timeStrToMinutes('24:00'), 1440);
  assert.equal(formatDuration(90), '1h 30m');
  assert.equal(formatDuration(45), '45m');
});

test('detectOverlaps identifies colliding blocks and ignores adjacent blocks', () => {
  const blocks: TimeBlock[] = [
    {
      id: 'b1',
      title: 'Lecture',
      category: 'lecture',
      startMinutes: 480, // 08:00
      endMinutes: 540, // 09:00
    },
    {
      id: 'b2',
      title: 'Study (Touching boundary)',
      category: 'study',
      startMinutes: 540, // 09:00
      endMinutes: 600, // 10:00
    },
    {
      id: 'b3',
      title: 'Overlapping Exercise',
      category: 'exercise',
      startMinutes: 570, // 09:30
      endMinutes: 630, // 10:30
    },
  ];

  const overlaps = detectOverlaps(blocks);
  assert.equal(overlaps.length, 1);
  assert.equal(overlaps[0].blockAId, 'b2');
  assert.equal(overlaps[0].blockBId, 'b3');
  assert.equal(overlaps[0].overlapMinutes, 30);
});

test('autoResolveOverlaps shifts colliding blocks to remove overlaps', () => {
  const blocks: TimeBlock[] = [
    {
      id: 'b1',
      title: 'Lecture',
      category: 'lecture',
      startMinutes: 540,
      endMinutes: 600,
    },
    {
      id: 'b2',
      title: 'Study',
      category: 'study',
      startMinutes: 570,
      endMinutes: 630,
    },
  ];

  const resolved = autoResolveOverlaps(blocks);
  assert.equal(detectOverlaps(resolved).length, 0);
  const b2 = resolved.find((b) => b.id === 'b2')!;
  assert.equal(b2.startMinutes, 600);
  assert.equal(b2.endMinutes, 660);
});

test('adjustBlockDuration enforces minimum 15m and maximum 24:00 boundary', () => {
  const block: TimeBlock = {
    id: 'b1',
    title: 'Short study',
    category: 'study',
    startMinutes: 600,
    endMinutes: 630,
  };

  const shorter = adjustBlockDuration(block, -30);
  assert.equal(shorter.endMinutes - shorter.startMinutes, 15);

  const longer = adjustBlockDuration(block, 30);
  assert.equal(longer.endMinutes - longer.startMinutes, 60);
});

test('findNextAvailableSlot locates an open conflict-free interval', () => {
  const blocks: TimeBlock[] = [
    {
      id: 'b1',
      title: 'Morning Block',
      category: 'lecture',
      startMinutes: 480, // 08:00
      endMinutes: 600, // 10:00
    },
    {
      id: 'b2',
      title: 'Midday Block',
      category: 'study',
      startMinutes: 630, // 10:30
      endMinutes: 720, // 12:00
    },
  ];

  // Looking for 60m slot starting at 08:00 -> should skip 10:00-10:30 (only 30m) and pick 12:00-13:00 (720-780)
  const slot = findNextAvailableSlot(blocks, 60, 480);
  assert.equal(slot.startMinutes, 720);
  assert.equal(slot.endMinutes, 780);
});

test('calculateBalanceMetrics computes sleep goal warnings and passion quotas accurately', () => {
  const defaultBlocks = createInitialBlocks('default-balanced');
  const metrics = calculateBalanceMetrics(defaultBlocks, 7.5, 1.5);

  // Default balanced schedule has 8h (480m) sleep and 2.5h (150m) hobbies
  assert.equal(metrics.sleepMinutes, 480);
  assert.equal(metrics.sleepStatus, 'optimal');
  assert.equal(metrics.passionsMinutes, 150);
  assert.equal(metrics.hobbyStatus, 'met');

  // If sleep goal is raised to 9.5h, sleepStatus should be deficit
  const strictSleepMetrics = calculateBalanceMetrics(defaultBlocks, 9.5, 1.5);
  assert.equal(strictSleepMetrics.sleepStatus, 'deficit');
  assert.ok(strictSleepMetrics.sleepDeficitMinutes > 60);
});
