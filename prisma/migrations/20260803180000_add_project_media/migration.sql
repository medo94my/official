-- Gallery images and short silent clips for a project.
--
-- Additive: no existing table is altered and no existing column changes, so
-- this cannot fail against populated data. That matters more than usual because
-- docker-entrypoint.sh runs `prisma migrate deploy` on every container start —
-- a failed migration does not fail the deploy, it stops the site coming back.
--
-- Project.image is deliberately left alone. It remains the single cover image;
-- this table is the gallery beside it.
CREATE TABLE "ProjectMedia" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "poster" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMedia_pkey" PRIMARY KEY ("id")
);

-- Every read is "the media for this project, in order".
CREATE INDEX "ProjectMedia_projectId_order_idx" ON "ProjectMedia"("projectId", "order");

-- ON DELETE CASCADE, so removing a project cannot leave rows pointing at files
-- that nothing then knows to unlink.
ALTER TABLE "ProjectMedia"
    ADD CONSTRAINT "ProjectMedia_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
