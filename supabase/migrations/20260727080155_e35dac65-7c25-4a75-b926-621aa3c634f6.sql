CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  work_type text NOT NULL DEFAULT 'Remote',
  employment_type text NOT NULL DEFAULT 'Full-time',
  salary_range text,
  summary text NOT NULL,
  description text NOT NULL,
  apply_url text NOT NULL,
  posted_on date NOT NULL DEFAULT current_date,
  expires_on date,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.jobs TO anon;
GRANT SELECT ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published jobs are publicly readable"
ON public.jobs FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.jobs (title, company, location, work_type, employment_type, salary_range, summary, description, apply_url, posted_on, featured) VALUES
('Affiliate Marketing Manager', 'Northlane Commerce', 'London, UK', 'Hybrid', 'Full-time', '£55,000 – £70,000',
 'Own a seven-figure affiliate programme for a fast-growing DTC retailer.',
 E'Northlane Commerce is hiring an Affiliate Marketing Manager to own our partner programme end to end.\n\nWhat you will do:\n- Manage and grow relationships with content, coupon and loyalty partners\n- Own commission structures, tiering and partner payouts\n- Recruit new publishers in home, lifestyle and gifting verticals\n- Report weekly on revenue, EPC and incrementality to the Head of Growth\n\nWhat we look for:\n- 3+ years managing an affiliate programme on a major network\n- Comfortable negotiating rates and placements directly with publishers\n- Strong spreadsheet and reporting skills\n\nWe work hybrid, three days a week in our London office.',
 'https://example.com/jobs/affiliate-marketing-manager', current_date - 2, true),
('Partnerships Lead', 'Fernwood Fintech', 'Remote (EU timezones)', 'Remote', 'Full-time', '€70,000 – €90,000',
 'First partnerships hire at a Series A fintech, with budget to build the channel.',
 E'Fernwood is building its partnerships channel from scratch and you would be the first hire.\n\nResponsibilities:\n- Define the partner strategy across affiliates, comparison sites and referral partners\n- Sign and onboard the first 25 partners\n- Work with legal and compliance on partner terms in regulated markets\n- Build the tracking and attribution stack with our data team\n\nRequirements:\n- Experience launching a partnerships or affiliate channel, ideally in fintech\n- Familiarity with regulated financial promotions\n- Fully remote within EU timezones',
 'https://example.com/jobs/partnerships-lead', current_date - 5, true),
('Performance Marketing Specialist', 'Halcyon Media', 'Remote (Worldwide)', 'Remote', 'Full-time', '$60,000 – $85,000',
 'Scale paid traffic to affiliate offers across native, social and search.',
 E'Halcyon Media runs a portfolio of comparison and review properties. We are looking for a performance marketer to scale paid acquisition profitably.\n\nYou will:\n- Plan, launch and optimise campaigns across Meta, native networks and Google\n- Build creative testing frameworks with our design team\n- Own payback and ROAS targets per offer\n\nYou should have:\n- 2+ years buying media against affiliate or lead-gen offers\n- Comfort with tracking platforms and postback setups\n- A bias for testing over theorising',
 'https://example.com/jobs/performance-marketing-specialist', current_date - 7, false),
('SEO Content Strategist', 'Brightpath Publishing', 'Manchester, UK', 'Hybrid', 'Full-time', '£42,000 – £52,000',
 'Plan and edit affiliate content for a portfolio of review sites.',
 E'You will own the editorial roadmap for three affiliate review sites in the tech and outdoor verticals.\n\nThe role:\n- Keyword research and content planning at scale\n- Briefing and editing freelance writers\n- Refreshing evergreen comparison pages to hold rankings\n- Working with the affiliate team on monetisation of new content\n\nWe want someone who has grown affiliate content traffic through at least one major algorithm update.',
 'https://example.com/jobs/seo-content-strategist', current_date - 9, false),
('Affiliate Programme Executive', 'Cove Retail Group', 'Dublin, Ireland', 'Onsite', 'Full-time', '€38,000 – €45,000',
 'Entry-level route into affiliate marketing with a large retail group.',
 E'A great first or second role in affiliate marketing.\n\nDay to day you will:\n- Handle partner queries and application approvals\n- Load offers, creatives and deals into the network\n- Prepare monthly performance reports\n- Support the Affiliate Manager on partner outreach\n\nNo agency experience required, but you should be numerate, organised and genuinely interested in performance marketing.',
 'https://example.com/jobs/affiliate-programme-executive', current_date - 12, false),
('Freelance Affiliate Consultant', 'Various clients (via The Affiliate Week)', 'Remote (Worldwide)', 'Remote', 'Contract', '$500 – $900 / day',
 'Short engagements auditing and relaunching affiliate programmes.',
 E'We regularly hear from brands looking for a consultant to audit an underperforming affiliate programme.\n\nTypical engagements:\n- Two to six weeks\n- Programme audit, partner mix review and commission redesign\n- Handover documentation and a 90-day plan\n\nYou need a track record of running programmes at scale and references we can check.',
 'https://example.com/jobs/freelance-affiliate-consultant', current_date - 14, false),
('Head of Partnerships', 'Meridian SaaS', 'New York, USA', 'Hybrid', 'Full-time', '$140,000 – $175,000',
 'Lead a team of four across affiliate, referral and reseller partnerships.',
 E'Meridian is scaling its partner-sourced revenue and needs a leader for the channel.\n\nScope:\n- Team of four across affiliate, referral and reseller motions\n- Full ownership of partner-sourced pipeline and revenue targets\n- Board-level reporting on channel contribution\n- Partner tooling and attribution roadmap\n\nWe expect experience leading partnerships in B2B SaaS with recurring commission models.',
 'https://example.com/jobs/head-of-partnerships', current_date - 3, false);