FIX FAILURES. The last step left failing checks. The failing output is pasted below this prompt.

1. Read the output carefully. For each failure, find the root cause by opening the relevant files. Do not guess.
2. Fix the cause in the code you wrote for this step. Do not weaken, skip, delete, or loosen any test or lint rule. Do not edit protected simulation, detector, localizer, sequencer, ML, matcher, or data files. If a failure appears to require that, stop and tell me why.
3. If a test is genuinely wrong, explain exactly why and propose the change, and wait for me.
4. Re-run npm test and npm run build (and the e2e command if e2e failed). Repeat until green or until you are blocked.
5. Report: each failure, its root cause, the fix, and the final pass counts. Mark anything you could not verify as NOT VERIFIED.
6. Do not run git commit, push, reset, or checkout.

FAILING OUTPUT:
