import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\armyn\\.gemini\\antigravity-ide\\brain\\b6583904-4bcb-462b-8c88-9bdbc5389d1f';

async function captureScreenshots() {
  console.log('📸 กำลังเปิดเบราว์เซอร์เพื่อถ่ายภาพหน้าจอ (Screenshots) หน้าเว็บจริง...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

  try {
    console.log('🌐 ไปที่หน้า Login...');
    await page.goto('http://127.0.0.1:5174/login', { waitUntil: 'networkidle0', timeout: 30000 });

    const loginImgPath = path.join(ARTIFACTS_DIR, 'preview_login_page.png');
    await page.screenshot({ path: loginImgPath, fullPage: true });
    console.log(`✅ ถ่ายภาพหน้า Login บันทึกที่: ${loginImgPath}`);

    console.log('📝 กรอกข้อมูลเบอร์ 0622306037 และ PIN 3239...');
    await page.type('#phone', '0622306037', { delay: 50 });
    await page.type('#pin', '3239', { delay: 50 });

    const filledImgPath = path.join(ARTIFACTS_DIR, 'preview_login_filled.png');
    await page.screenshot({ path: filledImgPath, fullPage: true });
    console.log(`✅ ถ่ายภาพตอนกรอกข้อมูล: ${filledImgPath}`);

    console.log('🔘 กดปุ่มเข้าสู่ระบบ...');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();

    console.log('⏳ รอโหลดหน้า Home...');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 4000));

    console.log(`📍 URL ปัจจุบัน: ${page.url()}`);
    const homeImgPath = path.join(ARTIFACTS_DIR, 'preview_home_dashboard.png');
    await page.screenshot({ path: homeImgPath, fullPage: true });
    console.log(`✅ ถ่ายภาพหน้า Home Dashboard บันทึกที่: ${homeImgPath}`);

  } catch (err) {
    console.error('❌ Error during screenshot capture:', err.message);
  } finally {
    await browser.close();
    console.log('🏁 เสร็จสิ้นการถ่ายภาพหน้าจอ');
  }
}

captureScreenshots();
