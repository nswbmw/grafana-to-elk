## grafana-to-elk

grafana 跳转到 elk 的 demo

### Usage

1. 启动 Telegraf(StatsD) + InfluxDB + Grafana：

```sh
$ docker run -d \
  --name docker-statsd-influxdb-grafana \
  -p 3003:3003 \
  -p 3004:8083 \
  -p 8086:8086 \
  -p 22022:22 \
  -p 8125:8125/udp \
  samuelebistoletti/docker-statsd-influxdb-grafana:latest
```

设置 grafana 的 datasource 为 influxdb，创建请求量和响应时间的图表。响应时间的图表添加 link：
  1. type: absolute
  2. url: 如 http://localhost:5601/
  3. title: 如 Go to ELK
  4. Url params: name=xxx&routerName=xxx
  5. Include time range: true
  6. Open in new tab: true

2. 启动 ELK

```sh
$ docker run -p 5601:5601 \
    -p 9200:9200 \
    -p 5044:5044 \
    -p 15044:15044/udp \
    -it --name elk sebp/elk
```

然后进入容器：

```sh
$ docker exec -it elk /bin/bash
```

运行以下命令设置 logstash 的 input 和 output：

```sh
# /opt/logstash/bin/logstash --path.data /tmp/logstash/data \
  -e 'input { udp { codec => "json" port => 15044 } } output { elasticsearch { hosts => ["localhost"] } }'
```

启动一个 15044 udp 端口，用来接收通过 UDP 发送到 Logstash 的日志。


3. 起两个终端，分别运行：

```sh
$ node server.js
$ node client.js
```

4. 此时，ELK 应该有 koa-await-breakpoint 的日志了。回到 Kibana，设置 index pattern 为 `logstash-*`。

5. 打开 Chrome 扩展程序页 -> 加载已解压的扩展程序... -> 加载 [grafana-to-elk-extension](https://github.com/nswbmw/grafana-to-elk-extension)（修改 manifest.json 的 matches 字段）。

6. Grafana 跳转到 ELK 试试吧。
