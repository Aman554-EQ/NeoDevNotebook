# Navigation: Part 1 (Python)

Module folder: `content/python/` · visuals: `src/components/viz/python/` (+ shared `_shared/code-stepper*`, `_shared/call-stack/`) · traces: `content/python/traces/` · E2E: `tests/e2e/python/`

## Lessons

| #   | Section                     | Lesson                                   | Route                                                    | Visual             |
| --- | --------------------------- | ---------------------------------------- | -------------------------------------------------------- | ------------------ |
| 01  | Basics                      | How Python runs your code                | `/learn/python/how-python-runs-your-code`                | BytecodeViz        |
| 02  | Basics                      | Variables, objects and types             | `/learn/python/variables-objects-and-types`              | MemoryViz          |
| 03  | Basics                      | Numbers and operators                    | `/learn/python/numbers-and-operators`                    | FloatBitsViz       |
| 04  | Basics                      | Strings                                  | `/learn/python/strings`                                  | SliceRulerViz      |
| 05  | Basics                      | Conditions and match                     | `/learn/python/conditions-and-match`                     | CodeStepper        |
| 06  | Basics                      | Loops                                    | `/learn/python/loops`                                    | CodeStepper        |
| 07  | Basics                      | Functions                                | `/learn/python/functions`                                | CallStack          |
| 08  | Basics                      | Scope and closures                       | `/learn/python/scope-and-closures`                       | ScopeLegbViz       |
| 09  | Basics                      | Recursion                                | `/learn/python/recursion`                                | CallStack          |
| 10  | Basics                      | Mutability, references and copies        | `/learn/python/mutability-references-and-copies`         | MemoryViz          |
| 11  | Data Structures             | Lists in depth                           | `/learn/python/lists-in-depth`                           | ListArrayViz       |
| 12  | Data Structures             | Tuples and unpacking                     | `/learn/python/tuples-and-unpacking`                     | UnpackViz          |
| 13  | Data Structures             | Dictionaries                             | `/learn/python/dictionaries`                             | DictTableViz       |
| 14  | Data Structures             | Sets                                     | `/learn/python/sets`                                     | VennViz            |
| 15  | Data Structures             | Comprehensions and generator expressions | `/learn/python/comprehensions-and-generator-expressions` | CompPipelineViz    |
| 16  | Data Structures             | Stacks and queues                        | `/learn/python/stacks-and-queues`                        | DequeViz           |
| 17  | Data Structures             | Heaps and priority queues                | `/learn/python/heaps-and-priority-queues`                | HeapViz            |
| 18  | Data Structures             | The collections toolkit                  | `/learn/python/the-collections-toolkit`                  | CounterViz         |
| 19  | Data Structures             | Choosing a data structure and Big-O      | `/learn/python/choosing-a-data-structure-and-big-o`      | BigOViz            |
| 20  | Core Language               | Iterators and generators                 | `/learn/python/iterators-and-generators`                 | CodeStepper        |
| 21  | Core Language               | Exceptions                               | `/learn/python/exceptions`                               | ExceptionUnwindViz |
| 22  | Core Language               | Context managers                         | `/learn/python/context-managers`                         | CodeStepper        |
| 23  | Core Language               | Decorators                               | `/learn/python/decorators`                               | DecoratorViz       |
| 24  | Core Language               | Classes and objects                      | `/learn/python/classes-and-objects`                      | MemoryViz          |
| 25  | Core Language               | Inheritance and special methods          | `/learn/python/inheritance-and-special-methods`          | MroViz             |
| 26  | Core Language               | Files and data formats                   | `/learn/python/files-and-data-formats`                   | CodeStepper        |
| 27  | Core Language               | Concurrency basics                       | `/learn/python/concurrency-basics`                       | ConcurrencyViz     |
| 28  | Packages, Imports & Tooling | Modules and the import system            | `/learn/python/modules-and-the-import-system`            | ImportViz          |
| 29  | Packages, Imports & Tooling | Packages and project layout              | `/learn/python/packages-and-project-layout`              | ImportViz          |
| 30  | Packages, Imports & Tooling | pip and virtual environments             | `/learn/python/pip-and-virtual-environments`             | VenvViz            |
| 31  | Packages, Imports & Tooling | The standard library tour                | `/learn/python/the-standard-library-tour`                | CodeStepper        |
| 32  | Packages, Imports & Tooling | Essential commands and type hints        | `/learn/python/essential-commands-and-type-hints`        | reference page     |
| 33  | Debugging                   | Reading tracebacks                       | `/learn/python/reading-tracebacks`                       | TracebackViz       |
| 34  | Debugging                   | print, logging and assertions            | `/learn/python/print-logging-and-assertions`             | CodeStepper        |
| 35  | Debugging                   | pdb and the IDE debugger                 | `/learn/python/pdb-and-the-ide-debugger`                 | CodeStepper        |
| 36  | Debugging                   | Error catalogue and bug patterns         | `/learn/python/error-catalogue-and-bug-patterns`         | reference page     |

## Problems (`/practice/python/<id>`, files `content/python/problems/<id>.yaml`)

| ID       | Tier   | Title                                        |
| -------- | ------ | -------------------------------------------- |
| py-p-001 | easy   | Reverse the words in a sentence              |
| py-p-002 | easy   | Count the vowels                             |
| py-p-003 | easy   | Leap-year checker                            |
| py-p-004 | easy   | Sum of digits                                |
| py-p-005 | easy   | Print a temperature table                    |
| py-p-006 | easy   | Second-largest unique number                 |
| py-p-007 | easy   | Palindrome, ignoring case and punctuation    |
| py-p-008 | easy   | Merge two score dicts, adding shared keys    |
| py-p-009 | easy   | Remove duplicates, keep order                |
| py-p-010 | easy   | Find the missing number in 1..n              |
| py-p-011 | easy   | 🐞 The sorted list that turned into None     |
| py-p-012 | easy   | Word frequency                               |
| py-p-013 | easy   | Safe integer parse with a default            |
| py-p-014 | easy   | 🐞 The loop that skips the last item         |
| py-p-015 | easy   | Invert a dictionary                          |
| py-p-016 | simple | Run-length encoding                          |
| py-p-017 | simple | Transpose a matrix                           |
| py-p-018 | simple | Split a list into chunks of n                |
| py-p-019 | simple | Rotate a list by k                           |
| py-p-020 | simple | Caesar cipher                                |
| py-p-021 | simple | Two-sum with a dictionary                    |
| py-p-022 | simple | First non-repeating character                |
| py-p-023 | simple | Multiset intersection of two lists           |
| py-p-024 | simple | Parse a key=value config string              |
| py-p-025 | simple | Running average generator                    |
| py-p-026 | simple | Totals per column from CSV text              |
| py-p-027 | simple | Bank account class with validation           |
| py-p-028 | simple | Memoized Fibonacci                           |
| py-p-029 | simple | 🐞 Every basket shares the same items        |
| py-p-030 | simple | 🐞 Click counter raises UnboundLocalError    |
| py-p-031 | medium | Valid brackets                               |
| py-p-032 | medium | Group anagrams                               |
| py-p-033 | medium | Top-k frequent words with tie-break          |
| py-p-034 | medium | 🐞 Every callback prints the last value      |
| py-p-035 | medium | Longest substring without repeats            |
| py-p-036 | medium | Merge overlapping intervals                  |
| py-p-037 | medium | Queue from two stacks                        |
| py-p-038 | medium | Flatten any nested list                      |
| py-p-039 | medium | LRU cache                                    |
| py-p-040 | medium | 🐞 Binary search that never ends             |
| py-p-041 | medium | Product of array except self                 |
| py-p-042 | medium | Deep-merge nested dicts                      |
| py-p-043 | medium | Temporarily override dict values             |
| py-p-044 | medium | Retry decorator with a limit                 |
| py-p-045 | medium | 🐞 The iterator that only works once         |
| py-p-046 | hard   | Shortest route in a weighted graph           |
| py-p-047 | hard   | Install order for package dependencies       |
| py-p-048 | hard   | Median of a data stream                      |
| py-p-049 | hard   | Word ladder                                  |
| py-p-050 | hard   | Calculator for + - * / and parentheses       |
| py-p-051 | hard   | Autocomplete with a trie                     |
| py-p-052 | hard   | Lazily merge k sorted iterators              |
| py-p-053 | hard   | Longest increasing subsequence in O(n log n) |
| py-p-054 | hard   | Edit distance                                |
| py-p-055 | hard   | TTL cache with an injectable clock           |
| py-p-056 | hard   | Count N-Queens solutions                     |
| py-p-057 | hard   | Find where a linked list's cycle starts      |
| py-p-058 | hard   | Log report: status counts and p95 latency    |
| py-p-059 | hard   | 🐞 Tree walk hits RecursionError             |
| py-p-060 | hard   | Count friend groups                          |

## Interview questions (`/interview/python/<id>`, files `content/python/interview/<id>.yaml`)

| ID       | Tier   | Question                                                                               |
| -------- | ------ | -------------------------------------------------------------------------------------- |
| py-i-001 | easy   | What is the difference between mutable and immutable objects in Python? Give examples. |
| py-i-002 | easy   | What is the difference between `is` and `==`?                                          |
| py-i-003 | medium | How are arguments passed to functions in Python: by value or by reference?             |
| py-i-004 | easy   | What do `*args` and `**kwargs` mean in a function definition and in a call?            |
| py-i-005 | simple | What's wrong with `def add(item, bucket=[])`? How do you fix it?                       |
| py-i-006 | easy   | When would you use a tuple instead of a list?                                          |
| py-i-007 | simple | Explain shallow copy vs deep copy.                                                     |
| py-i-008 | easy   | What is truthiness in Python, and how should you check for `None`?                     |
| py-i-009 | simple | Python is dynamically typed and strongly typed. What does each part mean?              |
| py-i-010 | medium | Why might `a is b` be True for small integers but False for larger ones?               |
| py-i-011 | easy   | What does `if __name__ == "__main__":` do?                                             |
| py-i-012 | medium | Explain the LEGB rule, and when you need `global` or `nonlocal`.                       |
| py-i-013 | simple | What are lambdas, and what are their limitations?                                      |
| py-i-014 | easy   | Compare f-strings, `str.format` and `%` formatting.                                    |
| py-i-015 | medium | How does a Python dict work internally, and what are its time complexities?            |
| py-i-016 | medium | Why must dict keys be hashable, and which objects are hashable?                        |
| py-i-017 | simple | Why is `x in some_set` faster than `x in some_list`?                                   |
| py-i-018 | medium | What are the time complexities of common list operations?                              |
| py-i-019 | simple | When should you use `collections.deque` instead of a list?                             |
| py-i-020 | medium | How do you use `heapq`, and how do you get a max-heap or a priority queue?             |
| py-i-021 | simple | What are `Counter` and `defaultdict`, and when would you use each?                     |
| py-i-022 | medium | Is Python's sort stable? How do you sort by multiple keys?                             |
| py-i-023 | medium | What's the difference between a list comprehension and a generator expression?         |
| py-i-024 | simple | Are dictionaries ordered in Python?                                                    |
| py-i-025 | medium | Can a tuple that contains a list be used as a dict key?                                |
| py-i-026 | medium | `namedtuple` vs `dataclass`: when do you use each?                                     |
| py-i-027 | medium | How do decorators work? Write one that times a function.                               |
| py-i-028 | simple | What does `functools.wraps` do, and why does it matter?                                |
| py-i-029 | hard   | What is a closure, and what is the late-binding problem?                               |
| py-i-030 | medium | What's the difference between an iterable, an iterator and a generator?                |
| py-i-031 | hard   | What does `yield from` do beyond a simple loop of `yield`s?                            |
| py-i-032 | medium | What is a context manager? Write one with and without contextlib.                      |
| py-i-033 | simple | What is `@property` for?                                                               |
| py-i-034 | medium | What's the difference between `@classmethod` and `@staticmethod`?                      |
| py-i-035 | hard   | Explain the MRO and how `super()` works with multiple inheritance.                     |
| py-i-036 | easy   | What's the difference between `__repr__` and `__str__`?                                |
| py-i-037 | hard   | What does `__slots__` do, and what are the trade-offs?                                 |
| py-i-038 | hard   | What is the contract between `__eq__` and `__hash__`?                                  |
| py-i-039 | hard   | What is a metaclass, and when would you actually need one?                             |
| py-i-040 | hard   | What is the GIL, and how does it affect multithreaded Python?                          |
| py-i-041 | hard   | When do you choose threads, multiprocessing or asyncio?                                |
| py-i-042 | hard   | How does Python manage memory and garbage collection?                                  |
| py-i-043 | medium | How does CPython execute a Python program?                                             |
| py-i-044 | simple | What is `__pycache__`, and should it be in version control?                            |
| py-i-045 | medium | Explain `async` and `await`. Does async code run in parallel?                          |
| py-i-046 | hard   | Why is Python considered slow, and how do you speed up Python code?                    |
| py-i-047 | hard   | What is free-threaded Python 3.13?                                                     |
| py-i-048 | easy   | Why use a virtual environment?                                                         |
| py-i-049 | medium | What's the difference between `requirements.txt` and `pyproject.toml`?                 |
| py-i-050 | medium | How does Python find a module when you `import` it?                                    |
| py-i-051 | hard   | What causes circular imports, and how do you fix them?                                 |
| py-i-052 | simple | Absolute vs relative imports: which should you use?                                    |
| py-i-053 | medium | A script fails in production with a traceback. How do you debug it step by step?       |
| py-i-054 | simple | Which pdb commands do you use most?                                                    |
| py-i-055 | simple | Why use `logging` instead of `print`?                                                  |
| py-i-056 | medium | When should you use `assert`, and how do you write a basic pytest test?                |

## Tests

| Spec                                                | Covers                                                                                                               |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `tests/e2e/python/lessons.spec.ts`                  | sections, every lesson + its visuals, related practice, stepper, call stack, 3D lazy/fallback, slice playground, axe |
| `tests/e2e/python/practice.spec.ts`                 | 60 problems, tier/tag filters, every page, exact copy, layout, axe                                                   |
| `tests/e2e/python/interview.spec.ts`                | 56 questions, filters, every page, copy, bookmarks, layout, axe                                                      |
| `tests/unit/python-content.test.ts`                 | targets, visuals per lesson, template sections, tiers, debugging count                                               |
| `tests/unit/viz-models.test.ts`                     | heap/list/deque/dict visuals vs real CPython                                                                         |
| `tests/unit/trace.test.ts`, `code-stepper.test.tsx` | recorder, yield/resume, stale traces, stepper UI                                                                     |
| `tests/unit/internal-links.test.ts`                 | every internal content link resolves                                                                                 |
