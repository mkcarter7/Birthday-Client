# Admin Setup Quick Start

## Frontend Admin (UI Only - NOT SECURE)

### Step 1: Create `.env.local` file
Create a file named `.env.local` in the root directory (same folder as `package.json`)

### Step 2: Add admin email(s)
```bash
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com
```

For multiple admins (comma-separated):
```bash
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Step 3: Restart your dev server
Stop your Next.js server (Ctrl+C) and restart:
```bash
npm run dev
```

**Note:** The email must match **exactly** (case-insensitive) with the Firebase user's email.

---

## Backend Admin (REQUIRED for Security)

### Option 1: Django Admin Panel (Easiest)

1. Go to: `http://localhost:8000/admin`
2. Log in with a superuser account
3. Navigate to **Users**
4. Find and click on the user you want to make an admin
5. Check the box for **"Staff status"** (or **"Superuser status"** for full admin)
6. Click **Save**

### Option 2: Django Shell

```bash
python manage.py shell
```

```python
from django.contrib.auth.models import User

# Find user by email
user = User.objects.get(email='your-email@gmail.com')

# Make them staff/admin
user.is_staff = True
user.save()

# Or make them superuser
user.is_superuser = True
user.save()
```

---

## Quick Check

### Frontend Check:
- User email matches `NEXT_PUBLIC_ADMIN_EMAILS` in `.env.local`
- Can see `/admin` pages

### Backend Check:
- User has `is_staff = True` or `is_superuser = True` in Django
- Backend API returns data (instead of 403 error)

---

## Example `.env.local` file:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Admin emails (frontend check)
NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com,another-admin@example.com

# Other config...
NEXT_PUBLIC_PARTY_NAME=Ivy's 2nd Birthday
# etc...
```
