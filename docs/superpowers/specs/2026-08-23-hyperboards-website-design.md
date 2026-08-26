# Hyperboards Standalone Website Design Specification

**Status:** Approved for implementation  
**Date:** 2026-08-23  
**Project root:** `C:\)(DOT MAPPERS PROJECTS\HYPERBOARDS WEBSITE`

## 1. Product definition

Hyperboards is presented as a family-office-style direct acquirer of established, profitable U.S. businesses. The website is not an EdTech resource, M&A course provider, forum, broker, investment bank, or transaction adviser.

The primary visitor is a business owner who is considering a sale now or may consider one later. The primary business outcome is a qualified, confidential owner conversation. Investor relationships are a real but deliberately secondary audience.

## 2. Positioning

### Core proposition

> A thoughtful next chapter for the business you built.

### Supporting proposition

Hyperboards acquires established, profitable businesses and works directly with owners on confidential, carefully structured transitions.

### Brand attributes

- Direct, patient, and discreet
- Capable without sounding institutional or inflated
- Respectful of employees, customers, and owner legacy
- Clear about criteria and process
- Entrepreneurial and operationally grounded

## 3. Audiences and goals

### Primary: business owners

Owners should understand within seconds that Hyperboards is a buyer, see whether their business broadly fits, feel their confidentiality and legacy concerns are understood, and know how to start a low-pressure conversation.

### Secondary: intermediaries and referral partners

They should be able to confirm the acquisition profile and submit an opportunity without encountering a separate broker-first experience.

### Tertiary: capital partners

They should find a restrained explanation of relationship-driven co-investment opportunities through a footer-level page. Investor content must never compete with the seller journey.

## 4. Approved acquisition profile

- EBITDA: **$750,000-$2 million**
- Typical deal value: **$2-$6 million**, depending on business quality and valuation multiple
- Public identity: **family office / direct buyer**
- Funding or assets-under-management figures: **do not disclose**
- Transaction experience: the phrase **“Our team has handled transactions ranging from $2-$7 million”** may appear only after the manager confirms that it is factually supportable and clarifies the team’s role. Until then, it remains an explicitly hidden placeholder.

### Target sectors

1. Building & Construction — repeat commercial and trade demand
2. Communication & Media — contracted or recurring client relationships
3. Entertainment & Recreation — membership and recurring-use models
4. Financial Services — recurring revenue and transferable books of business
5. Health Care & Fitness — recurring demand and defensive service characteristics
6. Manufacturing — established customer relationships and tangible assets
7. Online & Technology — scalable operations and attractive margins
8. Service Businesses — fragmented markets with consolidation potential
9. Wholesale & Distributors — recurring B2B demand and supplier relationships

Sector inclusion does not imply automatic fit. Every opportunity must meet the acquisition and underwriting criteria.

### Current exclusions

Agriculture; automotive and boats; beauty and personal care; education and children; pet services; restaurants and food; retail; transportation and storage; travel.

## 5. Information architecture

### Primary navigation

- Home
- What We Acquire
- For Business Owners
- Our Approach
- About
- Contact

### Secondary/footer navigation

- Investor Relationships
- Privacy
- Terms

### Page responsibilities

- **Home:** communicate buyer identity, criteria, seller empathy, approach, process, sectors, FAQs, and conversion.
- **What We Acquire:** make the buy box precise and self-qualifying without sounding formulaic.
- **For Business Owners:** address motivations, confidentiality, transition choices, legacy, employees, timing, and first-contact expectations.
- **Our Approach:** explain the acquisition journey from introduction through close and stewardship.
- **About:** explain the Hyperboards philosophy and operating principles without unsupported biography or track-record claims.
- **Contact:** offer a secure, low-friction owner/referrer inquiry path.
- **Investor Relationships:** quietly invite aligned capital relationships without fund claims or public fundraising language.

## 6. Homepage narrative

1. Hero: direct-buyer identity, emotional proposition, confidential CTA
2. Acquisition-profile strip: EBITDA, deal value, buyer type, geography
3. Seller context: a sale is personal, not merely financial
4. Why Hyperboards: direct relationship, discretion, flexibility, continuity
5. What we acquire: nine-sector index plus qualification principles
6. Process: five clear stages from conversation to stewardship
7. Stewardship: continuity for people, customers, and the business
8. Investor relationships: one restrained secondary mention
9. FAQ: resolve common owner objections
10. Confidential inquiry: concise, accessible conversion form

## 7. Voice and claims policy

### Voice

- Use plain, composed language and short sentences.
- Address the owner directly.
- Prefer “conversation,” “transition,” and “next chapter” over aggressive deal terminology.
- Be specific about criteria and intentionally modest about unverified experience.

### Prohibited unless verified

- Completed acquisition counts
- Assets under management or committed-capital figures
- “Permanent capital” or “we never sell” promises
- Guaranteed closing timelines or valuations
- Named team credentials, portfolio companies, or testimonials
- Claims that Hyperboards itself completed earlier team transactions

## 8. Visual direction: Quiet Stewardship

The site should feel like an understated, modern family office with an operator’s understanding of real businesses. It should not resemble a generic private-equity template.

### Palette

- Midnight: `#0B1B36`
- Deep navy: `#132A4A`
- Warm paper: `#F3EFE6`
- Soft white: `#FBFAF6`
- Brass: `#C7A85B`
- Slate: `#536276`
- Forest: `#27483D`
- Error: `#A13A32`

### Typography

- Display/editorial: Newsreader Variable
- Interface/body: Instrument Sans Variable
- Data labels: IBM Plex Mono

### Composition

- Editorial asymmetry rather than repetitive card grids
- Generous negative space and deliberate section rhythm
- Fine rules, subtle borders, large numerical markers, and quiet texture
- Abstract operational landscapes and line-work instead of handshakes, stock charts, skyscrapers, luxury imagery, or anonymous boardrooms
- Motion limited to meaningful reveals, navigation feedback, and reduced-motion-safe micro-interactions

## 9. Conversion design

### Primary CTA

**Start a confidential conversation**

### Form fields

- Full name
- Email
- Phone (optional)
- Company name
- Company website (optional)
- Industry
- Approximate EBITDA range
- Headquarters / location
- Role (owner, adviser, other)
- Message
- Confidentiality acknowledgement
- Hidden honeypot field

The server endpoint must validate and sanitize inputs, enforce a size limit, use basic rate limiting, and forward to a configured private webhook. If the webhook is not configured, the UI must report that submission is temporarily unavailable rather than falsely confirm delivery.

## 10. Technical architecture

- Astro with TypeScript and Node server output
- Component-level CSS plus a global token system
- Semantic HTML and progressive enhancement
- Minimal client JavaScript
- Server-side contact endpoint with schema validation and webhook forwarding
- Static metadata, Open Graph tags, canonical URLs, sitemap, and robots directives
- Responsive behavior from 320px through wide desktop
- WCAG 2.2 AA-aligned focus, contrast, landmarks, labels, errors, and reduced motion
- No CMS in the initial release; structured content lives in typed local data

## 11. Acceptance criteria

- A first-time visitor identifies Hyperboards as a direct business buyer within five seconds.
- Seller content dominates every primary route; investors are visually and structurally secondary.
- All approved ranges and sectors are accurate and exclusions are visible.
- No unsupported transaction, capital, portfolio, permanence, team, or testimonial claims are published.
- The inquiry flow is keyboard accessible and honest about delivery status.
- The site works at mobile, tablet, laptop, and wide-desktop widths.
- The project builds cleanly and its critical pages, links, metadata, API validation, and interactions are verified.
