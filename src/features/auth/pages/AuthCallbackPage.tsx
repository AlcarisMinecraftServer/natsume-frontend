import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '@/features/common/LoadingSpinner'

import { exchangeDiscordCode } from '../services/authApi'
import { useAuth } from '../context/AuthContext'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { setActor } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const code = params.get('code')
  const state = params.get('state')

  useEffect(() => {
    const run = async () => {
      if (!code || !state) {
        setError('認証情報が見つかりませんでした')
        return
      }

      try {
        const actor = await exchangeDiscordCode(code, state)
        setActor(actor)
        navigate('/items', { replace: true })
      } catch {
        setError('認証に失敗しました')
      }
    }

    run()
  }, [code, state, navigate, setActor])

  if (error) {
    return (
      <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-[#080d12]">認証エラー</h1>
            <p className="text-sm text-[#6f767a]">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#ffffff] border border-[#cad3d8] text-[#080d12] hover:bg-[#f6f9fb] transition-colors"
            >
              ログインへ戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner />
        <p className="text-sm text-[#6f767a]">認証中...</p>
      </div>
    </div>
  )
}
