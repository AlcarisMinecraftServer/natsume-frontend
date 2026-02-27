import { useEffect, useState } from 'react'
import { FaHistory, FaTimes } from 'react-icons/fa'
import { fetchAuditLogs } from '../services/auditLogsApi'
import type { AuditLogEntry, ResourceType } from '../types'
import { computeDiff } from '../utils/diffJson'

interface Props {
  resourceType: ResourceType
  resourceId: string
  resourceLabel: string
  onClose: () => void
  closing: boolean
}

const ACTION_BADGE: Record<string, { label: string; className: string }> = {
  create: { label: '作成', className: 'bg-green-100 text-green-700' },
  update: { label: '更新', className: 'bg-blue-100 text-blue-700' },
  delete: { label: '削除', className: 'bg-red-100 text-red-700' },
}

export default function AuditLogModal({
  resourceType,
  resourceId,
  resourceLabel,
  onClose,
  closing,
}: Props) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetchAuditLogs({ resource_type: resourceType, resource_id: resourceId })
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [resourceType, resourceId])

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-[color-mix(in_oklab,#6f767a_30%,transparent)] transition-opacity duration-500 z-60
          ${closing ? 'opacity-0' : 'opacity-100'}
          starting:opacity-0
        `}
      />
      <div className="pointer-events-none fixed inset-0 flex h-100svh w-full z-60">
        <div
          className={`pointer-events-auto m-auto origin-bottom shadow-[0_25px_50px_-12px_#00000040] duration-500 ease-spring-subtle bg-[#f1f6f9] w-19/20 rounded-4xl max-w-2xl max-h-[calc(100svh-2rem)]
            transition-[opacity,transform]
            ${closing
              ? 'opacity-0 translate-y-10 scale-80'
              : 'opacity-100 translate-y-0 scale-100'
            }
            starting:translate-y-10 starting:opacity-0 starting:scale-80
          `}
        >
          <div className="p-3.5 flex flex-col gap-4 overflow-y-auto max-h-[calc(100svh-2rem)]">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#080d12] flex items-center gap-2">
                <FaHistory className="text-[#4a5b77]" />
                編集履歴 — {resourceLabel}
              </h2>
              <button onClick={onClose} className="text-[#99a2a7] hover:text-[#4b5256]">
                <FaTimes size={20} />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-[#e9eef1] border-t-[#4a5b77] rounded-full" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-10 text-[#99a2a7] text-sm">履歴はありません</div>
            ) : (
              <div className="flex flex-col gap-2 pb-2">
                {entries.map((entry) => {
                  const badge = ACTION_BADGE[entry.action] ?? {
                    label: entry.action,
                    className: 'bg-gray-100 text-gray-700',
                  }
                  const isExpanded = expanded === entry.id
                  const diff = isExpanded
                    ? computeDiff(entry.before_data, entry.after_data, entry.action)
                    : null

                  return (
                    <div key={entry.id} className="bg-white shadow-xs rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : entry.id)}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#f8fafc] transition-colors"
                      >
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}
                        >
                          {badge.label}
                        </span>

                        {entry.actor_avatar_url ? (
                          <img
                            src={entry.actor_avatar_url}
                            alt={entry.actor_global_name ?? entry.actor_username}
                            className="h-7 w-7 rounded-full border border-black/5 shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-[#4a5b77] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(entry.actor_global_name ?? entry.actor_username)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-[#080d12]">
                            {entry.actor_global_name ?? entry.actor_username}
                          </span>
                          {entry.actor_global_name && entry.actor_username !== 'unknown' && (
                            <span className="text-xs text-[#99a2a7] ml-1.5">
                              @{entry.actor_username}
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-[#99a2a7] shrink-0">
                          {new Date(entry.created_at).toLocaleString('ja-JP', {
                            timeZone: 'Asia/Tokyo',
                          })}
                        </span>
                      </button>

                      {isExpanded && diff && (
                        <div className="border-t border-[#e9eef1] px-4 py-3">
                          {diff.length === 0 ? (
                            <p className="text-xs text-[#99a2a7]">差分データなし</p>
                          ) : (
                            <div className="text-xs font-mono leading-5 overflow-x-auto">
                              {diff.map((line, i) => (
                                <div
                                  key={i}
                                  className={
                                    line.type === 'added'
                                      ? 'text-green-700 bg-green-50 rounded px-1'
                                      : line.type === 'removed'
                                        ? 'text-red-700 bg-red-50 rounded px-1'
                                        : 'text-[#6f767a] px-1'
                                  }
                                >
                                  {line.text}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
