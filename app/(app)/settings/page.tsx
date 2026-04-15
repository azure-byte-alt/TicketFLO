'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [fullName, setFullName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setUser({ id: data.id, email: data.email })
          if (data.fullName) setFullName(data.fullName)
        } else {
          window.location.href = '/login'
        }
      })
      .catch(() => { window.location.href = '/login' })
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg(null)
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName }),
    })
    if (res.ok) {
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' })
    } else {
      setProfileMsg({ type: 'error', text: 'Failed to update profile. Please try again.' })
    }
    setSavingProfile(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    setSavingPassword(true)
    setPasswordMsg(null)
    const res = await fetch('/api/auth/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    })
    const data = await res.json()
    if (res.ok) {
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' })
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setPasswordMsg({ type: 'error', text: data.error || 'Failed to update password.' })
    }
    setSavingPassword(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return
    setDeleting(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a2744]">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-[#1a2744] mb-5">Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#4db8a4] rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="font-medium text-[#1a2744]">{fullName || 'No name set'}</div>
            <div className="text-sm text-gray-400">{user?.email}</div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4db8a4] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full px-4 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
          </div>

          {profileMsg && (
            <div className={`p-3 rounded-lg text-sm ${
              profileMsg.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {profileMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className="px-5 py-2.5 bg-[#1a2744] hover:bg-[#243456] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition"
          >
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-[#1a2744] mb-5">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4db8a4] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4db8a4] focus:border-transparent"
            />
          </div>

          {passwordMsg && (
            <div className={`p-3 rounded-lg text-sm ${
              passwordMsg.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {passwordMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={savingPassword || !newPassword || !confirmPassword}
            className="px-5 py-2.5 bg-[#1a2744] hover:bg-[#243456] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition"
          >
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-[#1a2744] mb-5">Preferences</h2>
        <div className="space-y-4">
          {[
            { label: 'Email Notifications', desc: 'Receive weekly progress summaries via email' },
            { label: 'Practice Reminders', desc: 'Daily reminder to complete a practice session' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-800">{label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
              </div>
              <button
                type="button"
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition"
                aria-label={label}
              >
                <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-xl border border-red-200 p-6">
        <h2 className="font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-600 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-400 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-700 font-medium">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-2.5 border border-red-300 rounded-lg text-sm text-red-900 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE' || deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
              >
                {deleting ? 'Signing out...' : 'Confirm Delete'}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
