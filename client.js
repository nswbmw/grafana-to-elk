const axios = require('axios')

setInterval(() => {
  // 模拟 1-9 的 tps
  const tps = Math.floor(Math.random() * 10)
  for (let i = 0; i < tps; i++) {
    axios.post('http://localhost:3000/users')
  }
}, 1000)
