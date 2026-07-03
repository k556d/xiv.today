CREATE TABLE "auth_accounts" (
	"user_id" text NOT NULL,
	"provider" text,
	"provider_account_id" text,
	CONSTRAINT "auth_accounts_pkey" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "auth_accounts_user_id_provider_unique" ON "auth_accounts" ("user_id","provider");--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;