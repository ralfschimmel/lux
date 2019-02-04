require('source-map-support').install({
  environment: 'node'
});

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Ora = _interopDefault(require('ora'));
var os = require('os');
var os__default = _interopDefault(os);
var cluster = require('cluster');
var cluster__default = _interopDefault(cluster);
var path = require('path');
var path__default = _interopDefault(path);
var lux = _interopDefault(require('rollup-plugin-lux'));
var json = _interopDefault(require('rollup-plugin-json'));
var alias = _interopDefault(require('rollup-plugin-alias'));
var babel = _interopDefault(require('rollup-plugin-babel'));
var eslint = _interopDefault(require('rollup-plugin-eslint'));
var resolve$1 = _interopDefault(require('rollup-plugin-node-resolve'));
var rollup = require('rollup');
var fs = require('fs');
var fs__default = _interopDefault(fs);
var EventEmitter = _interopDefault(require('events'));
var fbWatchman = require('fb-watchman');
var child_process = require('child_process');
var inflection = require('inflection');
var chalk = require('chalk');
var chalk__default = _interopDefault(chalk);
var readline = require('readline');
var tty = require('tty');
var ansiRegex = _interopDefault(require('ansi-regex'));
require('http');
require('url');
var repl = require('repl');

const {env:ENV}=process;function getPID(){let{pid}=process;if(cluster.isWorker&&typeof cluster.worker.pid==='number'){pid=cluster.worker.pid;}return pid}const CWD=process.cwd();const PID=getPID();const PORT=parseInt(ENV.PORT,10)||4000;const NODE_ENV=ENV.NODE_ENV||'development';const DATABASE_URL=ENV.DATABASE_URL;const LUX_CONSOLE=ENV.LUX_CONSOLE||false;const PLATFORM=os.platform();

function exec$1(cmd,opts){return new Promise((resolve$$1,reject)=>{child_process.exec(cmd,opts,(err,stdout,stderr)=>{if(err){reject(err);return}resolve$$1([stdout,stderr]);});})}

function K(){return this}

var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve$$1, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve$$1(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};























var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var tryCatch = (()=>{var _ref=asyncToGenerator(function*(fn,rescue=K){let result;try{result=yield fn();}catch(err){result=yield rescue(err);}return result});function tryCatch(_x){return _ref.apply(this,arguments)}return tryCatch})();

function isJSFile(target){return path.extname(target)==='.js'}

const FREEZER=new WeakSet;

function isObject(value){return Boolean(value)&&typeof value==='object'&&!Array.isArray(value)}

function freeze(value){FREEZER.add(value);return value}function freezeProps(target,makePublic,...props){Object.defineProperties(target,props.reduce((obj,key)=>Object.assign({},obj,{[key]:{value:Reflect.get(target,key),writable:false,enumerable:makePublic,configurable:false}}),{}));return target}

function isFrozen(value){return FREEZER.has(value)}

class FreezeableMap extends Map{set(key,value){if(!this.isFrozen()){super.set(key,value);}return this}clear(){if(!this.isFrozen()){super.clear();}}delete(key){return this.isFrozen()?false:super.delete(key)}freeze(deep){if(deep){this.forEach(Object.freeze);}return freeze(this)}isFrozen(){return isFrozen(this)}}

class FreezeableSet extends Set{add(value){if(!this.isFrozen()){super.add(value);}return this}clear(){if(!this.isFrozen()){super.clear();}}delete(value){return this.isFrozen()?false:super.delete(value)}freeze(deep){if(deep){this.forEach(Object.freeze);}return freeze(this)}isFrozen(){return isFrozen(this)}}

const SUBSCRIPTION_NAME='lux-watcher';function fallback(instance,path$$1){return fs.watch(path$$1,{recursive:true},(type,name)=>{if(isJSFile(name)){instance.emit('change',[{name,type}]);}})}function setupWatchmen(instance,path$$1){return new Promise((resolve$$1,reject)=>{const client=new fbWatchman.Client;client.capabilityCheck({},capabilityErr=>{if(capabilityErr){reject(capabilityErr);return}client.command(['watch-project',path$$1],(watchErr,{watch: watch$$1,relative_path:relativePath}={})=>{if(watchErr){reject(watchErr);return}client.command(['clock',watch$$1],(clockErr,{clock:since})=>{if(clockErr){reject(clockErr);return}client.command(['subscribe',watch$$1,SUBSCRIPTION_NAME,{since,relative_root:relativePath,fields:['name','size','exists','type'],expression:['allof',['match','*.js']]}],subscribeErr=>{if(subscribeErr){reject(subscribeErr);return}client.on('subscription',({files,subscription})=>{if(subscription===SUBSCRIPTION_NAME){instance.emit('change',files);}});resolve$$1(client);});});});});})}var initialize = (()=>{var _ref=asyncToGenerator(function*(instance,path$$1,useWatchman){const appPath=path.join(path$$1,'app');let client;if(useWatchman){yield tryCatch(asyncToGenerator(function*(){yield exec$1('which watchman');client=yield setupWatchmen(instance,appPath);}));}Object.assign(instance,{path:appPath,client:client||fallback(instance,appPath)});freezeProps(instance,true,'path','client');return instance});function initialize(_x,_x2,_x3){return _ref.apply(this,arguments)}return initialize})();

class Watcher extends EventEmitter{constructor(path$$1,useWatchman=true){super();return initialize(this,path$$1,useWatchman)}destroy(){const{client}=this;if(client instanceof fbWatchman.Client){client.end();}else{client.close();}}}

function createResolver(resolve$$1,reject){return function fsResolver(err,...args){const[data]=args;if(err){reject(err);return}resolve$$1(args.length>1?args:data);}}

function createPathRemover(path$$1){let pattern=new RegExp(`${path$$1}(/)?(.+)`);if(PLATFORM.startsWith('win')){const sep$$1='\\\\';pattern=new RegExp(`${path$$1.replace(/\\/g,sep$$1)}(${sep$$1})?(.+)`);}return source=>source.replace(pattern,'$2')}

function rmrf$$1(target){return stat(target).then(stats=>{if(stats&&stats.isDirectory()){return readdir(target)}else if(stats&&stats.isFile()){return unlink(target).then(()=>[])}return[]}).then(files=>Promise.all(files.map(file=>rmrf$$1(path__default.join(target,file))))).then(()=>rmdir(target)).catch(err=>{if(err.code==='ENOENT'){return Promise.resolve()}return Promise.reject(err)}).then(()=>true)}

var exists$$1 = (()=>{var _ref=asyncToGenerator(function*(path$$1,dir){if(path$$1 instanceof RegExp){const pattern=path$$1;let files=[];if(dir){files=yield readdir(dir);}return files.some(function(file){return pattern.test(file)})}return stat(path$$1).then(function(){return true},function(){return false})});function exists$$1(_x,_x2){return _ref.apply(this,arguments)}return exists$$1})();

function chain(source){return{pipe(handler){return chain(handler(source))},value(){return source},construct(constructor){return chain(Reflect.construct(constructor,[source]))}}}

function resolvePath(cwd=CWD,dir='',name=''){return chain(name.split('/')).pipe(parts=>path__default.join(cwd,dir,...parts)).pipe(path__default.parse).pipe((_ref)=>{let{base}=_ref,etc=objectWithoutProperties(_ref,['base']);return Object.assign({base},etc,{relative:path__default.join(etc.dir.substr(etc.dir.indexOf(dir)),base),absolute:path__default.join(etc.dir,base)})}).value()}

function watch$1(path$$1){return new Watcher(path$$1)}function stat(path$$1){return new Promise((resolve$$1,reject)=>{fs__default.stat(path$$1,createResolver(resolve$$1,reject));})}function mkdir(path$$1,mode=511){return new Promise((resolve$$1,reject)=>{fs__default.mkdir(path$$1,mode,createResolver(resolve$$1,reject));})}function mkdirRec(path$$1,mode=511){const parent=path.resolve(path$$1,'..');return stat(parent).catch(err=>{if(err.code==='ENOENT'){return mkdirRec(parent,mode)}return Promise.reject(err)}).then(()=>mkdir(path$$1,mode)).catch(err=>{if(err.code!=='EEXIST'){return Promise.reject(err)}return Promise.resolve()})}function rmdir(path$$1){return new Promise((resolve$$1,reject)=>{fs__default.rmdir(path$$1,createResolver(resolve$$1,reject));})}function readdir(path$$1){return new Promise((resolve$$1,reject)=>{fs__default.readdir(path$$1,createResolver(resolve$$1,reject));})}function readdirRec(path$$1,opts){const stripPath=createPathRemover(path$$1);return readdir(path$$1,opts).then(files=>Promise.all(files.map(file=>{const filePath=path.join(path$$1,file);return Promise.all([filePath,stat(filePath)])}))).then(files=>Promise.all(files.map(([file,stats])=>Promise.all([file,stats.isDirectory()?readdirRec(file):[]])))).then(files=>files.reduce((arr,[file,children])=>{const basename$$1=stripPath(file);return[...arr,basename$$1,...children.map(child=>path.join(basename$$1,stripPath(child)))]},[]))}function readFile(path$$1,opts){return new Promise((resolve$$1,reject)=>{fs__default.readFile(path$$1,typeof opts==='object'?opts:{},createResolver(resolve$$1,reject));})}function writeFile(path$$1,data,opts){return new Promise((resolve$$1,reject)=>{fs__default.writeFile(path$$1,data,opts,createResolver(resolve$$1,reject));})}function appendFile(path$$1,data,opts){return new Promise((resolve$$1,reject)=>{fs__default.appendFile(path$$1,data,typeof opts==='object'?opts:{},createResolver(resolve$$1,reject));})}function unlink(path$$1){return new Promise((resolve$$1,reject)=>{fs__default.unlink(path$$1,createResolver(resolve$$1,reject));})}

function insertValues(strings,...values){if(values.length){return strings.reduce((result,part,idx)=>{let value=values[idx];if(value&&typeof value.toString==='function'){value=value.toString();}else{value='';}return result+part+value},'')}return strings.join('')}

const bodyPattern=/^\n([\s\S]+)\s{2}$/gm;const trailingWhitespace=/\s+$/;function template(strings,...values){const compiled=insertValues(strings,...values);let[body]=compiled.match(bodyPattern)||[];let indentLevel=/^\s{0,4}(.+)$/g;if(!body){body=compiled;indentLevel=/^\s{0,2}(.+)$/g;}return body.split('\n').slice(1).map(line=>{let str=line.replace(indentLevel,'$1');if(trailingWhitespace.test(str)){str=str.replace(trailingWhitespace,'');}return str}).join('\n')}

function handleWarning(warning){if(warning.code==='UNUSED_EXTERNAL_IMPORT'){return}console.warn(warning.message);}

function isExternal(dir){return id=>!(id.startsWith('.')||id.endsWith('lux-framework')||id.startsWith('/')||/^[A-Z]:[\\/]/.test(id)||id.startsWith('app')||id.startsWith(path__default.join(dir,'app'))||id.startsWith(path__default.join(dir,'dist'))||id==='LUX_LOCAL'||id==='babelHelpers'||id==='\0babelHelpers')}

function underscore$1(source='',upper=false){return inflection.underscore(source,upper).replace(/-/g,'_')}

function compose(main,...etc){return input=>main(etc.reduceRight((value,fn)=>fn(value),input))}function composeAsync(main,...etc){return input=>etc.reduceRight((value,fn)=>Promise.resolve(value).then(fn),Promise.resolve(input)).then(main)}

const DOUBLE_COLON=/::/g;const formatName=compose(name=>name.replace(DOUBLE_COLON,'$'),inflection.camelize,underscore$1,name=>path.posix.join(path.dirname(name),path.basename(name,'.js')));

function createExportStatement(name,path$$1,isDefault=true){const normalized=path.posix.join(...path$$1.split(path.sep));if(isDefault){return`export {\n  default as ${name}\n} from '../${normalized}';\n\n`}return`export {\n  ${name}\n} from '../${normalized}';\n\n`}function createWriter(file){const writerFor=(type,handleWrite)=>value=>{const formatSymbol=compose(str=>str+inflection.capitalize(type),formatName);return Promise.all(value.map(item=>{if(handleWrite){return handleWrite(item)}const path$$1=path.join('app',inflection.pluralize(type),item);const symbol=formatSymbol(item);return appendFile(file,createExportStatement(symbol,path$$1))}))};return{controllers:writerFor('controller'),serializers:writerFor('serializer'),models:writerFor('model',(()=>{var _ref=asyncToGenerator(function*(item){const path$$1=path.join('app','models',item);const name=formatName(item);return appendFile(file,createExportStatement(name,path$$1))});return function(_x){return _ref.apply(this,arguments)}})()),migrations:writerFor('migration',(()=>{var _ref2=asyncToGenerator(function*(item){const path$$1=path.join('db','migrate',item);const name=chain(item).pipe(function(str){return path.basename(str,'.js')}).pipe(underscore$1).pipe(function(str){return str.substr(17)}).pipe(function(str){return inflection.camelize(str,true)}).value();yield appendFile(file,createExportStatement(`up as ${name}Up`,path$$1,false));yield appendFile(file,createExportStatement(`down as ${name}Down`,path$$1,false));});return function(_x2){return _ref2.apply(this,arguments)}})())}}var createManifest = (()=>{var _ref3=asyncToGenerator(function*(dir,assets,{useStrict}){const dist=path.join(dir,'dist');const file=path.join(dist,'index.js');const writer=createWriter(file);yield tryCatch(function(){return mkdir(dist)});yield writeFile(file,useStrict?'\'use strict\';\n\n':'');yield Promise.all(Array.from(assets).map(function([key,value]){const write=Reflect.get(writer,key);if(write){return write(value)}else if(!write&&typeof value==='string'){return appendFile(file,createExportStatement(key,value))}return Promise.resolve()}));});function createManifest(_x3,_x4,_x5){return _ref3.apply(this,arguments)}return createManifest})();

var createBootScript = (()=>{var _ref=asyncToGenerator(function*(dir,{useStrict}){let data=template`
    const CWD = process.cwd();
    const { env: { PORT } } = process;
    const { Application, config, database } = require('./bundle');

    module.exports = new Application(
      Object.assign(config, {
        database,
        path: CWD,
        port: PORT
      })
    ).catch(err => {
      process.send({
        error: err ? err.stack : void 0,
        message: 'error'
      });
    });
  `;if(useStrict){data=`'use strict';\n\n${data}`;}yield writeFile(path__default.join(dir,'dist','boot.js'),data);});function createBootScript(_x,_x2){return _ref.apply(this,arguments)}return createBootScript})();

let cache;let compile=(()=>{var _ref=asyncToGenerator(function*(dir,env,opts={}){const{useStrict=false}=opts;const local=path__default.join(__dirname,'..','src','index.js');const entry=path__default.join(dir,'dist','index.js');const external=isExternal(dir);let banner;const assets=yield Promise.all([readdir(path__default.join(dir,'app','models')),readdir(path__default.join(dir,'db','migrate')),readdirRec(path__default.join(dir,'app','controllers')),readdirRec(path__default.join(dir,'app','serializers'))]).then(function(types){let[models,migrations,controllers,serializers]=types;models=models.filter(isJSFile);migrations=migrations.filter(isJSFile);controllers=controllers.filter(isJSFile);serializers=serializers.filter(isJSFile);return new Map([['Application',path__default.join('app','index.js')],['config',path__default.join('config','environments',`${env}.js`)],['controllers',controllers],['database',path__default.join('config','database.js')],['migrations',migrations],['models',models],['routes',path__default.join('app','routes.js')],['seed',path__default.join('db','seed.js')],['serializers',serializers]])});yield Promise.all([createManifest(dir,assets,{useStrict}),createBootScript(dir,{useStrict})]);const aliases={app:path.posix.join('/',...dir.split(path__default.sep),'app'),LUX_LOCAL:path.posix.join('/',...local.split(path__default.sep))};if(os__default.platform()==='win32'){const[volume]=dir;const prefix=`${volume}:/`;Object.assign(aliases,{app:aliases.app.replace(prefix,''),LUX_LOCAL:aliases.LUX_LOCAL.replace(prefix,'')});}const bundle=yield rollup.rollup({entry,onwarn: handleWarning,external,cache,plugins:[alias(Object.assign({resolve:['.js']},aliases)),json(),resolve$1(),eslint({cwd:dir,parser:'babel-eslint',useEslintrc:false,include:[path__default.join(dir,'app','**')],exclude:[path__default.join(dir,'package.json'),path__default.join(__dirname,'..','src','**')]}),babel(),lux(path__default.resolve(path__default.sep,dir,'app'))]});if(NODE_ENV==='development'){cache=bundle;}yield rmrf$$1(entry);banner=template`
    const srcmap = require('source-map-support').install({
      environment: 'node'
    });
  `;if(useStrict){banner=`'use strict';\n\n${banner}`;}return bundle.write({banner,dest:path__default.join(dir,'dist','bundle.js'),format:'cjs',sourceMap:true,useStrict:false})});return function compile(_x,_x2){return _ref.apply(this,arguments)}})();

let build=(()=>{var _ref=asyncToGenerator(function*(useStrict=false){const spinner=new Ora({text:'Building your application...',spinner:'dots'});spinner.start();yield compile(CWD,NODE_ENV,{useStrict});spinner.stop();});return function build(){return _ref.apply(this,arguments)}})();

const drivers=new Map([['postgres','pg'],['sqlite','sqlite3'],['mysql','mysql2'],['mariadb','mariasql'],['oracle','oracle']]);function driverFor(database='sqlite'){return drivers.get(database)||'sqlite3'}

var appTemplate = (name=>{const normalized=chain(name).pipe(underscore$1).pipe(inflection.classify).value();return template`
    import { Application } from 'lux-framework';

    class ${normalized} extends Application {

    }

    export default ${normalized};
  `});

var configTemplate = ((name,env)=>{const isTestENV=env==='test';const isProdENV=env==='production';return template`
    export default {
      logging: {
        level: ${isProdENV?'\'INFO\'':'\'DEBUG\''},
        format: ${isProdENV?'\'json\'':'\'text\''},
        enabled: ${(!isTestENV).toString()},

        filter: {
          params: []
        }
      }
    };
  `});

var routesTemplate = (()=>template`
  export default function routes() {

  }
`);

function indent(amount=1){return' '.repeat(amount)}

var dbTemplate = ((name,driver)=>{const schemaName=underscore$1(name);let driverName=driver;let template='export default {\n';let username;if(!driverName){driverName='sqlite3';}if(driverName==='pg'){username='postgres';}else if(driverName!=='pg'&&driverName!=='sqlite3'){username='root';}['development','test','production'].forEach(environment=>{template+=`${indent(2)}${environment}: {\n`;if(driverName!=='sqlite3'){template+=`${indent(4)}pool: 5,\n`;}template+=`${indent(4)}driver: '${driverName}',\n`;if(username){template+=`${indent(4)}username: '${username}',\n`;}switch(environment){case'development':template+=`${indent(4)}database: '${schemaName}_dev'\n`;break;case'test':template+=`${indent(4)}database: '${schemaName}_test'\n`;break;case'production':template+=`${indent(4)}database: '${schemaName}_prod'\n`;break;default:template+=`${indent(4)}database: '${schemaName}_${environment}'\n`;break;}template+=`${indent(2)}}`;if(environment!=='production'){template+=',\n\n';}});template+='\n};\n';return template});

var seedTemplate = (()=>template`
  export default async function seed() {

  }
`);

var version="1.2.3";var devDependencies={"babel-core":"6.24.1","babel-plugin-istanbul":"4.1.3","babel-plugin-transform-es2015-modules-commonjs":"6.24.1","babel-preset-lux":"2.0.2","chai":"3.5.0","eslint-config-airbnb-base":"11.2.0","eslint-plugin-flowtype":"2.33.0","eslint-plugin-import":"2.2.0","faker":"4.1.0","flow-bin":"0.38.0","flow-typed":"2.1.2","mocha":"3.4.1","mocha-junit-reporter":"1.13.0","node-fetch":"1.6.3","nyc":"10.3.2","remark-cli":"3.0.1","remark-lint":"6.0.0","remark-preset-lint-recommended":"2.0.0","rollup-plugin-multi-entry":"2.0.1","shx":"0.2.2","sinon":"2.2.0"};

const LUX_VERSION=version;const BABEL_PRESET_VERSION=devDependencies['babel-preset-lux'];var pkgJSONTemplate = (name$$1=>template`
  {
    "name": "${name$$1}",
    "version": "0.0.1",
    "description": "",
    "scripts": {
      "start": "lux serve",
      "test": "lux test"
    },
    "author": "",
    "license": "MIT",
    "dependencies": {
      "babel-core": "6.17.0",
      "babel-preset-lux": "${BABEL_PRESET_VERSION}",
      "knex": "0.12.6",
      "lux-framework": "${LUX_VERSION}"
    },
    "engines": {
      "node": ">= 6.0"
    }
  }
`);

var babelrcTemplate = (()=>template`
  {
    "presets": ["lux"]
  }
`);

var eslintrcTemplate = (()=>template`
  {
    "parser": "babel-eslint",
    "extends": "eslint:recommended",
    "env": {
      "node": true
    },
    "globals": {
      "Map": true,
      "Set": true,
      "Proxy": true,
      "Promise": true,
      "Reflect": true,
      "WeakMap": true,
      "WeakSet": true,
      "Iterable": true
    }
  }
`);

var readmeTemplate = (name=>template`
  # ${name}

  ## Installation

  *   \`git clone https://github.com/<this-repository>\`
  *   \`cd ${name}\`
  *   \`npm install\`

  ## Running / Development

  *   \`lux serve\`

  ## Testing

  *   \`lux test\`

  ## Further Reading / Useful Links
  *   [Lux](https://github.com/postlight/lux/)
  *   [Chai](http://chaijs.com/) / [Mocha](http://mochajs.org/)
`);

var licenseTemplate = (()=>template`
  The MIT License (MIT)

  Copyright (c) 2016

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
`);

var gitignoreTemplate = (()=>template`
  # See http://help.github.com/ignore-files/ for more about ignoring files.

  # dependencies
  /node_modules

  # build
  /dist

  # logs
  /log
  npm-debug.log

  # misc
  *.DS_Store
`);

const YES=/^y(es)?$/i;function createPrompt(){const prompt=readline.createInterface({input:process.stdin,output:process.stdout});prompt.setPrompt('');return{question(text){return new Promise(resolve$$1=>{prompt.question(text,answer=>{resolve$$1(YES.test(answer));});})},close(){prompt.close();}}}

const NAMESPACED_RESOURCE_MESSAGE=template`

  🎉  It looks like the resource you generated is within a namespace!

  Lux will only update your 'routes.js' file if you generate a resource at the\
  root namespace (i.e 'lux generate resource users').

  In order to access the resource you have created, remember to manually update\
  your 'routes.js' file.

    Example:

    export default function routes() {
      ${chalk.dim('// this resource will be accessible at /users')}
      this.resource('users');

      this.namespace('admin', function () {
        ${chalk.dim('// this resource will be accessible at /admin/users')}
        this.resource('users');
      });
    }

`;

const VALID_DRIVERS=['pg','sqlite3','mssql','mysql','mysql2','mariasql','strong-oracle','oracle'];

const DEBUG='DEBUG';const INFO='INFO';const WARN='WARN';const ERROR='ERROR';const FORMATS=new FreezeableSet(['text','json']);FORMATS.freeze();const LEVELS=new FreezeableMap([[DEBUG,0],[INFO,1],[WARN,2],[ERROR,3]]);LEVELS.freeze();

const HAS_OBJECT_ENTRIES=typeof Object.entries==='function';function entries(source){if(HAS_OBJECT_ENTRIES){return Object.entries(source)}return Object.keys(source).reduce((result,key)=>{const value=Reflect.get(source,key);result.push([key,value]);return result},[])}

function setType(fn){return fn()}

function omit(src,...omitted){return setType(()=>entries(src).filter(([key])=>omitted.indexOf(key)<0).reduce((result,[key,value])=>Object.assign({},result,{[key]:value}),{}))}

const ANSI=ansiRegex();const STDOUT=/^(DEBUG|INFO)$/;const STDERR=/^(WARN|ERROR)$/;

function stringify(value,spaces){if(isObject(value)||Array.isArray(value)){return JSON.stringify(value,null,spaces)}return String(value)}

function formatMessage(data,format){if(data instanceof Error){return data.stack}else if(format==='json'){return stringify(data).replace(ANSI,'')}return stringify(data,2)}

function createWriter$1(format){return function write(data){const{level}=data,etc=objectWithoutProperties(data,['level']);let{message,timestamp}=etc;let output;if(format==='json'){output={};if(message&&typeof message==='object'&&message.message){output=Object.assign({timestamp,level,message:message.message},omit(message,'message'));}else{output=Object.assign({timestamp,level,message},etc);}output=formatMessage(output,'json');}else{let columns=0;if(process.stdout instanceof tty.WriteStream){columns=process.stdout.columns;}message=formatMessage(message,'text');switch(level){case WARN:timestamp=chalk.yellow(`[${timestamp}]`);break;case ERROR:timestamp=chalk.red(`[${timestamp}]`);break;default:timestamp=chalk.dim(`[${timestamp}]`);break;}output=`${timestamp} ${message}\n\n${chalk.dim('-').repeat(columns)}\n`;}if(STDOUT.test(level)){process.stdout.write(`${output}\n`);}else if(STDERR.test(level)){process.stderr.write(`${output}\n`);}}}

function line(strings,...values){return insertValues(strings,...values).replace(/(\r\n|\n|\r|)/gm,'').replace(/\s+/g,' ').trim()}

function countDigits(num){const digits=Math.floor(Math.log10(num)+1);return digits>0&&Number.isFinite(digits)?digits:1}function pad(startTime,endTime,duration){const maxLength=countDigits(endTime-startTime);return' '.repeat(maxLength-countDigits(duration))+duration}const debugTemplate=({path: path$$1,stats,route,method,params,colorStr,startTime,endTime,statusCode,statusMessage,remoteAddress})=>`\
${line`
  Processed ${chalk.cyan(`${method}`)} "${path$$1}" from ${remoteAddress}
  with ${Reflect.apply(colorStr,null,[`${statusCode}`])}
  ${Reflect.apply(colorStr,null,[`${statusMessage}`])} by ${route?`${chalk.yellow(route.controller.constructor.name)}#${chalk.blue(route.action)}`:null}
`}

${chalk.magenta('Params')}

${JSON.stringify(params,null,2)}

${chalk.magenta('Stats')}

${stats.map(stat=>{const{type,duration,controller}=stat;let{name}=stat;name=chalk.blue(name);if(type==='action'){name=`${chalk.yellow(controller)}#${name}`;}return`${pad(startTime,endTime,duration)} ms ${name}`}).join('\n')}
${pad(startTime,endTime,stats.reduce((total,{duration})=>total+duration,0))} ms Total
${(endTime-startTime).toString()} ms Actual\
`;const infoTemplate=({path: path$$1,route,method,params,colorStr,startTime,endTime,statusCode,statusMessage,remoteAddress})=>line`
Processed ${chalk.cyan(`${method}`)} "${path$$1}" ${chalk.magenta('Params')} ${JSON.stringify(params)} from ${remoteAddress} in ${(endTime-startTime).toString()} ms with ${Reflect.apply(colorStr,null,[`${statusCode}`])} ${Reflect.apply(colorStr,null,[`${statusMessage}`])} by ${route?`${chalk.yellow(route.controller.constructor.name)}#${chalk.blue(route.action)}`:null}
`;

function filterParams(params,...filtered){return entries(params).map(([key,value])=>[key,filtered.indexOf(key)>=0?'[FILTERED]':value]).reduce((result,[key,value])=>Object.assign({},result,{[key]:value&&typeof value==='object'&&!Array.isArray(value)?filterParams(value,...filtered):value}),{})}

function logText(logger,{startTime,request:req,response:res}){res.once('finish',()=>{const endTime=Date.now();const{route,method,url:{path: path$$1},connection:{remoteAddress}}=req;const{stats,statusMessage}=res;let{params}=req;let{statusCode}=res;let statusColor;params=filterParams(params,...logger.filter.params);if(statusCode>=200&&statusCode<400){statusColor='green';}else{statusColor='red';}let colorStr=Reflect.get(chalk__default,statusColor);if(typeof colorStr==='undefined'){colorStr=str=>str;}statusCode=statusCode.toString();const templateData={path: path$$1,stats,route,method,params,colorStr,startTime,endTime,statusCode,statusMessage,remoteAddress};if(logger.level===DEBUG){logger.debug(debugTemplate(templateData));}else{logger.info(infoTemplate(templateData));}});}

const MESSAGE='Processed Request';function logJSON(logger,{request:req,response:res}){res.once('finish',()=>{const{method,headers,httpVersion,url:{path: path$$1},connection:{remoteAddress}}=req;const{statusCode:status}=res;const userAgent=headers.get('user-agent');const protocol=`HTTP/${httpVersion}`;let{params}=req;params=filterParams(params,...logger.filter.params);logger.info({message:MESSAGE,method,path: path$$1,params,status,protocol,userAgent,remoteAddress});});}

function createRequestLogger(logger){return function request(req,res,{startTime}){if(logger.format==='json'){logJSON(logger,{startTime,request:req,response:res});}else{logText(logger,{startTime,request:req,response:res});}}}

const PATTERN=/(?:,?`|'|").+(?:`|'|"),?/;function sql(strings,...values){return insertValues(strings,...values).split(' ').map(part=>{if(PATTERN.test(part)){return part}return part.toUpperCase()}).join(' ')}

class Logger{constructor({level,format,filter,enabled}){let write=K;let request=K;if(!LUX_CONSOLE&&enabled){write=createWriter$1(format);request=createRequestLogger(this);}Object.defineProperties(this,{level:{value:level,writable:false,enumerable:true,configurable:false},format:{value:format,writable:false,enumerable:true,configurable:false},filter:{value:filter,writable:false,enumerable:true,configurable:false},enabled:{value:Boolean(enabled),writable:false,enumerable:true,configurable:false},request:{value:request,writable:false,enumerable:false,configurable:false}});const levelNum=LEVELS.get(level)||0;LEVELS.forEach((val,key)=>{Reflect.defineProperty(this,key.toLowerCase(),{writable:false,enumerable:false,configurable:false,value:val>=levelNum?message=>{write({message,level:key,timestamp:this.getTimestamp()});}:K});});}getTimestamp(){return new Date().toISOString()}}

class InvalidDriverError extends Error{constructor(driver){super(line`
      Invalid database driver ${chalk.yellow(driver)} in ./config/database.js.
      Please use one of the following database drivers:
      ${VALID_DRIVERS.map(str=>chalk.green(str)).join(', ')}.
    `);}}

class ModelMissingError extends Error{constructor(name){super(`Could not resolve model by name '${name}'`);}}

class MigrationsPendingError extends Error{constructor(migrations=[]){const pending=migrations.map(str=>chalk.yellow(str.substr(0,str.length-3))).join(', ');super(line`
      The following migrations are pending ${pending}.
      Please run ${chalk.green('lux db:migrate')} before starting your application.
    `);}}

function createServerError(Target,statusCode){return setType(()=>{const ServerError=class ServerError extends Target{constructor(...args){super(...args);this.statusCode=statusCode;}};Reflect.defineProperty(ServerError,'name',{value:Target.name});return ServerError})}

class MalformedRequestError extends SyntaxError{constructor(){super(line`
      There was an error parsing the request body. Please make sure that the
      request body is a valid JSON API document.
    `);}}createServerError(MalformedRequestError,400);

const MIME_TYPE='application/vnd.api+json';

class NotAcceptableError extends TypeError{constructor(contentType){super(line`
      Media type parameters is not supported. Try your request again
      without specifying '${contentType.replace(MIME_TYPE,'')}'.
    `);}}createServerError(NotAcceptableError,406);

class UnsupportedMediaTypeError extends TypeError{constructor(contentType){super(line`
      Media type parameters is not supported. Try your request again
      without specifying '${contentType.replace(MIME_TYPE,'')}'.
    `);}}createServerError(UnsupportedMediaTypeError,415);

class InvalidContentTypeError extends TypeError{constructor(contentType='undefined'){super(line`
      Content-Type: '${contentType}' is not supported. Try your request again
      with Content-Type: '${MIME_TYPE}'.
    `);}}createServerError(InvalidContentTypeError,400);

class UniqueConstraintError extends Error{}createServerError(UniqueConstraintError,409);

class ConfigMissingError extends Error{constructor(environment){super(`Database config not found for environment ${environment}.`);}}

class RecordNotFoundError extends Error{constructor({name,primaryKey},primaryKeyValue){super(`Could not find ${name} with ${primaryKey} ${stringify(primaryKeyValue)}.`);}}createServerError(RecordNotFoundError,404);

function connect(path$$1,config={}){let{pool}=config;const{host,socket,driver,database,username,password,port,ssl,url: url$$1}=config;if(VALID_DRIVERS.indexOf(driver)<0){throw new InvalidDriverError(driver)}if(pool&&typeof pool==='number'){pool={min:pool>1?2:1,max:pool};}const knex=require(path.join(path$$1,'node_modules','knex'));const usingSQLite=driver==='sqlite3';const connection=DATABASE_URL||url$$1||{host,database,password,port,ssl,user:username,socketPath:socket,filename:usingSQLite?path.join(path$$1,'db',`${database||'default'}_${NODE_ENV}.sqlite`):undefined};return knex({pool,connection,debug:false,client:driver,useNullAsDefault:usingSQLite})}

var createMigrations = (()=>{var _ref=asyncToGenerator(function*(schema){const hasTable=yield schema().hasTable('migrations');if(!hasTable){yield schema().createTable('migrations',function(table){table.string('version',16).primary();});}return true});function createMigrations(_x){return _ref.apply(this,arguments)}return createMigrations})();

var pendingMigrations = (()=>{var _ref=asyncToGenerator(function*(appPath,table){const migrations=yield readdir(`${appPath}/db/migrate`);const versions=yield table().select().then(function(data){return data.map(function({version}){return version})});return migrations.filter(function(migration){return versions.indexOf(migration.replace(/^(\d{16})-.+$/g,'$1'))<0})});function pendingMigrations(_x,_x2){return _ref.apply(this,arguments)}return pendingMigrations})();

var initialize$1 = (()=>{var _ref=asyncToGenerator(function*(instance,opts){const{path: path$$1,models,logger,checkMigrations}=opts;let{config}=opts;config=Reflect.get(config,NODE_ENV);if(!config){throw new ConfigMissingError(NODE_ENV)}const{debug=NODE_ENV==='development'}=config;Object.defineProperties(instance,{path:{value:path$$1,writable:false,enumerable:false,configurable:false},debug:{value:debug,writable:false,enumerable:false,configurable:false},models:{value:models,writable:false,enumerable:false,configurable:false},logger:{value:logger,writable:false,enumerable:false,configurable:false},config:{value:config,writable:false,enumerable:true,configurable:false},schema:{value:function(){return instance.connection.schema},writable:false,enumerable:false,configurable:false},connection:{value:connect(path$$1,config),writable:false,enumerable:false,configurable:false}});if(cluster.isMaster||cluster.worker&&cluster.worker.id===1){yield createMigrations(instance.schema);if(checkMigrations){const pending=yield pendingMigrations(path$$1,function(){return instance.connection('migrations')});if(pending.length){throw new MigrationsPendingError(pending)}}}yield Promise.all(Array.from(models.values()).map(function(model){return model.initialize(instance,function(){return instance.connection(model.tableName)})}));return instance});function initialize(_x,_x2){return _ref.apply(this,arguments)}return initialize})();

var normalizeModelName = compose(inflection.singularize,inflection.dasherize,underscore$1);

function formatInt(int){return(int/10).toString().replace('.','').substr(0,2)}function*padding(char,amount){for(let i=0;i<amount;i+=1){yield char;}}function generateTimestamp(){const now=new Date;const timestamp=now.toISOString().substr(0,10).split('-').join('')+formatInt(now.getHours())+formatInt(now.getMinutes())+formatInt(now.getSeconds())+formatInt(now.getMilliseconds());return timestamp+Array.from(padding('0',16-timestamp.length)).join('')}

class Migration{constructor(fn){this.fn=fn;}run(schema){return this.fn(schema)}}

class Database{constructor({path: path$$1,models,config,logger,checkMigrations}){return initialize$1(this,{path: path$$1,models,config,logger,checkMigrations})}modelFor(type){const model=this.models.get(normalizeModelName(type));if(!model){throw new ModelMissingError(type)}return model}}

const VALID_ATTR=/^(\w|-)+:(\w|-)+$/;const RELATIONSHIP=/^belongs-to|has-(one|many)$/;var modelTemplate = ((name,attrs)=>{const normalized=chain(name).pipe(underscore$1).pipe(inflection.classify).value();return template`
    import { Model } from 'lux-framework';

    class ${normalized} extends Model {
    ${entries((attrs||[]).filter(attr=>VALID_ATTR.test(attr)).map(attr=>attr.split(':')).filter(([,type])=>RELATIONSHIP.test(type)).reduce((types,[related,type])=>{const key=chain(type).pipe(underscore$1).pipe(str=>inflection.camelize(str,true)).value();const value=Reflect.get(types,key);if(value){const inverse=inflection.camelize(normalized,true);const relatedKey=chain(related).pipe(underscore$1).pipe(str=>inflection.camelize(str,true)).value();return Object.assign({},types,{[key]:[...value,`${indent(8)}${relatedKey}: {${os.EOL}`+`${indent(10)}inverse: '${inverse}'${os.EOL}`+`${indent(8)}}`]})}return types},{hasOne:[],hasMany:[],belongsTo:[]})).filter(([,value])=>value.length).reduce((result,[key,value],index)=>chain(result).pipe(str=>{if(index&&str.length){return`${str}${os.EOL.repeat(2)}`}return str}).pipe(str=>str+`${indent(index===0?2:6)}static ${key} = {${os.EOL}`+`${value.join(`,${os.EOL.repeat(2)}`)}${os.EOL}`+`${indent(6)}};`).value(),'')}
    }

    export default ${normalized};
  `});

var serializerTemplate = ((name,attrs)=>{let normalized=chain(name).pipe(underscore$1).pipe(inflection.classify).value();if(!normalized.endsWith('Application')){normalized=inflection.pluralize(normalized);}const body=entries(attrs.filter(attr=>/^(\w|-)+:(\w|-)+$/g.test(attr)).map(attr=>attr.split(':')).reduce((obj,parts)=>{const[,type]=parts;let[attr]=parts;let{hasOne,hasMany,attributes}=obj;attr=`${indent(8)}'${inflection.camelize(underscore$1(attr),true)}'`;switch(type){case'belongs-to':case'has-one':hasOne=[...hasOne,attr];break;case'has-many':hasMany=[...hasMany,attr];break;default:attributes=[...attributes,attr];}return{attributes,hasOne,hasMany}},{attributes:[],belongsTo:[],hasOne:[],hasMany:[]})).reduce((result,group,index)=>{const[key]=group;let[,value]=group;let str=result;if(value.length){value=value.join(',\n');if(index&&str.length){str+='\n\n';}str+=`${indent(index===0?2:6)}${key} = `+`[\n${value}\n${indent(6)}];`;}return str},'');return template`
    import { Serializer } from 'lux-framework';

    class ${normalized}Serializer extends Serializer {
    ${body}
    }

    export default ${normalized}Serializer;
  `});

var controllerTemplate = ((name,attrs)=>{let normalized=chain(name).pipe(underscore$1).pipe(inflection.classify).value();if(!normalized.endsWith('Application')){normalized=inflection.pluralize(normalized);}const body=entries(attrs.filter(attr=>/^(\w|-)+:(\w|-)+$/g.test(attr)).map(attr=>attr.split(':')[0]).reduce((obj,attr)=>Object.assign({},obj,{params:[...obj.params,`${indent(8)}'${inflection.camelize(underscore$1(attr),true)}'`]}),{params:[]})).reduce((result,group,index)=>{const[key]=group;let[,value]=group;let str=result;if(value.length){value=value.join(',\n');if(index&&str.length){str+='\n\n';}str+=`${indent(index===0?2:6)}${key} = `+`[\n${value}\n${indent(6)}];`;}return str},'');return template`
    import { Controller } from 'lux-framework';

    class ${normalized}Controller extends Controller {
    ${body}
    }

    export default ${normalized}Controller;
  `});

var emptyMigrationTemplate = (()=>template`
  export function up(schema) {

  }

  export function down(schema) {

  }
`);

var modelMigrationTemplate = ((name,attrs)=>{const indices=['id'];const table=chain(name).pipe(str=>str.substr(24)).pipe(underscore$1).pipe(inflection.pluralize).value();let body='';if(Array.isArray(attrs)){body=attrs.filter(attr=>/^(\w|-)+:(\w|-)+$/g.test(attr)).map(attr=>attr.split(':')).filter(([,type])=>!/^has-(one|many)$/g.test(type)).map(attr=>{let[column,type]=attr;column=underscore$1(column);if(type==='belongs-to'){type='integer';column=`${column}_id`;if(Array.isArray(indices)){indices.push(column);}}return[column,type]}).map((attr,index)=>{let[column]=attr;const[,type]=attr;const shouldIndex=indices.indexOf(column)>=0;column=`${indent(index>0?8:0)}table.${type}('${column}')`;return shouldIndex?`${column}.index();`:`${column};`}).join('\n');}return template`
    export function up(schema) {
      return schema.createTable('${table}', table => {
        table.increments('id');
        ${body}
        table.timestamps();

        table.index('created_at');
        table.index('updated_at');
      });
    }

    export function down(schema) {
      return schema.dropTable('${table}');
    }
  `});

var middlewareTemplate = (name=>{const normalized=chain(name).pipe(underscore$1).pipe(str=>inflection.camelize(str,true)).value();return template`
    export default function ${normalized}(/*request, response*/) {

    }
  `});

var utilTemplate = (name=>{const normalized=chain(name).pipe(underscore$1).pipe(str=>inflection.camelize(str,true)).value();return template`
    export default function ${normalized}() {

    }
  `});

function log(data){if(data instanceof Error){process.stdout.write(`${data.stack||data.message}\n`);}else{process.stderr.write(`${data}\n`);}}

const FORWARD_SLASH=/\//g;function createGenerator({dir,template,hasConflict=exists$$1}){return(()=>{var _ref2=asyncToGenerator(function*(_ref){let{cwd,attrs,onConflict}=_ref,opts=objectWithoutProperties(_ref,['cwd','attrs','onConflict']);const path$$1=resolvePath(cwd,dir,`${opts.name}.js`);const name=opts.name.replace(FORWARD_SLASH,'-');let action=chalk.green('create');yield mkdirRec(path$$1.dir);if(yield hasConflict(path$$1.absolute)){const shouldContinue=yield onConflict(path$$1.relative);if(shouldContinue&&typeof shouldContinue==='string'){yield rmrf$$1(path.join(path$$1.dir,shouldContinue));log(`${chalk.red('remove')} ${path.join(dir,shouldContinue)}`);}else if(shouldContinue&&typeof shouldContinue==='boolean'){action=chalk.yellow('overwrite');yield rmrf$$1(path$$1.absolute);}else{log(`${chalk.yellow('skip')} ${path$$1.relative}`);return}}yield writeFile(path$$1.absolute,template(name,attrs));log(`${action} ${path$$1.relative}`);});return function(_x){return _ref2.apply(this,arguments)}})()}

function detectConflict(path$$1){const{dir,base}=resolvePath(path$$1);const pattern=new RegExp(`^\\d+-${base.substr(17)}$`);return exists$$1(pattern,dir)}function createConflictResolver({cwd,onConflict}){return(()=>{var _ref=asyncToGenerator(function*(path$$1){if(yield onConflict(path$$1)){const parsed=resolvePath(cwd,path$$1);const migrations=yield readdir(parsed.dir);return migrations.find(function(file){return file.substr(17)===parsed.base.substr(17)})||false}return false});return function(_x){return _ref.apply(this,arguments)}})()}

let controller=(()=>{var _ref=asyncToGenerator(function*(opts){const{cwd}=opts;let{name}=opts;const dir=path.join('app','controllers');const generate=createGenerator({dir,template:controllerTemplate});if(!name.endsWith('application')){name=inflection.pluralize(name);}yield generate(Object.assign({},opts,{cwd,name}));const namespace=path.posix.dirname(name);if(namespace!=='.'){const hasParent=yield exists$$1(path.join(cwd,dir,...[...namespace.split('/'),'application.js']));if(!hasParent){yield controller(Object.assign({},opts,{cwd,name:`${namespace}/application`,attrs:[]}));}}});return function controller(_x){return _ref.apply(this,arguments)}})();let serializer=(()=>{var _ref2=asyncToGenerator(function*(opts){const{cwd}=opts;let{name}=opts;const dir=path.join('app','serializers');const generate=createGenerator({dir,template:serializerTemplate});if(!name.endsWith('application')){name=inflection.pluralize(name);}yield generate(Object.assign({},opts,{cwd,name}));const namespace=path.posix.dirname(name);if(namespace!=='.'){const hasParent=yield exists$$1(path.join(cwd,dir,...[...namespace.split('/'),'application.js']));if(!hasParent){yield serializer(Object.assign({},opts,{cwd,name:`${namespace}/application`,attrs:[]}));}}});return function serializer(_x2){return _ref2.apply(this,arguments)}})();function migration(opts){const{cwd,onConflict}=opts;let{name}=opts;const dir=path.join('db','migrate');const generate=createGenerator({dir,template:emptyMigrationTemplate,hasConflict:detectConflict});name=chain(name).pipe(path.posix.basename).pipe(str=>`${generateTimestamp()}-${str}`).value();return generate(Object.assign({},opts,{cwd,name,onConflict:createConflictResolver({cwd,onConflict})}))}function modelMigration(opts){const{cwd,onConflict}=opts;let{name}=opts;const dir=path.join('db','migrate');const generate=createGenerator({dir,template:modelMigrationTemplate,hasConflict:detectConflict});name=chain(name).pipe(path.posix.basename).pipe(inflection.pluralize).pipe(str=>`${generateTimestamp()}-create-${str}`).value();return generate(Object.assign({},opts,{cwd,name,onConflict:createConflictResolver({cwd,onConflict})}))}let model=(()=>{var _ref3=asyncToGenerator(function*(opts){let{name}=opts;const generate=createGenerator({dir:path.join('app','models'),template:modelTemplate});yield modelMigration(Object.assign({name},opts));name=chain(name).pipe(path.posix.basename).pipe(inflection.singularize).value();return generate(Object.assign({},opts,{name}))});return function model(_x3){return _ref3.apply(this,arguments)}})();function middleware(opts){let{name}=opts;const parts=name.split('/');name=parts.pop()||name;const generate=createGenerator({dir:path.join('app','middleware',...parts),template:middlewareTemplate});return generate(Object.assign({},opts,{name}))}function util(opts){let{name}=opts;const parts=name.split('/');name=parts.pop()||name;const generate=createGenerator({dir:path.join('app','utils',...parts),template:utilTemplate});return generate(Object.assign({},opts,{name}))}let resource=(()=>{var _ref4=asyncToGenerator(function*(opts){yield model(opts);yield controller(opts);yield serializer(opts);if(path.posix.dirname(opts.name)!=='.'){log(NAMESPACED_RESOURCE_MESSAGE);return}const path$$1=path.join(opts.cwd,'app','routes.js');const routes=chain((yield readFile(path$$1))).pipe(function(buf){return buf.toString('utf8')}).pipe(function(str){return str.split('\n')}).pipe(function(lines){return lines.reduce(function(result,line,index,arr){const closeIndex=arr.lastIndexOf('}');let str=result;if(line&&index<=closeIndex){str+=`${line}\n`;}if(index+1===closeIndex){str+=`  this.resource('${inflection.pluralize(opts.name)}');\n`;}return str},'')}).value();yield writeFile(path$$1,routes);log(`${chalk.green('update')} app/routes.js`);});return function resource(_x4){return _ref4.apply(this,arguments)}})();



var generators = Object.freeze({
	controller: controller,
	serializer: serializer,
	migration: migration,
	modelMigration: modelMigration,
	model: model,
	middleware: middleware,
	util: util,
	resource: resource
});

function generatorFor(type){const normalized=type.toLowerCase();const generator=Reflect.get(generators,normalized);if(!generator){throw new Error(`Could not find a generator for '${type}'.`)}return generator}

let runGenerator=(()=>{var _ref=asyncToGenerator(function*({cwd,type,name,attrs}){const generator=generatorFor(type);const prompt=createPrompt();yield generator({cwd,type,name,attrs,onConflict:function(path$$1){return prompt.question(`${chalk.green('?')} ${chalk.red('Overwrite')} ${path$$1}? (Y/n)\r`)}});prompt.close();});return function runGenerator(_x){return _ref.apply(this,arguments)}})();

function generate({cwd=CWD,name,type,attrs=[]}){return runGenerator({cwd,name,type,attrs})}

let create=(()=>{var _ref=asyncToGenerator(function*(name,database){const driver=driverFor(database);const project=`${CWD}/${name}`;yield mkdir(project);yield Promise.all([mkdir(`${project}/app`),mkdir(`${project}/config`),mkdir(`${project}/db`)]);yield Promise.all([mkdir(`${project}/app/models`),mkdir(`${project}/app/serializers`),mkdir(`${project}/app/controllers`),mkdir(`${project}/app/middleware`),mkdir(`${project}/app/utils`),mkdir(`${project}/config/environments`),mkdir(`${project}/db/migrate`)]);yield Promise.all([writeFile(`${project}/app/index.js`,appTemplate(name)),writeFile(`${project}/app/routes.js`,routesTemplate()),writeFile(`${project}/config/environments/development.js`,configTemplate(name,'development')),writeFile(`${project}/config/environments/test.js`,configTemplate(name,'test')),writeFile(`${project}/config/environments/production.js`,configTemplate(name,'production')),writeFile(`${project}/config/database.js`,dbTemplate(name,driver)),writeFile(`${project}/db/seed.js`,seedTemplate()),writeFile(`${project}/README.md`,readmeTemplate(name)),writeFile(`${project}/LICENSE`,licenseTemplate()),writeFile(`${project}/package.json`,pkgJSONTemplate(name,database)),writeFile(`${project}/.babelrc`,babelrcTemplate()),writeFile(`${project}/.eslintrc.json`,eslintrcTemplate()),writeFile(`${project}/.gitignore`,gitignoreTemplate())]);const logOutput=template`
    ${chalk.green('create')} app/index.js
    ${chalk.green('create')} app/routes.js
    ${chalk.green('create')} bin/app.js
    ${chalk.green('create')} config/environments/development.js
    ${chalk.green('create')} config/environments/test.js
    ${chalk.green('create')} config/environments/production.js
    ${chalk.green('create')} config/database.js
    ${chalk.green('create')} db/migrate
    ${chalk.green('create')} db/seed.js
    ${chalk.green('create')} README.md
    ${chalk.green('create')} LICENSE
    ${chalk.green('create')} package.json
    ${chalk.green('create')} .babelrc
    ${chalk.green('create')} .eslintrc.json
    ${chalk.green('create')} .gitignore
  `;process.stdout.write(logOutput.substr(0,logOutput.length-1));process.stdout.write(os.EOL);yield Promise.all([generate({cwd:project,type:'serializer',name:'application'}),generate({cwd:project,type:'controller',name:'application'})]);yield exec$1('git init && git add .',{cwd:project});process.stdout.write(`${chalk.green('initialize')} git`);process.stdout.write(os.EOL);const spinner=new Ora({text:'Installing dependencies from npm...',spinner:'dots'});spinner.start();yield exec$1('npm install',{cwd:project});yield exec$1(`npm install --save --save-exact ${driver}`,{cwd:project});spinner.stop();});return function create(_x,_x2){return _ref.apply(this,arguments)}})();

const GITHUB_URL='https://github.com/postlight/lux';function fileLink(path$$1,opts={}){const{line,branch='master'}=opts;let link=`${GITHUB_URL}/blob/${branch}/${path$$1}`;if(line&&line>=0){link+=`#${line}`;}return link}

const DB_INTERFACE_URL=fileLink('src/packages/database/interfaces.js',{line:17});const CONNECTION_STRING_MESSAGE=template`

    You're using a URL in your database config (config/database.js).

    In that case, Lux assumes you don't need to create or drop your database.
    If you'd like to create or drop a database, set up your database config
    without the url.

    For guidance, see:
    ${DB_INTERFACE_URL}
`;

class DatabaseConfigMissingError extends ReferenceError{constructor(environment){super(`Could not find database config for environment "${environment}".`);}}

function createDefaultConfig(){const isTestENV=NODE_ENV==='test';const isProdENV=NODE_ENV==='production';return{server:{cors:{enabled:false}},logging:{level:isProdENV?'INFO':'DEBUG',format:isProdENV?'json':'text',enabled:!isTestENV,filter:{params:[]}}}}

function hasOwnProperty$1(target,key){return Reflect.apply(Object.prototype.hasOwnProperty,target,[key])}function merge(dest,source){return setType(()=>entries(source).reduce((result,[key,value])=>{if(hasOwnProperty$1(result,key)&&isObject(value)){const currentValue=Reflect.get(result,key);if(isObject(currentValue)){return Object.assign({},result,{[key]:merge(currentValue,value)})}}return Object.assign({},result,{[key]:value})},Object.assign({},dest)))}

const NAMESPACE_DELIMITER=/\$-/g;function formatKey(key,formatter){return chain(key).pipe(str=>{if(formatter){return formatter(str)}return str}).pipe(underscore$1).pipe(inflection.dasherize).pipe(str=>str.replace(NAMESPACE_DELIMITER,'/')).value()}

const SUFFIX_PATTERN=/^.+(Controller|Down|Serializer|Up)/;function normalize$1(manifest){return entries(manifest).reduce((obj,[key,value])=>{if(SUFFIX_PATTERN.test(key)){const suffix=key.replace(SUFFIX_PATTERN,'$1');const stripSuffix=source=>source.replace(suffix,'');switch(suffix){case'Controller':obj.controllers.set(formatKey(key,stripSuffix),value);break;case'Serializer':obj.serializers.set(formatKey(key,stripSuffix),value);break;case'Up':case'Down':obj.migrations.set(formatKey(key),Reflect.construct(Migration,[value]));break;default:break;}}else{switch(key){case'Application':case'routes':case'seed':Reflect.set(obj,formatKey(key),value);break;case'config':Reflect.set(obj,'config',Object.assign({},merge(createDefaultConfig(),Object.assign({},obj.config,value))));break;case'database':Reflect.set(obj,'config',Object.assign({},obj.config,{database:value}));break;default:obj.models.set(formatKey(key),value);break;}}return obj},{config:{},controllers:new FreezeableMap,migrations:new FreezeableMap,models:new FreezeableMap,serializers:new FreezeableMap})}function bundleFor(path$$1){const manifest=Reflect.apply(require,null,[path.join(path$$1,'dist','bundle')]);return chain(manifest).pipe(normalize$1).pipe(entries).construct(FreezeableMap).value().freeze()}

function createLoader(path$$1){let bundle;return function load(type){if(!bundle){bundle=bundleFor(path$$1);}return bundle.get(type)}}

function dbcreate(){const load=createLoader(CWD);const config=Reflect.get(load('config').database,NODE_ENV);if(!config){throw new DatabaseConfigMissingError(NODE_ENV)}if(config.driver==='sqlite3'){return writeFile(`${CWD}/db/${config.database}_${NODE_ENV}.sqlite`,'')}if(DATABASE_URL||config.url){process.stderr.write(CONNECTION_STRING_MESSAGE);process.stderr.write(os.EOL);return Promise.resolve()}const{schema}=connect(CWD,config);const query=`CREATE DATABASE ${config.database}`;return schema.raw(query).once('query',()=>{process.stdout.write(query);process.stdout.write(os.EOL);})}

function dbdrop(){const load=createLoader(CWD);const config=Reflect.get(load('config').database,NODE_ENV);if(!config){throw new DatabaseConfigMissingError(NODE_ENV)}if(config.driver==='sqlite3'){return rmrf$$1(`${CWD}/db/${config.database}_${NODE_ENV}.sqlite`)}if(DATABASE_URL||config.url){process.stderr.write(CONNECTION_STRING_MESSAGE);process.stderr.write(os.EOL);return Promise.resolve()}const{schema}=connect(CWD,config);const query=`DROP DATABASE IF EXISTS ${config.database}`;return schema.raw(query).once('query',()=>{process.stdout.write(query);process.stdout.write(os.EOL);})}

let dbmigrate=(()=>{var _ref=asyncToGenerator(function*(){const load=createLoader(CWD);const{database:config}=load('config');const models=load('models');const migrations=load('migrations');const{connection,schema}=yield new Database({config,models,path:CWD,checkMigrations:false,logger:new Logger({enabled:false})});const pending=yield pendingMigrations(CWD,function(){return connection('migrations')});if(pending.length){const runners=pending.map(function(name){const version=name.replace(/^(\d{16})-.+$/g,'$1');const key=name.replace(new RegExp(`${version}-(.+)\\.js`),'$1');return[version,migrations.get(`${key}-up`)]}).filter(function([,migration]){return Boolean(migration)}).reverse().map(function([version,migration]){return function(){const query=migration.run(schema());return query.on('query',function(){process.stdout.write(sql`${query.toString()}`);process.stdout.write(os.EOL);}).then(function(){return connection('migrations').insert({version})})}});yield composeAsync(...runners)();}return true});return function dbmigrate(){return _ref.apply(this,arguments)}})();

let dbrollback=(()=>{var _ref=asyncToGenerator(function*(){const load=createLoader(CWD);const{database:config}=load('config');const models=load('models');const migrations=load('migrations');const{connection,schema}=yield new Database({config,models,path:CWD,checkMigrations:false,logger:new Logger({enabled:false})});const migrationFiles=yield readdir(`${CWD}/db/migrate`);if(migrationFiles.length){let migration;let version=yield connection('migrations').orderBy('version','desc').first();if(version&&version.version){version=version.version;}const target=migrationFiles.find(function(m){return m.indexOf(version)===0});if(target){migration=target.replace(new RegExp(`${version}-(.+)\\.js`),'$1');migration=migrations.get(`${migration}-down`);if(migration){const query=migration.run(schema());yield query.on('query',function(){process.stdout.write(sql`${query.toString()}`);process.stdout.write(os.EOL);});yield connection('migrations').where({version}).del();}}}});return function dbrollback(){return _ref.apply(this,arguments)}})();

function dbseed(){const load=createLoader(CWD);const{database:config}=load('config');const seed=load('seed');const models=load('models');return new Database({config,models,path:CWD,logger:new Logger({enabled:false})}).then(store=>store.connection.transaction(seed))}

let destroyType=(()=>{var _ref=asyncToGenerator(function*(type,name){const normalizedType=type.toLowerCase();let normalizedName=name;let path$$1;let migrations;switch(normalizedType){case'model':normalizedName=inflection.singularize(normalizedName);path$$1=`app/${inflection.pluralize(normalizedType)}/${normalizedName}.js`;break;case'migration':migrations=yield readdir(`${CWD}/db/migrate`);normalizedName=migrations.find(function(file){return`${normalizedName}.js`===file.substr(17)});path$$1=`db/migrate/${normalizedName}`;break;case'controller':case'serializer':normalizedName=inflection.pluralize(normalizedName);path$$1=`app/${inflection.pluralize(normalizedType)}/${normalizedName}.js`;break;case'middleware':path$$1=`app/${normalizedType}/${normalizedName}.js`;break;case'util':path$$1=`app/${inflection.pluralize(normalizedType)}/${normalizedName}.js`;break;default:return;}if(yield exists$$1(`${CWD}/${path$$1}`)){yield rmrf$$1(`${CWD}/${path$$1}`);process.stdout.write(`${chalk.red('remove')} ${path$$1}`);process.stdout.write(os.EOL);}});return function destroyType(_x,_x2){return _ref.apply(this,arguments)}})();let destroy$1=(()=>{var _ref2=asyncToGenerator(function*({type,name}){if(type==='resource'){const routes=(yield readFile(`${CWD}/app/routes.js`)).toString('utf8').split('\n').reduce(function(lines,line){const pattern=new RegExp(`\\s*this.resource\\(('|"|\`)${inflection.pluralize(name)}('|"|\`)\\);?`);return pattern.test(line)?lines:[...lines,line]},'').join('\n');yield Promise.all([destroyType('model',name),destroyType('migration',`create-${inflection.pluralize(name)}`),destroyType('serializer',name),destroyType('controller',name)]);yield writeFile(`${CWD}/app/routes.js`,routes);process.stdout.write(`${chalk.green('update')} app/routes.js`);process.stdout.write(os.EOL);}else if(type==='model'){yield Promise.all([destroyType(type,name),destroyType('migration',`create-${inflection.pluralize(name)}`)]);}else{yield destroyType(type,name);}});return function destroy(_x3){return _ref2.apply(this,arguments)}})();

function repl$1(){return new Promise((()=>{var _ref=asyncToGenerator(function*(resolve$$1){const app=yield Reflect.apply(require,null,[path__default.join(CWD,'dist','boot')]);const instance=repl.start({prompt:'> '});instance.once('exit',resolve$$1);Object.assign(instance.context,Object.assign({app,logger:app.logger,routes:app.router,[app.constructor.name]:app},Array.from(app.models).reduce(function(context,[,model]){return Object.assign({},context,{[model.name]:model})},{}),Array.from(app.controllers).reduce(function(context,[,controller]){return Object.assign({},context,{[controller.constructor.name]:controller})},{}),Array.from(app.serializers).reduce(function(context,[,serializer]){return Object.assign({},context,{[serializer.constructor.name]:serializer})},{})));});return function(_x){return _ref.apply(this,arguments)}})())}

function*range(start$$1,end){for(let i=start$$1;i<=end;i+=1){yield i;}}

class Cluster extends EventEmitter{constructor({path: path$$1,port,logger,maxWorkers}){super();Object.defineProperties(this,{path:{value:path$$1,writable:false,enumerable:true,configurable:false},port:{value:port,writable:false,enumerable:true,configurable:false},logger:{value:logger,writable:false,enumerable:true,configurable:false},workers:{value:new Set,writable:false,enumerable:true,configurable:false},maxWorkers:{value:maxWorkers||os__default.cpus().length,writable:false,enumerable:true,configurable:false}});cluster__default.setupMaster({exec:path.join(path$$1,'dist','boot.js')});process.on('update',changed=>{changed.forEach(({name:filename})=>{logger.info(`${chalk.green('update')} ${filename}`);});this.reload();});this.forkAll().then(()=>this.emit('ready'));}fork(retry=true){return new Promise(resolve$$1=>{if(this.workers.size<this.maxWorkers){const worker$$1=cluster__default.fork({NODE_ENV,PORT:this.port});const timeout=setTimeout(()=>{this.logger.info(line`
            Removing worker process: ${chalk.red(`${worker$$1.process.pid}`)}
          `);clearTimeout(timeout);worker$$1.removeAllListeners();worker$$1.kill();this.workers.delete(worker$$1);resolve$$1(worker$$1);if(retry){this.fork(false);}},30000);const handleError=err=>{if(err){this.logger.error(err);}this.logger.info(line`
            Removing worker process: ${chalk.red(`${worker$$1.process.pid}`)}
          `);clearTimeout(timeout);worker$$1.removeAllListeners();worker$$1.kill();this.workers.delete(worker$$1);resolve$$1(worker$$1);};worker$$1.on('message',msg=>{let data={};let message=msg;if(typeof message==='object'){data=omit(message,'message');message=message.message;}switch(message){case'ready':this.logger.info(line`
                Adding worker process: ${chalk.green(`${worker$$1.process.pid}`)}
              `);this.workers.add(worker$$1);clearTimeout(timeout);worker$$1.removeListener('error',handleError);resolve$$1(worker$$1);break;case'error':handleError(data.error);break;default:break;}});worker$$1.once('error',handleError);worker$$1.once('exit',code=>{const{process:{pid}}=worker$$1;if(typeof code==='number'){this.logger.info(line`
              Worker process: ${chalk.red(`${pid}`)} exited with code ${code}
            `);}this.logger.info(`Removing worker process: ${chalk.red(`${pid}`)}`);clearTimeout(timeout);worker$$1.removeAllListeners();this.workers.delete(worker$$1);this.fork();});}})}shutdown(worker$$1){return new Promise(resolve$$1=>{this.workers.delete(worker$$1);const timeout=setTimeout(()=>worker$$1.kill(),5000);worker$$1.once('disconnect',()=>{worker$$1.kill();});worker$$1.once('exit',()=>{resolve$$1(worker$$1);clearTimeout(timeout);});worker$$1.send('shutdown');worker$$1.disconnect();})}reload(){if(this.workers.size){const groups=Array.from(this.workers).reduce((arr,item,idx,src)=>{if((idx+1)%2){const group=src.slice(idx,idx+2);return[...arr,()=>Promise.all(group.map(worker$$1=>this.shutdown(worker$$1)))]}return arr},[]);return composeAsync(...groups)()}return this.fork()}forkAll(){return Promise.race(Array.from(range(1,this.maxWorkers)).map(()=>this.fork()))}}

function createCluster({path: path$$1,port,logger,maxWorkers}){return new Cluster({path: path$$1,port,logger,maxWorkers})}

let serve=(()=>{var _ref=asyncToGenerator(function*({hot=NODE_ENV==='development',cluster: cluster$$1=false,useStrict=false}){const load=createLoader(CWD);const{logging}=load('config');const logger=new Logger(logging);if(hot){const watcher=yield watch$1(CWD);watcher.on('change',(()=>{var _ref2=asyncToGenerator(function*(changed){yield build(useStrict);process.emit('update',changed);});return function(_x2){return _ref2.apply(this,arguments)}})());}createCluster({logger,path:CWD,port:PORT,maxWorkers:cluster$$1?undefined:1}).once('ready',function(){logger.info(`Lux Server listening on port: ${chalk.cyan(`${PORT}`)}`);});});return function serve(_x){return _ref.apply(this,arguments)}})();

function test(){process.stdout.write('Coming Soon!');process.stdout.write(os.EOL);return Promise.resolve()}

exports.build = build;
exports.create = create;
exports.dbcreate = dbcreate;
exports.dbdrop = dbdrop;
exports.dbmigrate = dbmigrate;
exports.dbrollback = dbrollback;
exports.dbseed = dbseed;
exports.destroy = destroy$1;
exports.generate = generate;
exports.repl = repl$1;
exports.serve = serve;
exports.test = test;
//# sourceMappingURL=index.js.map
