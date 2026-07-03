CREATE TABLE "events" (
	"id" text PRIMARY KEY,
	"organizer" text NOT NULL,
	"name" text,
	"date" text,
	"description" text
);
--> statement-breakpoint
CREATE INDEX "events_organizer_idx" ON "events" ("organizer");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_users_id_fkey" FOREIGN KEY ("organizer") REFERENCES "users"("id");
