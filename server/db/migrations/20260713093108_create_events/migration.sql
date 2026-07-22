CREATE TABLE "events" (
	"id" text PRIMARY KEY,
	"organizer_id" text NOT NULL,
	"name" text,
	"date" text,
	"description" text
);
--> statement-breakpoint
CREATE INDEX "events_organizer_id_idx" ON "events" ("organizer_id");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "characters"("id");