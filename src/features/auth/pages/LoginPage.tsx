import { FaDiscord } from 'react-icons/fa'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getDiscordLoginUrl } from '../services/authApi'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return <Navigate to="/items" replace />

  const handleLogin = async () => {
    try {
      setError(null)
      const url = await getDiscordLoginUrl()
      window.location.assign(url)
    } catch {
      setError('ログインURLの取得に失敗しました')
    }
  }

  return (
    <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#4a5b77] text-white font-bold text-xl flex items-center justify-center">
              N
            </div>
            <h1 className="text-2xl font-bold text-[#080d12]">Natsume CMS</h1>
            <p className="text-sm text-[#6f767a]">Discordでの認証が必要です</p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-[#ff6161] bg-[#fef2f3] px-4 py-3 text-sm text-[#ff6161]">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            className="mt-7 w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors"
          >
            <FaDiscord className="text-2xl" />
            Discordでログイン
          </button>

          <p className="mt-4 text-xs text-[#93a0a7] text-center">
            許可されたDiscordロールを持つユーザーのみ利用できます
          </p>
        </div>
      </div>
    </div>
  )
}
