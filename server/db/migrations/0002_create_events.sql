CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"organizer" text NOT NULL,
	"name" text,
	"date" text,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_users_id_fk" FOREIGN KEY ("organizer") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "events_organizer_idx" ON "events" USING btree ("organizer");
