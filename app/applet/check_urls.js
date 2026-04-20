import https from 'https';

const urls = [
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/XiangKuang1.png',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/XiangKuang2.png',
  'https://260308-bursh-app-1259547000.cos.ap-beijing.myqcloud.com/XiangKuang3.png'
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(url, res.statusCode);
  }).on('error', (e) => {
    console.error(url, e);
  });
});
