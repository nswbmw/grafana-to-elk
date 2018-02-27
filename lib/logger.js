const _ = require('lodash')
const Logstash = require('logstash-client')

const logstash = new Logstash({
  type: 'udp',
  host: 'localhost',
  port: 15044
})

module.exports = {
  save (record, ctx) {
    ctx.__koaAwaitBreakpointLoggers = ctx.__koaAwaitBreakpointLoggers || []
    record.env = process.env.NODE_ENV
    record.url = ctx.method + ' ' + ctx.host + ctx.path
    if (ctx.routerName) {
      record.routerName = ctx.routerName
    }

    delete record.this

    if (typeof record.result !== 'undefined') {
      record.result = JSON.stringify(record.result)
    }

    if (record.error) {
      record.error = {
        message: record.error.message,
        stack: record.error.stack,
        status: record.error.status || record.error.statusCode || 500
      }
      if (ctx.request) {
        record.request = JSON.stringify(_.pick(ctx.request, 'url', 'method', 'headers', 'body', 'query', 'ips'))
      }
    }

    ctx.__koaAwaitBreakpointLoggers.push(record)

    // 发生错误或者最后一步（并且响应时间大于 1ms，可调节）才会发送到 logstash
    if (record.error || (record.type === 'end')) {
      const sumOfTake = _.sumBy(ctx.__koaAwaitBreakpointLoggers, 'take')
      if (record.error || sumOfTake > 1) {
        // end|error 的 log 添加一个 sumOfTake 字段记录这个请求的总响应时间
        record.sumOfTake = sumOfTake
        // 发送多条 log，而不是合成一条，方便在 kibana 聚合
        ctx.__koaAwaitBreakpointLoggers.forEach((record) => {
          logstash.send(record)
        })
      }
    }
  }
}
