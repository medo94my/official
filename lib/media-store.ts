import { mkdir, unlink } from 'fs/promises'
import { join } from 'path'

/**
 * Where uploaded media lives on disk.
 *
 * **Not under `public/`.** Next's standalone server fixes the public directory
 * at build time and will not serve anything added afterwards — verified against
 * the running container — so putting uploads there would look right and quietly
 * 404. They are served by `app/media/[name]/route.ts` instead, and living
 * outside `public/` keeps that fact obvious to the next reader.
 *
 * A Docker *named volume* rather than a bind mount, because the container runs
 * as uid 1001 while the host directory would be owned by uid 1000, and there is
 * no `setfacl` here to bridge that without root. Docker seeds a named volume
 * from the image path including its ownership, so writes work with no host-side
 * permission setup at all.
 *
 * The trade-off is that `docker compose down -v` destroys it. See the README.
 */
export const MEDIA_DIR = process.env.MEDIA_DIR ?? join(process.cwd(), 'media')

/** Created on demand: the volume is empty on a first deploy. */
export async function ensureMediaDir() {
  await mkdir(MEDIA_DIR, { recursive: true })
}

/**
 * Removes a stored file, given the site-relative URL held in the database.
 *
 * A missing file is success, not an error. Otherwise a row whose file was
 * already removed can never be deleted, and the owner is stuck with a broken
 * gallery entry and no way to clear it from the UI.
 */
export async function removeMediaFile(url: string | null | undefined) {
  const name = url?.startsWith('/media/') ? url.slice('/media/'.length) : null
  if (!name || name.includes('/')) return

  try {
    await unlink(join(MEDIA_DIR, name))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('[media] could not remove', name, error)
    }
  }
}
