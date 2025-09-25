-- CreateTable
CREATE TABLE "forum_threads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "forum_threads_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "forum_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "forum_threads_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_forum_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "threadId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "forum_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "forum_posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "forum_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "forum_posts_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "forum_threads" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_forum_posts" ("authorId", "categoryId", "content", "createdAt", "id", "isLocked", "isPinned", "status", "title", "updatedAt", "viewCount") SELECT "authorId", "categoryId", "content", "createdAt", "id", "isLocked", "isPinned", "status", "title", "updatedAt", "viewCount" FROM "forum_posts";
DROP TABLE "forum_posts";
ALTER TABLE "new_forum_posts" RENAME TO "forum_posts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "forum_threads_slug_key" ON "forum_threads"("slug");
