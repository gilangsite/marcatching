import test from 'node:test'
import assert from 'node:assert/strict'
import Module from 'node:module'

// `server-only` is resolved by Next's bundler, not by Node, so stub it for the server module under test.
const moduleLoader = Module as unknown as { _load: (request: string, ...rest: unknown[]) => unknown }
const originalLoad = moduleLoader._load
moduleLoader._load = function (this: unknown, request: string, ...rest: unknown[]) {
  return request === 'server-only' ? {} : originalLoad.call(this, request, ...rest)
}

const schema = { type: 'OBJECT', properties: { description: { type: 'STRING' } } }
const input = { system: 's', user: 'u', schema }
const ok = (value: unknown) => new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(value) }] } }] }), { status: 200 })
const status = (code: number, body = '{"error":{"message":"x"}}') => new Response(body, { status: code })

/** Plays a script of responses (or thrown errors) one fetch at a time and records which model each call hit. */
function script(...steps: Array<Response | Error>) {
  const calls: string[] = []
  globalThis.fetch = (async (url: string | URL | Request) => {
    calls.push(String(url).match(/models\/([^:]+):/)?.[1] || '?')
    const step = steps[calls.length - 1]
    if (!step) throw new Error(`unexpected extra call #${calls.length}`)
    if (step instanceof Error) throw step
    return step
  }) as typeof fetch
  return calls
}

async function load() {
  process.env.GEMINI_API_KEY = 'test-key'
  delete process.env.GEMINI_MODEL
  return import('../../lib/llm')
}

test('an overloaded model hands over to the next one instead of failing the member', async () => {
  const { generateJson } = await load()
  const calls = script(status(503), ok({ description: 'ok' }))
  const result = await generateJson(input)
  assert.deepEqual(result.data, { description: 'ok' })
  assert.equal(result.model, 'gemini-3.5-flash-lite')
  assert.deepEqual(calls, ['gemini-3.6-flash', 'gemini-3.5-flash-lite'])
})

test('a model that never answers (timeout), is retired (404) or is out of quota (429) is skipped too', async () => {
  const { generateJson } = await load()
  const calls = script(new Error('aborted'), status(404), status(429), ok({ description: 'late but fine' }))
  const result = await generateJson(input)
  assert.equal(result.model, 'gemini-3.8-flash')
  assert.equal(calls.length, 4)
})

test('empty, cut-off, or non-JSON answers move on to the next model', async () => {
  const { generateJson } = await load()
  const empty = new Response(JSON.stringify({ candidates: [{ content: { parts: [] } }] }), { status: 200 })
  const cut = new Response(JSON.stringify({ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: '{"descr' }] } }] }), { status: 200 })
  const broken = new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'not json' }] } }] }), { status: 200 })
  script(empty, cut, broken, ok({ description: 'fine' }))
  assert.deepEqual((await generateJson(input)).data, { description: 'fine' })
})

test('a rejected request or bad key stops at once instead of trying every model', async () => {
  const { generateJson, LlmError } = await load()
  for (const code of [400, 401, 403]) {
    const calls = script(status(code, '{"error":{"message":"API key not valid"}}'))
    await assert.rejects(() => generateJson(input), (error: unknown) => error instanceof LlmError && /pengaturan di server/.test(error.message))
    assert.equal(calls.length, 1, `HTTP ${code} must not fan out`)
  }
})

test('a blocked prompt is reported as such and never retried', async () => {
  const { generateJson, LlmError } = await load()
  const calls = script(new Response(JSON.stringify({ promptFeedback: { blockReason: 'SAFETY' } }), { status: 200 }))
  await assert.rejects(() => generateJson(input), (error: unknown) => error instanceof LlmError && error.status === 422)
  assert.equal(calls.length, 1)
})

test('when every model is overloaded the member is told it is temporary, not that something is broken', async () => {
  const { generateJson, LlmError } = await load()
  const calls = script(status(503), status(503), status(503), new Error('timeout'))
  await assert.rejects(() => generateJson(input), (error: unknown) => error instanceof LlmError && error.status === 503 && /sedang penuh/.test(error.message))
  assert.equal(calls.length, 4)
})

test('the configured model goes first without being tried twice; a missing key is a clear 503', async () => {
  const { geminiModelChain, generateJson, LlmError } = await load()
  assert.deepEqual(geminiModelChain('gemini-3.8-flash'), ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'])
  assert.deepEqual(geminiModelChain('my-custom-model').slice(0, 2), ['my-custom-model', 'gemini-3.6-flash'])
  assert.equal(geminiModelChain('  ').length, 4)
  assert.equal(geminiModelChain('').includes('gemini-2.5-flash'), false, 'retired model must not be in the default chain')
  delete process.env.GEMINI_API_KEY
  await assert.rejects(() => generateJson(input), (error: unknown) => error instanceof LlmError && error.status === 503)
})
