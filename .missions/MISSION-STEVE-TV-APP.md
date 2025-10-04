# Mission Brief: Retro TV App 📺

**Agent**: Steve
**Task**: Build YouTube playlist player in retro TV frame
**Branch**: `feature/tv-app`
**Status**: 🟢 READY TO START

---

## 🎯 Mission Objective

Create a nostalgic retro TV app that plays YouTube videos in an old-school TV frame with wooden borders, rabbit ear antenna, and channel knobs!

Think: 1980s living room TV meets Windows 3.1.

---

## 📋 Requirements

### 1. YouTube Playlist Embed

**Use YouTube iframe API**:
```tsx
<iframe
  width="640"
  height="480"
  src="https://www.youtube.com/embed/videoid?list=playlistid&autoplay=1"
  title="Retro TV"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

**Playlist to embed** (you can use any playlist, or I'll provide one):
- Could be music videos
- Retro commercials
- 80s/90s content
- Or let user configure playlist URL

---

### 2. Retro TV Frame Design

**Wooden TV Cabinet**:
```tsx
const tvFrameStyle = {
  backgroundColor: '#654321', // Wood brown
  padding: 40,
  borderRadius: 12,
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  backgroundImage: 'linear-gradient(90deg, #654321 0%, #8B4513 50%, #654321 100%)',
};
```

**Screen Bezel** (around video):
```tsx
const bezelStyle = {
  backgroundColor: '#2a2a2a',
  padding: 20,
  borderRadius: 8,
  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
};
```

**Layout**:
```
┌───────────────────────────────────┐
│ ╔═══════════════════════════════╗ │  ← Wooden cabinet
│ ║  ┌─────────────────────────┐ ║ │
│ ║  │                         │ ║ │  ← Antenna on top
│ ║  │    YOUTUBE VIDEO        │ ║ │
│ ║  │                         │ ║ │  ← Black bezel
│ ║  └─────────────────────────┘ ║ │
│ ╚═══════════════════════════════╝ │
│                                   │
│  🔊 ◄ Volume ►   📺 ◄ Channel ►  │  ← Controls
│                                   │
└───────────────────────────────────┘
```

---

### 3. Rabbit Ear Antenna

**Visual element on top**:
```tsx
<div style={{
  position: 'absolute',
  top: -40,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: 100,
}}>
  {/* Left antenna */}
  <div style={{
    width: 4,
    height: 60,
    backgroundColor: '#888',
    transform: 'rotate(-25deg)',
    transformOrigin: 'bottom',
    borderRadius: 2,
  }} />

  {/* Right antenna */}
  <div style={{
    width: 4,
    height: 60,
    backgroundColor: '#888',
    transform: 'rotate(25deg)',
    transformOrigin: 'bottom',
    borderRadius: 2,
  }} />
</div>
```

---

### 4. Channel Controls

**Channel switching** (switches between videos in playlist):

**Simple approach** - Modify YouTube embed URL:
```tsx
const [currentVideo, setCurrentVideo] = useState(0);
const playlistVideos = [
  'dQw4w9WgXcQ', // Video ID 1
  'VIDEO_ID_2',
  'VIDEO_ID_3',
];

const nextChannel = () => {
  setCurrentVideo((prev) => (prev + 1) % playlistVideos.length);
};

const prevChannel = () => {
  setCurrentVideo((prev) => (prev - 1 + playlistVideos.length) % playlistVideos.length);
};

// Embed URL
const videoUrl = `https://www.youtube.com/embed/${playlistVideos[currentVideo]}`;
```

**Channel buttons**:
```tsx
<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
  <button onClick={prevChannel}>◄</button>
  <span>CH {currentVideo + 1}</span>
  <button onClick={nextChannel}>►</button>
</div>
```

---

### 5. Volume Control (Visual Only)

**Volume slider** (controls YouTube player if using API):

**Simple version** - just visual slider:
```tsx
const [volume, setVolume] = useState(50);

<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
  <button onClick={() => setVolume(v => Math.max(0, v - 10))}>🔉</button>
  <input
    type="range"
    min="0"
    max="100"
    value={volume}
    onChange={(e) => setVolume(Number(e.target.value))}
    style={{ width: 100 }}
  />
  <button onClick={() => setVolume(v => Math.min(100, v + 10))}>🔊</button>
  <span>{volume}%</span>
</div>
```

**Advanced version** - Actually control YouTube player:
- Use YouTube iframe API
- Call `player.setVolume(volume)`
- Requires more setup

---

### 6. TV Effects (Optional Polish)

**Static noise between channels**:
```tsx
const [isChangingChannel, setIsChangingChannel] = useState(false);

const changeChannel = (direction) => {
  setIsChangingChannel(true);
  // Show static for 500ms
  setTimeout(() => {
    setCurrentVideo(/* new channel */);
    setIsChangingChannel(false);
  }, 500);
};

{isChangingChannel && (
  <div style={{
    position: 'absolute',
    inset: 0,
    background: 'url(data:image/png;base64,STATIC_NOISE_IMAGE)',
    animation: 'staticNoise 0.1s infinite',
  }} />
)}
```

**CRT Curvature** (CSS filter):
```css
filter: contrast(1.2) saturate(0.9);
border-radius: 8px;
```

---

### 7. UI Layout

**Recommended design**:

```
┌────────────────────────────────────────┐
│ TV                           [_][□][×] │
├────────────────────────────────────────┤
│                 /\                     │  ← Antenna
│                /  \                    │
│   ╔══════════════════════════════╗     │
│   ║  ┌────────────────────────┐ ║     │
│   ║  │                        │ ║     │  ← Wooden frame
│   ║  │   YOUTUBE VIDEO        │ ║     │
│   ║  │                        │ ║     │  ← Black bezel
│   ║  │                        │ ║     │
│   ║  └────────────────────────┘ ║     │
│   ╚══════════════════════════════╝     │
│                                        │
│   🔊 Volume: [▬▬▬▬▬▬▬░░░] 70%         │
│   📺 Channel: [◄]  5  [►]              │
│                                        │
│   [🔌 Power]   [⏸️ Play/Pause]         │
│                                        │
├────────────────────────────────────────┤
│ Now Playing: Rick Astley - Never...   │
└────────────────────────────────────────┘
```

---

### 8. Desktop Integration

**Desktop Icon**:
- Add TV.exe to desktop
- Icon: 📺
- Double-click opens TV app

**Add to constants.ts**:
```tsx
{
  id: 'tv-exe',
  type: 'file',
  name: 'TV.exe',
  icon: '📺',
  gridPosition: { x: 1, y: 4 },
  isProtected: false,
}
```

**App registration**:
```tsx
// In openWindow handler
case 'tv':
  return <TV />;
```

---

### 9. Playlist Configuration (Bonus)

**Allow user to set playlist URL**:
```tsx
const [playlistUrl, setPlaylistUrl] = useState(
  'https://www.youtube.com/embed/videoid?list=PLxxxxxx'
);

// Settings dialog
<dialog>
  <h3>TV Settings</h3>
  <label>
    YouTube Playlist URL:
    <input
      type="text"
      value={playlistUrl}
      onChange={(e) => setPlaylistUrl(e.target.value)}
    />
  </label>
  <button>Save</button>
</dialog>
```

---

## 🎨 Visual Design Inspiration

### Color Palette

**Wood tones**:
- Cabinet: `#654321` (Saddle brown)
- Trim: `#8B4513` (Sienna)
- Dark wood: `#3E2723`

**Screen**:
- Bezel: `#2a2a2a` (Almost black)
- Screen glow: `rgba(255, 255, 255, 0.05)`

**Controls**:
- Knobs: Metallic gray/silver
- Buttons: Classic Windows style

---

## 📦 Visual Assets Guide

### Option 1: Pure CSS (Recommended - Start Here)

**Wood Grain Effect**:
```tsx
const woodStyle = {
  background: `
    linear-gradient(90deg,
      #5a3a1a 0%,
      #6b4423 25%,
      #5a3a1a 50%,
      #6b4423 75%,
      #5a3a1a 100%
    )
  `,
  backgroundSize: '100% 100%',
  boxShadow: `
    0 8px 16px rgba(0,0,0,0.4),
    inset 0 2px 4px rgba(255,255,255,0.1),
    inset 0 -2px 6px rgba(0,0,0,0.3)
  `,
  borderRadius: '12px',
  border: '4px solid #4a2f1a',
};
```

**Screen Bezel**:
```tsx
const bezelStyle = {
  backgroundColor: '#1a1a1a',
  padding: '24px',
  borderRadius: '8px',
  boxShadow: `
    inset 0 0 30px rgba(0,0,0,0.9),
    inset 0 4px 8px rgba(0,0,0,0.8)
  `,
  border: '3px solid #0a0a0a',
};
```

**Antenna (Pure CSS)**:
```tsx
// Left antenna
<div style={{
  position: 'absolute',
  top: -50,
  left: '40%',
  width: '3px',
  height: '70px',
  background: 'linear-gradient(to bottom, #999, #666)',
  transform: 'rotate(-20deg)',
  transformOrigin: 'bottom',
  borderRadius: '2px',
  boxShadow: '2px 0 4px rgba(0,0,0,0.3)',
}}>
  {/* Ball on top */}
  <div style={{
    position: 'absolute',
    top: -6,
    left: -3,
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, #bbb, #666)',
  }} />
</div>
```

**Knobs/Dials**:
```tsx
const knobStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: `
    radial-gradient(circle at 30% 30%,
      #aaa,
      #666 40%,
      #333
    )
  `,
  border: '2px solid #444',
  boxShadow: `
    0 2px 4px rgba(0,0,0,0.5),
    inset 0 1px 2px rgba(255,255,255,0.3)
  `,
  cursor: 'pointer',
};
```

---

### Option 2: Image Assets (If CSS Doesn't Look Good)

**USER: Please find these assets** (I'll tell you what to search for):

**Search Terms for Free Assets**:

1. **"retro wood texture seamless pattern free"**
   - Download wood texture PNG/JPG
   - Save to: `/public/assets/wood-texture.png`
   - Use as: `backgroundImage: url('/assets/wood-texture.png')`

2. **"vintage TV frame transparent PNG free"**
   - Old TV bezel/frame overlay
   - Save to: `/public/assets/tv-frame.png`
   - Layer over YouTube iframe

3. **AI-Generated Option** - Ask AI image generator:
   - **Prompt**: "Seamless wood grain texture, brown oak, top view, tileable pattern, 512x512, photorealistic"
   - **Or**: "Vintage 1980s TV cabinet texture, wooden brown, seamless pattern"
   - Save generated image to `/public/assets/`

**Where to get free assets**:
- Freepik.com (filter by free)
- Pixabay.com
- Unsplash.com
- TextureKing.com
- Or use AI: Midjourney, DALL-E, Stable Diffusion

---

### Option 3: SVG Assets (Clean and Scalable)

**Simple TV Frame SVG** (embed directly in code):
```tsx
const tvFrameSVG = `
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Wood cabinet -->
  <rect x="0" y="0" width="800" height="600" fill="#654321" rx="20"/>
  <rect x="10" y="10" width="780" height="580" fill="#5a3a1a" rx="15"/>

  <!-- Screen cutout -->
  <rect x="80" y="80" width="640" height="440" fill="#000" rx="8"/>

  <!-- Wood grain lines -->
  <path d="M0,100 Q400,90 800,100" stroke="#4a2a0a" opacity="0.3"/>
  <path d="M0,200 Q400,210 800,200" stroke="#4a2a0a" opacity="0.3"/>
  <path d="M0,300 Q400,290 800,300" stroke="#4a2a0a" opacity="0.3"/>
</svg>
`;

// Use as background
<div dangerouslySetInnerHTML={{ __html: tvFrameSVG }} />
```

---

### Recommended Approach

**START WITH**: Pure CSS (Option 1)
- Fastest to implement
- No external dependencies
- Looks decent with gradients and shadows

**IF IT LOOKS BAD**:
1. Ask user to search for wood texture
2. Or ask user to AI-generate texture
3. Drop image into `/public/assets/`
4. Update CSS to use image

**STEVE**: Try CSS first. If you need assets, add a `TODO:` in your commit message and we'll provide them!

---

### 3D Effect

**Make it look dimensional**:
```tsx
boxShadow: `
  0 4px 8px rgba(0,0,0,0.3),
  inset 0 2px 4px rgba(255,255,255,0.1),
  inset 0 -2px 4px rgba(0,0,0,0.5)
`;
```

---

## ✅ Success Criteria

Your TV app is complete when:

1. ✅ YouTube video plays in iframe
2. ✅ Retro TV frame with wooden cabinet
3. ✅ Rabbit ear antenna on top
4. ✅ Channel buttons switch videos
5. ✅ Volume slider (visual or functional)
6. ✅ TV.exe icon on desktop
7. ✅ Double-click launches TV app
8. ✅ Looks nostalgic and fun
9. ✅ No lint errors
10. ✅ All commits use `[STEVE]` prefix

**Bonus**:
- Static noise between channels
- Power button (turns screen black)
- Play/Pause control
- CRT scan lines overlay
- Channel number display
- Playlist title in status bar

---

## 🔧 Technical Notes

### YouTube Embed

**Basic embed**:
```html
<iframe src="https://www.youtube.com/embed/VIDEO_ID" />
```

**Playlist embed**:
```html
<iframe src="https://www.youtube.com/embed/VIDEO_ID?list=PLAYLIST_ID" />
```

**Autoplay** (might be blocked by browser):
```html
<iframe src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1" />
```

### YouTube iframe API (Advanced)

If you want programmatic control:
```tsx
// Load YouTube API
<script src="https://www.youtube.com/iframe_api"></script>

// Create player
const player = new YT.Player('player', {
  videoId: 'VIDEO_ID',
  events: {
    onReady: (event) => event.target.playVideo()
  }
});

// Control player
player.playVideo();
player.pauseVideo();
player.setVolume(50);
player.nextVideo(); // In playlist
```

---

## 🚀 Getting Started

1. **Pull latest**: Already on `feature/tv-app`
2. **Create TV component**: `app/components/Apps/TV/TV.tsx`
3. **Basic iframe**: Get YouTube video playing
4. **Add frame**: Wooden cabinet styling
5. **Add antenna**: Visual decoration
6. **Channel switching**: Button controls
7. **Volume slider**: Visual or functional
8. **Desktop icon**: Add to constants

**Estimated Time**: 2-3 hours

---

## 🧪 Testing Checklist

- [ ] Open TV.exe from desktop
- [ ] YouTube video plays
- [ ] Looks like retro TV (wood, bezel, antenna)
- [ ] Click next channel - video changes
- [ ] Click prev channel - goes back
- [ ] Volume slider moves (bonus: actually changes volume)
- [ ] Full screen button works (YouTube native)
- [ ] Window can be dragged and resized
- [ ] Multiple TVs can open at once

---

## 📝 Commit Format

```
[STEVE] feat(tv): add TV app with YouTube embed
[STEVE] feat(tv): create retro TV frame with wooden cabinet
[STEVE] feat(tv): add rabbit ear antenna decoration
[STEVE] feat(tv): implement channel switching controls
[STEVE] feat(tv): add volume slider and controls
[STEVE] feat(tv): add desktop icon and app integration
```

---

## 🎯 Why This Matters

This is pure **nostalgia** - combines modern tech (YouTube) with retro aesthetic (old TV).

It shows:
- Creative UI design
- iframe embedding
- State management (channels, volume)
- Attention to detail (antenna, wood grain)

Plus it's FUN! Users will smile when they see a fake TV playing real YouTube videos in Windows 3.1. **That's the portfolio magic!** ✨

**Make it look old, make it work new!** 📺🚀

— Claude (Product Owner)

---

## 🎁 ASSETS PROVIDED!

**USER has provided 2 texture images** in `/public/apps/tv/`:

1. **`wood.png`** - Wood texture for TV cabinet
2. **`pattern.png`** - Pattern/grain texture

**How to use them**:

```tsx
// Wood cabinet background
const cabinetStyle = {
  backgroundImage: 'url("/apps/tv/wood.png")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  // Or combine with gradient:
  background: `
    linear-gradient(rgba(90, 58, 26, 0.3), rgba(90, 58, 26, 0.3)),
    url("/apps/tv/wood.png")
  `,
  backgroundSize: 'cover',
};

// Pattern overlay (optional)
const patternStyle = {
  backgroundImage: 'url("/apps/tv/pattern.png")',
  backgroundSize: '200px 200px', // Adjust tile size
  backgroundRepeat: 'repeat',
  opacity: 0.3,
};
```

**You can**:
- Use `wood.png` as main cabinet texture
- Use `pattern.png` as overlay for grain detail
- Or just use one if it looks good alone
- Still add CSS shadows/borders on top for depth

**No need to generate your own textures - these are ready to use!** 🎨
