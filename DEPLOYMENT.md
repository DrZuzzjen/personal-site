# Deployment Checklist for fran-ai.dev

## ✅ Completed

### SEO & Metadata
- [x] Updated README with fran-ai.dev domain
- [x] Comprehensive meta tags (title, description, keywords)
- [x] Open Graph tags for social sharing
- [x] Twitter Card meta tags
- [x] Structured data (JSON-LD) for search engines
- [x] robots.txt created
- [x] sitemap.xml created
- [x] Canonical URLs configured

### Site Content
- [x] Portfolio data updated with real projects
- [x] Professional welcome message
- [x] LinkedIn and GitHub links added
- [x] Portfolio UI optimized

## 📋 TODO Before Launch

### 1. Create Social Media Image
- [ ] Create `og-image.png` (1200x630 pixels)
  - See `/public/og-image-todo.md` for instructions
  - Should include your photo and Windows 3.1 theme
  - Place at `/public/og-image.png`

### 2. Domain Configuration (Vercel)
- [ ] Add custom domain `fran-ai.dev` to Vercel project
- [ ] Configure DNS records (A/CNAME) at your domain registrar
- [ ] Enable automatic HTTPS
- [ ] Test domain is working

### 3. Search Engine Setup
- [ ] **Google Search Console**
  - Add property for https://fran-ai.dev
  - Verify ownership (add code to `layout.tsx` line 63)
  - Submit sitemap: https://fran-ai.dev/sitemap.xml
  - Request indexing

- [ ] **Bing Webmaster Tools**
  - Add site https://fran-ai.dev
  - Verify ownership
  - Submit sitemap
  - Request indexing

### 4. Social Media Preview Testing
- [ ] Test Open Graph tags: https://www.opengraph.xyz/
- [ ] Test Twitter Cards: https://cards-dev.twitter.com/validator
- [ ] Test LinkedIn preview: Share URL in LinkedIn and check preview

### 5. Performance & Analytics (Optional)
- [ ] Add Google Analytics (if desired)
- [ ] Test performance with Lighthouse
- [ ] Test on mobile devices
- [ ] Test in different browsers (Chrome, Firefox, Safari, Edge)

### 6. Final Checks
- [ ] All portfolio project links working
- [ ] All social links (LinkedIn, GitHub) working
- [ ] MSN Messenger AI chatbot working
- [ ] All games/apps functioning
- [ ] Boot sequence working
- [ ] No console errors

## 🚀 Deployment Commands

```bash
# Build locally to test
npm run build

# Start production build locally
npm run start

# Deploy to Vercel (if using Vercel CLI)
vercel --prod
```

## 📊 Post-Launch Monitoring

### Week 1
- [ ] Monitor Google Search Console for crawl errors
- [ ] Check if site is being indexed
- [ ] Monitor for any JavaScript errors

### Week 2-4
- [ ] Check search engine rankings for "Jean François Gutierrez"
- [ ] Check rankings for "AI Engineer portfolio"
- [ ] Monitor social media shares

## 🔗 Important URLs

- **Live Site**: https://fran-ai.dev
- **Google Search Console**: https://search.google.com/search-console
- **Bing Webmaster**: https://www.bing.com/webmasters
- **OG Debugger**: https://www.opengraph.xyz/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator

## 📝 Notes

- The site uses client-side rendering, ensure JavaScript is enabled for full experience
- Mobile users automatically see Terminal interface
- Boot sequence can be skipped with any key press
- User files are saved to localStorage

## 🎯 SEO Keywords Targeting

Primary:
- Jean François Gutierrez
- AI Engineer
- Developer Relations
- DevRel

Secondary:
- Machine Learning Portfolio
- LLM Projects
- Interactive Portfolio
- Windows 3.1 Portfolio
- Next.js Portfolio

---

**Last Updated**: 2025-10-06
