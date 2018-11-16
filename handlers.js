const path = require('path')
const fs = require('fs')
const _ = require('lodash')

// 返回路径目录数组
function _findSync(startAbsolutePath) {
  let result = []

  function finder(_p) {
    const files = fs.readdirSync(_p)
    files.forEach((val, index) => {
      const fPath = path.join(_p, val)
      const stats = fs.statSync(fPath)
      if (stats.isDirectory()) finder(fPath)
      else if (stats.isFile()) result.push(fPath)
    })
  }

  finder(startAbsolutePath)
  return result
}

/**
 * 将路径转换为对象
 * ep: 'user/login.json' => { user: { login: data } }
 */
function _handlePathToObj(_p) {
  let arr, obj
  if (_p.substring(_p.length - 3) === ".js") {
    arr = _p.replace('.js', '').split('\\')
    let m = require(path.join(__dirname, 'data', _p))
    obj = {
      [arr.join('_')]: m()
    }
  } else {
    arr = _p.replace('.json', '').split('\\')
    obj = {
      [arr.join('_')]: require(path.join(__dirname, 'data', _p))
    }
  }

  return obj
}

// 将data目录下的文件整合为一个db数据
function dbHandler(startPath) {
  let db = {}

  const startAbsolutePath = path.join(__dirname, startPath)
  const filePaths = _findSync(startAbsolutePath)

  filePaths.forEach(_p => {
    // 获取相对路径
    const relativePath = path.relative(path.join(__dirname, 'data'), _p)
    db = _.merge(db, _handlePathToObj(relativePath))
  })

  console.log(db)
  return db
}

function rewriterHandler(db) {
  const rewriter = {
    '/api/*': '/$1'
  }
  for (const key of Object.keys(db)) {
    const tmpKey = `/${key.replace(/_/g, '/')}`
    rewriter[tmpKey] = `/${key}`

    // const tmpKey2 = `/${key.replace(/_/g, '/')}/:id`
    // rewriter[tmpKey2] = `/${key}/:id`

    const tmpKey2 = `/${key.replace(/_/g, '/')}/*`
    rewriter[tmpKey2] = `/${key}/$1`

    const tmpKey3 = `/${key.replace(/_/g, '/')}?*`
    rewriter[tmpKey3] = `/${key}?$1`
  }
  console.log(rewriter)
  return rewriter
}

module.exports = {
  dbHandler,
  rewriterHandler
}