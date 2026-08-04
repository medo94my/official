-- Blog posts.
--
-- Additive: no existing table is altered, so this cannot fail against populated
-- data. That matters because docker-entrypoint.sh runs `prisma migrate deploy`
-- on every container start — a failed migration does not fail the deploy, it
-- stops the site coming back.
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT,
    "coverAlt" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "aiDrafted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- Both are routes or upsert keys, so both must be unique.
CREATE UNIQUE INDEX "Post_title_key" ON "Post"("title");
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- Every public read is "published, newest first".
CREATE INDEX "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");
