async function main() {
  try {
    const res = await fetch('http://localhost:3000/api/seed');
    const data = await res.json();
    console.log('Seed Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

main();
