-- CreateTable
CREATE TABLE "content_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "content_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "content_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "content_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "type" TEXT NOT NULL DEFAULT 'ARTICLE',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "tags" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "content_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "content_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "content_items_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "content_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "contentBody" TEXT NOT NULL,
    "excerpt" TEXT,
    "changeLog" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "content_versions_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "content_versions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "content_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "content_comments_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "content_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "content_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "content_comments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "content_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "timeOnPage" INTEGER NOT NULL DEFAULT 0,
    "bounceRate" REAL NOT NULL DEFAULT 0,
    "organicViews" INTEGER NOT NULL DEFAULT 0,
    "directViews" INTEGER NOT NULL DEFAULT 0,
    "referralViews" INTEGER NOT NULL DEFAULT 0,
    "socialViews" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "content_analytics_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "knowledge_bases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "notHelpful" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "knowledge_bases_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "content_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "knowledge_bases_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "knowledge_sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "knowledgeBaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "knowledge_sections_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "knowledge_bases" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "content_categories_slug_key" ON "content_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "content_items_slug_key" ON "content_items"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "content_versions_contentId_versionNumber_key" ON "content_versions"("contentId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "content_analytics_contentId_date_key" ON "content_analytics"("contentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_bases_slug_key" ON "knowledge_bases"("slug");
