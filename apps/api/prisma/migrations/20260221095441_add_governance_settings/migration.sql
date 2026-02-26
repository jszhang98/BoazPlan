-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Church" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "location" TEXT,
    "privacyMode" TEXT NOT NULL DEFAULT 'open',
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "reportThreshold" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Church" ("createdAt", "id", "location", "name", "privacyMode", "slug", "updatedAt") SELECT "createdAt", "id", "location", "name", "privacyMode", "slug", "updatedAt" FROM "Church";
DROP TABLE "Church";
ALTER TABLE "new_Church" RENAME TO "Church";
CREATE UNIQUE INDEX "Church_slug_key" ON "Church"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
