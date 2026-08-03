CREATE TABLE "linked_accounts" (
	"user_id" text NOT NULL,
	"provider" text,
	"provider_account_id" text,
	"display_name" text NOT NULL,
	"avatar_url" text NOT NULL,
	CONSTRAINT "linked_accounts_pkey" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "linked_accounts_user_id_provider_unique" ON "linked_accounts" ("user_id","provider");--> statement-breakpoint
ALTER TABLE "linked_accounts" ADD CONSTRAINT "linked_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;