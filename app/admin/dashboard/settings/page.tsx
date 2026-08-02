'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  BTN,
  BTN_DANGER,
  BTN_GHOST,
  FIELD,
  FIELD_MONO,
  LABEL,
  PAGE_TITLE,
  PANEL,
} from '@/app/admin/ui'
import { apiRequest, errorMessage } from '@/app/admin/client'

/**
 * Application configuration.
 *
 * Mirrors `SettingStatus` from lib/settings.ts. Deliberately no `value` field —
 * the server never sends one. The form does not need the current value to
 * accept a replacement, and shipping it would put every API key into this
 * page's HTML, the browser cache, and any screenshot of this screen.
 */
type SettingStatus = {
  key: string
  label: string
  group: 'email' | 'integrations' | 'privacy'
  secret: boolean
  help: string
  placeholder?: string
  danger?: string
  configured: boolean
  source: 'database' | 'environment' | null
  hint: string | null
  updatedAt: string | null
}

type StatusResponse = {
  encryptionAvailable: boolean
  settings: SettingStatus[]
}

const GROUPS: { id: SettingStatus['group']; title: string; blurb: string }[] = [
  {
    id: 'email',
    title: 'Email',
    blurb:
      'Notifications when someone uses the contact form. All three are needed together — with any of them missing, messages are still saved and readable in the inbox, and only the email is skipped.',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    blurb:
      'Optional services. Each feature reports that it is unavailable rather than failing when its key is absent.',
  },
  {
    id: 'privacy',
    title: 'Privacy',
    blurb: 'How contact-form senders are identified without storing their address.',
  },
]

export default function SettingsPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setStatus(await apiRequest<StatusResponse>('/api/settings'))
    } catch (error) {
      toast.error(errorMessage(error, 'Could not load settings'))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const dirty = Object.entries(drafts).filter(([, v]) => v.trim() !== '')

  const save = async () => {
    if (dirty.length === 0) return

    // Confirm once per dangerous field rather than once for the whole save, so
    // the warning names the specific consequence instead of being generic.
    for (const [key] of dirty) {
      const def = status?.settings.find((s) => s.key === key)
      if (def?.danger && !confirm(`${def.label}\n\n${def.danger}\n\nContinue?`)) {
        return
      }
    }

    setSaving(true)
    try {
      // The server returns the fresh status, so the screen re-renders from what
      // was actually stored rather than from what was typed — which is how a
      // rejected write would otherwise look like a successful one.
      setStatus(
        await apiRequest<StatusResponse>('/api/settings', {
          method: 'PUT',
          body: JSON.stringify(Object.fromEntries(dirty)),
        })
      )
      setDrafts({})
      toast.success(dirty.length === 1 ? 'Saved' : `Saved ${dirty.length} settings`)
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save'))
    } finally {
      setSaving(false)
    }
  }

  const clear = async (setting: SettingStatus) => {
    const stillInEnv =
      'If the same variable is set in .env, that value applies again. Otherwise the feature turns off.'
    if (!confirm(`Remove the stored ${setting.label}?\n\n${stillInEnv}`)) return

    setClearing(setting.key)
    try {
      setStatus(
        await apiRequest<StatusResponse>(`/api/settings/${setting.key}`, {
          method: 'DELETE',
        })
      )
      toast.success('Removed')
    } catch (error) {
      toast.error(errorMessage(error, 'Could not remove'))
    } finally {
      setClearing(null)
    }
  }

  if (!status) {
    return (
      <div>
        <h1 className={`${PAGE_TITLE} mb-2`}>Settings</h1>
        <p className="text-meta text-foreground-muted">Loading…</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <h1 className={`${PAGE_TITLE} mb-2`}>Settings</h1>
      <p className="mb-6 max-w-measure text-meta text-foreground-muted">
        Configuration that would otherwise mean editing <code className="font-mono">.env</code> on
        the server and restarting. A value saved here overrides the matching
        environment variable and takes effect immediately.
      </p>

      {!status.encryptionAvailable && (
        <div className="mb-6 border border-warning/40 bg-surface p-4">
          <p className="label text-warning">Secrets cannot be stored</p>
          <p className="mt-2 max-w-measure text-meta text-foreground/85">
            {/* Refusing beats writing API keys into Postgres as plain text,
                where they would land in every backup. */}
            <code className="font-mono">SETTINGS_KEY</code> is not set, so there is nothing to
            encrypt secrets with. Add it to <code className="font-mono">.env</code> and restart —
            generate one with <code className="font-mono">openssl rand -hex 32</code>. Fields that
            are not secrets can still be saved.
          </p>
        </div>
      )}

      {GROUPS.map((group) => {
        const items = status.settings.filter((s) => s.group === group.id)
        if (items.length === 0) return null

        return (
          <section key={group.id} className="mb-8">
            <h2 className="label mb-1">{group.title}</h2>
            <p className="mb-4 max-w-measure text-meta text-foreground-subtle">{group.blurb}</p>

            <div className="space-y-4">
              {items.map((setting) => {
                const locked = setting.secret && !status.encryptionAvailable
                return (
                  <div key={setting.key} className={PANEL}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <label htmlFor={setting.key} className={`${LABEL} mb-0`}>
                        {setting.label}
                      </label>
                      <StatusPill setting={setting} />
                    </div>

                    <p className="mt-2 max-w-measure text-meta text-foreground-muted">
                      {setting.help}
                    </p>

                    {setting.danger && (
                      <p className="mt-2 max-w-measure text-meta text-warning">{setting.danger}</p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        id={setting.key}
                        type={setting.secret ? 'password' : 'text'}
                        autoComplete="off"
                        disabled={locked}
                        className={`${setting.secret ? FIELD_MONO : FIELD} flex-1 disabled:opacity-50`}
                        placeholder={
                          locked
                            ? 'Unavailable until SETTINGS_KEY is set'
                            : setting.configured
                              ? 'Enter a new value to replace it'
                              : (setting.placeholder ?? '')
                        }
                        value={drafts[setting.key] ?? ''}
                        onChange={(e) =>
                          setDrafts((prev) => ({ ...prev, [setting.key]: e.target.value }))
                        }
                      />
                      {setting.source === 'database' && (
                        <button
                          type="button"
                          onClick={() => void clear(setting)}
                          disabled={clearing === setting.key}
                          className={BTN_DANGER}
                        >
                          {clearing === setting.key ? 'Removing…' : 'Remove'}
                        </button>
                      )}
                    </div>

                    <p className="mt-2 font-mono text-meta text-foreground-subtle">
                      {/* Naming the variable makes the .env fallback discoverable
                          without reading the README. */}
                      {setting.key}
                      {setting.hint && ` · ${setting.hint}`}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      <div className="sticky bottom-0 -mx-4 border-t border-border bg-background px-4 py-4 lg:mx-0 lg:px-0">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || dirty.length === 0}
            className={BTN}
          >
            {saving ? 'Saving…' : dirty.length > 0 ? `Save ${dirty.length}` : 'Save'}
          </button>
          {dirty.length > 0 && (
            <button type="button" onClick={() => setDrafts({})} className={BTN_GHOST}>
              Discard
            </button>
          )}
          <p className="text-meta text-foreground-subtle">
            Empty fields are left unchanged. Use Remove to fall back to{' '}
            <code className="font-mono">.env</code>.
          </p>
        </div>
      </div>

      <PasswordSection />
    </div>
  )
}

/** Where the effective value comes from — the thing most likely to confuse. */
function StatusPill({ setting }: { setting: SettingStatus }) {
  if (!setting.configured) {
    return <span className="label text-foreground-subtle">Not set</span>
  }
  return (
    <span className={`label ${setting.source === 'database' ? 'text-success' : 'text-foreground-muted'}`}>
      {setting.source === 'database' ? 'Saved here' : 'From .env'}
    </span>
  )
}

/**
 * Changing the administrator password.
 *
 * Its own form and its own endpoint rather than another row above: it writes a
 * bcrypt hash to the User row, not a Setting, and requiring the current
 * password is what stops a borrowed session from becoming permanent control of
 * the account.
 */
function PasswordSection() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirmValue, setConfirmValue] = useState('')
  const [saving, setSaving] = useState(false)

  const mismatch = confirmValue.length > 0 && next !== confirmValue
  const canSubmit = current && next.length >= 12 && next === confirmValue && !saving

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      const result = await apiRequest<{ note?: string }>('/api/settings/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      setCurrent('')
      setNext('')
      setConfirmValue('')
      toast.success(result?.note ?? 'Password updated')
    } catch (error) {
      toast.error(errorMessage(error, 'Could not change the password'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="label mb-1">Account</h2>
      <p className="mb-4 max-w-measure text-meta text-foreground-subtle">
        This dashboard is reachable from the public internet and has no limit on sign-in attempts,
        so the length of this password is what actually protects it.
      </p>

      <form onSubmit={submit} className={`${PANEL} space-y-4`}>
        {/* A username field, hidden but present, so password managers file the
            change against the right account instead of creating a new entry. */}
        <input
          type="text"
          autoComplete="username"
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
          readOnly
          value=""
        />

        <div>
          <label htmlFor="current-password" className={LABEL}>
            Current password
          </label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            className={FIELD}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="new-password" className={LABEL}>
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            className={FIELD}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            aria-describedby="new-password-hint"
          />
          <p id="new-password-hint" className="mt-1 text-meta text-foreground-muted">
            At least 12 characters. {next.length > 0 && next.length < 12 && `${next.length} so far.`}
          </p>
        </div>

        <div>
          <label htmlFor="confirm-password" className={LABEL}>
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            className={FIELD}
            value={confirmValue}
            onChange={(e) => setConfirmValue(e.target.value)}
            aria-invalid={mismatch}
            aria-describedby={mismatch ? 'confirm-error' : undefined}
          />
          {mismatch && (
            <p id="confirm-error" className="mt-1 text-meta text-error">
              These do not match.
            </p>
          )}
        </div>

        <button type="submit" disabled={!canSubmit} className={BTN}>
          {saving ? 'Changing…' : 'Change password'}
        </button>

        <p className="text-meta text-foreground-subtle">
          {/* Sessions are JWTs, so this does not sign anyone out. Better said
              here than discovered later. */}
          Devices already signed in stay signed in until their session expires.
        </p>
      </form>
    </section>
  )
}
