/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-medium text-white tracking-tight">Acoustic Priming Test</h1>
          <p className="text-neutral-400">
            The script <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-sm text-neutral-300">test_acoustic_priming.ts</code> has been generated in the project root.
          </p>
        </header>

        <section className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78.52-2.61a2 2 0 0 1 2.4-1.56l2.16.43a2 2 0 0 1 1.56 2.4l-.52 2.61"/></svg>
              Execution Instructions
            </span>
          </div>
          <div className="p-6 space-y-4 text-sm text-neutral-300">
            <p>
              To run the script directly in your terminal, use:
            </p>
            <pre className="bg-black p-4 rounded border border-neutral-800 text-green-400 font-mono text-xs overflow-x-auto">
              {`npm install\nnpx tsx test_acoustic_priming.ts`}
            </pre>
            <p className="text-neutral-400 mt-4 leading-relaxed">
              This Node.js script tests the Turn A → Turn B → Turn C sequence via the <code className="text-neutral-300">@google/genai</code> Live API (WebSockets). It connects, sends an empty audio chunk with an explicitly constructed thoughtSignature and toolResponse wrapper, and ensures sequential execution of <code className="text-neutral-300">fetch_payload</code> and <code className="text-neutral-300">execute_code</code>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
