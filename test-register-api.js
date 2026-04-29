const fetch = require('node-fetch'); // Next.js server might be running, but we can use native fetch in newer node or require('axios')
// Or better yet, we can use fetch natively in node 18+
async function testRegister() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        full_name: 'Test Registration',
        email: 'test_register@example.com',
        username: 'test_reg',
        password: 'password123'
      })
    });
    
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

testRegister();
