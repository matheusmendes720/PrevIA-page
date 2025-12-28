# Open Graph Image Guide

## Current Setup

Your website is now configured to use Open Graph metadata for social media previews. The preview image is set to `/og-image.png`.

## Create Your Preview Image

### Requirements
- **Filename**: `og-image.png`
- **Location**: `frontend/public/og-image.png`
- **Recommended Size**: 1200 x 630 pixels (aspect ratio 1.91:1)
- **Format**: PNG or JPG

### Quick Options

#### Option 1: Use Existing Logo (Temporary)
You can temporarily copy one of your existing logos and resize it:
```bash
# Copy an existing logo as a placeholder
cp frontend/public/images/logos/previa-logo.png frontend/public/og-image.png
```

#### Option 2: Create Custom Image
Use any design tool to create a custom preview image:

**Recommended Tools:**
- **Canva** (Free): https://www.canva.com
  - Search for "Facebook Post" template (1200x630px)
  - Add your logo, title, and branding
  
- **Figma** (Free): https://www.figma.com
  - Create a frame at 1200x630px
  - Design your preview card

- **Photoshop/GIMP**: Create a 1200x630px canvas

**What to Include:**
- Nova Corrente logo/branding
- Title: "Nova Corrente - Demand Forecasting Dashboard"
- Subtitle: "Production-ready demand forecasting system with ML/DL models"
- Visual elements (charts, graphs, or your brand colors)

#### Option 3: Generate Programmatically
You can use tools like:
- **og-image.vercel.app**: https://og-image.vercel.app (generate via API)
- **Next.js OG Image**: Use `@vercel/og` package to generate dynamically

### Testing Your Preview

After adding `og-image.png` to `frontend/public/`:

1. **Build and deploy** your site
2. **Test with these tools:**
   - Facebook Debugger: https://developers.facebook.com/tools/debug/
   - Twitter Card Validator: https://cards-dev.twitter.com/validator
   - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

3. **Clear cache** if the old preview still shows:
   - Social media platforms cache preview images
   - Use the debugger tools above to force refresh

### Important Notes

- The image must be publicly accessible at `https://previa-novacorrente.netlify.app/og-image.png`
- Images are cached by social platforms - may take a few hours to update
- Always use absolute URLs in Open Graph tags (already configured ✅)
- For better performance, optimize the image (keep file size < 1MB)

