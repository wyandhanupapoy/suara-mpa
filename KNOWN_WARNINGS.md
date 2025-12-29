# Known Warnings & Non-Critical Issues

This document lists known warnings that appear during development but do not affect functionality.

## Middleware Deprecation Warning

```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**Status**: ✅ **RESOLVED**

**Resolution Applied**: 
Migrated from `src/middleware.js` to `src/proxy.js` following Next.js 16+ convention.

**What Changed**:
- File renamed: `src/middleware.js` → `src/proxy.js`
- All rate limiting functionality preserved
- CSRF protection remains active
- No code changes required - just filename update

**Verification**:
After restarting dev server, the middleware deprecation warning should no longer appear.

---

## Development Environment Noise

### Multiple `.env.local` Reloads

```
Reload env: .env.local
```

**Status**: ℹ️ Normal behavior

**Explanation**:
Next.js hot-reloads environment variables during development when files change. This is expected behavior and ensures environment variables are always up-to-date.

**Impact**: None - this is normal development mode behavior

---

## Summary

All warnings listed above are:
- ✅ Non-blocking
- ✅ Don't affect application functionality  
- ✅ Don't affect security
- ✅ Don't affect performance

The application is **production-ready** despite these informational warnings.

---

**Last Updated**: 2025-12-27
**Next.js Version**: 16.1.1
