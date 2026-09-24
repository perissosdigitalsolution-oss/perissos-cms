# ClawCloud Quickstart — Sprint 37 Phase 1
## Perissos CMS Backoffice Deployment (15 min)

---

### Step 1: Create Account (2 min)
1. Go to **https://us-east-1.run.claw.cloud/signin**
2. Click **GitHub** to sign in
3. Select region: **Germany (EU)**
4. Verify $5/month credit is available

---

### Step 2: Deploy PostgreSQL (5 min)
1. Dashboard → **Database** → **Create Database**
2. Fill in:
   - Type: **PostgreSQL**
   - Name: `perissos-db`
   - CPU: **0.5 Core**
   - RAM: **512 MB**
   - Storage: **3 Gi**
3. Click **Deploy**
4. Wait for status: **Running**
5. **Copy connection details** (you'll need them next):
   ```
   Host: <host>.clawcloud.run
   Port: 5432
   Username: <username>
   Password: <password>
   Database: perissos-db
   ```

---

### Step 3: Deploy Backoffice (5 min)
1. Dashboard → **App Launchpad** → **Create App**
2. Fill in:
   - Application Name: `perissos-backoffice`
   - Image Type: **Public**
   - Image Name: `ghcr.io/perissosdigitalsolution-oss/backoffice:latest`
   - Usage Type: **Fixed**
   - Replicas: **1**
   - CPU: **1 Core**
   - Memory: **1 GB**
   - Container Port: **3000**
   - Public Access: **✅ Enabled**
3. Add Environment Variables (click **Add** for each):

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql://<user>:<pass>@<host>:5432/perissos-db` |
   | `PAYLOAD_SECRET` | `944576dd5973f5a20431dbde0464ebb208bb379b4d3400e5498bee4c2200f205` |
   | `NEXT_PUBLIC_CMS_URL` | `https://perissos-backoffice.clawcloud.run` |
   | `NODE_ENV` | `production` |

4. Click **Deploy**
5. Wait for status: **Running** (2-3 min)

---

### Step 4: Verify (3 min)
```bash
# Test health endpoint
curl https://perissos-backoffice.clawcloud.run/api/health
# Expected: {"status":"ok"}

# Open admin panel
open https://perissos-backoffice.clawcloud.run/admin
# Login: admin@perissos.dev / Admin123!@#
```

---

### Step 5: Configure Health Check (Optional)
In App Launchpad → perissos-backoffice → Settings:
- Path: `/api/health`
- Initial Delay: **30s**
- Interval: **30s**
- Timeout: **5s**
- Failure Threshold: **3**

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Container won't start | Check logs in App Launchpad → perissos-backoffice → Logs |
| `/api/health` returns 500 | Wait 30s for Payload to initialize, check DATABASE_URL |
| Can't login | Use `admin@perissos.dev` / `Admin123!@#` |
| Image pull failed | Verify image is public: `docker pull ghcr.io/perissosdigitalsolution-oss/backoffice:latest` |

---

## After First Boot

Once `/api/health` returns `{"status":"ok"}` and `/admin` works:
- Set `push: false` in `apps/backoffice/src/payload.config.ts`
- Push to branch: `fix: set push:false after schema creation`

---

## Resource Usage
| Service | CPU | RAM | Storage |
|---------|-----|-----|---------|
| Backoffice | 1 Core | 1 GB | 1 GB |
| PostgreSQL | 0.5 Core | 512 MB | 3 Gi |
| **Total** | **1.5 Core** | **1.5 GB** | **4 Gi** |
| **Est. Cost** | | | **~$3.00/mo** |

Within $5 free budget. ✅
