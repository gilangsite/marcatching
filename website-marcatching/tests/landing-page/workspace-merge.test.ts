import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultWorkspaceData, memoryParagraphsReady, type WorkspaceData } from '../../app/course/workspaceData'
import { applyBrandProfile, cloneDefaultData, mergeWorkspaceData } from '../../app/course/workspaceMerge'

function ready(): WorkspaceData {
  const data = cloneDefaultData()
  for (const key of ['voice', 'redLines', 'audienceFacts', 'qualityGate'] as const) data.memory[key] = 'x'.repeat(100)
  return data
}

test('the landing page gate needs all four AI Memory paragraphs at 100+ characters', () => {
  assert.equal(memoryParagraphsReady(cloneDefaultData()), false)
  assert.equal(memoryParagraphsReady(ready()), true)
  const short = ready()
  short.memory.qualityGate = 'x'.repeat(99)
  assert.equal(memoryParagraphsReady(short), false)
  const padded = ready()
  padded.memory.voice = `${' '.repeat(60)}${'x'.repeat(40)}`
  assert.equal(memoryParagraphsReady(padded), false, 'whitespace does not count')
  assert.equal(memoryParagraphsReady({ ...ready(), memory: undefined } as unknown as WorkspaceData), false)
})

test('saving the profile from the landing page leaves everything else in the stored workspace untouched', () => {
  const stored = { ...defaultWorkspaceData, creatorName: 'Lama', revenue: { ...defaultWorkspaceData.revenue, offer: 'Kelas barista' }, futureField: { keep: 'me' } }
  const next = applyBrandProfile(stored, { creatorName: '  Kopi Sore  ', brandProfile: { description: 'd'.repeat(500), website: 'kopisore.id', whatsapp: '0812', email: 'halo@kopisore.id' } })
  assert.equal(next.creatorName, 'Kopi Sore')
  assert.equal((next.brandProfile as { description: string }).description.length, 400)
  assert.deepEqual(next.futureField, { keep: 'me' })
  assert.equal((next.revenue as { offer: string }).offer, 'Kelas barista')
  assert.equal(stored.creatorName, 'Lama', 'input is not mutated')
  // A member who never opened the workspace has no row yet: start from defaults instead of failing.
  const fresh = applyBrandProfile(null, { creatorName: 'Baru', brandProfile: defaultWorkspaceData.brandProfile })
  assert.equal(fresh.creatorName, 'Baru')
  assert.equal(fresh.version, 2)
})

test('loading a stored workspace still normalizes every optional section after the refactor', () => {
  const merged = mergeWorkspaceData({
    creatorName: 'Kopi Sore',
    brandProfile: { description: 'Kopi susu', website: 5, email: 'halo@kopisore.id' },
    visualIdentity: { primaryColor: 'blue', secondaryColor: '#f59e0b', headingFont: ' Poppins ' },
    refinedMemory: { status: 'approved', inputHash: 'abc', sections: { offer: 'isi' } },
    brandInterview: { status: 'asking', questions: [{ question: 'Berapa harganya?' }] },
    calendar: [{ week: 9, title: 'x', status: 'Weird' }],
    deliverables: [{ id: 'd1', status: 'Approved' }, { id: 'd2', status: 'Nonsense' }],
  })
  assert.equal(merged.creatorName, 'Kopi Sore')
  assert.equal(merged.brandProfile.website, '')
  assert.equal(merged.brandProfile.email, 'halo@kopisore.id')
  assert.equal(merged.visualIdentity.primaryColor, '')
  assert.equal(merged.visualIdentity.secondaryColor, '#F59E0B')
  assert.equal(merged.visualIdentity.headingFont, 'Poppins')
  assert.equal(merged.refinedMemory?.status, 'approved')
  assert.equal(merged.brandInterview?.questions[0].question, 'Berapa harganya?')
  assert.equal(merged.calendar[0].week, 4)
  assert.equal(merged.calendar[0].status, 'Idea')
  assert.equal(merged.deliverables[0].status, 'Approved')
  assert.equal(merged.deliverables[1].status, 'Not started')
  assert.deepEqual(mergeWorkspaceData('garbage'), cloneDefaultData())
})
