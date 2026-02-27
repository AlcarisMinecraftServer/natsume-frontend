export type DiffLine = {
  type: 'added' | 'removed' | 'unchanged'
  text: string
}

export function computeDiff(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
  action: string
): DiffLine[] {
  if (action === 'create' && after) {
    return Object.entries(after).map(([k, v]) => ({
      type: 'added',
      text: `+ ${k}: ${JSON.stringify(v)}`,
    }))
  }

  if (action === 'delete' && before) {
    return Object.entries(before).map(([k, v]) => ({
      type: 'removed',
      text: `- ${k}: ${JSON.stringify(v)}`,
    }))
  }

  if (!before || !after) return []

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])
  const changed: DiffLine[] = []
  const unchanged: DiffLine[] = []

  for (const k of allKeys) {
    const bv = JSON.stringify(before[k])
    const av = JSON.stringify(after[k])
    if (bv !== av) {
      if (k in before) changed.push({ type: 'removed', text: `- ${k}: ${bv}` })
      if (k in after) changed.push({ type: 'added', text: `+ ${k}: ${av}` })
    } else {
      unchanged.push({ type: 'unchanged', text: `  ${k}: ${bv}` })
    }
  }

  return [...changed, ...unchanged]
}
