import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runLiveBrowserTest() {
  console.log('🚀 กำลังเปิด Microsoft Edge เพื่อทดสอบล็อกอินบนหน้าจอจริง...');
  
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: false, // แสดงหน้าต่างเบราว์เซอร์จริงบนหน้าจอของผู้ใช้
    defaultViewport: null,
    args: ['--start-maximized', '--window-size=1280,800'],
  });

  const pages = await browser.pages();
  const page = pages[0] || (await browser.newPage());

  try {
    console.log('🌐 กำลังเปิดหน้า Login ที่ http://127.0.0.1:5174/login ...');
    await page.goto('http://127.0.0.1:5174/login', { waitUntil: 'networkidle0', timeout: 30000 });

    console.log('⏳ รอช่องกรอกเบอร์โทรและ PIN...');
    await page.waitForSelector('#phone', { timeout: 10000 });
    await page.waitForSelector('#pin', { timeout: 10000 });

    // เคลียร์ค่าเดิม
    await page.click('#phone', { clickCount: 3 });
    await page.keyboard.press('Backspace');

    console.log('📝 กำลังพิมพ์เบอร์โทร: 0622306037');
    await page.type('#phone', '0622306037', { delay: 100 });

    console.log('🔑 กำลังพิมพ์รหัสผ่าน PIN 4 หลัก: 3239');
    await page.type('#pin', '3239', { delay: 100 });

    await new Promise(r => setTimeout(r, 1000));

    console.log('🔘 กำลังกดปุ่มเข้าสู่ระบบ...');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
    }

    console.log('⏳ กำลังรอระบบล็อกอินและนำทางไปยังหน้า /home ...');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {
      console.log('Waiting for URL change...');
    });

    await new Promise(r => setTimeout(r, 3000));

    const currentUrl = page.url();
    console.log(`📍 URL ปัจจุบัน: ${currentUrl}`);

    if (currentUrl.includes('/home')) {
      console.log('🎉 ✅ สำเร็จ 100%! เข้าสู่ระบบและเข้าหน้า Home สำเร็จเรียบร้อยบนหน้าจอ!');
    } else {
      console.log('⚠️ URL:', currentUrl);
    }

    console.log('👀 เปิดหน้าจอทิ้งไว้ให้ผู้ใช้รับชม 15 วินาที...');
    await new Promise(r => setTimeout(r, 15000));

  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', err.message);
  } finally {
    await browser.close();
    console.log('🏁 จบการทดสอบเบราว์เซอร์สด');
  }
}

runLiveBrowserTest();
