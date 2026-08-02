-- Application settings, editable from the admin dashboard.
--
-- Additive and standalone: no existing table is touched, so this cannot fail
-- against populated data. That matters more than usual here because
-- docker-entrypoint.sh runs `prisma migrate deploy` on every container start —
-- a failed migration does not fail the deploy, it stops the site coming back.
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "encrypted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);
