const jsonServer = require('json-server')
const server = jsonServer.create()
const middlewares = jsonServer.defaults()

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

// 获取db数据
const db = require("./db")

console.log(db)
// 需要加在 server.use(router) 前
server.use(jsonServer.rewriter({
  '/user/login': '/user_login',
  '/user/logout': '/user_logout'
}))


// Use router
server.use(jsonServer.router(db))

server.listen(3000, () => {
  console.log('JSON Server is running on 3000')
})
