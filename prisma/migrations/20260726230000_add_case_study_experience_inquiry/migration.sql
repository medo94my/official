-- AlterTable
ALTER TABLE "Hero" ADD COLUMN     "valueProp" TEXT;

-- AlterTable
-- Case-study columns. All nullable, so the existing rows absorb them
-- untouched and every consumer treats "empty" as "no case study".
ALTER TABLE "Project" ADD COLUMN     "approach" TEXT,
ADD COLUMN     "audience" TEXT,
ADD COLUMN     "caseStudyUrl" TEXT,
ADD COLUMN     "challenges" TEXT,
ADD COLUMN     "constraints" TEXT,
ADD COLUMN     "context" TEXT,
ADD COLUMN     "keyDecisions" TEXT,
ADD COLUMN     "lessons" TEXT,
ADD COLUMN     "myRole" TEXT,
ADD COLUMN     "outcome" TEXT,
ADD COLUMN     "problem" TEXT,
ADD COLUMN     "responsibilities" TEXT,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "tradeoffs" TEXT;

-- ─────────────────────────────────────────────────────────────────────────
-- Project.slug — hand-written, three steps.
--
-- Prisma scaffolds this as a single `ADD COLUMN "slug" TEXT NOT NULL`, which
-- cannot run against a populated table and aborts the migration. Because
-- docker-entrypoint.sh runs `prisma migrate deploy` on every container start,
-- an aborted migration means the container never starts — the site goes down,
-- not just the deploy. So: add it nullable, backfill, then constrain.
--
-- The expression must stay character-for-character equivalent to slugify() in
-- lib/slug.ts, or slugs created by the admin will diverge from seeded ones.
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE "Project" ADD COLUMN "slug" TEXT;

UPDATE "Project"
SET "slug" = trim(BOTH '-' FROM regexp_replace(
  regexp_replace(lower("title"), '[^a-z0-9]+', '-', 'g'),
  '-{2,}', '-', 'g'
))
WHERE "slug" IS NULL;

ALTER TABLE "Project" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "audience" TEXT,
ADD COLUMN     "deliverables" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "engagement" TEXT,
ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'service';

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "location" TEXT,
    "summary" TEXT,
    "highlights" TEXT,
    "url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "reason" TEXT,
    "projectType" TEXT,
    "budget" TEXT,
    "timeline" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "readAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "notes" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Experience_company_role_startDate_key" ON "Experience"("company", "role", "startDate");

-- CreateIndex
CREATE INDEX "Inquiry_status_createdAt_idx" ON "Inquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Inquiry_ipHash_createdAt_idx" ON "Inquiry"("ipHash", "createdAt");

-- CreateIndex
-- Runs after the backfill above, so it sees 7 distinct values rather than 7 nulls.
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_featured_order_idx" ON "Project"("featured", "order");

-- CreateIndex
CREATE INDEX "Service_kind_order_idx" ON "Service"("kind", "order");
