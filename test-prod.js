fetch('https://marcatching.vercel.app/api/course-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@marcatching.com',
    fullName: 'Test User',
    productName: 'Test Product',
    orderId: '123'
  })
}).then(res => res.text()).then(text => console.log('Response:', text)).catch(console.error);
