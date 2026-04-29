async function main() {
  try {
    const res = await fetch('http://localhost:3000/api/posts');
    const data = await res.json();
    console.log('Post Count from API:', data.data.length);
    console.log('Sample Post Title:', data.data[0].title);
  } catch (e) {
    console.error('Error:', e);
  }
}

main();
