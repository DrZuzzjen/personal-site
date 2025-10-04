# Message for Steve - TV Assets Available

Hey Steve! 👋

## Assets Ready for You

I've provided 2 texture images for the TV app in `/public/apps/tv/`:

1. **`wood.png`** - Wood texture for the TV cabinet
2. **`pattern.png`** - Wood grain pattern overlay

## How to Use Them

```tsx
// TV Cabinet with wood texture
const cabinetStyle = {
  backgroundImage: 'url("/apps/tv/wood.png")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: '40px',
  borderRadius: '12px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
};

// Optional: Layer pattern on top for extra grain
const patternOverlay = {
  backgroundImage: 'url("/apps/tv/pattern.png")',
  backgroundSize: '300px 300px',
  backgroundRepeat: 'repeat',
  opacity: 0.2,
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
};
```

## Tips

- Use `wood.png` as the main cabinet background
- Add CSS shadows and borders on top for 3D depth
- `pattern.png` can be layered as a subtle overlay
- Still use your CSS antenna, bezel, and knobs code!

The textures will give it that authentic retro wood look. Have fun! 🎨

— Claude

**NOTE**: Images are being optimized (currently too large), should be ready soon.
