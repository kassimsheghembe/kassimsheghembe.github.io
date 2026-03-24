---
layout: post
title: "How to Connect WhatsApp Business to Open Chat Studio Using Meta Cloud API"
date: 2026-03-23
author: Kassim Sheghembe
tags: [WhatsApp, Meta, Open Chat Studio, API, Chatbots]
description: "A complete guide to connecting a WhatsApp Business phone number to Open Chat Studio using the Meta Cloud API — covering Meta app creation, credential gathering, OCS configuration, infrastructure requirements, and common pitfalls."
---

This guide walks through every step needed to connect a WhatsApp Business phone number to Open Chat Studio (OCS) using the Meta Cloud API. It covers Meta app creation, credential gathering, OCS configuration, infrastructure requirements, and common pitfalls — all based on real experience setting this up from scratch.

## Prerequisites

- A Meta Business account at [business.facebook.com](https://business.facebook.com)
- A phone number dedicated to the chatbot — this number **cannot** simultaneously be used on the WhatsApp mobile app
- An Open Chat Studio instance accessible over **HTTPS** with a valid SSL certificate (a domain name is required — bare IP addresses won't work)
- Celery worker and Redis running on the OCS instance

## Overview

The setup involves three areas:

1. **Meta Developer Dashboard** — create an app, gather credentials, configure the webhook
2. **Open Chat Studio** — create a messaging provider and WhatsApp channel
3. **Infrastructure** — ensure HTTPS, correct Django Site domain, and background workers

---

## Part 1: Meta Configuration

### Step 1: Create a Meta App

1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Click **Create App**
3. Select the **Business** type
4. Select your Business portfolio
5. Name the app and click **Create**

### Step 2: Add WhatsApp Product

1. In your app dashboard, click **Add Product** (or go to **Use cases**)
2. Find **WhatsApp** / "Connect with customers through WhatsApp" and set it up
3. WhatsApp configuration options should now appear under **Use cases** → **Customize** in the left sidebar

### Step 3: Add Your Phone Number

1. Go to **WhatsApp** → **API Setup**
2. Click **Add phone number**
3. Enter your dedicated phone number and verify it via SMS or voice call

> **Important:** If the number is currently registered on the WhatsApp mobile app, you must first delete the WhatsApp account from your phone (**Settings** → **Account** → **Delete my account**), wait a few minutes, then register it on the Cloud API. A number cannot be on both the mobile app and Cloud API simultaneously.

If you get an error about "Upgrading from a consumer app", delete the WhatsApp account from the phone, wait 5–30 minutes, then register via the API:

```bash
curl -X POST "https://graph.facebook.com/v22.0/PHONE_NUMBER_ID/register" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messaging_product": "whatsapp", "pin": "123456"}'
```

### Step 4: Gather Credentials

You need four values from Meta:

#### 4a. WhatsApp Business Account ID

- Go to **Meta Business Suite** → **Settings** → **Business Settings** → **Accounts** → **WhatsApp Accounts**
- Select your account — the **ID** is displayed in the info panel
- Alternatively, it's shown on the **WhatsApp** → **API Setup** page in the developer dashboard

#### 4b. App Secret

- Go to [developers.facebook.com/apps](https://developers.facebook.com/apps) → your app → **App Settings** → **Basic**
- Click **Show** next to **App Secret** and copy it

#### 4c. System User Access Token (permanent)

The temporary token from the API Setup page expires in 24 hours. Create a permanent one:

1. Go to **Meta Business Suite** → **Settings** → **Business Settings** → **Users** → **System Users**
2. Click **Add** to create a system user with **Admin** role (or select an existing one)
3. Click the system user → **Add Assets**:
   - Add your **App** with **Full Control**
   - Add your **WhatsApp Account** with **Full Control**
4. Click **Generate New Token**:
   - Select your app
   - Select permissions: `whatsapp_business_management` and `whatsapp_business_messaging`
   - Set expiration to **Never**
5. Click **Generate Token** and **copy it immediately** — it won't be shown again

#### 4d. Verify Token

This is a secret string **you create yourself** (e.g., `my-ocs-webhook-2024-secure`). You'll enter the same value in both Meta's webhook config and OCS.

### Step 5: Subscribe the App to the WhatsApp Business Account

**This step is critical and easy to miss.** Without it, Meta will not deliver webhooks even if everything else is configured correctly.

```bash
curl -X POST "https://graph.facebook.com/v22.0/WHATSAPP_BUSINESS_ACCOUNT_ID/subscribed_apps" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Verify the subscription:

```bash
curl -s "https://graph.facebook.com/v22.0/WHATSAPP_BUSINESS_ACCOUNT_ID/subscribed_apps" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

The response should include your app in the `data` array.

### Step 6: Publish the App

An unpublished app only receives test webhooks from the dashboard, not real messages.

1. Go to your app **Dashboard** → **Publish** (left sidebar)
2. Complete the requirements:
   - **Privacy Policy URL** — enter a URL in **App Settings** → **Basic**
   - **Use case review** — complete any listed requirements
3. Click **Publish**

---

## Part 2: Open Chat Studio Configuration

### Step 1: Configure the Django Site Domain

OCS uses Django's Sites framework to generate webhook URLs. The default is `localhost:8000`, which won't work in production.

```bash
python manage.py shell -c "
from django.contrib.sites.models import Site
site = Site.objects.get(id=1)
site.domain = 'your-domain.com'
site.name = 'Open Chat Studio'
site.save()
print(f'Updated: {site.domain}')
"
```

Also set HTTPS in your environment:

```
USE_HTTPS_IN_ABSOLUTE_URLS=True
```

Restart the app after these changes.

### Step 2: Create a Messaging Provider

1. Log in to OCS → navigate to your team
2. Go to **Settings** → **Service Providers**
3. Click **Add** and select type: **Meta Cloud API (WhatsApp)**
4. Fill in:

| Field | Value |
|-------|-------|
| **Name** | Descriptive name (e.g., "My WhatsApp Business") |
| **Business ID** | WhatsApp Business Account ID (Part 1, Step 4a) |
| **Access Token** | System User permanent token (Part 1, Step 4c) |
| **App Secret** | App Secret (Part 1, Step 4b) |
| **Verify Token** | The secret string you created (Part 1, Step 4d) |

5. Save

### Step 3: Create a WhatsApp Channel

1. Navigate to your **Chatbot** (Experiment)
2. Go to the **Channels** tab → **Add Channel**
3. Configure:
   - **Platform**: WhatsApp
   - **Messaging Provider**: Select the provider from Step 2
   - **Phone Number**: Your WhatsApp Business phone number (e.g., `+255 791 807 896`)
4. Save

OCS validates the phone number against the Meta Business Account and resolves the internal `phone_number_id`. After saving, the **webhook URL** is displayed:

```
https://your-domain.com/channels/whatsapp/meta/incoming_message
```

---

## Part 3: Configure the Webhook in Meta

### Step 1: Verify the Webhook

1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps) → your app
2. Navigate to **WhatsApp** → **Configuration** (under **Use cases** → **Customize** → left sidebar)
3. Under **Webhook**, click **Edit**
4. Enter:
   - **Callback URL**: `https://your-domain.com/channels/whatsapp/meta/incoming_message`
   - **Verify Token**: the exact string you entered in OCS
5. Click **Verify and Save**

> **Tip:** Test verification locally first:
> ```bash
> curl -s "https://your-domain.com/channels/whatsapp/meta/incoming_message?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test123"
> ```
> This should return `test123`. If it returns `Verification failed.`, the token doesn't match what's stored in OCS.

### Step 2: Subscribe to Webhook Fields

1. On the same **Configuration** page, under **Webhook fields**, click **Manage**
2. Subscribe to the **`messages`** field
3. Save

---

## Part 4: Infrastructure Requirements

### HTTPS with a Valid Certificate

Meta requires HTTPS with a valid SSL certificate. A bare IP address won't work — you need a domain name.

**Using Caddy as a reverse proxy (recommended):**

Install Caddy, then configure `/etc/caddy/Caddyfile`:

```
your-domain.com {
    reverse_proxy localhost:8000
}
```

Restart Caddy: `sudo systemctl restart caddy`. Caddy automatically provisions and renews Let's Encrypt certificates.

### Django Settings

```
ALLOWED_HOSTS=your-domain.com
CSRF_TRUSTED_ORIGINS=https://your-domain.com
```

### Background Workers

The webhook handler dispatches messages to Celery for async processing. Both Celery and Redis must be running:

```bash
# Check Redis
sudo systemctl status redis

# Start Celery worker
celery -A config worker -l info
```

---

## Part 5: Verification and Testing

1. From a phone, send a WhatsApp message to your business number
2. Monitor logs at each stage:

```bash
# Caddy — is Meta hitting the webhook?
sudo journalctl -u caddy --since "2 minutes ago" -f

# Django — any errors?
sudo journalctl -u your-ocs-service --since "2 minutes ago"

# Celery — is the message being processed?
sudo journalctl -u your-celery-service --since "2 minutes ago"
```

3. You should receive a response from the chatbot

You can also verify your phone number status via the API:

```bash
curl -s "https://graph.facebook.com/v22.0/PHONE_NUMBER_ID\
?fields=display_phone_number,verified_name,code_verification_status,platform_type" \
  -H "Authorization: Bearer ACCESS_TOKEN" | python3 -m json.tool
```

Expected: `platform_type: "CLOUD_API"` and `code_verification_status: "VERIFIED"`.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Webhook verification fails in Meta | Verify token mismatch | Re-enter the verify token in OCS messaging provider, then retry |
| Webhook verified but no messages arrive | App not subscribed to WABA | Run `POST /{WABA_ID}/subscribed_apps` (Part 1, Step 5) |
| Webhook verified but no messages arrive | App not published | Publish the app (Part 1, Step 6) |
| Messages arrive but 500 error in Django | Celery task not registered | Restart the Celery worker |
| Messages arrive but no response | Celery worker not running | Start Celery and verify Redis is running |
| `Verification failed.` on curl test | Token hash mismatch in DB | Edit OCS messaging provider and re-save with correct verify token |
| Phone number validation fails in OCS | Wrong Business ID | Ensure Business ID matches the WABA that owns the phone number |
| `Upgrading from consumer app not allowed` | Number still on WhatsApp mobile app | Delete WhatsApp account from phone, wait 5–30 min, register via API |
| `localhost:8000` in webhook URL | Django Site domain not updated | Update `Site.objects.get(id=1).domain` and set `USE_HTTPS_IN_ABSOLUTE_URLS=True` |
| Meta sends webhooks but connection drops | Django app crashing | Check Django logs for the traceback |

---

## How It All Fits Together

```
User Phone
  → WhatsApp
    → Meta Cloud API
      → POST /channels/whatsapp/meta/incoming_message
        → Verify X-Hub-Signature-256 (app_secret)
        → Route by phone_number_id → ExperimentChannel
        → Celery task → LLM processing
        → POST /{phone_number_id}/messages (via access_token)
          → Meta Cloud API → WhatsApp → User Phone
```

All Meta Cloud API channels share a single webhook endpoint. Routing to the correct chatbot happens by matching the `phone_number_id` from the incoming payload against stored channel data in OCS.
