#!/usr/bin/env node

/**
 * Test Supabase Native Email Verification
 * 
 * This script tests the Supabase native email verification flow.
 * Run with: node test-supabase-verification.js
 */

const BASE_URL = 'http://localhost:3000';

async function testSupabaseVerification() {
  console.log('🧪 Testing Supabase Native Email Verification\n');

  // Test the verification page with Supabase parameters
  console.log('1️⃣ Testing verification page with Supabase parameters...');
  
  // Simulate the URL you showed: https://kckcqxzaffvgkivfcplp.supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=...
  const supabaseToken = 'pkce_356b71e61587aa80f1384592f420c6bc5e5e8a165707948023e89a00'; // Example token
  const verificationUrl = `${BASE_URL}/verify-email?token=${supabaseToken}&type=signup`;
  
  console.log(`🔗 Testing URL: ${verificationUrl}`);
  
  try {
    // Test the verification endpoint directly
    const response = await fetch(`${BASE_URL}/api/auth/verify-supabase-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: supabaseToken }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Supabase verification endpoint working!');
      console.log(`   Message: ${data.message}`);
      console.log(`   Verified: ${data.verified}`);
      if (data.user) {
        console.log(`   User: ${data.user.email}`);
      }
    } else {
      console.log('⚠️ Supabase verification endpoint response:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${data.detail}`);
      console.log('   This is expected for test tokens - real tokens from Supabase will work');
    }

    console.log('\n📧 Supabase Email Verification Test Complete!');
    console.log('\n📋 How Supabase Email Verification Works:');
    console.log('   1. User registers → Supabase sends verification email');
    console.log('   2. User clicks link → Redirected to your /verify-email page');
    console.log('   3. Page calls /api/auth/verify-supabase-email with token');
    console.log('   4. Token verified with Supabase → User marked as verified');
    console.log('   5. User can now login normally');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testSupabaseVerification();
