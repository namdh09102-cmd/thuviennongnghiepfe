const fetch = require('node-fetch');

async function main() {
  try {
    const res = await fetch('http://localhost:3000/');
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('HTML length:', text.length);
    const fs = require('fs');
    fs.writeFileSync('homepage.html', text);
    console.log('Saved HTML to homepage.html');
    // Let's look at the first 1000 chars of HTML
    console.log('HTML snippet:', text.substring(0, 1000));
  } catch (e) {
    console.error('Error:', e);
  }
}

main();
