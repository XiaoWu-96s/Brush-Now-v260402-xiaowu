import http from 'http';
import https from 'https';

https.get('https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/zhua_pai_zhao1.jpg', {
  headers: { 'Origin': 'https://example.com' }
}, (res) => {
  console.log('Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
});
