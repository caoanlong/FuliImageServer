const Koa = require('koa')
const Router = require('koa-router')
const multer = require('koa-multer')
const logger = require('koa-logger')
const sharp = require('sharp')
const config = require('./config')
const { getSuffixName } = require('./utils')

const app = new Koa()
app.use(logger())

let storage = multer.diskStorage({
	// 文件保存路径
	destination: function(req, file, cb) {
		cb(null, config.image_path)
	},
	// 修改文件名称
	filename: function(req, file, cb) {
		cb(null, Math.random().toString(16).substr(2) + Date.now() + '.' + getSuffixName(file.originalname))
	}
})

let upload = multer({ storage: storage })

let router = new Router()

router.get('/test', async ctx => {
	ctx.body = 'fuck you!'
})

router.post('/image/upload/single', upload.single('file'), async ctx => {
	if (ctx.req.file) {
		sharp(config.image_path + ctx.req.file.filename)
		.resize(200).toFile(config.mini_image_path + ctx.req.file.filename, (err, info) => {
			err && console.log('err:' + err)
			info && console.log('info:' + JSON.stringify(info))
		})
		ctx.body = {
			code: 0,
			msg: '成功',
			data: ctx.req.file.path
		}
	} else {
		ctx.body = {
			code: -1,
			msg: '图片为空'
		}
	}
})

router.post('/image/upload/multiple', upload.array('files', 9), async ctx => {
	if (ctx.req.files && ctx.req.files.length > 0) {
		ctx.req.files.forEach(item => {
			sharp(config.image_path + item.filename)
			.resize(200).toFile(config.mini_image_path + item.filename, (err, info) => {
				err && console.log('err:' + err)
				info && console.log('info:' + JSON.stringify(info))
			})
		})
		ctx.body = {
			code: 0,
			msg: '成功',
			data: ctx.req.files.map(item => item.path)
		}
	} else {
		ctx.body = {
			code: -1,
			msg: '图片为空'
		}
	}
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(config.port, () => {
	console.log(`Listen at ${config.port}!`)
})

