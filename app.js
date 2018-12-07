const Koa = require('koa')
const path = require('path')
const router = require('koa-router')()

const bodyParser = require('koa-bodyparser') //post数据 处理提交的表单信息

const ejs = require('ejs') //模板引擎
const views = require('koa-views')

const session = require('koa-session-minimal') //数据库操作
const MysqlStore = require('koa-mysql-session')

const koaStatic = require('koa-static') //配置静态资源
const staticCache = require('koa-static-cache') //缓存文件

const config = require('./config/default.js')
const signup = require('./routers/signup.js')
const signin = require('./routers/signin.js')
const posts = require('./routers/posts.js')
const signout = require('./routers/signout.js')

const app = new Koa()

/**
 * session存储配置
 */
const sessionMysqlConfig = {
  user: config.database.USERNAME,
  password: config.database.PASSWORD,
  database: config.database.DATABASE,
  host: config.database.HOST
}
/**
 * 配置session中间件
 */
app.use(
  session({
    key: 'USER_SID',
    store: new MysqlStore(sessionMysqlConfig)
  })
)

/**
 * 配置静态资源加载中间件
 */
app.use(koaStatic(path.join(__dirname, './public')))

/**
 *缓存
 */

app.use(
  staticCache(
    path.join(__dirname, './public'),
    { dynamic: true },
    {
      maxAge: 365 * 24 * 60 * 60
    }
  )
)
app.use(
  staticCache(
    path.join(__dirname, './public/images'),
    { dynamic: true },
    {
      maxAge: 365 * 24 * 60 * 60
    }
  )
)

/**
 * 配置服务端模板渲染引擎中间件
 */
app.use(
  views(path.join(__dirname, './views'), {
    extension: 'ejs'
  })
)

app.use(
  bodyParser({
    formLimit: '1mb' //的默认最大上传限制
  })
)

//路由
app.use(signup.routes(), signup.allowedMethods())
app.use(signin.routes(), signin.allowedMethods())
app.use(posts.routes(), posts.allowedMethods())
app.use(signout.routes(), signout.allowedMethods())

app.listen(3000)

console.log(`listening on port ${config.port}`)
