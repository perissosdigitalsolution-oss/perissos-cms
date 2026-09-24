# Puppeteer MCP ClawCloud Deployment Guide
## Use this guide with MCP tools when ClawCloud is accessible

---

## Prerequisites
- ClawCloud accessible from your network
- Puppeteer MCP configured in opencode.jsonc
- GitHub account with 180+ days age

---

## Step 1: Navigate to ClawCloud Signin

```
puppeteer_navigate → https://us-east-1.run.claw.cloud/signin
puppeteer_screenshot → clawcloud-signin
```

---

## Step 2: Login with GitHub

```
puppeteer_click → button:has-text("GitHub")
puppeteer_evaluate → await new Promise(r => setTimeout(r, 3000))
puppeteer_screenshot → github-oauth
```

**⚠️ MANUAL ACTION**: Complete GitHub OAuth in the browser window.

---

## Step 3: Wait for Dashboard

```
puppeteer_evaluate → await new Promise(r => setTimeout(r, 5000))
puppeteer_screenshot → dashboard
```

---

## Step 4: Create PostgreSQL Database

```
puppeteer_navigate → https://us-east-1.run.claw.cloud/database
puppeteer_evaluate → await new Promise(r => setTimeout(r, 2000))
puppeteer_screenshot → database-page
puppeteer_click → button:has-text("Create")
puppeteer_evaluate → await new Promise(r => setTimeout(r, 2000))
puppeteer_screenshot → create-database-form
puppeteer_fill → input[name="name"] → perissos-db
puppeteer_select → select[name="type"] → postgresql
puppeteer_fill → input[name="cpu"] → 0.5
puppeteer_fill → input[name="memory"] → 512
puppeteer_fill → input[name="storage"] → 3
puppeteer_screenshot → database-form-filled
puppeteer_click → button:has-text("Deploy")
puppeteer_evaluate → await new Promise(r => setTimeout(r, 15000))
puppeteer_screenshot → database-deployed
```

---

## Step 5: Extract DATABASE_URL

```
puppeteer_evaluate → 
  const el = document.querySelector('[class*="connection"], code, pre');
  el ? el.textContent : null
```

**Copy the DATABASE_URL for next step.**

---

## Step 6: Create Backoffice App

```
puppeteer_navigate → https://us-east-1.run.claw.cloud/app-launchpad
puppeteer_evaluate → await new Promise(r => setTimeout(r, 2000))
puppeteer_screenshot → app-launchpad
puppeteer_click → button:has-text("Create")
puppeteer_evaluate → await new Promise(r => setTimeout(r, 2000))
puppeteer_screenshot → create-app-form
puppeteer_fill → input[name="name"] → perissos-backoffice
puppeteer_fill → input[name="image"] → ghcr.io/perissosdigitalsolution-oss/backoffice:latest
puppeteer_fill → input[name="cpu"] → 1
puppeteer_fill → input[name="memory"] → 1024
puppeteer_fill → input[name="port"] → 3000
puppeteer_click → button:has-text("Public")
puppeteer_screenshot → app-form-filled
```

---

## Step 7: Add Environment Variables

```
puppeteer_click → button:has-text("Add")
puppeteer_fill → input[placeholder*="key"] → DATABASE_URL
puppeteer_fill → input[placeholder*="value"] → postgresql://<user>:<pass>@<host>:5432/perissos-db
puppeteer_click → button:has-text("Add")
puppeteer_fill → input[placeholder*="key"] → PAYLOAD_SECRET
puppeteer_fill → input[placeholder*="value"] → 944576dd5973f5a20431dbde0464ebb208bb379b4d3400e5498bee4c2200f205
puppeteer_click → button:has-text("Add")
puppeteer_fill → input[placeholder*="key"] → NEXT_PUBLIC_CMS_URL
puppeteer_fill → input[placeholder*="value"] → https://perissos-backoffice.clawcloud.run
puppeteer_click → button:has-text("Add")
puppeteer_fill → input[placeholder*="key"] → NODE_ENV
puppeteer_fill → input[placeholder*="value"] → production
puppeteer_screenshot → env-vars-added
```

---

## Step 8: Deploy App

```
puppeteer_click → button:has-text("Deploy")
puppeteer_evaluate → await new Promise(r => setTimeout(r, 20000))
puppeteer_screenshot → app-deploying
puppeteer_evaluate → await new Promise(r => setTimeout(r, 15000))
puppeteer_screenshot → app-deployed
```

---

## Step 9: Verify Deployment

```
puppeteer_navigate → https://perissos-backoffice.clawcloud.run/api/health
puppeteer_evaluate → await new Promise(r => setTimeout(r, 3000))
puppeteer_screenshot → health-check
puppeteer_navigate → https://perissos-backoffice.clawcloud.run/admin
puppeteer_evaluate → await new Promise(r => setTimeout(r, 3000))
puppeteer_screenshot → admin-page
```

---

## Expected Results

- Health check: `{"status":"ok"}`
- Admin page: Login form visible
- Login: `admin@perissos.dev` / `Admin123!@#`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Element not found | Use `puppeteer_screenshot` to verify page state |
| Click fails | Try `puppeteer_evaluate` with `document.querySelector('selector').click()` |
| Form doesn't submit | Check all required fields are filled |
| Deployment timeout | Wait longer, check ClawCloud dashboard |
| DNS fails | Run from machine with ClawCloud access |

---

## Notes

- Each `puppeteer_screenshot` saves to `screenshots/` directory
- Use `puppeteer_evaluate` for custom JavaScript when MCP tools are insufficient
- First GitHub OAuth requires manual intervention
- Subsequent runs can reuse session via `PUPPETEER_USER_DATA_DIR`
