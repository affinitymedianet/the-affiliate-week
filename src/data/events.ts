import conference from "@/assets/event-conference.jpg";
import meetup from "@/assets/event-meetup.jpg";
import webinar from "@/assets/event-webinar.jpg";
import summit from "@/assets/event-summit.jpg";

export type AffiliateEvent = {
  id: string;
  name: string;
  date: string;
  dateLabel: { day: string; month: string };
  location: string;
  format: "Conference" | "Meetup" | "Webinar" | "Summit";
  price: string;
  description: string;
  image: string;
  url: string;
};

export const events: AffiliateEvent[] = [
  {
    id: "affiliate-summit-west",
    name: "Affiliate Summit West",
    date: "15 March 2027",
    dateLabel: { day: "15", month: "Mar" },
    location: "Las Vegas, USA",
    format: "Conference",
    price: "From $499",
    description:
      "The largest gathering of affiliates, networks and advertisers, with three days of partnership deal-making.",
    image: conference,
    url: "#",
  },
  {
    id: "performance-marketing-meetup",
    name: "Performance Marketing Meetup",
    date: "20 March 2027",
    dateLabel: { day: "20", month: "Mar" },
    location: "London, UK",
    format: "Meetup",
    price: "Free",
    description:
      "An evening of drinks and candid conversation with UK affiliate managers and publishers.",
    image: meetup,
    url: "#",
  },
  {
    id: "media-buyers-workshop",
    name: "Media Buyers Workshop",
    date: "28 March 2027",
    dateLabel: { day: "28", month: "Mar" },
    location: "Online",
    format: "Webinar",
    price: "Free",
    description:
      "A hands-on session on scaling paid traffic to affiliate offers without burning creative.",
    image: webinar,
    url: "#",
  },
  {
    id: "partnership-growth-summit",
    name: "Partnership Growth Summit",
    date: "11 April 2027",
    dateLabel: { day: "11", month: "Apr" },
    location: "Berlin, Germany",
    format: "Summit",
    price: "From €350",
    description:
      "Strategy-led talks on building partner programmes that survive tighter attribution rules.",
    image: summit,
    url: "#",
  },
  {
    id: "affiliate-world-europe",
    name: "Affiliate World Europe",
    date: "3 May 2027",
    dateLabel: { day: "03", month: "May" },
    location: "Barcelona, Spain",
    format: "Conference",
    price: "From €690",
    description:
      "Global networks, e-commerce brands and super-affiliates under one roof for two intense days.",
    image: conference,
    url: "#",
  },
  {
    id: "creator-affiliate-mixer",
    name: "Creator x Affiliate Mixer",
    date: "19 May 2027",
    dateLabel: { day: "19", month: "May" },
    location: "New York, USA",
    format: "Meetup",
    price: "$25",
    description:
      "Where creator-led commerce meets classic affiliate: an informal mixer for both sides of the deal.",
    image: meetup,
    url: "#",
  },
  {
    id: "seo-affiliate-clinic",
    name: "SEO for Affiliates Clinic",
    date: "2 June 2027",
    dateLabel: { day: "02", month: "Jun" },
    location: "Online",
    format: "Webinar",
    price: "Free",
    description:
      "A live teardown of affiliate sites, covering what still ranks after the latest core updates.",
    image: webinar,
    url: "#",
  },
  {
    id: "apac-partner-summit",
    name: "APAC Partner Summit",
    date: "24 June 2027",
    dateLabel: { day: "24", month: "Jun" },
    location: "Singapore",
    format: "Summit",
    price: "From $420",
    description:
      "Regional networks and advertisers on what is actually converting across Southeast Asia.",
    image: summit,
    url: "#",
  },
];
