import { db } from "./index";

export function findEventsWithOrganizer() {
  return db.query.events.findMany({
    with: {
      organizer: true,
    },
  });
}
