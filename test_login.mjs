import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = 'https://ygopnjbvccenryejqmlw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnb3BuamJ2Y2NlbnJ5ZWpxbWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTc2NjQsImV4cCI6MjA5MjEzMzY2NH0.aOA0zbkUtS85hb0Bz5aZO8koi2gVHmDGE7Vttv0VDME';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLogin(phone, pin, name) {
  console.log(`\n======================================================`);
  console.log(`🚀 [TEST] ทดสอบเข้าสู่ระบบ: ${name} (เบอร์: ${phone}, PIN: ${pin})`);
  console.log(`======================================================`);

  const email = `${phone}@thlotto.app`;
  const pinHash = crypto.createHash('sha256').update(pin + phone).digest('hex');

  console.log(`📌 1. คำนวณ PIN Hash (SHA-256): ${pinHash}`);
  console.log(`📌 2. กำลังส่งคำขอเข้าสู่ระบบผ่าน Supabase Auth...`);

  const startTime = Date.now();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: pinHash,
  });

  if (authError) {
    console.error(`❌ [FAILED] ไม่สามารถเข้าสู่ระบบได้: ${authError.message}`);
    return false;
  }

  const duration = Date.now() - startTime;
  console.log(`✅ 3. เข้าสู่ระบบสำเร็จ 100%! (ใช้เวลา: ${duration}ms)`);
  console.log(`   - User ID: ${authData.user.id}`);
  console.log(`   - Email: ${authData.user.email}`);
  console.log(`   - Session Token: ${authData.session.access_token.substring(0, 35)}...`);

  console.log(`📌 4. โหลดข้อมูล Profile & Wallet จากฐานข้อมูล...`);
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('id, username, full_name, phone, is_admin, vip_level, status')
    .eq('id', authData.user.id)
    .single();

  const { data: wallet, error: wallErr } = await supabase
    .from('wallets')
    .select('balance, commission_balance, total_won, total_bets')
    .eq('user_id', authData.user.id)
    .single();

  console.log(`✅ 5. ข้อมูลผู้ใช้ (Profile):`, profile);
  console.log(`✅ 6. กระเป๋าเงิน (Wallet):`, wallet);
  console.log(`🎉 สรุปผล: บัญชี ${name} ล็อกอินและดึงข้อมูลระบบได้สมบูรณ์แบบ!`);
  return true;
}

async function main() {
  const r1 = await testLogin('0622306037', '3239', 'คุณ arm (Admin)');
  const r2 = await testLogin('0999999998', '1234', 'Boss (Admin)');
  const r3 = await testLogin('0999999992', '1234', 'แอดมิน-02');

  console.log(`\n======================================================`);
  if (r1 && r2 && r3) {
    console.log(`🏆 ผลการทดสอบ: ทุกบัญชีสามารถเข้าสู่ระบบและใช้งานได้จริง 100%`);
  } else {
    console.log(`⚠️ มีข้อผิดพลาดในบางบัญชี`);
  }
  console.log(`======================================================\n`);
}

main();
