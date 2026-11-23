import advantagePinterest from '../assets/images/advantage_pinterest.jpg';
import africartPinterest from '../assets/images/africart_pinterest.jpg';
import cogitoPinterest from '../assets/images/cogito_pinterest.jpg';
import fitnovaPinterest from '../assets/images/fitnova_pinterest.jpg';
import heroPinterestPortrait from '../assets/images/hero_pinterest_portrait.jpg';
import koraPinterest from '../assets/images/kora_pinterest.jpg';
import neoscreenPinterest from '../assets/images/neoscreen_pinterest.jpg';
import nurightPinterest from '../assets/images/nuright_pinterest.jpg';
import overitePinterest from '../assets/images/overite_pinterest.jpg';
import powerupPinterest from '../assets/images/powerup_pinterest.jpg';
import urockPinterest from '../assets/images/urock_pinterest.jpg';
import veraSmartHome from '../assets/images/vera_smart_home_1794832137834.jpg';

export interface ProjectItem {
  id: string;
  number: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  stack: string[];
  accentHex: string;
  bgHex: string;
  imageUrl: string;
  liveUrl: string;
  themeKind:
    | 'asad'
    | 'nuright'
    | 'overite'
    | 'urock'
    | 'advantage'
    | 'fitnova'
    | 'africart'
    | 'cogito'
    | 'neoscreen'
    | 'kora'
    | 'powerup'
    | 'vera';
}

export const SALON_IMAGE_PATH = nurightPinterest;
export const PORTRAIT_IMAGE_PATH = heroPinterestPortrait;

export const PROJECTS: ProjectItem[] = [
  {
    id: 'asad-studio',
    number: '01',
    title: 'Asad Web Developer',
    category: 'WEB APPS · 3D · FULL-STACK',
    tagline: 'Fast, Modern & Responsive Digital Products',
    description:
      'I build fast, modern, and responsive websites and web apps that help businesses grow online and win more clients — combining Three.js spatial motion, clean UI architecture, and Supabase-backed workflows.',
    stack: ['REACT', 'TYPESCRIPT', 'THREE.JS', 'TAILWIND', 'SUPABASE', 'PWA'],
    accentHex: '#D4B475',
    bgHex: '#0B0D14',
    imageUrl: heroPinterestPortrait,
    liveUrl: 'https://asadweb.example.com',
    themeKind: 'asad',
  },
  {
    id: 'nuright',
    number: '02',
    title: 'NURIGHT Beauty Parlour',
    category: 'BEAUTY · E-COMMERCE · PWA',
    tagline: 'Look Naturally, Glow Naturally, Shine Naturally',
    description:
      'A full platform for a Lagos beauty parlour: a cinematic React + Three.js storefront with scroll-driven frame sequences, service booking, a shop with Paystack checkout and Shipbubble delivery, and an installable admin app with push notifications.',
    stack: ['REACT', 'THREE.JS', 'GSAP', 'LENIS', 'PAYSTACK', 'SHIPBUBBLE', 'PWA', 'PHP'],
    accentHex: '#D4B475',
    bgHex: '#18130E',
    imageUrl: nurightPinterest,
    liveUrl: 'https://nurightparlour.example.com',
    themeKind: 'nuright',
  },
  {
    id: 'overite',
    number: '03',
    title: 'Overite',
    category: 'TECHNOLOGY · LANDING PAGE',
    tagline: "Africa's digital future should be built here.",
    description:
      'High-impact corporate technology platform featuring a custom WebGL orbital globe shader, interactive partner showcase for regional infrastructure leaders, and sub-second route choreography.',
    stack: ['REACT', 'THREE.JS', 'GLSL', 'TYPESCRIPT', 'TAILWIND', 'LENIS'],
    accentHex: '#60A5FA',
    bgHex: '#0A101D',
    imageUrl: overitePinterest,
    liveUrl: 'https://overite.example.com',
    themeKind: 'overite',
  },
  {
    id: 'urock',
    number: '04',
    title: 'URock Media',
    category: 'MEDIA · MAGAZINE · RADIO · TV',
    tagline: 'THE VOICE OF THE YOUTH IN RHYTHM',
    description:
      'Multi-channel youth entertainment network uniting live radio streaming, editorial print archives, and high-energy TV programming inside a responsive dark-and-amber flagship web app.',
    stack: ['REACT', 'WORDPRESS', 'PHP', 'WEB AUDIO', 'TAILWIND', 'PWA'],
    accentHex: '#FACC15',
    bgHex: '#11100B',
    imageUrl: urockPinterest,
    liveUrl: 'https://urockmedia.example.com',
    themeKind: 'urock',
  },
  {
    id: 'advantage',
    number: '05',
    title: 'Advantage Care Group',
    category: 'HEALTHCARE · TEXAS, USA',
    tagline: 'Excellence in Care, Your Advantage.',
    description:
      'Accessible multi-clinic healthcare portal built for Texas care providers, featuring rapid specialist search, digital patient intake, and WCAG AA compliant appointment scheduling.',
    stack: ['NEXT.JS', 'TYPESCRIPT', 'TAILWIND', 'JWT', 'GOOGLE AUTH'],
    accentHex: '#10B981',
    bgHex: '#05070D',
    imageUrl: advantagePinterest,
    liveUrl: 'https://advantagecare.example.com',
    themeKind: 'advantage',
  },
  {
    id: 'fitnova',
    number: '06',
    title: 'FitNova',
    category: 'FITNESS · SAAS · TRACKER',
    tagline: 'Precision Biometrics & Split Analytics',
    description:
      'Athletic performance workspace with real-time volume progression curves, macro adherence telemetry, and offline-first gym session logging.',
    stack: ['REACT', 'TYPESCRIPT', 'FRAMER MOTION', 'PWA', 'TAILWIND'],
    accentHex: '#F97316',
    bgHex: '#141110',
    imageUrl: fitnovaPinterest,
    liveUrl: 'https://fitnova.example.com',
    themeKind: 'fitnova',
  },
  {
    id: 'africart',
    number: '07',
    title: 'AfriCart Logistics',
    category: 'LOGISTICS · FLEET · API',
    tagline: 'Automated Last-Mile Dispatch Across Lagos',
    description:
      'Live fleet command interface integrating Shipbubble webhooks, rider GPS corridors via Leaflet, and instant merchant checkout rate calculators.',
    stack: ['REACT', 'LEAFLET', 'SHIPBUBBLE', 'PAYSTACK', 'MYSQL', 'PHP'],
    accentHex: '#38BDF8',
    bgHex: '#0B1319',
    imageUrl: africartPinterest,
    liveUrl: 'https://africart.example.com',
    themeKind: 'africart',
  },
  {
    id: 'cogito',
    number: '08',
    title: 'Cogito AI Banking',
    category: 'AI FINTECH · MOBILE & DESKTOP',
    tagline: 'Intelligent Credit & Automated Cashflow',
    description:
      'Modern AI-assisted digital banking cockpit displaying instant liquidity balances, automated underwriting rates, and conversational financial diagnostics.',
    stack: ['REACT', 'TYPESCRIPT', 'AI APIS', 'JWT', 'TAILWIND'],
    accentHex: '#D4B475',
    bgHex: '#0D1014',
    imageUrl: cogitoPinterest,
    liveUrl: 'https://cogitobank.example.com',
    themeKind: 'cogito',
  },
  {
    id: 'neoscreen',
    number: '09',
    title: 'NeoScreen',
    category: 'ADTECH · DIGITAL BILLBOARDS',
    tagline: 'Programmatic Outdoor Billboard Network',
    description:
      'Self-serve DOOH media booking engine enabling brands to preview creative slots on roadside LED billboards across major metro hubs and book impressions live.',
    stack: ['REACT', 'THREE.JS', 'PAYSTACK', 'LEAFLET', 'TYPESCRIPT'],
    accentHex: '#A78BFA',
    bgHex: '#110E1A',
    imageUrl: neoscreenPinterest,
    liveUrl: 'https://neoscreen.example.com',
    themeKind: 'neoscreen',
  },
  {
    id: 'kora',
    number: '10',
    title: 'Kora Studio',
    category: 'FASHION · 3D LOOKBOOK',
    tagline: 'Contemporary Bespoke Apparel Storefront',
    description:
      'Editorial fashion commerce platform pairing fluid Lenis lookbook transitions with instant Paystack checkout and automated Shipbubble doorstep courier dispatch.',
    stack: ['REACT', 'LENIS', 'PAYSTACK', 'SHIPBUBBLE', 'TAILWIND'],
    accentHex: '#E5C687',
    bgHex: '#161310',
    imageUrl: koraPinterest,
    liveUrl: 'https://korastudio.example.com',
    themeKind: 'kora',
  },
  {
    id: 'powerup',
    number: '11',
    title: 'PowerUp',
    category: 'FINTECH · ELECTRICITY PAYMENTS',
    tagline: 'Instant Utility & Smart Meter Top-Ups',
    description:
      'Zero-friction prepaid electricity token platform with real-time tariff forecasting, meter number verification, and instant digital token delivery.',
    stack: ['REACT', 'PWA', 'PAYSTACK', 'TYPESCRIPT', 'JWT'],
    accentHex: '#F59E0B',
    bgHex: '#12100B',
    imageUrl: powerupPinterest,
    liveUrl: 'https://powerup.example.com',
    themeKind: 'powerup',
  },
  {
    id: 'vera',
    number: '12',
    title: 'Vera',
    category: 'IOT · SMART HOME',
    tagline: 'Good Morning, Asad — Connected Living',
    description:
      'Low-latency IoT home telemetry hub controlling room climate, lighting circuits, and solar load balancing with real-time kWh consumption telemetry.',
    stack: ['REACT', 'TYPESCRIPT', 'IOT API', 'TAILWIND', 'PWA'],
    accentHex: '#3B82F6',
    bgHex: '#F6F8FB',
    imageUrl: veraSmartHome,
    liveUrl: 'https://vera.example.com',
    themeKind: 'vera',
  },
];

/**
 * Draws a crisp, high-resolution UI preview with embedded project photography
 * onto an HTMLCanvasElement for both 3D Night Tunnel panels and Modal views.
 */
export function drawProjectPreviewCanvas(
  canvas: HTMLCanvasElement,
  project: ProjectItem,
  loadedImage?: HTMLImageElement | null
): void {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, w, h);

  // Base background
  ctx.fillStyle = project.bgHex;
  ctx.fillRect(0, 0, w, h);

  const isLightTheme = project.themeKind === 'vera';

  // Draw the project photo across the main stage (below top chrome bar)
  const topBarH = 54;
  const bottomBarH = 58;
  const stageH = h - topBarH - bottomBarH;

  const isFullPageUi =
    project.themeKind === 'neoscreen' ||
    project.themeKind === 'kora' ||
    project.themeKind === 'powerup';

  const isPortraitShowcase =
    project.themeKind === 'nuright' ||
    project.themeKind === 'overite' ||
    project.themeKind === 'urock' ||
    project.themeKind === 'advantage' ||
    project.themeKind === 'fitnova' ||
    project.themeKind === 'africart' ||
    project.themeKind === 'cogito';

  if (loadedImage && loadedImage.complete && loadedImage.naturalWidth > 0) {
    const imgAspect = loadedImage.naturalWidth / loadedImage.naturalHeight;
    const stageAspect = w / stageH;

    if (isPortraitShowcase) {
      // Subtle studio radial spotlight behind right portrait card (zero dark scrim over the face)
      const glow = ctx.createRadialGradient(w * 0.78, topBarH + stageH * 0.45, 20, w * 0.78, topBarH + stageH * 0.45, 460);
      glow.addColorStop(0, project.accentHex + '2E');
      glow.addColorStop(1, project.bgHex);
      ctx.fillStyle = glow;
      ctx.fillRect(0, topBarH, w, stageH);

      const frameH = stageH - 32;
      const frameW = project.themeKind === 'advantage' ? 464 : 416;
      const frameX = w - frameW - 30;
      const frameY = topBarH + 16;

      ctx.save();
      roundRect(ctx, frameX, frameY, frameW, frameH, 18);
      ctx.clip();

      if (project.themeKind === 'advantage') {
        const size = Math.min(frameW, frameH);
        const drawX = frameX + (frameW - size) / 2;
        const drawY = frameY + (frameH - size) / 2;
        ctx.drawImage(loadedImage, drawX, drawY, size, size);
      } else {
        // Fit width cleanly and bias vertical framing near top so full head & face remain crisp
        const drawW = frameW;
        const drawH = frameW / imgAspect;
        const drawX = frameX;
        const drawY =
          drawH >= frameH
            ? frameY + (frameH - drawH) * 0.06
            : frameY + (frameH - drawH) * 0.5;
        ctx.drawImage(loadedImage, drawX, drawY, drawW, drawH);
      }
      ctx.restore();

      // Crisp accent frame hairline
      ctx.save();
      ctx.strokeStyle = project.accentHex + '66';
      ctx.lineWidth = 1.5;
      roundRect(ctx, frameX, frameY, frameW, frameH, 18);
      ctx.stroke();
      ctx.restore();
    } else {
      let drawW = w;
      let drawH = stageH;
      let drawX = 0;
      let drawY = topBarH;

      if (isFullPageUi) {
        // Align full-page UI screenshot to the top hero banner
        drawW = w;
        drawH = w / imgAspect;
        drawY = topBarH;
      } else if (imgAspect > stageAspect) {
        drawH = stageH;
        drawW = stageH * imgAspect;
        drawX = (w - drawW) / 2;
      } else {
        drawW = w;
        drawH = w / imgAspect;
        const verticalBias = imgAspect < 1.25 ? 0.14 : 0.5;
        drawY = topBarH + (stageH - drawH) * verticalBias;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, topBarH, w, stageH);
      ctx.clip();
      ctx.drawImage(loadedImage, drawX, drawY, drawW, drawH);

      // Measured directional contrast scrim so typography stays legible over photography
      const scrim = isFullPageUi
        ? ctx.createLinearGradient(0, topBarH, w, topBarH)
        : ctx.createLinearGradient(0, topBarH, w * 0.78, topBarH + stageH * 0.35);

      if (isFullPageUi) {
        scrim.addColorStop(0, 'rgba(11, 10, 18, 0.98)');
        scrim.addColorStop(0.38, 'rgba(11, 10, 18, 0.94)');
        scrim.addColorStop(0.62, 'rgba(11, 10, 18, 0.16)');
        scrim.addColorStop(1, 'rgba(11, 10, 18, 0.04)');
      } else if (isLightTheme) {
        scrim.addColorStop(0, 'rgba(248, 250, 249, 0.92)');
        scrim.addColorStop(0.55, 'rgba(248, 250, 249, 0.62)');
        scrim.addColorStop(1, 'rgba(248, 250, 249, 0.12)');
      } else {
        scrim.addColorStop(0, 'rgba(8, 8, 12, 0.90)');
        scrim.addColorStop(0.58, 'rgba(8, 8, 12, 0.56)');
        scrim.addColorStop(1, 'rgba(8, 8, 12, 0.14)');
      }
      ctx.fillStyle = scrim;
      ctx.fillRect(0, topBarH, w, stageH);
      ctx.restore();
    }
  } else {
    // Subtle fallback gradient mesh while image finishes loading
    const grad = ctx.createRadialGradient(w * 0.75, h * 0.48, 30, w * 0.75, h * 0.48, 420);
    grad.addColorStop(0, project.accentHex + '44');
    grad.addColorStop(1, project.bgHex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, topBarH, w, stageH);
  }

  // Top browser / app chrome bar
  ctx.fillStyle = isLightTheme ? '#FFFFFF' : '#0E0E13';
  ctx.fillRect(0, 0, w, topBarH);
  ctx.strokeStyle = isLightTheme ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, topBarH);
  ctx.lineTo(w, topBarH);
  ctx.stroke();

  ctx.fillStyle = project.accentHex;
  ctx.beginPath();
  ctx.arc(34, 27, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isLightTheme ? '#141417' : '#F4F0E8';
  ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(project.title, 52, 33);

  ctx.fillStyle = isLightTheme ? 'rgba(20,20,23,0.55)' : 'rgba(244,240,232,0.55)';
  ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Overview    Showcase    Metrics    Launch', w - 330, 32);

  // Editorial Overlay Content inside Stage
  const leftMaxW = isPortraitShowcase ? 480 : 620;

  ctx.fillStyle = project.accentHex;
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillText(project.category, 56, 136);

  if (project.themeKind === 'asad') {
    ctx.fillStyle = '#F7F3EA';
    ctx.font = '500 54px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Modern Web Apps', 56, 206);
    ctx.fillStyle = '#E5C687';
    ctx.font = 'italic 500 54px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Built to Win Clients', 56, 268);
    ctx.fillStyle = 'rgba(247,243,234,0.88)';
    ctx.font = '400 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Fast, responsive websites & interactive 3D builds for growing brands.', 56, 316);
  } else if (project.themeKind === 'nuright') {
    ctx.fillStyle = '#F7F3EA';
    ctx.font = '500 48px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Enhance Your', 56, 202);
    ctx.fillStyle = '#E5C687';
    ctx.font = 'italic 500 48px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Natural Radiance', 56, 256);
    ctx.fillStyle = 'rgba(247,243,234,0.85)';
    ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
    drawWrappedText(ctx, 'Bespoke hair artistry, skincare rituals & booking in Lagos.', 56, 302, leftMaxW, 24);
  } else if (project.themeKind === 'overite') {
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '700 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("Africa's digital", 56, 200);
    ctx.fillText('future should be', 56, 254);
    ctx.fillStyle = '#60A5FA';
    ctx.fillText('built here.', 56, 308);
  } else if (project.themeKind === 'urock') {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('THE VOICE OF', 56, 200);
    ctx.fillStyle = '#FACC15';
    ctx.fillText('THE YOUTH IN', 56, 254);
    ctx.fillText('RHYTHM.', 56, 308);
  } else if (project.themeKind === 'advantage') {
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '700 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Excellence in Care,', 56, 200);
    ctx.fillStyle = '#34D399';
    ctx.fillText('Your Advantage.', 56, 254);
    ctx.fillStyle = 'rgba(244,240,232,0.84)';
    ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
    drawWrappedText(ctx, 'Dedicated clinical care & patient coordination across 14 counties.', 56, 300, leftMaxW - 20, 24);
  } else if (project.themeKind === 'cogito') {
    ctx.fillStyle = '#F4F0E8';
    ctx.font = '700 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('₦350,000.00', 56, 202);
    ctx.fillStyle = '#D4B475';
    ctx.font = '600 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Home Loan Special · 5.5% AI Rate', 56, 250);
    ctx.fillStyle = 'rgba(244,240,232,0.82)';
    ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
    drawWrappedText(ctx, 'Instant treasury yield & automated credit underwriting.', 56, 294, leftMaxW, 24);
  } else if (project.themeKind === 'vera') {
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 46px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Good Morning, Asad', 56, 204);
    ctx.fillStyle = '#2563EB';
    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.fillText('22°C INDOOR  ·  4.8 kWh SOLAR  ·  ALL CIRCUITS OPTIMAL', 56, 252);
  } else {
    ctx.fillStyle = '#F4F0E8';
    ctx.font = isPortraitShowcase ? '600 46px "Cormorant Garamond", Georgia, serif' : '600 54px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(project.title, 56, 204);
    ctx.fillStyle = 'rgba(244,240,232,0.85)';
    ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
    drawWrappedText(ctx, project.tagline, 56, 252, leftMaxW, 26);
  }

  // Action Pill inside UI screenshot
  ctx.fillStyle = project.accentHex;
  roundRect(ctx, 56, 368, 186, 44, 22);
  ctx.fill();
  ctx.fillStyle = '#0B0B0E';
  ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('EXPLORE LIVE BUILD', 78, 395);

  // Bottom signature plate inside canvas
  ctx.fillStyle = 'rgba(7,7,9,0.92)';
  ctx.fillRect(0, h - bottomBarH, w, bottomBarH);
  ctx.strokeStyle = 'rgba(212,180,117,0.4)';
  ctx.beginPath();
  ctx.moveTo(0, h - bottomBarH);
  ctx.lineTo(w, h - bottomBarH);
  ctx.stroke();

  ctx.fillStyle = '#D4B475';
  ctx.font = '600 14px "JetBrains Mono", monospace';
  ctx.fillText(project.number, 28, h - 24);

  ctx.fillStyle = '#F4F0E8';
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(project.title, 62, h - 24);

  ctx.fillStyle = 'rgba(244,240,232,0.62)';
  ctx.font = '500 12px "JetBrains Mono", monospace';
  ctx.fillText(project.category, w - 280, h - 24);
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
