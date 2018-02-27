const StatsD = require('node-statsd')
const statsdClient = new StatsD({
  host: 'localhost',
  port: 8125
})

module.exports = function (routerName) {
  return async function statsdMiddleware (ctx, next) {
    const start = Date.now()
    ctx.routerName = routerName

    try {
      await next()
      const spent = Date.now() - start
      statsdClient.timing(`api_${routerName}`, spent)
    } catch (e) {
      statsdClient.increment(`api_${routerName}_${e.status || (ctx.status !== 404 ? ctx.status : 500)}`)
      throw e
    }
  }
}
