-- CreateTable: Global User model replacing isolated Participant model
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique email
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateTable: Implicit many-to-many join table for Group <-> User
-- Prisma convention: _<RelationName>, A = Group (alphabetically first), B = User
CREATE TABLE "_GroupParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GroupParticipants_AB_unique" ON "_GroupParticipants"("A", "B");
CREATE INDEX "_GroupParticipants_B_index" ON "_GroupParticipants"("B");

-- Migrate data: copy all Participants into User (same IDs, same names)
INSERT INTO "User" ("id", "name")
SELECT "id", "name" FROM "Participant";

-- Migrate data: create group memberships from Participant.groupId
INSERT INTO "_GroupParticipants" ("A", "B")
SELECT "groupId", "id" FROM "Participant";

-- Drop old FK on Expense (referencing Participant)
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_paidById_fkey";

-- Drop old FK on ExpensePaidFor (referencing Participant)
ALTER TABLE "ExpensePaidFor" DROP CONSTRAINT "ExpensePaidFor_participantId_fkey";

-- Add new FK on Expense referencing User (same IDs, data unchanged)
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_paidById_fkey"
    FOREIGN KEY ("paidById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add new FK on ExpensePaidFor referencing User (same IDs, data unchanged)
ALTER TABLE "ExpensePaidFor" ADD CONSTRAINT "ExpensePaidFor_participantId_fkey"
    FOREIGN KEY ("participantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add FKs for the join table
ALTER TABLE "_GroupParticipants" ADD CONSTRAINT "_GroupParticipants_A_fkey"
    FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_GroupParticipants" ADD CONSTRAINT "_GroupParticipants_B_fkey"
    FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old Participant table (data migrated to User + _GroupParticipants)
DROP TABLE "Participant";
