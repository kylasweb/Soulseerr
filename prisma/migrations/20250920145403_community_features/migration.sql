/*
  Warnings:

  - You are about to drop the `gifts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `sortOrder` on the `forum_categories` table. All the data in the column will be lost.
  - You are about to drop the column `animationUrl` on the `virtual_gifts` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `virtual_gifts` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `virtual_gifts` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `virtual_gifts` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `virtual_gifts` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `virtual_gifts` table. All the data in the column will be lost.
  - Added the required column `slug` to the `forum_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `giftType` to the `virtual_gifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `virtual_gifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `virtual_gifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalValue` to the `virtual_gifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `virtual_gifts` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "gifts";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "forum_post_likes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "forum_post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "forum_post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_forum_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "postCount" INTEGER NOT NULL DEFAULT 0,
    "lastPostId" TEXT,
    "lastPostAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "forum_categories_lastPostId_fkey" FOREIGN KEY ("lastPostId") REFERENCES "forum_posts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_forum_categories" ("createdAt", "description", "icon", "id", "name", "updatedAt") SELECT "createdAt", "description", "icon", "id", "name", "updatedAt" FROM "forum_categories";
DROP TABLE "forum_categories";
ALTER TABLE "new_forum_categories" RENAME TO "forum_categories";
CREATE UNIQUE INDEX "forum_categories_slug_key" ON "forum_categories"("slug");
CREATE UNIQUE INDEX "forum_categories_lastPostId_key" ON "forum_categories"("lastPostId");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "firebaseUid" TEXT,
    "displayName" TEXT,
    "avatar" TEXT,
    "profileImageUrl" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'EMAIL',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "coinBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("avatar", "createdAt", "displayName", "email", "emailVerified", "firebaseUid", "id", "passwordHash", "provider", "role", "status", "updatedAt", "username") SELECT "avatar", "createdAt", "displayName", "email", "emailVerified", "firebaseUid", "id", "passwordHash", "provider", "role", "status", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_firebaseUid_key" ON "users"("firebaseUid");
CREATE TABLE "new_virtual_gifts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "giftType" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalValue" INTEGER NOT NULL,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "virtual_gifts_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "virtual_gifts_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_virtual_gifts" ("createdAt", "id") SELECT "createdAt", "id" FROM "virtual_gifts";
DROP TABLE "virtual_gifts";
ALTER TABLE "new_virtual_gifts" RENAME TO "virtual_gifts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "forum_post_likes_userId_postId_key" ON "forum_post_likes"("userId", "postId");
