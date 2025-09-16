# WebRTC Production Debugging Guide

This guide helps troubleshoot WebRTC call issues in production builds (built/installed apps).

## Common Issues in Production Builds

### 1. WebSocket Connection Failures

**Symptoms:**
- Status goes to "disconnected" immediately
- Never connects to signaling server
- Console shows WebSocket connection errors

**Causes:**
- Using `ws://` instead of `wss://` for HTTPS domains
- Network security policies blocking WebSocket connections
- Firewall/proxy blocking connections
- Invalid SSL certificates

**Solutions:**
- ✅ **Fixed**: Updated `constants/index.ts` to use `wss://` for production
- Check network connectivity with diagnostics
- Try different networks (WiFi vs mobile data)
- Contact network administrator if on corporate network

### 2. STUN/TURN Server Issues

**Symptoms:**
- WebSocket connects but no media flows
- ICE connection fails
- One-way audio/video

**Causes:**
- STUN servers blocked by firewall
- NAT traversal failures
- Missing TURN servers for restrictive networks

**Solutions:**
- ✅ **Added**: More STUN servers for redundancy
- Consider adding TURN servers for corporate networks
- Test with mobile data vs WiFi

### 3. Media Permission Issues

**Symptoms:**
- "Failed to get local stream" errors
- No camera/microphone access
- Permissions denied

**Solutions:**
- ✅ **Added**: Proper Android permissions in `app.json`
- Check device settings for app permissions
- Restart app after granting permissions

## Network Diagnostics

The app now includes automatic network diagnostics in production builds:

```typescript
// Runs automatically when initializing calls
const diagnostics = await NetworkDiagnosticsService.getInstance()
  .performDiagnostics(WEBRTC_CONFIG.SIGNALING_URL);
```

### Diagnostic Checks:
- ✅ Online status
- ✅ Signaling server reachability  
- ✅ STUN server connectivity
- ✅ Connection type and latency
- ✅ Troubleshooting suggestions

## Testing Production Builds

### 1. Build and Test
```bash
# Build production version
npx expo build:android
# or
npx expo build:ios

# Install on device and test calls
```

### 2. Debug Logs
Enable remote debugging to see console logs:
- Use Flipper or similar tools
- Check device logs via ADB (Android)
- Use Xcode console (iOS)

### 3. Network Testing
Test on different networks:
- ✅ Home WiFi
- ✅ Mobile data (4G/5G)
- ✅ Public WiFi
- ✅ Corporate networks

## Configuration Changes Made

### 1. WebSocket URLs (`constants/index.ts`)
```typescript
SIGNALING_URL: __DEV__
  ? "ws://signaling-server-seo6.onrender.com"  // Development
  : "wss://signaling-server-seo6.onrender.com" // Production - SECURE
```

### 2. Enhanced Error Handling
- Connection timeouts (10 seconds)
- Detailed error messages
- Network diagnostics on failures
- ICE connection monitoring

### 3. Android Permissions (`app.json`)
```json
"permissions": [
  "android.permission.INTERNET",
  "android.permission.ACCESS_NETWORK_STATE", 
  "android.permission.CAMERA",
  "android.permission.RECORD_AUDIO",
  "android.permission.MODIFY_AUDIO_SETTINGS"
]
```

## Troubleshooting Steps

### Step 1: Check Network Diagnostics
Look for diagnostic output in console:
```
=== WebRTC Network Diagnostics ===
Online Status: ✅ Online
Signaling Server: ❌ Unreachable  
STUN Connectivity: ❌ Failed
================================
```

### Step 2: Test Different Networks
- Switch between WiFi and mobile data
- Try from different locations
- Test on unrestricted networks

### Step 3: Check Permissions
- Verify camera/microphone permissions
- Check network access permissions
- Restart app after permission changes

### Step 4: Server Health Check
Visit: `https://signaling-server-seo6.onrender.com/health`
Should return server status and active connections.

## Known Limitations

1. **Corporate Networks**: May block WebRTC traffic entirely
2. **Symmetric NATs**: Require TURN servers (not implemented yet)
3. **iOS App Store**: Additional restrictions on network access
4. **Battery Optimization**: May kill background connections

## Next Steps for Better Reliability

1. **Add TURN Servers**: For networks with strict NAT/firewall
2. **Connection Retry Logic**: Automatic reconnection attempts
3. **Fallback Mechanisms**: Alternative connection methods
4. **Quality Monitoring**: Real-time connection quality metrics

## Getting Help

If issues persist:
1. Check console logs for detailed error messages
2. Run network diagnostics and share results
3. Test on different devices/networks
4. Contact support with diagnostic report
