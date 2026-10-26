// Visualizations usable in content/python lessons (auto-registered by scripts/gen-viz-registry.ts).
import { BigOViz } from "./big-o/big-o-viz"
import { BytecodeViz } from "./bytecode/bytecode-viz"
import { DequeViz } from "./deque/deque-viz"
import { DictTableViz } from "./dict-table/dict-table-viz"
import { FloatBitsViz } from "./float-bits/float-bits-viz"
import { HeapViz } from "./heap/heap-viz"
import { ListArrayViz } from "./list-array/list-array-viz"
import { MemoryViz } from "./memory/memory-viz"
import { ScopeLegbViz } from "./scope-legb/scope-legb-viz"
import { SliceRulerViz } from "./slice-ruler/slice-ruler-viz"
import { CompPipelineViz } from "./small/comp-pipeline-viz"
import { ConcurrencyViz } from "./small/concurrency-viz"
import { DecoratorViz } from "./small/decorator-viz"
import { ExceptionUnwindViz } from "./small/exception-unwind-viz"
import { MroViz } from "./small/mro-viz"
import { CounterViz } from "./small/counter-viz"
import { UnpackViz } from "./small/unpack-viz"
import { VennViz } from "./small/venn-viz"

export const viz = {
  BigOViz,
  BytecodeViz,
  CompPipelineViz,
  ConcurrencyViz,
  DecoratorViz,
  ExceptionUnwindViz,
  MroViz,
  CounterViz,
  DequeViz,
  DictTableViz,
  FloatBitsViz,
  HeapViz,
  ListArrayViz,
  MemoryViz,
  ScopeLegbViz,
  SliceRulerViz,
  UnpackViz,
  VennViz,
}
