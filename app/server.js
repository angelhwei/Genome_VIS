const express = require('express')
const path = require('path')
const app = express()

// Serve static files from the dist/app/browser directory
app.use(express.static(path.join(__dirname, 'dist/app/browser')))

// Send all requests to index.html
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'dist/app/browser/index.html'))
})

// Start the app by listening on the default port
const port = process.env.PORT || 8000
const host = '0.0.0.0' // 监听所有网络接口
app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
})
