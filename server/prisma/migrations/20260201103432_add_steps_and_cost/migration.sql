-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workoutDone" BOOLEAN NOT NULL DEFAULT false,
    "dietFollowed" BOOLEAN NOT NULL DEFAULT false,
    "waterIntake" INTEGER NOT NULL DEFAULT 0,
    "sleepHours" REAL NOT NULL DEFAULT 0,
    "steps" INTEGER NOT NULL DEFAULT 0,
    "dietCost" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DailyLog" ("date", "dietFollowed", "id", "sleepHours", "userId", "waterIntake", "workoutDone") SELECT "date", "dietFollowed", "id", "sleepHours", "userId", "waterIntake", "workoutDone" FROM "DailyLog";
DROP TABLE "DailyLog";
ALTER TABLE "new_DailyLog" RENAME TO "DailyLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
