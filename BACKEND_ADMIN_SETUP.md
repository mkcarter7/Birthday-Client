# Backend Admin Setup Guide

## Current Status
✅ **Frontend**: Admin checks implemented (for UI hiding)
❌ **Backend**: No admin validation yet (NOT SECURE)

## ⚠️ Security Warning
The current implementation only checks admin status in the frontend. **Anyone can bypass this by modifying the frontend code or making direct API calls.** 

**You MUST add backend validation** to properly secure admin features.

## Django Backend Requirements

### Option 1: Use Django's Built-in Admin Fields (Recommended)

Django User model has built-in fields:
- `is_staff` - Staff members (can access Django admin)
- `is_superuser` - Superusers (full admin access)

#### 1. Set Admin Users in Django Admin Panel

1. Go to Django admin panel: `http://localhost:8000/admin`
2. Navigate to **Users**
3. Edit each user you want to be an admin
4. Check **"Staff status"** or **"Superuser status"**
5. Save

#### 2. Update Django Views/Serializers

Add admin checks in your Django views or serializers:

```python
# In your views.py or serializers.py

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

class IsAdminUser(IsAuthenticated):
    """
    Permission class to check if user is staff/superuser
    """
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        # Check if user is staff or superuser
        return request.user.is_staff or request.user.is_superuser

# Example: Protect RSVP list endpoint
@permission_classes([IsAdminUser])
def list(self, request):
    # Only admins can see all RSVPs
    queryset = RSVP.objects.filter(party=party_id)
    serializer = RSVPSerializer(queryset, many=True)
    return Response(serializer.data)
```

#### 3. Create Admin Status Endpoint (Optional but Recommended)

Create an endpoint to check if the current user is an admin:

```python
# In your views.py or viewsets.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_admin_status(request):
    """
    Return whether the current user is an admin
    """
    return Response({
        'is_admin': request.user.is_staff or request.user.is_superuser,
        'is_staff': request.user.is_staff,
        'is_superuser': request.user.is_superuser,
        'email': request.user.email,
    })
```

Add to `urls.py`:
```python
path('api/check-admin/', check_admin_status, name='check-admin'),
```

### Option 2: Custom Admin Field

If you want custom admin logic:

#### 1. Add Custom Field to User Model (or use Profile)

```python
# models.py (if using custom user model)
# OR create a Profile model

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_party_admin = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.email} - Admin: {self.is_party_admin}"
```

#### 2. Check in Views

```python
def is_party_admin(user):
    try:
        return user.userprofile.is_party_admin
    except:
        return False

# Use in views
if not is_party_admin(request.user):
    return Response({'error': 'Admin access required'}, status=403)
```

## Frontend Updates Needed

Once you add backend validation, update the frontend to:

1. **Check admin status from backend** (instead of just email list)
2. **Handle 403 errors gracefully** when accessing admin endpoints

### Updated Admin Utility (Future Enhancement)

```javascript
// src/utils/admin.js - Enhanced version
export const checkAdminStatus = async (user) => {
  if (!user) return false;
  
  try {
    const token = await user.getIdToken();
    const res = await fetch('/api/check-admin', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      return data.is_admin || false;
    }
  } catch (e) {
    console.error('Error checking admin status:', e);
  }
  
  // Fallback to email check
  return isAdmin(user);
};
```

## Summary

**What you need to do:**
1. ✅ Frontend is done (hides UI)
2. ❌ **Backend**: Add admin checks in Django views/serializers
3. ❌ **Backend**: Use `request.user.is_staff` or create custom admin field
4. ❌ **Backend**: Return 403 for non-admin users accessing admin endpoints
5. ⚠️ **Important**: The `/api/rsvps/` GET endpoint should only return all RSVPs for admins

**Current Risk:**
- Anyone can call `/api/rsvp` (GET) and see all RSVPs
- Frontend check can be bypassed
- No real security until backend is updated
