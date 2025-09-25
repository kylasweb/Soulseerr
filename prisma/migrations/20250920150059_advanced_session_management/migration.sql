-- CreateTable
CREATE TABLE "session_bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT,
    "clientId" TEXT NOT NULL,
    "readerId" TEXT NOT NULL,
    "preferredDates" JSONB NOT NULL,
    "selectedDateTime" DATETIME,
    "duration" INTEGER NOT NULL,
    "sessionType" TEXT NOT NULL,
    "requirements" TEXT,
    "category" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL,
    "bookingSource" TEXT NOT NULL DEFAULT 'PLATFORM',
    "estimatedCost" REAL,
    "finalCost" REAL,
    "proposedTimes" JSONB,
    "rescheduleCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "internalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "session_bookings_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "session_bookings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "session_bookings_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "session_recordings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "recordingUrl" TEXT,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "fileSize" INTEGER,
    "format" TEXT,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "processingLog" JSONB,
    "qualitySettings" JSONB,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT true,
    "accessExpiry" DATETIME,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "session_recordings_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reader_availability_overrides" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "readerId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "isAvailable" BOOLEAN NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reader_availability_overrides_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "session_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "readerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresPrep" BOOLEAN NOT NULL DEFAULT false,
    "prepDuration" INTEGER,
    "sessionType" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL DEFAULT 1,
    "advanceBooking" INTEGER NOT NULL,
    "maxBookings" INTEGER,
    "defaultNotes" TEXT,
    "instructions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "session_templates_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "session_bookings_sessionId_key" ON "session_bookings"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "session_recordings_sessionId_key" ON "session_recordings"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "reader_availability_overrides_readerId_date_startTime_endTime_key" ON "reader_availability_overrides"("readerId", "date", "startTime", "endTime");
