# Mission Brief: Camera App 📹

**Agent**: Steve
**Task**: Build webcam/mic app with screenshot feature
**Branch**: `feature/camera-app`
**Status**: 🟢 READY TO START

---

## 🎯 Mission Objective

Create a retro webcam app that accesses the user's camera and microphone, displays live feed in a CRT-style frame, and **lets them save their face as a screenshot** to the desktop!

Think: Old-school webcam software meets Windows 3.1 aesthetic.

---

## 📋 Requirements

### 1. Camera Access

**Use WebRTC API**:
```tsx
const getCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  } catch (err) {
    console.error('Camera access denied:', err);
    // Show error dialog
  }
};
```

**Permissions**:
- Browser will ask for camera/mic permission
- If denied, show error: "Camera access required. Please allow camera in browser settings."

---

### 2. Video Feed Display

**Retro CRT Aesthetic**:

```tsx
<div style={{
  position: 'relative',
  backgroundColor: '#000',
  padding: 20,
  borderRadius: 4,
}}>
  {/* Scanlines overlay */}
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
    pointerEvents: 'none',
    zIndex: 2,
  }} />

  {/* Video element */}
  <video
    ref={videoRef}
    autoPlay
    playsInline
    muted
    style={{
      width: '100%',
      maxWidth: 640,
      height: 'auto',
      display: 'block',
      filter: 'contrast(1.1) saturate(0.9)', // Slight retro color
    }}
  />
</div>
```

**Features**:
- Live video feed from webcam
- CRT scanlines overlay effect
- Dark frame/border (old monitor style)
- Slight color grading for retro feel

---

### 3. Screenshot Feature (THE MAIN ATTRACTION!)

**User wants to save their face as screenshot to desktop!**

**Implementation**:
```tsx
const takeScreenshot = () => {
  const video = videoRef.current;
  if (!video) return;

  // Create canvas to capture video frame
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  // Convert to blob
  canvas.toBlob((blob) => {
    if (!blob) return;

    // Create file and save to desktop
    const fileName = `Webcam_${Date.now()}.png`;
    const filePath = `/Desktop/${fileName}`;

    // Save to file system (you'll need to add image support to FileSystemContext)
    // For now, trigger download:
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    // Show confirmation
    alert(`📸 Screenshot saved to Desktop as ${fileName}!`);
  }, 'image/png');
};
```

**Button**:
- Big "📸 Take Photo" button below video
- Click → captures current frame
- Saves as PNG to desktop
- Shows confirmation message

---

### 4. Microphone Level Indicator

**Visual feedback that mic is working**:

```tsx
const [micLevel, setMicLevel] = useState(0);

useEffect(() => {
  if (!stream) return;

  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const microphone = audioContext.createMediaStreamSource(stream);

  microphone.connect(analyser);
  analyser.fftSize = 256;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  const updateLevel = () => {
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setMicLevel(average);
    requestAnimationFrame(updateLevel);
  };

  updateLevel();

  return () => {
    audioContext.close();
  };
}, [stream]);

// Render mic meter
<div style={{
  width: '100%',
  height: 20,
  backgroundColor: COLORS.WIN_GRAY,
  border: `2px solid ${COLORS.BORDER_SHADOW}`,
  position: 'relative',
}}>
  <div style={{
    height: '100%',
    width: `${(micLevel / 255) * 100}%`,
    backgroundColor: micLevel > 200 ? '#ff0000' : '#00ff00',
    transition: 'width 0.1s',
  }} />
</div>
```

**Shows**:
- Green bar when mic picks up sound
- Red when too loud (clipping)
- Visual confirmation mic is working

---

### 5. UI Layout

**Recommended design**:

```
┌─────────────────────────────────────┐
│ Camera                    [_][□][×] │
├─────────────────────────────────────┤
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║                               ║  │
│  ║       VIDEO FEED              ║  │
│  ║       (with scanlines)        ║  │
│  ║                               ║  │
│  ╚═══════════════════════════════╝  │
│                                     │
│  🎤 Mic Level: [████████░░░░░░░░]   │
│                                     │
│        [📸 Take Screenshot]         │
│        [🔴 Start/Stop Camera]       │
│                                     │
├─────────────────────────────────────┤
│ Status: Camera active               │
└─────────────────────────────────────┘
```

**Elements**:
- Video feed (640x480 or 16:9 aspect)
- Scanline overlay for retro effect
- Mic level meter below video
- Take Screenshot button (BIG and obvious)
- Start/Stop camera button (optional)
- Status bar showing "Camera active" or "Camera off"

---

### 6. Error Handling

**When camera access denied**:
```tsx
if (error) {
  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h3>⚠️ Camera Access Denied</h3>
      <p>This app needs camera permission to work.</p>
      <p>Please allow camera access in your browser settings.</p>
      <button onClick={() => getCamera()}>Try Again</button>
    </div>
  );
}
```

**When no camera found**:
```tsx
<p>❌ No camera detected. Please connect a webcam.</p>
```

---

### 7. Desktop Integration

**Desktop Icon**:
- Add Camera.exe to desktop icons
- Icon: 📹 or 📷
- Double-click opens Camera app

**File Location**: `app/components/Apps/Camera/Camera.tsx`

**Add to constants.ts**:
```tsx
{
  id: 'camera-exe',
  type: 'file',
  name: 'Camera.exe',
  icon: '📹',
  gridPosition: { x: 0, y: 4 },
  isProtected: false,
  onDoubleClick: 'launch-camera'
}
```

---

### 8. Screenshot Storage (Bonus)

**Ideal**: Save screenshot to FileSystem as image file

**Simple version** (for now):
- Download screenshot as PNG file
- User can manually save to desktop
- Show message: "Screenshot downloaded! Save to desktop."

**Future enhancement**:
- Actually save to `/Desktop/` in FileSystemContext
- Support image file type
- Show thumbnail in File Explorer

---

## 🎨 Visual Design

### CRT Monitor Frame

**Black border with retro styling**:
```tsx
const monitorStyle = {
  backgroundColor: '#1a1a1a',
  padding: 24,
  borderRadius: 8,
  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
};
```

### Scanlines Effect

**Horizontal lines over video**:
```css
background: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgba(0, 0, 0, 0.3) 2px,
  rgba(0, 0, 0, 0.3) 4px
);
```

### Button Styling

**Screenshot button should be OBVIOUS**:
```tsx
<button
  onClick={takeScreenshot}
  style={{
    padding: '12px 32px',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: COLORS.WIN_BLUE,
    color: COLORS.WIN_WHITE,
    border: `2px solid ${COLORS.BORDER_LIGHT}`,
    cursor: 'pointer',
    marginTop: 16,
  }}
>
  📸 Take Screenshot
</button>
```

---

## ✅ Success Criteria

Your Camera app is complete when:

1. ✅ Requests camera/mic permission on open
2. ✅ Shows live video feed from webcam
3. ✅ Has retro CRT aesthetic (scanlines, dark frame)
4. ✅ Mic level meter shows audio input
5. ✅ Take Screenshot button works
6. ✅ Screenshot saves as PNG file
7. ✅ Camera.exe icon on desktop
8. ✅ Double-click launches Camera app
9. ✅ Error handling for denied permissions
10. ✅ No lint errors
11. ✅ All commits use `[STEVE]` prefix

**Bonus**:
- Record video (save as .webm)
- Filters/effects on video
- Save screenshot directly to FileSystem
- Flip camera (front/back on mobile)

---

## 🔧 Technical Notes

### Browser APIs Needed
- `navigator.mediaDevices.getUserMedia()` - Camera/mic access
- `HTMLVideoElement` - Display video stream
- `HTMLCanvasElement` - Capture screenshot
- `Web Audio API` - Mic level detection
- `Blob` / `URL.createObjectURL()` - Download file

### Permissions
- Browser will show permission dialog
- HTTPS required for camera access (localhost is OK)
- User must click "Allow"

### Performance
- Video element is hardware accelerated
- Scanlines overlay is CSS only (performant)
- Audio analysis runs in requestAnimationFrame

---

## 🚀 Getting Started

1. **Pull latest**: Already on `feature/camera-app`
2. **Create Camera component**: `app/components/Apps/Camera/Camera.tsx`
3. **Test camera access**: Get permission working first
4. **Show video feed**: Display stream in video element
5. **Add scanlines**: CSS overlay for retro look
6. **Implement screenshot**: Canvas capture + download
7. **Add mic meter**: Audio analysis visual
8. **Desktop icon**: Add to constants and test launch

**Estimated Time**: 3-4 hours

---

## 🧪 Testing Checklist

- [ ] Open Camera.exe from desktop
- [ ] Browser asks for camera permission
- [ ] Allow permission - video feed appears
- [ ] Video shows with scanlines overlay
- [ ] Mic meter moves when you talk
- [ ] Click "Take Screenshot" - downloads PNG
- [ ] Screenshot shows your face clearly
- [ ] Open downloaded file - image looks good
- [ ] Deny permission - shows error message
- [ ] Click "Try Again" - asks for permission again

---

## 📝 Commit Format

```
[STEVE] feat(camera): add Camera app with webcam access
[STEVE] feat(camera): implement screenshot capture functionality
[STEVE] feat(camera): add CRT scanlines and retro styling
[STEVE] feat(camera): add microphone level indicator
[STEVE] feat(camera): add desktop icon and app integration
```

---

## 🎯 Why This Matters

This is a **showcase feature** that demonstrates:
- Modern browser APIs (WebRTC, Canvas, Web Audio)
- Permission handling
- Media capture
- File downloads
- Retro aesthetic design

Plus, it's FUN! Users can take selfies in a retro Windows 3.1 app. **That's memorable!** 📸

**Most importantly**: User requested "save your face as screenshot" - deliver that exact feature prominently!

**Make it work, make it retro!** 🎥🚀

— Claude (Product Owner)
