# InterpWhat Email Integration Guide

## Overview

This guide covers email integration for InterpWhat using **Resend** (recommended) or **Mailchimp** for marketing campaigns.

---

## Option 1: Resend (Recommended for Transactional + Marketing)

### Why Resend?
- **Free tier:** 3,000 emails/month, 100/day
- **Developer-friendly:** Simple API, great docs
- **Deliverability:** Excellent reputation
- **Cost:** $20/month for 50,000 emails (scales well)

### Setup Steps

#### 1. Sign Up for Resend
```bash
# Visit: https://resend.com/signup
# Create account, verify email
```

#### 2. Get API Key
```bash
# Dashboard → API Keys → Create API Key
# Copy the key (starts with re_...)
```

#### 3. Add to Environment Variables
```bash
cd /home/ubuntu/interpwhat
echo "RESEND_API_KEY=re_your_api_key_here" >> .env
```

#### 4. Install Resend SDK
```bash
cd /home/ubuntu/interpwhat/server
npm install resend
```

#### 5. Create Email Service
```typescript
// server/services/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAnnouncementEmail(
  to: string,
  subject: string,
  html: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'InterpWhat <hello@interpwhat.com>',
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

export async function sendShelterOutreachEmail(
  to: string,
  shelterName: string,
  personalizedMessage: string
) {
  const subject = `Partnership Opportunity: InterpWhat for ${shelterName}`;
  
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        ${personalizedMessage}
        
        <p>Thank you for everything you do to save lives.</p>
        
        <p>Warm regards,<br>
        <strong>Chantell</strong><br>
        Co-Founder, InterpWhat<br>
        Built in memory of Paisley 🐾</p>
        
        <p style="font-size: 12px; color: #666;">
          📧 hello@interpwhat.com<br>
          🌐 <a href="https://interpwhat.com">interpwhat.com</a>
        </p>
      </body>
    </html>
  `;

  return sendAnnouncementEmail(to, subject, html);
}
```

#### 6. Create API Endpoint for Sending Emails
```typescript
// server/routes/email.ts
import { Express } from 'express';
import { sendAnnouncementEmail, sendShelterOutreachEmail } from '../services/email';

export function registerEmailRoutes(app: Express) {
  app.post('/api/email/send-announcement', async (req, res) => {
    const { to, subject, html } = req.body;
    
    const result = await sendAnnouncementEmail(to, subject, html);
    
    if (result.success) {
      res.json({ success: true, message: 'Email sent successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  });

  app.post('/api/email/send-shelter-outreach', async (req, res) => {
    const { to, shelterName, personalizedMessage } = req.body;
    
    const result = await sendShelterOutreachEmail(to, shelterName, personalizedMessage);
    
    if (result.success) {
      res.json({ success: true, message: 'Outreach email sent successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  });
}
```

#### 7. Track Email Campaigns
```typescript
// server/services/email-tracking.ts
import { db } from '../db';
import { emailCampaigns, emailRecipients } from '@db/schema';

export async function createEmailCampaign(
  name: string,
  type: 'announcement' | 'shelter_outreach' | 'newsletter' | 'promotional',
  subject: string
) {
  const [campaign] = await db.insert(emailCampaigns).values({
    campaign_name: name,
    campaign_type: type,
    subject,
    sent_at: new Date()
  }).returning();

  return campaign;
}

export async function trackEmailSent(
  campaignId: number,
  email: string,
  userId?: number,
  shelterPartnerId?: number
) {
  await db.insert(emailRecipients).values({
    campaign_id: campaignId,
    email,
    user_id: userId,
    shelter_partner_id: shelterPartnerId,
    status: 'sent',
    sent_at: new Date()
  });
}

export async function trackEmailOpened(recipientId: number) {
  await db.update(emailRecipients)
    .set({
      status: 'opened',
      opened_at: new Date()
    })
    .where(eq(emailRecipients.id, recipientId));
}
```

---

## Option 2: Mailchimp (For Marketing Campaigns Only)

### Why Mailchimp?
- **Free tier:** Up to 500 contacts, 1,000 sends/month
- **Easy UI:** Drag-and-drop editor
- **Templates:** Professional-looking emails
- **Automation:** Drip campaigns, welcome series

### Setup Steps

#### 1. Sign Up for Mailchimp
```bash
# Visit: https://mailchimp.com/signup
# Create account, verify email
```

#### 2. Create Audience
```
Marketing → Audience → Create Audience
Name: InterpWhat Users
Default from email: hello@interpwhat.com
```

#### 3. Get API Key
```
Profile → Extras → API Keys → Create A Key
Copy the key
```

#### 4. Install Mailchimp SDK
```bash
cd /home/ubuntu/interpwhat/server
npm install @mailchimp/mailchimp_marketing
```

#### 5. Create Mailchimp Service
```typescript
// server/services/mailchimp.ts
import mailchimp from '@mailchimp/mailchimp_marketing';

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX, // e.g., "us1"
});

export async function addSubscriberToAudience(
  email: string,
  firstName: string,
  lastName: string,
  tags: string[] = []
) {
  try {
    const response = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_AUDIENCE_ID!,
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
        tags,
      }
    );

    return { success: true, data: response };
  } catch (error) {
    console.error('Mailchimp error:', error);
    return { success: false, error };
  }
}

export async function sendCampaign(
  subject: string,
  htmlContent: string,
  recipients: string[]
) {
  try {
    // Create campaign
    const campaign = await mailchimp.campaigns.create({
      type: 'regular',
      recipients: {
        list_id: process.env.MAILCHIMP_AUDIENCE_ID!,
      },
      settings: {
        subject_line: subject,
        from_name: 'Chantell from InterpWhat',
        reply_to: 'hello@interpwhat.com',
      },
    });

    // Set content
    await mailchimp.campaigns.setContent(campaign.id, {
      html: htmlContent,
    });

    // Send campaign
    await mailchimp.campaigns.send(campaign.id);

    return { success: true, campaignId: campaign.id };
  } catch (error) {
    console.error('Campaign send error:', error);
    return { success: false, error };
  }
}
```

---

## MCP Integration for Automation

### What is MCP?
Model Context Protocol - allows AI agents to interact with external tools and services.

### Use Cases for InterpWhat:
1. **Automated shelter outreach** - AI drafts personalized emails
2. **Follow-up reminders** - AI tracks responses and schedules follow-ups
3. **Email performance analysis** - AI analyzes open rates, suggests improvements
4. **Content generation** - AI writes newsletter content, social posts

### MCP Tools to Consider:

#### 1. **Pipedream** (Recommended)
- **What it does:** Workflow automation, connects APIs
- **Use for:** Trigger emails when events happen (new user, subscription, etc.)
- **Free tier:** 100 invocations/day
- **Setup:** https://pipedream.com

**Example Workflow:**
```
New User Signs Up → Pipedream → Send Welcome Email via Resend
```

#### 2. **n8n** (Open Source Alternative)
- **What it does:** Self-hosted workflow automation
- **Use for:** Complex automation without vendor lock-in
- **Cost:** Free (self-hosted)
- **Setup:** https://n8n.io

**Example Workflow:**
```
Shelter Partner Signs Up → n8n → Create in Database → Send Welcome Email → Add to CRM
```

#### 3. **Zapier** (Easiest, Not Open Source)
- **What it does:** No-code automation
- **Use for:** Quick integrations without coding
- **Cost:** $20/month for 750 tasks
- **Setup:** https://zapier.com

---

## Recommended Stack for InterpWhat

### Phase 1: Launch (Now)
- **Resend** for all emails (transactional + marketing)
- **Manual sending** via admin dashboard
- **Basic tracking** (sent, opened, clicked)

### Phase 2: Growth (Month 3-6)
- **Resend** for transactional emails
- **Mailchimp** for marketing campaigns (if volume increases)
- **Pipedream** for basic automation (welcome emails, follow-ups)

### Phase 3: Scale (Month 6-12)
- **Resend** for transactional
- **Mailchimp** or **SendGrid** for marketing
- **n8n** (self-hosted) for complex automation
- **Custom MCP tools** for AI-powered email optimization

---

## Email Templates

### 1. Announcement Email (HTML)
Located at: `/home/ubuntu/InterpWhat-Marketing/email-sequences/announcement-email-1.html`

### 2. Shelter Outreach Emails (Markdown)
Located at: `/home/ubuntu/InterpWhat-Marketing/partner-outreach/01-05-*-Email.md`

### 3. Welcome Email (New Users)
```html
<html>
  <body style="font-family: Arial, sans-serif;">
    <h2>Welcome to InterpWhat! 🐾</h2>
    <p>Hi [First Name],</p>
    <p>Thank you for joining InterpWhat! We're excited to help you understand your pet better.</p>
    <p><strong>Here's what you can do now:</strong></p>
    <ul>
      <li>Upload your first pet photo or video</li>
      <li>Get instant AI behavior analysis</li>
      <li>Try our Breed ID feature</li>
      <li>Set up care reminders</li>
    </ul>
    <p><a href="https://interpwhat.com/dashboard" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Started</a></p>
    <p>Questions? Reply to this email anytime.</p>
    <p>Warm regards,<br>Chantell & the InterpWhat team</p>
  </body>
</html>
```

---

## Testing

### Test Resend Integration
```bash
curl -X POST http://localhost:5000/api/email/send-announcement \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email from InterpWhat",
    "html": "<h1>Hello from InterpWhat!</h1><p>This is a test email.</p>"
  }'
```

### Test Mailchimp Integration
```bash
curl -X POST http://localhost:5000/api/mailchimp/add-subscriber \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "tags": ["beta-user"]
  }'
```

---

## Next Steps

1. **Choose email provider** (Resend recommended)
2. **Sign up and get API key**
3. **Add to environment variables**
4. **Install SDK and create service**
5. **Test with your email**
6. **Send first announcement email to existing users**
7. **Start shelter outreach campaign**

---

## Support

- **Resend Docs:** https://resend.com/docs
- **Mailchimp API:** https://mailchimp.com/developer/
- **Pipedream Docs:** https://pipedream.com/docs
- **n8n Docs:** https://docs.n8n.io

**Questions? Email hello@interpwhat.com**

