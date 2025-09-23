#!/usr/bin/env node

/**
 * Email Verification Test Script
 * 
 * This script demonstrates how the email verification system works.
 * Run with: node test-email-verification.js
 */

const BASE_URL = 'http://localhost:3000';

async function testEmailVerification() {
  console.log('🧪 Testing Email Verification System\n');

  // Test 1: Register a new user
  console.log('1️⃣ Testing user registration...');
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    password: 'password123',
    first_name: 'Test',
    last_name: 'User'
  };

  try {
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful!');
      console.log(`   Message: ${registerData.message}`);
      console.log(`   User ID: ${registerData.id}`);
      console.log(`   Verification Required: ${registerData.verification_required}`);
    } else {
      console.log('❌ Registration failed:');
      console.log(`   Error: ${registerData.detail}`);
      return;
    }

    // Test 2: Try to login before verification
    console.log('\n2️⃣ Testing login before email verification...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: testUser.email,
        password: testUser.password,
      }),
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.status === 403 && loginData.detail === 'Email not verified') {
      console.log('✅ Login correctly blocked for unverified user');
      console.log(`   Message: ${loginData.detail}`);
    } else {
      console.log('❌ Login should have been blocked:');
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Response: ${JSON.stringify(loginData)}`);
    }

    // Test 3: Resend verification email
    console.log('\n3️⃣ Testing resend verification email...');
    const resendResponse = await fetch(`${BASE_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
      }),
    });

    const resendData = await resendResponse.json();
    
    if (resendResponse.ok) {
      console.log('✅ Resend verification email successful');
      console.log(`   Message: ${resendData.message}`);
    } else {
      console.log('❌ Resend verification failed:');
      console.log(`   Error: ${resendData.detail}`);
    }

    console.log('\n📧 Email Verification System Test Complete!');
    console.log('\n📋 What happens next:');
    console.log('   1. Check your Supabase dashboard for the verification email');
    console.log('   2. Click the verification link in the email');
    console.log('   3. The user will be redirected to /verify-email page');
    console.log('   4. After verification, the user can login normally');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testEmailVerification();
