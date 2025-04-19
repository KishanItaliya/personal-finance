-- AlterTable
ALTER TABLE "users" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'en-IN',
ALTER COLUMN "currencyPreference" SET DEFAULT 'INR';
