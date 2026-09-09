import fetch from 'node-fetch';
(async()=>{try{const res=await fetch('http://127.0.0.1:5000/api/user/send-otp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Test User',email:'test@example.com',password:'secret123'})});console.log('status',res.status);console.log(await res.text());}catch(err){console.error('request error',err);} })();
