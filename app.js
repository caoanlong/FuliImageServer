const Koa = require('koa')
const Router = require('koa-router')
const multer = require('koa-multer')
const logger = require('koa-logger')
const sharp = require('sharp')

const app = new Koa()
app.use(logger())

let storage = multer.diskStorage({
	// 文件保存路径
	destination: function(req, file, cb) {
		cb(null, './public/uploads/')
	},
	// 修改文件名称
	filename: function(req, file, cb) {
		cb(null, Math.random().toString(32).substr(2) + '.' + getSuffixName(file.originalname))
	}
})

let upload = multer({ storage: storage })

let router = new Router()

let responseData = {
	code: 0,
	msg: '成功'
}


function getSuffixName( fileName ) {
	let nameList = fileName.split('.')
	return nameList[nameList.length - 1]
}

router.post('/image/upload/single', upload.single('file'), async ctx => {
	if (ctx.req.file) {
		let filePath = ctx.req.file.path
		sharp('public/uploads/' + ctx.req.file.filename)
		.resize(200).toFile('public/uploads_mini/' + ctx.req.file.filename, (err, info) => {
			err && console.log('err:' + err)
			info && console.log('info:' + JSON.stringify(info))
		})
		responseData.data = filePath
		ctx.body = responseData
	} else {
		responseData.code = 1
		responseData.msg = '图片为空'
		ctx.body = responseData
	}
})

router.post('/image/upload/multiple', upload.array('files', 9), async ctx => {
	if (ctx.req.files && ctx.req.files.length > 0) {
		ctx.req.files.forEach(item => {
			sharp('public/uploads/' + item.filename)
			.resize(200).toFile('public/uploads_mini/' + item.filename, (err, info) => {
				err && console.log('err:' + err)
				info && console.log('info:' + JSON.stringify(info))
			})
		})
		responseData.data = ctx.req.files.map(item => item.path)
		ctx.body = responseData
	} else {
		responseData.code = 1
		responseData.msg = '图片为空'
		ctx.body = responseData
	}
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => {
	console.log('Listen at 3000!')
})

