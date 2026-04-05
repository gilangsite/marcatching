const url = "https://script.google.com/macros/s/AKfycbyc5FDReHAFo7r_Bj62kzBoJZHKF75xaJwuuiU-6n4G24WrjylHmijOJm5OcazNJU1i/exec";
fetch(url, {
  method: 'POST',
  body: JSON.stringify({
    action: 'sendCourseEmail',
    email: 'gilang@gilang.com',
    fullName: 'Test User',
    productName: 'Test Product',
    orderId: '123'
  })
}).then(res => res.json()).then(console.log).catch(console.error);
