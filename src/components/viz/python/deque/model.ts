/**
 * collections.deque stores items in fixed-size blocks linked in both directions, so both ends
 * grow and shrink in O(1). Blocks are drawn with 4 slots for clarity (CPython uses 64).
 * Contents match what deque printed: deque([0, 1, 2, 3, 4]) … deque([4, 1, 2, 3]).
 */
export type DequeFrame = {
  code: string
  blocks: (number | null)[][]
  touched: number[]
  result?: string
}

export const DEQUE_FRAMES: DequeFrame[] = [
  { code: "q = deque([1, 2, 3])", blocks: [[null, 1, 2, 3]], touched: [1, 2, 3] },
  {
    code: "q.append(4)",
    blocks: [
      [null, 1, 2, 3],
      [4, null, null, null],
    ],
    touched: [4],
  },
  {
    code: "q.appendleft(0)",
    blocks: [
      [0, 1, 2, 3],
      [4, null, null, null],
    ],
    touched: [0],
  },
  {
    code: "q.popleft()",
    blocks: [
      [null, 1, 2, 3],
      [4, null, null, null],
    ],
    touched: [],
    result: "0",
  },
  { code: "q.rotate(1)", blocks: [[4, 1, 2, 3]], touched: [4], result: "deque([4, 1, 2, 3])" },
]
