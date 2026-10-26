// @vitest-environment node
import { execFileSync } from "node:child_process"
import { describe, expect, it } from "vitest"
import { DEQUE_FRAMES } from "@/components/viz/python/deque/model"
import { DICT_FRAMES } from "@/components/viz/python/dict-table/model"
import { HEAP_FRAMES, HEAP_OPS } from "@/components/viz/python/heap/model"
import { LIST_OPS_FRAMES } from "@/components/viz/python/list-array/model"

/**
 * The data-structure visuals make claims about CPython. This test asks real Python
 * (the same interpreter as `pnpm verify:code`) and compares, so a visual can't drift from reality.
 */
const PY = String.raw`
import heapq, json, sys
from collections import deque

out = {}

h, heaps = [], [[]]
for op, v in json.loads(sys.argv[1]):
    if op == "push":
        heapq.heappush(h, v)
    else:
        heapq.heappop(h)
    heaps.append(list(h))
out["heaps"] = heaps

cap = lambda l: (sys.getsizeof(l) - sys.getsizeof([])) // 8
caps = []
nums = [10, 20, 30]; caps.append((list(nums), cap(nums)))
nums[2]; caps.append((list(nums), cap(nums)))
nums.append(40); caps.append((list(nums), cap(nums)))
nums.insert(0, 5); caps.append((list(nums), cap(nums)))
nums.pop(); caps.append((list(nums), cap(nums)))
nums.pop(0); caps.append((list(nums), cap(nums)))
out["lists"] = caps

q = deque([1, 2, 3]); states = [list(q)]
q.append(4); states.append(list(q))
q.appendleft(0); states.append(list(q))
q.popleft(); states.append(list(q))
q.rotate(1); states.append(list(q))
out["deques"] = states

def slot_path(h, used, mask=7):
    i = h & mask; path = [i]; perturb = h
    while i in used:
        perturb >>= 5
        i = (i * 5 + perturb + 1) & mask
        path.append(i)
    return path
used, paths, d = set(), [], {}
for k, v in [(10, "pen"), (18, "ink"), (3, "cap"), (26, "pad")]:
    p = slot_path(hash(k), used); used.add(p[-1]); paths.append(p); d[k] = v
out["dict_paths"] = paths
out["dict_order"] = list(d)
print(json.dumps(out))
`

const py = JSON.parse(
  execFileSync(
    "python",
    ["-I", "-c", PY, JSON.stringify(HEAP_OPS.map((o) => [o.op, o.value ?? null]))],
    {
      encoding: "utf8",
    },
  ),
) as {
  heaps: number[][]
  lists: [number[], number][]
  deques: number[][]
  dict_paths: number[][]
  dict_order: number[]
}

describe("visual models match CPython", () => {
  it("heap arrays after each push/pop equal heapq's", () => {
    expect(HEAP_FRAMES.map((f) => f.heap)).toEqual(py.heaps)
  })

  it("heap frames respect the heap invariant", () => {
    for (const { heap } of HEAP_FRAMES) {
      heap.forEach((v, i) => {
        if (i > 0) expect(heap[Math.floor((i - 1) / 2)]!).toBeLessThanOrEqual(v)
      })
    }
  })

  it("list contents and capacities equal sys.getsizeof measurements", () => {
    const model = LIST_OPS_FRAMES.map((f) => [
      f.slots.filter((s): s is string => s !== null).map(Number),
      f.slots.length,
    ])
    expect(model).toEqual(py.lists)
  })

  it("deque contents equal collections.deque after each operation", () => {
    expect(DEQUE_FRAMES.map((f) => f.blocks.flat().filter((v) => v !== null))).toEqual(py.deques)
  })

  it("dict probe paths follow CPython's open addressing and order is insertion order", () => {
    const inserts = DICT_FRAMES.slice(1, 5)
    expect(inserts.map((f) => f.probe)).toEqual(py.dict_paths)
    const last = DICT_FRAMES.at(-1)!
    expect(last.entries.map((e) => Number(e.key))).toEqual(py.dict_order)
    // each entry sits in the slot its probe path ended on
    inserts.forEach((f, entry) => expect(last.slots[f.probe.at(-1)!]).toBe(entry))
  })
})
