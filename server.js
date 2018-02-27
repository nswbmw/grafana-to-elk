const koaAwaitBreakpoint = require('koa-await-breakpoint')({
  name: 'api',
  files: ['./routes/*.js'],
  store: require('./lib/logger')
})

const Paloma = require('paloma')
const app = new Paloma()
const statsd = require('./middlewares/statsd')

app.use(koaAwaitBreakpoint)
app.route({ method: 'POST', path: '/users', controller: [
  statsd('getHome'),
  require('./routes/user').createUser
]})

app.listen(3000)
