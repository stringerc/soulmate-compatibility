# 🔧 Resend DNS Records Setup Guide

## ✅ Domain Status in Resend

**Domain**: `soulmates.syncscript.app`  
**Status**: ⏳ **Pending Verification** (DNS records need to be added)

---

## 📋 DNS Records to Add

You need to add these DNS records to your DNS provider (where `syncscript.app` is managed):

### Record 1: DKIM (DomainKeys Identified Mail)

**Purpose**: Verifies emails are from your domain

```
Type: TXT
Name: resend._domainkey.soulmates
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCvoJ0RRg/FFAUmQ3ALnXdcVNvkFOKYgi4G0p0yqZApcfl1Ir5zrF4qdzwk8syKTMT+2qN+Wj5BsmJNomEkUuuKlinzSYMn/bKcfuW5ATxYmJNEq7vp301whgV9LqYrb1xn0a+rn0W0COO3jl2+Z6TIgXfTJUENI6HNtSjvARW3ZwIDAQAB
TTL: Auto (or 3600)
```

**Important**: The name should be `resend._domainkey.soulmates` (not `resend._domainkey.soulmates.syncscript.app`)

---

### Record 2: SPF (Sender Policy Framework)

**Purpose**: Authorizes Resend to send emails from your domain

```
Type: TXT
Name: send.soulmates
Value: v=spf1 include:amazonses.com ~all
TTL: Auto (or 3600)
```

**Important**: The name should be `send.soulmates` (not `send.soulmates.syncscript.app`)

---

### Record 3: MX for Receiving (Optional - only if you want to receive emails)

**Purpose**: Allows receiving emails at your domain

```
Type: MX
Name: soulmates
Value: inbound-smtp.us-east-1.amazonaws.com
Priority: 10
TTL: Auto (or 3600)
```

**Note**: This is optional - only needed if you want to receive emails at addresses like `noreply@soulmates.syncscript.app`

---

## 🔧 How to Add DNS Records

### Step 1: Find Your DNS Provider

Where is `syncscript.app` managed?
- Cloudflare?
- Namecheap?
- GoDaddy?
- AWS Route 53?
- Other?

### Step 2: Add Records

1. **Log in** to your DNS provider
2. **Find** DNS management for `syncscript.app`
3. **Add** the records listed above
4. **Save** changes

### Step 3: Wait for Propagation

- DNS changes take **5-15 minutes** to propagate
- Some providers take up to **24 hours** (rare)

### Step 4: Verify in Resend

1. **Go to**: https://resend.com/domains
2. **Click** on `soulmates.syncscript.app`
3. **Check** verification status:
   - ✅ **Verified** = Ready to use!
   - ⏳ **Pending** = Still waiting for DNS propagation
   - ❌ **Failed** = Check DNS records are correct

---

## 🧪 Verify DNS Records

### Check DKIM Record:
```bash
dig TXT resend._domainkey.soulmates.syncscript.app
```

Should return: `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCvoJ0RRg/FFAUmQ3ALnXdcVNvkFOKYgi4G0p0yqZApcfl1Ir5zrF4qdzwk8syKTMT+2qN+Wj5BsmJNomEkUuuKlinzSYMn/bKcfuW5ATxYmJNEq7vp301whgV9LqYrb1xn0a+rn0W0COO3jl2+Z6TIgXfTJUENI6HNtSjvARW3ZwIDAQAB`

### Check SPF Record:
```bash
dig TXT send.soulmates.syncscript.app
```

Should return: `v=spf1 include:amazonses.com ~all`

### Online DNS Checker:
Visit: https://dnschecker.org
- Enter: `resend._domainkey.soulmates.syncscript.app`
- Select: TXT record type
- Check globally

---

## ⚠️ Common Issues

### Issue 1: Wrong Record Name

**Problem**: Records not found  
**Solution**: Make sure name is exactly:
- `resend._domainkey.soulmates` (for DKIM)
- `send.soulmates` (for SPF)

**NOT**:
- ❌ `resend._domainkey.soulmates.syncscript.app`
- ❌ `send.soulmates.syncscript.app`

### Issue 2: DNS Not Propagated

**Problem**: Records added but not showing up  
**Solution**: 
- Wait 5-15 minutes
- Check with `dig` command
- Use DNS checker tool

### Issue 3: Verification Still Pending

**Problem**: Records added but Resend shows "Pending"  
**Solution**:
- Wait up to 24 hours
- Double-check record values match exactly
- Contact Resend support if still pending after 24h

---

## ✅ After Verification

Once Resend shows **"Verified"** status:

1. **Update Vercel Environment Variable**:
   - Go to: Vercel Dashboard → Settings → Environment Variables
   - Change `RESEND_FROM_EMAIL` to: `noreply@soulmates.syncscript.app`
   - (Currently set to `onboarding@resend.dev`)

2. **Redeploy**:
   - Go to: Deployments → Latest → Redeploy
   - Or push a new commit

3. **Test Email**:
   - Request a new magic link
   - Should arrive without security warnings
   - Should not go to spam

---

## 📊 Current Status

- ✅ Domain added to Resend
- ✅ DKIM record configured
- ✅ SPF record configured
- ⏳ **DNS records need to be added to DNS provider**
- ⏳ **Waiting for verification**

---

## 🚀 Next Steps

1. **Add DNS records** to your DNS provider (see above)
2. **Wait 5-15 minutes** for propagation
3. **Check verification** in Resend dashboard
4. **Update Vercel** environment variable once verified
5. **Redeploy** and test

---

## 💡 Pro Tips

1. **Use DNS checker** to verify records globally
2. **Double-check** record names match exactly
3. **Wait patiently** - DNS propagation can take time
4. **Keep using** `onboarding@resend.dev` until verified
5. **Test** with a small email first after verification

---

**Last Updated**: December 24, 2024  
**Status**: DNS records ready to add ⏳

