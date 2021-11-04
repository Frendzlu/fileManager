const express = require("express");
const path = require("path");
const app = express();
const formidable = require('formidable');
const PORT = process.env.PORT || 3000;
const hbs = require('express-handlebars');
const e = require("express");

const A_HARDCODED_PASSWORD_WHICH_IS_A_BAD_IDEA = "testPassword"

let currentId = 0;
let filesArray = []
let isLoggedIn = false

let types = ["docx", "mp4", "mp3", "jpg", "gif", "docx", "徽宗"]

function getFileInfo(item) {
    let extension = item['name'].split('.')
    extension = extension[extension.length-1]
    if (!types.includes(extension)) extension = "undefined"
    currentId++
    return {
        id: currentId,
        size: item['size'],
        type: item['type'],
        path: item['path'],
        date: Date.now(),
        icon: extension + '.png',
        name: item['name'],
        extension: extension
    }
}

app.use(express.urlencoded({extended: true}));
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');

app.get("/", function (req, res) {
    if (isLoggedIn) res.render('./UploadSite.hbs')
    else res.render('./login.hbs')
})

app.get("/deleteAll", function (req, res) {
    filesArray = []
    if (isLoggedIn) {
        res.render('./fileManagerTemplate.hbs', {files: filesArray})
        filesArray = []
    }
    else res.render('./login.hbs')
})


app.get("/upload", function (req, res) {
    if (isLoggedIn) res.render('./UploadSite.hbs')
    else res.render('./login.hbs')
})

app.post("/upload", function (req, res) {
    if (isLoggedIn) res.render('./UploadSite.hbs')
    else res.render('./login.hbs')
})

app.get("/fileManager", function (req, res) {
    if (isLoggedIn) res.render('./fileManagerTemplate.hbs', {files: filesArray});
    else res.render('./login.hbs')
})

app.post("/info", function (req, res) {
    if (isLoggedIn) {
        let x = filesArray.filter(x => {return x["id"] == req.body.id})
        res.render('./InfoSite.hbs', x[0]);
    } else res.render('./login.hbs')

})

app.post("/delete", function (req, res) {
    if (isLoggedIn) {
        filesArray = filesArray.filter(x => {
            return x.id != req.body.id
        })
        res.render('./fileManagerTemplate.hbs', {files: filesArray})
    } else res.render('./login.hbs')
})

app.post("/download", function (req, res) {
    if (isLoggedIn) {
        let x = filesArray.filter(x => {
            return x.id == req.body.id
        })
        res.download(x[0]['path'])
    } else res.render('./login.hbs')
})

app.post('/handleUpload', function (req, res) {
    try {
        if (isLoggedIn) {
            let form = formidable({})
            form.keepExtensions = true
            form.multiples = true
            form.uploadDir = __dirname + '/static/upload/'
            form.parse(req, function (err, fields, files) {
                if (Array.isArray(files.uploadedFile)) filesArray.push(...files.uploadedFile.map(file => getFileInfo(file)))
                else {
                    filesArray.push(getFileInfo(files.uploadedFile))
                }
                res.redirect("/fileManager")
            });
        } else res.redirect('/login')
    } catch (e) {
        console.log(e)
        res.render("/UploadSite.hbs")
    }

});

app.post("/login", function (req, res) {
    if (isLoggedIn) res.render('/fileManager', {files: filesArray});
    else if (req.body.password === A_HARDCODED_PASSWORD_WHICH_IS_A_BAD_IDEA) {
        isLoggedIn = true
        res.redirect('/fileManager')
    }
})

app.use(express.static('static'))

app.listen(PORT, function () {
    console.log(`Server is listening on port ${PORT} - http://localhost:${PORT}`)
})
