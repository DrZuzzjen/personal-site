# Mission: Real Portfolio Content + SEO/OG Tags 📝🔍

**Agent**: Claude (Orchestrator)
**Branch**: TBD (after Steve/Codex merge)
**Status**: PENDING - Wait for current missions

---

## 🎯 Objective

Replace placeholder content with real portfolio information and add proper metadata for SEO/social sharing.

---

## 📋 Part 1: Real Content

### About.txt (CV Card)
Replace placeholder with:
```
Name: [Your Real Name]
Title: [Your Real Title - e.g., Full-Stack Developer]
Location: [Your Location]

Links:
- LinkedIn: [your LinkedIn URL]
- GitHub: [your GitHub URL]
- X/Twitter: [your X URL]
- Email: [your email]

Bio:
[2-3 sentence professional bio]
```

### Project Files (My Documents)
Replace `Project_1.txt` through `Project_5.txt` with real projects:

**Template for each:**
```
Project Name: [Real Project Name]

Description:
[2-3 sentences about what it does, problem it solves]

Tech Stack:
- [Technology 1]
- [Technology 2]
- [Technology 3]

GitHub: [repo URL]
Live Demo: [URL if applicable]

Highlights:
- [Achievement/metric 1]
- [Achievement/metric 2]
```

### Resume.pdf (A:\ Floppy)
- Upload real PDF resume to `public/resume.pdf`
- Wire download button to actual file
- Ensure download works on all browsers

### Profile Picture (Optional)
- Add `public/profile-pic.png` (retro pixelated version?)
- Could display in About window
- Or use in Camera app as placeholder

---

## 📋 Part 2: Metadata & SEO

### Update app/layout.tsx Metadata
```typescript
export const metadata: Metadata = {
  title: 'Your Name - Portfolio | Windows 3.1 Experience',
  description: 'Full-stack developer portfolio built as a fully functional Windows 3.1 OS simulation. Explore projects, play retro games, and experience authentic Windows nostalgia.',
  keywords: ['portfolio', 'full-stack developer', 'windows 3.1', 'retro', 'web development'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.vercel.app',
    title: 'Your Name - Windows 3.1 Portfolio',
    description: 'A fully functional Windows 3.1 OS simulation showcasing projects and skills',
    siteName: 'Your Name Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Windows 3.1 Desktop Preview',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Your Name - Windows 3.1 Portfolio',
    description: 'Full-stack developer portfolio as a Windows 3.1 simulation',
    creator: '@yourTwitterHandle',
    images: ['/og-image.png'],
  },

  // Verification
  verification: {
    google: 'your-google-verification-code',
  },
};
```

### Create OG Image
- Screenshot of desktop with apps open
- Size: 1200x630px
- Save as `public/og-image.png`
- Ensure looks good on Twitter/LinkedIn preview

### Add Favicon
- Create retro Windows 3.1 style favicon
- Multiple sizes: 16x16, 32x32, 180x180
- Apple touch icon for iOS
- Place in `app/` folder as `favicon.ico`, `apple-icon.png`

---

## 📋 Part 3: Analytics & Indexing

### Google Analytics (Optional)
```typescript
// app/components/Analytics.tsx
'use client';

import Script from 'next/script';

export function Analytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        `}
      </Script>
    </>
  );
}
```

### robots.txt
```
# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://your-domain.vercel.app/sitemap.xml
```

### sitemap.xml (Next.js generates automatically)
Ensure it's enabled in `next.config.ts`:
```typescript
const nextConfig = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
    ];
  },
};
```

---

## 📋 Part 4: Server-Side Rendering for SEO

### Ensure Content is SSR
Current page.tsx is client component ('use client'). For SEO, we need:

**Option A**: Keep client component, add metadata in layout.tsx ✅ (EASIEST)
- Metadata in `app/layout.tsx` is server-rendered
- Page remains interactive client component
- Crawlers see metadata, users see interactive app

**Option B**: Hybrid approach (if needed)
- Extract static content to server component
- Render client components only for interactive parts
- More complex, may not be necessary

**Recommendation**: Stick with Option A - it works great for SPA-style apps

---

## 🚫 Constraints

- Wait until Steve and Codex finish their missions
- Don't break existing functionality
- Keep retro aesthetic intact
- Ensure content is professional but fun

---

## ✅ Acceptance Criteria

### Content
- [ ] About.txt has real name, title, links, bio
- [ ] All 5 project files have real project info
- [ ] Resume.pdf is real and downloads correctly
- [ ] Content is professional and accurate

### SEO/Metadata
- [ ] Page title, description, keywords set
- [ ] Open Graph tags for social sharing
- [ ] Twitter Card tags configured
- [ ] OG image created (1200x630px screenshot)
- [ ] Favicon and apple-touch-icon added
- [ ] robots.txt allows indexing
- [ ] Preview looks good on Twitter/LinkedIn

### Analytics (Optional)
- [ ] Google Analytics installed
- [ ] Tracking events on key actions
- [ ] Privacy-compliant

### Testing
- [ ] Twitter Card Validator: https://cards-dev.twitter.com/validator
- [ ] Facebook Debugger: https://developers.facebook.com/tools/debug/
- [ ] LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
- [ ] Google Search Console submitted

---

## 📦 Deliverables

- Real content in all placeholder files
- Complete metadata in layout.tsx
- OG image and favicons
- Optional: Analytics setup
- Tested social sharing previews

---

## 🚀 Next Steps (After This Mission)

1. Submit to Google Search Console
2. Share on social media (use those OG tags!)
3. Add to LinkedIn featured section
4. Consider: Blog posts as .txt files in My Documents?
5. Consider: Contact form (maybe as "Send Mail" app?)

---

**This transforms it from demo to legit portfolio!** 🎯

I'll tackle this after Steve and Codex wrap up their current work.
