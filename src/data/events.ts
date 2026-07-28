import conference from "@/assets/event-conference.jpg";
import meetup from "@/assets/event-meetup.jpg";
import webinar from "@/assets/event-webinar.jpg";
import summit from "@/assets/event-summit.jpg";

export type AffiliateEvent = {
  /** URL slug, used as the route param. */
  id: string;
  name: string;
  date: string;
  isoDate: string;
  dateLabel: { day: string; month: string };
  location: string;
  format: string;
  price: string;
  description: string;
  imageKey: string;
  imageUrl: string | null;
  /** Official event site, when there is one. */
  url?: string;
  featured: boolean;
};

const covers: Record<string, string> = { conference, meetup, webinar, summit };

export function eventImage(event: Pick<AffiliateEvent, "imageKey" | "imageUrl">): string {
  return event.imageUrl || covers[event.imageKey] || conference;
}
