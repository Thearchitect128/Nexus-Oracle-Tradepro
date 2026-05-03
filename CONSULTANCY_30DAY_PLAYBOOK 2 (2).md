# MSY Protocol Consultancy: 30-Day Launch Playbook

## Overview

You have three production-ready assets. This playbook tells you exactly what to do with them—in order—to land your first client in 30 days.

**Target**: 1-2 qualified calls per week → 1 engagement signed by day 45.

---

## Week 1: Foundation & Launch

### Day 1-2: Deploy the Landing Page

```
Goal: Get your sales site live and discoverable.

Tasks:
[ ] Deploy Consultancy_Landing.jsx to Vercel or Netlify
[ ] Set up custom domain (e.g., deterministic.systems or msy-protocol.com)
[ ] Configure email forwarding (hello@youromain.com → your email)
[ ] Add Google Analytics
[ ] Set up scheduling link (Calendly or similar) in the CTA button
[ ] Add to GitHub profile and LinkedIn

Time: 2-3 hours
```

**Domain Registration**:
- Use Namecheap, Google Domains, or Porkbun
- "deterministic.systems" is likely available (~$12/year)
- Point DNS to Vercel (takes 10 minutes)

**Scheduling Tool**:
- Use Calendly (free tier) or Savvycal
- Create "30-Minute Diagnostic" slot
- Set availability: 3-4 time slots per week
- Link directly in CTA button

### Day 3: Set Up Your PDFs

```
Goal: Make case studies downloadable from your landing page.

Tasks:
[ ] Review the three generated PDFs (Case_Study_1-3.pdf)
[ ] Anonymize company names if using real projects
[ ] Create /assets folder on your website
[ ] Upload PDFs: Case_Study_1_Fintech.pdf, Case_Study_2_Healthcare.pdf, Case_Study_3_Ecommerce.pdf
[ ] Add a "Download Case Studies" section to your landing page
[ ] Test all PDF links work

Time: 1-2 hours
```

**Optional**: Customize the Python script to add your real case studies:
- Use `case_study_pdf_generator.py` as template
- Replace "fintech", "healthcare", "ecommerce" with your actual projects
- Re-run to generate new PDFs
- Upload to website

### Day 4-5: Build Your Email Outreach Engine

```
Goal: Set up infrastructure to send 60+ personalized emails.

Tasks:
[ ] Choose email tool: Lemlist (best), Sequences, or HubSpot
[ ] Create a spreadsheet with target prospects:
    - Name, Title, Company, Email, Source, Notes
[ ] Build your first list: 20 CTOs/VPs at enterprise companies
[ ] Write 3-4 subject lines to test
[ ] Create email templates using OUTREACH_EMAIL_TEMPLATES.md
[ ] Schedule first batch to send: Tuesday morning

Time: 4-6 hours
```

**Building Your Prospect List**:

**Free sources**:
- LinkedIn (search "VP Engineering" + "fintech" or "healthcare")
- GitHub (search repos by industry → find company infrastructure)
- Company job postings (infrastructure roles = growth signal)
- Twitter/blogs (follow infrastructure influencers, see their companies)
- News (Crunchbase, TechCrunch) for recently funded companies

**Paid sources** (if budget allows):
- LinkedIn Sales Navigator ($50/mo) — most effective
- Hunter.io ($100+/mo) — email finding
- Apollo.io ($49+/mo) — list building + email tool

**Sample target companies** (enterprise + likely pain):
- PayPal, Square, Stripe (fintech → state management)
- Databricks, Palantir (data → consistency)
- Notion, Figma (scaling infrastructure)
- DuckDB, Postgres (databases → replication)
- Anthropic, OpenAI (AI infrastructure at scale)

### Day 6: Write Your First Essay

```
Goal: Create thought leadership content that brings inbound leads.

Tasks:
[ ] Choose topic: "Why Enterprise State Management Always Drifts"
    or "The Hidden Cost of Configuration Drift" or "Five Layers of Deterministic Architecture"
[ ] Write 800-1000 words (2-3 hours)
[ ] Post on Medium or Substack
[ ] Share link in outreach emails
[ ] Post on Twitter/LinkedIn with key insight

Time: 3-4 hours
```

**Essay Structure**:
1. Hook: "Most enterprises lose $5-20M annually to configuration drift"
2. Problem: Describe the issue (use real examples from your research)
3. Solution: Introduce your approach (five layers)
4. Example: One concrete case (use one of your PDFs as backup)
5. CTA: "Curious about this? Schedule a diagnostic."

**Publishing**:
- Medium: Free, reaches engineers, gets indexed in Google
- Substack: Build email list while posting
- Dev.to: Developer community, good engagement
- Your website: Blog section

---

## Week 2: Outreach & Meetings

### Day 8-10: First Email Batch

```
Goal: Send 20 personalized emails. Target: 1-2 responses per day.

Tasks:
[ ] Send first batch of 20 emails (1 per prospect)
[ ] Personalize each: mention something specific about their company
[ ] Use template from OUTREACH_EMAIL_TEMPLATES.md
[ ] Track opens/clicks in spreadsheet
[ ] Respond to replies within 2 hours
[ ] Offer 30-min diagnostic call in first reply

Time: 4-5 hours (1 hour = prep; 3-4 hours = personalization + sending)
```

**Email Best Practices**:
- Send Tuesday-Thursday, 10am-2pm their timezone
- Subject: "Configuration drift at [Company]?" or "Quick question about state management"
- Body: 3-4 sentences max
- ONE clear ask: "30-min call Thursday?"
- Include your website link + scheduling link

**Expected Response Rate**:
- Open: 20-30% (4-6 opens)
- Reply: 5-10% (1-2 replies)
- Call scheduled: 50% of replies (0.5-1 call)

### Day 11-12: First Calls

```
Goal: Take your first diagnostic calls. Establish authority and gather intelligence.

Tasks:
[ ] Schedule first call in Calendly
[ ] Prepare 30-min call structure (see below)
[ ] Record call (with permission) or take notes
[ ] Send follow-up email same day with recap + next steps
[ ] Track outcomes in spreadsheet

Time: 1-2 hours per call
```

**30-Min Diagnostic Call Structure**:

**Intro (2 min)**:
- "Thanks for making time. I help enterprises eliminate configuration drift. In 30 minutes, I want to understand your current state and see if MSY Protocol is relevant."

**Discovery (15 min)**:
- "Tell me about your current architecture. How many services? Databases? What's your biggest pain point around consistency?"
- "Have you had any incidents related to state divergence or configuration drift?"
- "What's your current approach to governance and change control?"

**Positioning (10 min)**:
- "Here's how I'd think about it. Most enterprises have the same five problems [name the five layers]. MSY Protocol is a framework to solve them systematically."
- "The typical engagement is 2-week diagnostic ($25-50K) where we audit your systems and give you a roadmap."
- "Want to explore a diagnostic?"

**Close (3 min)**:
- "If interested, I'll send a proposal. If not, I appreciate the conversation. Either way, let me know if I can help."

**After Call**:
- Send email within 2 hours: recap + proposal + calendar link
- If interested: "Great. Here's what a 2-week diagnostic looks like..."
- If not: "Thanks for the conversation. If things change, you know where to find me."

### Day 13-14: Send Second Email Batch

```
Goal: Keep momentum. Send next 20 emails while tracking week 1 results.

Tasks:
[ ] Send 20 more emails (different prospects)
[ ] Follow-up 1x to week 1 non-responders
[ ] Track cumulative metrics
[ ] Look at what subject lines performed best → iterate

Time: 3-4 hours
```

**Week 1 Metrics Review**:
- Emails sent: 20
- Opens: 4-6
- Replies: 1-2
- Calls scheduled: 1
- Calls completed: 0-1

If metrics are lower, adjust:
- Subject lines: Too generic? Make more specific to their company
- Body: Too long? Trim to 3 sentences
- Timing: Try different times of day
- Target: Wrong persona? Are you reaching CTOs or wrong titles?

---

## Week 3: Scale & Conversion

### Day 15-17: Continuous Outreach

```
Goal: Establish pattern of 1-2 calls/week. Convert one to paid engagement.

Tasks:
[ ] Send 20 more emails (batch 3)
[ ] Follow up with week 1-2 non-responders (if <2 weeks since send)
[ ] Take 2-3 diagnostic calls
[ ] Send proposals to interested prospects
[ ] Track proposal pipeline

Time: 5-6 hours/day
```

**Proposal Template** (send after call):

```
Subject: MSY Protocol Diagnostic Proposal - [Company]

Hi [Name],

Following our conversation on [date], here's the diagnostic proposal:

SCOPE:
2-week systems architecture diagnostic for [Company]

DELIVERABLES:
1. Architecture audit (week 1)
2. Risk assessment + drift analysis (week 1-2)
3. Written report with findings (week 2)
4. 12-month implementation roadmap (week 2)

INVESTMENT:
$25,000 - $50,000 (depending on scope)

TIMELINE:
Start: [Date], End: [Date]
Kickoff call: [Specific time]

NEXT STEPS:
1. You approve proposal
2. We schedule kickoff
3. I send you an SOW (1-page agreement)
4. We start immediately

Ready to move forward? Reply with "yes" or let's schedule a 15-min call to finalize.

[Your name]
```

### Day 18-19: First Client Signals

```
Goal: One prospect should be showing strong buying signals.

Signals that a prospect is ready to buy:
✓ Replied to multiple emails
✓ Took a call and asked detailed questions
✓ Asked about pricing/timeline
✓ Mentioned budget or approval process
✓ Referred you to someone else on their team
✓ Asked to review case studies
✓ Requested proposal in writing

Tasks:
[ ] Identify your hottest lead
[ ] Move quickly: send proposal within 24 hours of call
[ ] Be available for immediate follow-up questions
[ ] Don't delay. Momentum is everything.

Time: 2-3 hours
```

### Day 20-21: Close or Pipeline

```
Goal: Either close first client OR have 3-4 strong prospects in pipeline.

Outcomes:
A) Client says yes:
   [ ] Send SOW (statement of work)
   [ ] Get signature (use DocuSign or HelloSign free tier)
   [ ] Collect 50% deposit
   [ ] Schedule kickoff
   [ ] WIN 🎉

B) Client stalls:
   [ ] "Need to discuss with team" → offer to present to team
   [ ] "Let me think about it" → set specific follow-up date
   [ ] "Not now" → ask when to reconnect

C) No close yet:
   [ ] Continue outreach to new prospects
   [ ] Keep warm prospects warm (1x/week check-in)
   [ ] Adjust messaging based on objections you're hearing

Time: 1-2 hours
```

---

## Week 4: Optimization & Iteration

### Day 22-24: Learn & Adjust

```
Goal: Analyze what's working. Double down. Kill what isn't.

Metrics to analyze:
- Which email subject lines got best open rate?
- Which companies/industries replied most?
- Which pitches converted to calls?
- Which calls converted to proposals?
- What objections are you hearing?

Tasks:
[ ] Review all emails sent + results
[ ] Identify top 3 performing subject lines
[ ] Identify top 3 industries with highest reply rate
[ ] Note all objections you heard in calls
[ ] Update email templates based on what works
[ ] Send batch 4 (20 more) with optimized approach

Time: 3-4 hours
```

**Questions to Ask Yourself**:
- Did people engage more when I mentioned [specific company]?
- Which subject line got highest open rate?
- Which email body got most replies?
- What specific pain point got fastest response?
- What caused people to schedule calls?

### Day 25-28: Final Push

```
Goal: End the month with 1-2 signed engagements in hand OR 4-6 in pipeline.

Tasks:
[ ] Send final batch (20 emails)
[ ] Take 3-5 more calls
[ ] Close or move 1-2 deals to proposal stage
[ ] Document your best-performing message + target
[ ] Plan Month 2 strategy

Time: 6-8 hours/day
```

**End-of-Month Scorecard**:

| Metric | Target | Result |
|--------|--------|--------|
| Emails sent | 80 | __ |
| Responses | 5-8 | __ |
| Calls taken | 3-5 | __ |
| Proposals sent | 2-3 | __ |
| Signed clients | 0-1 | __ |
| Pipeline value | $50-100K | __ |

**If you hit 0 clients by day 30**: That's OK. You've got 4-6 prospects in pipeline. Month 2 is when conversions happen.

**If you hit 1+ clients**: Congratulations. You're establishing product-market fit.

---

## Daily Routine (After Launch)

Once week 1 is done, here's your daily routine:

**Morning (30 min)**:
- Check email for replies
- Respond to all inquiries within 2 hours
- Update prospect status in spreadsheet

**Mid-morning (1-2 hours)**:
- Personalize and send 4-5 emails OR
- Prepare for scheduled call

**Afternoon (30 min - 1 hour)**:
- Take call (if scheduled)
- Send follow-up (if call happened)

**Evening (30 min)**:
- Plan tomorrow's outreach
- Track metrics for the day

**Weekly (Friday)**:
- Review metrics
- Adjust approach
- Plan next week's batches

---

## Month 2-3 Strategy (If You Don't Have a Client Yet)

### Month 2: Leverage & Content

If outreach is getting 0 clients but good response rates:

**Add inbound channels:**
1. **Content marketing**: Blog posts 2x/week on infrastructure topics
2. **Twitter/LinkedIn**: Share insights, build audience
3. **Speaking**: Pitch yourself for webinars, podcasts
4. **Communities**: Answer questions in r/devops, engineer forums
5. **Referrals**: Ask every call taker "Know anyone dealing with configuration drift?"

**Why**: Outbound alone takes 90+ days to close. Inbound works faster when you have social proof.

### Month 3: Product Refinement

If you're taking calls but not closing:

**Analyze objections:**
- "Too expensive": Reduce price point or offer smaller engagement
- "Need to think about it": You're not creating urgency or clarity
- "Not a priority": They don't have pain. Move on.
- "Wrong person": Ask to be introduced to the right person
- "Need to evaluate alternatives": You're not differentiated enough

**Fix**:
- Lower your minimum from $25K to $10-15K diagnostic
- Add case study focused on their specific problem
- Get a case study reference to call on
- Increase price/scope if you're closing everything

---

## Success Checklist (30 Days)

### Landing Page
- [ ] Deployed to custom domain
- [ ] All CTAs link to scheduling tool
- [ ] Case study PDFs are downloadable
- [ ] Contact email forwarding works
- [ ] Google Analytics installed

### Outreach
- [ ] 80+ personalized emails sent
- [ ] Email list of 100+ prospects built
- [ ] 3-5 diagnostic calls completed
- [ ] 2-3 proposals sent
- [ ] 1+ prospect seriously considering engagement

### Content
- [ ] 1-2 essays written and published
- [ ] Email templates documented
- [ ] Call structure documented
- [ ] Case studies reviewed and ready to share

### Business Foundations
- [ ] SOW template created (1-page contract)
- [ ] Pricing clarified (what includes, what doesn't)
- [ ] Deposit structure decided (50% upfront, 50% on completion)
- [ ] Timeline commitment set (2-week diagnostic, 8-week implementation, etc.)
- [ ] Payment method set up (Stripe, PayPal, ACH)

---

## Common Obstacles & Solutions

### "I'm not getting responses"
- **Problem**: Your subject line or targeting is off
- **Solution**: Switch to different industries. Try subject lines that mention specific pain ("Configuration drift at [Company]?" vs "Quick question")

### "People reply but don't schedule calls"
- **Problem**: Your email isn't compelling enough OR you're not making a clear ask
- **Solution**: Simplify ask. Replace "Would you like to chat?" with "30-min diagnostic call Thursday 2pm ET—does that work?"

### "I'm taking calls but no one's buying"
- **Problem**: You're not creating urgency or differentiation OR price is too high
- **Solution**: Add case study during call. Use urgency: "I have capacity for 1 more diagnostic this month." Lower price point or offer smaller initial engagement.

### "I don't have case studies yet"
- **Problem**: You haven't done client work yet (it's your first month!)
- **Solution**: Use the template PDFs as examples. Be honest: "These are similar situations we'd solve. Let's talk about yours specifically."

---

## Key Success Factors

1. **Personalization**: Every email should reference something specific about their company. Template-obvious emails get 0% response.

2. **Persistence**: 5 emails gets 0% response. 20+ emails gets 1-2 calls. 80+ emails gets 3-5 calls. Volume matters.

3. **Clarity**: "Want to chat?" = 0% conversion. "30-min diagnostic call Thursday?" = 30%+ conversion.

4. **Speed**: Reply to every inquiry within 2 hours. Move fast on qualified prospects.

5. **Credibility**: Case studies, essays, and a professional website make a huge difference. They signal you're serious.

---

## What Success Looks Like

**Day 30**: 
- 80+ emails sent
- 5-10 responses
- 3-5 calls taken
- 1-2 proposals sent
- 0-1 client signed

**Day 60**:
- 150+ emails sent
- 10-15 responses
- 6-10 calls taken
- 3-5 proposals sent
- 1-2 clients signed
- $50-100K pipeline

**Day 90**:
- 200+ emails sent
- 15-25 responses
- 8-12 calls taken
- 4-6 proposals sent
- 2-3 clients signed
- $100K+ pipeline

---

## Your First Week: Daily Breakdown

**Day 1: Deployment**
- Deploy landing page (2 hours)
- Set up domain + email (1 hour)
- Configure scheduling (30 min)

**Day 2: Asset Prep**
- Review case study PDFs (30 min)
- Upload to website (30 min)
- Test all links (15 min)

**Day 3: Outreach Infrastructure**
- Choose email tool (30 min)
- Build prospect list (2 hours)
- Write email templates (1.5 hours)

**Day 4: Content**
- Write first essay (3 hours)

**Day 5: First Emails**
- Send first 20 emails (2 hours)

**Day 6: Momentum**
- Monitor responses (30 min)
- Respond to inquiries (1 hour)
- Schedule calls (15 min)

**Day 7: Reflection**
- Analyze what worked (30 min)
- Plan week 2 (30 min)

**Total Week 1**: ~15-20 hours. Doable alongside other work.

---

## Go

You have everything you need. The landing page is production-ready. The PDFs are generated. The email templates are written. 

**Next step**: Deploy the landing page TODAY. Send first emails TOMORROW.

First client in 30-45 days is achievable. But only if you start.

Go.

---

**Status**: Ready for execution  
**Next Move**: Deploy → Outreach → Close  
**Target**: 1st client by day 45
