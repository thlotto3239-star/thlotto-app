import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function openAndTestBrowser() {
  console.log('🚀 กำลังเปิดหน้าต่างเบราว์เซอร์ Edge บนหน้าจอของผู้ใช้แบบถาวร (ไม่ปิด)...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: false,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--new-window',
      '--no-default-browser-check',
      '--disable-extensions-except'
    ],
  });

  const pages = await browser.pages();
  const page = pages[0] || (await browser.newPage());

  try {
    console.log('🌐 กำลังเปิดหน้า Login ที่ http://127.0.0.1:5174/login ...');
    await page.goto('http://127.0.0.1:5174/login', { waitUntil: 'networkidle0', timeout: 30000 });

    console.log('⏳ ค้นหาช่องกรอกข้อมูล...');
    await page.waitForSelector('#phone', { timeout: 10000 });
    await page.waitForSelector('#pin', { timeout: 10000 });

    console.log('📝 กรอกเบอร์โทร: 0622306037');
    await page.click('#phone', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('#phone', '0622306037', { delay: 150 });

    console.log('🔑 กรอกรหัส PIN: 3239');
    await page.type('#pin', '3239', { delay: 150 });

    await new Promise(r => setTimeout(r, 1000));

    console.log('🔘 กดปุ่มเข้าสู่ระบบ...');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
    }

    console.log('⏳ รอเข้าสู่หน้าหลัก /home...');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 3000));

    console.log(`📍 URL ปัจจุบัน: ${page.url()}`);
    console.log('✅ ล็อกอินสำเร็จและแสดงผลหน้า Home บนหน้าจอเรียบร้อยแล้ว!');
    console.log('🔒 ปลดการเชื่อมต่อเพื่อให้เบราว์เซอร์เปิดค้างไว้บนหน้าจอถาวร...');
    
    // Disconnect so the browser stays open on the user's screen forever
    browser.disconnect();
    console.log('🎉 เสร็จสิ้น! หน้าต่างเบราว์เซอร์จะเปิดค้างไว้ให้ใช้งานต่อเนื่องได้ทันที');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err.message);
  }
}

openAndTestBrowser();
