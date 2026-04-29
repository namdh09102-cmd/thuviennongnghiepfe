async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/posts?page=1&category=&limit=12');
    const json = await res.json();
    console.log('API Response:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
