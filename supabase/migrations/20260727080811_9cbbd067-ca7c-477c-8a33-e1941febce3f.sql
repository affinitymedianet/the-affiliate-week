CREATE TABLE public.deals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  vendor text NOT NULL,
  category text NOT NULL DEFAULT 'Software',
  deal_type text NOT NULL DEFAULT 'Discount',
  discount_label text,
  summary text NOT NULL,
  description text NOT NULL,
  coupon_code text,
  deal_url text NOT NULL,
  exclusive boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  starts_on date NOT NULL DEFAULT CURRENT_DATE,
  expires_on date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.deals TO anon;
GRANT SELECT ON public.deals TO authenticated;
GRANT ALL ON public.deals TO service_role;

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published deals are publicly readable"
ON public.deals FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE TRIGGER update_deals_updated_at
BEFORE UPDATE ON public.deals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.deals (title, vendor, category, deal_type, discount_label, summary, description, coupon_code, deal_url, exclusive, featured, expires_on) VALUES
('30% off your first 3 months of affiliate tracking', 'Voluum', 'Tracking', 'Discount', '30% off', 'Cloud-based tracker for paid media and affiliate campaigns, discounted for The Affiliate Week readers.', 'Voluum is one of the most widely used cloud trackers in performance marketing, with automated traffic distribution, anti-fraud reporting and click-level attribution. This deal takes 30% off any plan for the first three months, which covers most solo affiliates through their testing phase. Apply the code at checkout on a new account only.', 'AFFILIATEX30', 'https://voluum.com/', true, true, '2026-12-31'),
('50% off residential proxy bandwidth', 'Bright Data', 'Proxies', 'Discount', '50% off', 'Half-price residential bandwidth on your first top-up — useful for offer and SERP verification.', 'Bright Data runs one of the largest ethically sourced residential proxy pools, with city-level and ASN targeting. Affiliates use it for geo-checking landing pages, verifying cloaked offers and monitoring competitor funnels. This deal matches your first bandwidth top-up up to a set cap, effectively halving the cost of your first month.', NULL, 'https://brightdata.com/', false, true, NULL),
('$100 credit on rotating datacenter proxies', 'Smartproxy', 'Proxies', 'Credit', '$100 credit', 'A starter credit on rotating datacenter proxies for large-scale link and offer checks.', 'Datacenter proxies are the cheapest way to run high-volume link checks, ad compliance scans and rank tracking. Smartproxy gives new accounts a credit that covers roughly a month of light scraping for most solo operators. Credit applies to datacenter plans only and expires 60 days after signup.', 'AFFX100', 'https://smartproxy.com/', false, false, '2026-10-31'),
('Lifetime deal on landing page builder', 'Landingi', 'Software', 'Lifetime', 'Lifetime access', 'One-time payment for an affiliate-friendly page builder with unlimited landers.', 'A lifetime licence covering unlimited published landing pages, A/B testing and popups, with no monthly fee. This is a good fit if you run a stable set of offers and do not want another recurring SaaS bill. Support and template updates are included for the life of the plan.', NULL, 'https://landingi.com/', false, false, NULL),
('3 months free on the Pro SEO suite', 'Ahrefs', 'Tools', 'Free trial', '3 months free', 'Extended access to keyword, backlink and content gap research for content affiliates.', 'Ahrefs remains the default keyword and backlink research tool for content-led affiliate sites. This promotion adds three months to an annual Pro plan, which works out to roughly a 25% saving. New customers only; existing subscribers can apply it at renewal by contacting support.', NULL, 'https://ahrefs.com/', false, true, '2026-09-30'),
('40% off your first year of email infrastructure', 'Beehiiv', 'Software', 'Discount', '40% off', 'Newsletter platform with built-in ad network and referral programme, discounted for a year.', 'If you monetise an audience by email, Beehiiv bundles sending, segmentation, a referral programme and a sponsorship marketplace into one product. This code takes 40% off the first twelve months on any paid tier. Applies to new workspaces only.', 'AFFILIATEX40', 'https://beehiiv.com/', true, false, '2026-11-30'),
('20% off link cloaking and management', 'ThirstyAffiliates', 'Tools', 'Discount', '20% off', 'Cloak, categorise and auto-link affiliate URLs across a WordPress site.', 'ThirstyAffiliates keeps affiliate links tidy, cloaked and easy to swap when a programme changes network. The Pro tier adds automatic keyword linking, geolocation redirects and click reporting. Discount applies to first-year licences on all site tiers.', 'AFFX20', 'https://thirstyaffiliates.com/', false, false, NULL),
('Free tier extended to 25k monthly clicks', 'RedTrack', 'Tracking', 'Free trial', 'Extended free tier', 'A larger free allowance while you validate your first campaigns.', 'RedTrack is a conversion tracker and attribution tool used across affiliate, agency and e-commerce setups. Instead of the standard trial, The Affiliate Week readers get an extended allowance of 25,000 tracked clicks per month for the first 90 days, which is enough to validate several offers before committing.', NULL, 'https://redtrack.io/', true, false, '2026-12-15'),
('35% off managed WordPress hosting', 'Cloudways', 'Hosting', 'Discount', '35% off', 'Fast managed hosting for review and comparison sites, discounted for three months.', 'Cloudways runs managed WordPress on top of DigitalOcean, Vultr and AWS, which suits affiliate sites that outgrow shared hosting but do not want to manage servers. The code takes 35% off for three months on any plan, plus free migration of an existing site.', 'AFFX35', 'https://cloudways.com/', false, false, NULL),
('Half price on the affiliate manager certification', 'Affiverse Academy', 'Education', 'Discount', '50% off', 'Structured training for in-house affiliate and partnerships managers.', 'A self-paced certification covering programme setup, partner recruitment, compliance and payout modelling. Useful if you are moving from affiliate to the network or in-house side of the industry. The discount applies to the full certification bundle, not individual modules.', 'AFFILIATEX50', 'https://affiverse.com/', false, false, '2026-08-31');