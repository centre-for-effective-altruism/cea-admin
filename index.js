// start a timer
var buildTime = process.hrtime();
var buildTimeDiff = buildTime;
// load ENV variables
// require('dotenv').load();
process.env.NODE_ENV = process.env.NODE_ENV || 'development'
var NODE_ENV = process.env.NODE_ENV;

if(NODE_ENV==='development'){
    require('cache-require-paths');
}
var chalk = require('chalk');
message('Initialising Build',chalk.dim)


var Metalsmith = require('metalsmith')
message('Loaded Metalsmith')

var markdown = require('metalsmith-markdown')
var layouts = require('metalsmith-layouts')
message('Loaded templating')

var ngAnnotate = require('ng-annotate');
var sass  = require('metalsmith-sass');
var concat = require('metalsmith-concat');
var autoprefixer = require('metalsmith-autoprefixer');
var browserify = require('browserify')
message('Loaded static file compilation')

var moment = require('moment');
var ignore = require('metalsmith-ignore')
var copy = require('metalsmith-copy')
var each = require('async').each;
var path = require('path');
var minimatch = require('minimatch');
message('Loaded utilities')

if(NODE_ENV==='production'){
    var uglify = require('metalsmith-uglify');
    var cleanCSS = require('metalsmith-clean-css');
    var uncss = require('metalsmith-uncss');
    var htmlMinifier = require("metalsmith-html-minifier");
    message('Loaded production dependencies')
}



message('Dependencies loaded, building site')
var colophonemes = new Metalsmith(__dirname);
    colophonemes
    .use(logMessage('NODE_ENV: ' + NODE_ENV,chalk.dim,true))
    .use(logMessage('NODE VERSION: ' + process.version,chalk.dim,true))
    .use(logMessage('BUILD TIME: ' + moment().format('YYYY-MM-DD @ H:m'),chalk.dim,true))
    .source('./src')
    .destination('./dest')
    .use(ignore([
        '**/.DS_Store',
        'styles/partials/**'
    ]))
    .use(logMessage('Set metadata'))
    .use(markdown({
        smartypants: true,
        gfm: true,
        tables: true
    }))
    .use(logMessage('Parsed Markdown files into HTML'))
    .use(layouts({
        engine:'jade',
        directory: 'templates'
    }))
    .use(logMessage('Built HTML files from templates'))
    .use(function (files,metalsmith,done){
        each(Object.keys(files).filter(minimatch.filter('scripts/app.js')),annotate,done)

        function annotate(file, cb){
            var res = ngAnnotate(files[file].contents.toString(),{
                add: true
            });
            if(res.error) throw Error(res.error);
            files[file].contents = res.src;
            cb();
        }

    })
    .use(function (files,metalsmith,done){
        // Bundle our javascript files using browserify
        each(Object.keys(files).filter(minimatch.filter('scripts/*.bundle.js')),bundle,done)

        function bundle(file, cb){
            // the filename of our entry script, relative to the Metalsmith source directory
            var filePath = file;
            // the output filename of our bundle
            var outFilePath = file.replace('.bundle','');
            // the output filename of our sourcemap
            var mapFilePath = file.replace('bundle','map');
            // get an absolute path to the file — browserify won't accept a buffer from Metalsmith's virtual file system
            var entryFile  = path.join(metalsmith.source(),filePath);
            // turn minification on or off
            var minify = NODE_ENV ==='production' ? true : false;
            // start browserify
            var b = new browserify({debug:true});
            // add the entry file to the queue
            b.add(entryFile)
            // add minifier / sourcemap generator
            b.plugin('minifyify', {map: '/'+mapFilePath, minify:minify}); 
            // call the main bundle function
            b.bundle(function(err, src, map){
                if(err) throw err;
                 if(minify){
                    files[outFilePath.replace('.js','.min.js')] = {contents: src, mode: 0664 }
                    files[mapFilePath] = {contents: map, mode: 0664 }
                 } else {
                    files[outFilePath] = {contents: src, mode: 0664 }
                 }
                delete files[file]
                 cb();
            })
        }
    })

    .use(logMessage('Bundled Javascript files'))
    ;
    // Build CSS
    if(NODE_ENV === 'development'){
        colophonemes
        .use(sass({
            outputStyle: 'nested'
        }))
    } else {
        colophonemes
        .use(sass())
    }
    colophonemes
    // .use(concat({
    //     files: ['styles/styles.css','styles/icons.css'],
    //     output: 'styles/app.css'
    // }))
    .use(autoprefixer())
    .use(logMessage('Built CSS files'))
    ;


// stuff to only do in production
    if(NODE_ENV==='production'){
        colophonemes
        .use(htmlMinifier())
        .use(logMessage('Minified HTML'))
        .use(logMessage('Cleaning CSS files',chalk.yellow.dim))
        .use(uncss({
            basepath: 'styles',
            css: ['app.css'],
            output: 'app.min.css',
            removeOriginal: true,
            uncss: {
                ignore: [
                    /collaps/,
                    /nav/,
                    /dropdown/,
                    /modal/,
                    /.fade/,
                    /.in/,
                    /.open/,
                    /ct-/,
                    /slider/,
                    '.loader',
                    '.transparent',
                    '.content-block-wrapper .scroll-down-chevron',
                    /slabtext/,
                    /lazyload/,
                    /tooltip/,
                ],
                media: ['(min-width: 480px)','(min-width: 768px)','(min-width: 992px)','(min-width: 1200px)']
            }
        }))
        .use(cleanCSS({
            cleanCSS : {
                keepBreaks: true,
                keepSpecialComments: false,
            }
        }))
        .use(logMessage('Cleaned CSS files'))
        .use(uglify({
            removeOriginal: true,
            filter: "scripts/includes/**"
        }))
        .use(logMessage('Minified Javascript'))
        .use(sitemap({
            hostname: 'https://www.givingwhatwecan.org',
            omitIndex: true,
            modified: 'data.sys.updatedAt',
            urlProperty: 'path'
        }))
        .use(logMessage('Built sitemap'))
        
    }

    // stuff to only do in development
    if(NODE_ENV==='development'){
        colophonemes
        // add '.min' to our asset filenames to match the HTML source
        .use(copy({
            pattern: '**/*.js',
            extension: '.min.js',
            move: true
        }))
        .use(copy({
            pattern: '**/*.css',
            extension: '.min.css',
            move: true
        }))
        
    }

    // Run build
    colophonemes.use(logMessage('Finalising build')).build(function(err,files){
        var t = formatBuildTime(buildTime);
        if(err){
            console.log('Build Failed!','(Build time: ' + t + ')');
            console.log('Errors:');
            console.trace(err);
        }
        else if(files){
            
            console.log('Build OK!','(Build time: ' + t + ')');
            
        }
    } )
    ;

// SEND CONSOLE MESSAGES
function message(m,c,t){
    c = c||chalk.yellow.bold
    t = t||false;
    var output = c(m);
    if(!t) {
        output += '................................................'.substr(m.length)
        output += chalk.dim('(+'+formatBuildTimeDiff()+' / '+formatBuildTime()+')')
    }
    console.log('-',output);
}
function logMessage (m,c,t){
    c = c ||chalk.bold.blue
    return function(files, metalsmith, done){
        message(m,c,t)
        done();
    }
}
// FORMAT BUILD TIMER INTO Mins : secs . milliseconds
function formatBuildTime(hrTimeObj){
    hrTimeObj = hrTimeObj || buildTime
    var t = process.hrtime(hrTimeObj)
    return (t[0] + (t[1]/10e+9)).toFixed(3)+'s';
}
function formatBuildTimeDiff(){
    var t = buildTimeDiff;
    buildTimeDiff = process.hrtime();
    return formatBuildTime(t);
}