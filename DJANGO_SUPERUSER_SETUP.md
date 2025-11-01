# Django Superuser Setup Guide

## How to Check if You're a Superuser

### Method 1: Try Logging In to Django Admin

1. **Start your Django backend server** (if not running):
   ```bash
   cd /path/to/your/django/project
   python manage.py runserver
   ```

2. **Go to Django Admin**:
   - Open your browser and go to: `http://localhost:8000/admin`
   - Try logging in with your email/password

3. **If you can log in and see the admin panel** → You're a superuser or staff user ✅
4. **If you get "Please enter the correct username and password"** → You need to create a superuser ❌

---

### Method 2: Check via Django Shell

1. **Open Django shell**:
   ```bash
   cd /path/to/your/django/project
   python manage.py shell
   ```

2. **Run these commands** (replace `your-email@gmail.com` with your actual email):
   ```python
   from django.contrib.auth.models import User
   
   try:
       user = User.objects.get(email='your-email@gmail.com')
       print(f"User found: {user.username}")
       print(f"Email: {user.email}")
       print(f"Is Staff: {user.is_staff}")
       print(f"Is Superuser: {user.is_superuser}")
   except User.DoesNotExist:
       print("User not found with that email")
   ```

3. **Exit the shell**:
   ```python
   exit()
   ```

---

## How to Create a Superuser

### Step 1: Navigate to Your Django Project

```bash
cd /path/to/your/django/project
```

### Step 2: Run the Createsuperuser Command

```bash
python manage.py createsuperuser
```

### Step 3: Follow the Prompts

You'll be asked for:
- **Username** (or press Enter to leave blank)
- **Email address** (enter your email)
- **Password** (enter a secure password - it won't show as you type)
- **Password confirmation** (enter the same password again)

Example:
```
Username (leave blank to use 'your-email@gmail.com'):
Email address: your-email@gmail.com
Password: 
Password (again):
Superuser created successfully.
```

**Note**: If your Django project uses email as the username, you can leave username blank and it will use your email.

---

## How to Log In to Django Admin

### Step 1: Make Sure Django Server is Running

```bash
cd /path/to/your/django/project
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### Step 2: Open Django Admin in Browser

Go to: **http://localhost:8000/admin**

### Step 3: Log In

- **Username**: Enter the username you used when creating the superuser (or your email if that's what you used)
- **Password**: Enter the password you set

### Step 4: Once Logged In

You should see the Django admin dashboard with:
- **Users** section
- **Groups** section
- Your custom models (RSVP, GuestBookEntry, Party, etc.)

---

## If You Already Have a User (But Not Superuser)

### Make Existing User a Superuser via Shell

1. **Open Django shell**:
   ```bash
   python manage.py shell
   ```

2. **Make your user a superuser**:
   ```python
   from django.contrib.auth.models import User
   
   # Find user by email
   user = User.objects.get(email='your-email@gmail.com')
   
   # Make them a superuser
   user.is_superuser = True
   user.is_staff = True
   user.save()
   
   print(f"User {user.email} is now a superuser!")
   ```

3. **Exit shell**:
   ```python
   exit()
   ```

Now you can log in at `http://localhost:8000/admin` with that user's credentials!

---

## Troubleshooting

### "Command 'python' not found"
Try using `python3` instead:
```bash
python3 manage.py createsuperuser
```

### "No module named 'django'"
You need to activate your virtual environment first:
```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

Then try again.

### "Username already exists"
- Either use a different username
- Or find the existing user and make them a superuser (see "If You Already Have a User" section above)

### "I don't remember my password"
Reset it via Django shell:
```python
from django.contrib.auth.models import User
user = User.objects.get(email='your-email@gmail.com')
user.set_password('new-password-here')
user.save()
```

---

## Quick Checklist

- [ ] Django server is running (`python manage.py runserver`)
- [ ] Created superuser (`python manage.py createsuperuser`)
- [ ] Can access `http://localhost:8000/admin`
- [ ] Can see Users section in admin panel
- [ ] Can edit users and check "Staff status" or "Superuser status"

---

## Summary

1. **Check if superuser**: Try logging in to `/admin` or check via Django shell
2. **Create superuser**: `python manage.py createsuperuser`
3. **Log in**: Go to `http://localhost:8000/admin` and use your superuser credentials
4. **Set other users as admin**: Go to Users → Edit user → Check "Staff status" or "Superuser status"
