# Render Deployment Troubleshooting

## Current Issue
Render is not respecting `rootDir` setting and can't find `requirements.txt`.

## Root Cause
Render appears to:
1. Auto-detect Poetry (even though we're not using it)
2. Run build commands BEFORE applying `rootDir` setting
3. Execute commands from repository root instead of `web_app/backend/`

## Solutions Tried

### Solution 1: Build Script (Current)
Created `web_app/backend/build.sh` that:
- Detects current directory
- Changes to backend directory if needed
- Handles both root and backend directory scenarios
- Provides debugging output

### Solution 2: If Build Script Fails
If the build script still fails, try:

**Option A: Use Dockerfile**
```yaml
dockerfilePath: web_app/backend/Dockerfile
```
Remove `buildCommand` and let Docker handle it.

**Option B: Move requirements.txt to root**
Not ideal, but would work:
- Copy requirements.txt to root
- Update build command to use root requirements.txt
- Keep app code in backend/

**Option C: Disable Poetry Detection**
Create empty files to prevent Poetry detection:
- `web_app/backend/.python-version` (already exists)
- Or create `runtime.txt` in root

**Option D: Use Render's native Python build**
Remove `buildCommand` entirely and let Render auto-detect:
- Render should find `requirements.txt` if `rootDir` is set
- But this hasn't worked so far

## Next Steps
1. Monitor deployment with build script
2. Check logs for directory information
3. If still failing, try Dockerfile approach
4. Consider moving to a simpler structure

## Debugging Commands
If you need to debug locally:
```bash
cd web_app/backend
bash build.sh
```

