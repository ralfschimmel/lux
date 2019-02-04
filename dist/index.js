require('source-map-support').install({
  environment: 'node'
});

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Ora = _interopDefault(require('ora'));
var os = require('os');
var cluster = require('cluster');
var path = require('path');
var lux = _interopDefault(require('rollup-plugin-lux'));
var json = _interopDefault(require('rollup-plugin-json'));
var alias = _interopDefault(require('rollup-plugin-alias'));
var babel = _interopDefault(require('rollup-plugin-babel'));
var eslint = _interopDefault(require('rollup-plugin-eslint'));
var resolve$1 = _interopDefault(require('rollup-plugin-node-resolve'));
var rollup = require('rollup');
var fs = require('fs');
var EventEmitter = _interopDefault(require('events'));
var fbWatchman = require('fb-watchman');
var cp = require('child_process');
var inflection = require('inflection');
var chalk = require('chalk');
var chalk__default = _interopDefault(chalk);
var readline = require('readline');
var tty = require('tty');
var ansiRegex = _interopDefault(require('ansi-regex'));
var url = require('url');
var qs = _interopDefault(require('qs'));
var repl = require('repl');

/**
 * @private
 */
function normalizePort(port) {
  switch (typeof port) {
    case 'string':
      return Number.parseInt(port, 10);

    case 'number':
      return Math.abs(port);

    default:
      return 4000;
  }
}

const { env: ENV } = process;

function getPID() {
  let { pid } = process;

  if (cluster.isWorker && typeof cluster.worker.pid === 'number') {
    pid = cluster.worker.pid;
  }

  return pid;
}

const CWD = process.cwd();
const PID = getPID();
const PORT = normalizePort(ENV.PORT);
const NODE_ENV = ENV.NODE_ENV || 'development';
const DATABASE_URL = ENV.DATABASE_URL;
const LUX_CONSOLE = Boolean(ENV.LUX_CONSOLE);
const PLATFORM = os.platform();


const HAS_BODY = /^(?:POST|PATCH)$/;

/**
 * Convert a function that implements a callback based interface into a function
 * that implements a Promise based interface.
 */
function promisify(source, context) {
  return (...args) => new Promise((resolve$$1, reject) => {
    source.apply(context, [...args, (err, ...result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve$$1(result.length > 1 ? result : result[0]);
    }]);
  });
}

/**
 * @private
 */
const exec$1 = promisify(cp.exec);

/**
 * A utility function that always returns `this` based on it's current
 * context.
 *
 * A common use case for the K function is a default parameter for optional
 * callback functions or general function arguments.
 *
 * @private
 */
function K() {
  return this;
}

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

/**
 * A utility function used for wrapping async code that would otherwise need a
 * try-catch block.
 *
 * V8 deoptimizes functions when running into try-catch catch due to the
 * unpredictable nature of the code. The `tryCatch` utility function is a way
 * to "have your cake and eat it too". Since the inner function (`fn`) will not
 * become deoptimized by V8 for including a standard try-catch block, we don't
 * have to sacrifice as much perf for error handling expensive computations.
 *
 * The `tryCatch` utility is also very useful when you want to perform a noop
 * when an error is thrown as the catch argument (`rescue`) is optional unlike
 * a traditional try-catch block.
 *
 * @example
 * tryCatch(() => {
 *   const n = Math.floor(Math.random() * 6);
 *
 *   if (n >= 4) {
 *     throw new Error('You lose!');
 *   } else {
 *     return Promise.resolve(n);
 *   }
 * }, err => {
 *   console.error(err);
 * }).then(luckyNumber => {
 *   console.log(`Your lucky number is ${luckyNumber}.`);
 * });
 *
 * @private
 */
var tryCatch = (() => {
  var _ref = asyncToGenerator(function* (fn, rescue = K) {
    let result;

    try {
      result = yield fn();
    } catch (err) {
      result = yield rescue(err);
    }

    return result;
  });

  function tryCatch(_x) {
    return _ref.apply(this, arguments);
  }

  return tryCatch;
})();

/**
 * A syncronous implementation of the `tryCatch` utility.
 *
 * @example
 * const luckyNumber = tryCatchSync(() => {
 *   const n = Math.floor(Math.random() * 6);
 *
 *   if (n >= 4) {
 *     throw new Error('You lose!');
 *   } else {
 *     return n;
 *   }
 * }, err => {
 *   console.error(err);
 * });
 *
 * if (luckyNumber) {
 *   console.log(`Your lucky number is ${luckyNumber}.`);
 * }
 *
 * @private
 */

/**
 * @private
 */
function isJSFile(target) {
  return path.extname(target) === '.js';
}

const FREEZER = new WeakSet();

/**
 * Determine wether or not a value is an Object.
 *
 * @example
 * const a = null;
 * const b = [];
 * const c = {};
 *
 * console.log(typeof a, typeof b, typeof c);
 * // => 'object', 'object', 'object' 👎
 *
 * console.log(isObject(a), isObject(b), isObject(c));
 * // => false, false, true 👍
 *
 * @private
 */
function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * @private
 */
function freeze(value) {
  FREEZER.add(value);
  return value;
}

/**
 * @private
 */


/**
 * @private
 */


/**
 * @private
 */
function freezeProps(target, makePublic, ...props) {
  Object.defineProperties(target, props.reduce((obj, key) => Object.assign({}, obj, {
    [key]: {
      value: Reflect.get(target, key),
      writable: false,
      enumerable: makePublic,
      configurable: false
    }
  }), {}));

  return target;
}

/**
 * @private
 */

/**
 * @private
 */
function isFrozen(value) {
  return FREEZER.has(value);
}

/**
 * @private
 */
class FreezeableMap extends Map {
  set(key, value) {
    if (!this.isFrozen()) {
      super.set(key, value);
    }

    return this;
  }

  clear() {
    if (!this.isFrozen()) {
      super.clear();
    }
  }

  delete(key) {
    return this.isFrozen() ? false : super.delete(key);
  }

  freeze(deep) {
    if (deep) {
      this.forEach(Object.freeze);
    }

    return freeze(this);
  }

  isFrozen() {
    return isFrozen(this);
  }
}

/**
 * @private
 */
class FreezeableSet extends Set {
  add(value) {
    if (!this.isFrozen()) {
      super.add(value);
    }

    return this;
  }

  clear() {
    if (!this.isFrozen()) {
      super.clear();
    }
  }

  delete(value) {
    return this.isFrozen() ? false : super.delete(value);
  }

  freeze(deep) {
    if (deep) {
      this.forEach(Object.freeze);
    }

    return freeze(this);
  }

  isFrozen() {
    return isFrozen(this);
  }
}

// eslint-disable-line no-duplicate-imports

// eslint-disable-next-line no-unused-vars


const SUBSCRIPTION_NAME = 'lux-watcher';

/**
 * @private
 */
function fallback(instance, path$$1) {
  return fs.watch(path$$1, {
    recursive: true
  }, (type, name) => {
    if (isJSFile(name)) {
      instance.emit('change', [{ name, type }]);
    }
  });
}

/**
 * @private
 */
function setupWatchmen(instance, path$$1) {
  return new Promise((resolve$$1, reject) => {
    const client = new fbWatchman.Client();

    client.capabilityCheck({}, capabilityErr => {
      if (capabilityErr) {
        reject(capabilityErr);
        return;
      }

      client.command(['watch-project', path$$1], (watchErr, {
        watch: watch$$1,
        relative_path: relativePath
      } = {}) => {
        if (watchErr) {
          reject(watchErr);
          return;
        }

        client.command(['clock', watch$$1], (clockErr, { clock: since }) => {
          if (clockErr) {
            reject(clockErr);
            return;
          }

          client.command(['subscribe', watch$$1, SUBSCRIPTION_NAME, {
            since,
            relative_root: relativePath, // eslint-disable-line camelcase

            fields: ['name', 'size', 'exists', 'type'],

            expression: ['allof', ['match', '*.js']]
          }], subscribeErr => {
            if (subscribeErr) {
              reject(subscribeErr);
              return;
            }

            client.on('subscription', ({
              files,
              subscription
            }) => {
              if (subscription === SUBSCRIPTION_NAME) {
                instance.emit('change', files);
              }
            });

            resolve$$1(client);
          });
        });
      });
    });
  });
}

/**
 * @private
 */
var initialize = (() => {
  var _ref = asyncToGenerator(function* (instance, path$$1, useWatchman) {
    const appPath = path.join(path$$1, 'app');
    let client;

    if (useWatchman) {
      yield tryCatch(asyncToGenerator(function* () {
        yield exec$1('which watchman');
        client = yield setupWatchmen(instance, appPath);
      }));
    }

    Object.assign(instance, {
      path: appPath,
      client: client || fallback(instance, appPath)
    });

    freezeProps(instance, true, 'path', 'client');

    return instance;
  });

  function initialize(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  }

  return initialize;
})();

/**
 * @private
 */
class Watcher extends EventEmitter {

  constructor(path$$1, useWatchman = true) {
    super();
    return initialize(this, path$$1, useWatchman);
  }

  destroy() {
    const { client } = this;

    if (client instanceof fbWatchman.Client) {
      client.end();
    } else {
      client.close();
    }
  }
}

/**
 * @private
 */
function createPathRemover(path$$1) {
  let pattern = new RegExp(`${path$$1}(/)?(.+)`);

  if (PLATFORM.startsWith('win')) {
    const sep$$1 = '\\\\';

    pattern = new RegExp(`${path$$1.replace(/\\/g, sep$$1)}(${sep$$1})?(.+)`);
  }

  return source => source.replace(pattern, '$2');
}

function noop() {
  return undefined;
}

/**
 * @private
 */
let rmrf$$1 = (() => {
  var _ref = asyncToGenerator(function* (target) {
    const stats = yield stat$1(target).catch(noop);

    if (stats) {
      if (stats.isDirectory()) {
        const files = yield readdir$1(target);

        yield Promise.all(files.map(function (file) {
          return rmrf$$1(path.join(target, file));
        }));

        yield rmdir$1(target).catch(noop);
      } else {
        yield unlink$1(target);
      }
    }

    return true;
  });

  return function rmrf$$1(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * @private
 */
let exists$$1 = (() => {
  var _ref = asyncToGenerator(function* (path$$1, dir) {
    if (path$$1 instanceof RegExp) {
      const pattern = path$$1;
      let files = [];

      if (dir) {
        files = yield readdir$1(dir);
      }

      return files.some(function (file) {
        return pattern.test(file);
      });
    }

    return stat$1(path$$1).then(function () {
      return true;
    }, function () {
      return false;
    });
  });

  return function exists$$1(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * @private
 */
function parsePath(cwd = CWD, dir = '', name = '') {
  const parsed = path.parse(path.join(cwd, dir, ...name.split(path.sep)));

  return Object.assign({}, parsed, {
    absolute: path.join(parsed.dir, parsed.base),
    relative: path.join(parsed.dir.substr(parsed.dir.indexOf(dir)), parsed.base)
  });
}

// eslint-disable-next-line


/**
 * @private
 */
const stat$1 = promisify(fs.stat);

/**
 * @private
 */
const mkdir$1 = promisify(fs.mkdir);

/**
 * @private
 */
const rmdir$1 = promisify(fs.rmdir);

/**
 * @private
 */
const unlink$1 = promisify(fs.unlink);

/**
 * @private
 */
const readdir$1 = promisify(fs.readdir);

/**
 * @private
 */
const readFile$1 = promisify(fs.readFile);

/**
 * @private
 */
const writeFile$1 = promisify(fs.writeFile);

/**
 * @private
 */
const appendFile$1 = promisify(fs.appendFile);

/**
 * @private
 */
function watch$1(watchPath) {
  return new Watcher(watchPath);
}

/**
 * @private
 */
function mkdirRec(dirPath, mode = 511) {
  const parent = path.resolve(dirPath, '..');

  return stat$1(parent).catch(() => mkdirRec(parent, mode)).then(() => mkdir$1(dirPath, mode)).catch(err => {
    if (err.code !== 'EEXIST') {
      return Promise.reject(err);
    }
    return Promise.resolve();
  });
}

/**
 * @private
 */
function readdirRec(dirPath) {
  const stripPath = createPathRemover(dirPath);

  return readdir$1(dirPath).then(files => Promise.all(files.map(file => {
    const filePath = path.join(dirPath, file);

    return Promise.all([filePath, stat$1(filePath)]);
  }))).then(files => Promise.all(files.map(([file, stats]) => Promise.all([file, stats.isDirectory() ? readdirRec(file) : []])))).then(files => files.reduce((arr, [file, children]) => {
    const basename$$1 = stripPath(file);

    return [...arr, basename$$1, ...children.map(child => path.join(basename$$1, stripPath(child)))];
  }, []));
}

/**
 * @private
 */
function insertValues(strings, ...values) {
  if (values.length) {
    return strings.reduce((result, part, idx) => {
      let value = values[idx];

      if (value && typeof value.toString === 'function') {
        value = value.toString();
      } else {
        value = '';
      }

      return result + part + value;
    }, '');
  }

  return strings.join('');
}

const bodyPattern = /^\n([\s\S]+)\s{2}$/gm;
const trailingWhitespace = /\s+$/;

/**
 * @private
 */
function template(strings, ...values) {
  const compiled = insertValues(strings, ...values);
  let [body] = compiled.match(bodyPattern) || [];
  let indentLevel = /^\s{0,4}(.+)$/g;

  if (!body) {
    body = compiled;
    indentLevel = /^\s{0,2}(.+)$/g;
  }

  return body.split('\n').slice(1).map(line => {
    let str = line.replace(indentLevel, '$1');

    if (trailingWhitespace.test(str)) {
      str = str.replace(trailingWhitespace, '');
    }

    return str;
  }).join('\n');
}

/**
 * @private
 */
function handleWarning(warning) {
  if (warning.code === 'UNUSED_EXTERNAL_IMPORT') {
    return;
  }
  // eslint-disable-next-line no-console
  console.warn(warning.message);
}

/**
 * @private
 */

/**
 * @private
 */
function isExternal(dir) {
  return id => !(id.startsWith('.') || id.endsWith('lux-framework') || id.startsWith('/') // Absolute path on Unix
  || /^[A-Z]:[\\/]/.test(id) // Absolute path on Windows
  || id.startsWith('app') || id.startsWith(path.join(dir, 'app')) || id.startsWith(path.join(dir, 'dist')) || id === 'LUX_LOCAL' || id === 'babelHelpers' || id === '\u0000babelHelpers');
}

/**
 * @private
 */
function chain(source) {
  return {
    pipe(handler) {
      return chain(handler(source));
    },

    value() {
      return source;
    },

    construct(constructor) {
      return chain(Reflect.construct(constructor, [source]));
    }
  };
}

/**
 * @private
 */
function underscore$1(source = '', upper = false) {
  return inflection.underscore(source, upper).replace(/-/g, '_');
}

/**
 * @private
 */


/**
 * @private
 */
function compose(main, ...etc) {
  return input => main(etc.reduceRight((value, fn) => fn(value), input));
}

/**
 * @private
 */
function composeAsync(main, ...etc) {
  return input => etc.reduceRight((value, fn) => Promise.resolve(value).then(fn), Promise.resolve(input)).then(main);
}

const DOUBLE_COLON = /::/g;

/**
 * @private
 */
const formatName = compose(name => name.replace(DOUBLE_COLON, '$'), inflection.camelize, underscore$1, name => path.posix.join(path.dirname(name), path.basename(name, '.js')));

/**
 * @private
 */
function createExportStatement(name, path$$1, isDefault = true) {
  const normalized = path.posix.join(...path$$1.split(path.sep));
  let data;

  if (isDefault) {
    data = `export {\n  default as ${name}\n} from '../${normalized}';\n\n`;
  } else {
    data = `export {\n  ${name}\n} from '../${normalized}';\n\n`;
  }

  return Buffer.from(data);
}

/**
 * @private
 */
function createWriter(file) {
  const writerFor = (type, handleWrite) => value => {
    const formatSymbol = compose(str => str + inflection.capitalize(type), formatName);

    return Promise.all(value.map(item => {
      if (handleWrite) {
        return handleWrite(item);
      }

      const path$$1 = path.join('app', inflection.pluralize(type), item);
      const symbol = formatSymbol(item);

      return appendFile$1(file, createExportStatement(symbol, path$$1));
    }));
  };

  return {
    controllers: writerFor('controller'),
    serializers: writerFor('serializer'),

    models: writerFor('model', (() => {
      var _ref = asyncToGenerator(function* (item) {
        const path$$1 = path.join('app', 'models', item);
        const name = formatName(item);

        return appendFile$1(file, createExportStatement(name, path$$1));
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })()),

    migrations: writerFor('migration', (() => {
      var _ref2 = asyncToGenerator(function* (item) {
        const path$$1 = path.join('db', 'migrate', item);
        const name = chain(item).pipe(function (str) {
          return path.basename(str, '.js');
        }).pipe(underscore$1).pipe(function (str) {
          return str.substr(17);
        }).pipe(function (str) {
          return inflection.camelize(str, true);
        }).value();

        yield appendFile$1(file, createExportStatement(`up as ${name}Up`, path$$1, false));

        yield appendFile$1(file, createExportStatement(`down as ${name}Down`, path$$1, false));
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })())
  };
}

/**
 * @private
 */
var createManifest = (() => {
  var _ref3 = asyncToGenerator(function* (dir, assets, { useStrict }) {
    const dist = path.join(dir, 'dist');
    const file = path.join(dist, 'index.js');
    const writer = createWriter(file);

    yield tryCatch(function () {
      return mkdir$1(dist);
    });
    yield writeFile$1(file, Buffer.from(useStrict ? '\'use strict\';\n\n' : ''));

    yield Promise.all(Array.from(assets).map(function ([key, value]) {
      const write = Reflect.get(writer, key);

      if (write) {
        return write(value);
      } else if (!write && typeof value === 'string') {
        return appendFile$1(file, createExportStatement(key, value));
      }

      return Promise.resolve();
    }));
  });

  function createManifest(_x3, _x4, _x5) {
    return _ref3.apply(this, arguments);
  }

  return createManifest;
})();

let readBabelConfig = (() => {
  var _ref = asyncToGenerator(function* (root) {
    let data = yield readFile$1(path.join(root, '.babelrc'));

    data = data.toString('utf8');
    return JSON.parse(data);
  });

  return function readBabelConfig(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * @private
 */
var createBootScript = (() => {
  var _ref = asyncToGenerator(function* (dir, {
    useStrict
  }) {
    let data = template`
    const http = require('http');

    const bundle = require('./bundle');

    const { env: { PORT } } = process;
    const hasIPC = typeof process.send === 'function';
    const config = Object.assign({}, bundle.config, {
      path: process.cwd(),
      database: bundle.database,
    });

    let server;

    module.exports = new bundle.Application(config)
      .then(app => {
        if (hasIPC) {
          process.send('ready');
        } else {
          process.emit('ready');
        }

        if (app.adapter.type === 'http') {
          server = http.createServer((request, response) => {
            app.exec(request, response);
          });
          server.listen(PORT);
        }

        return app
          .on('error', err => {
            setImmediate(() => {
              app.logger.error(err);
            });
          })
          .on('request:error', (request, response, err) => {
            setImmediate(() => {
              app.logger.error(err);
            });
          })
          .on('request:complete', (request, response) => {
            setImmediate(() => {
              app.logger.info(\`\${request.method} \${response.statusCode} \`);
            });
          });
      })
      .catch(err => {
        if (hasIPC) {
          process.send({
            error: err ? err.stack : void 0,
            message: 'error'
          });
        } else {
          process.emit('error', err);
        }
      });
  `;

    if (useStrict) {
      data = `'use strict';\n\n${data}`;
    }

    yield writeFile$1(path.join(dir, 'dist', 'boot.js'), Buffer.from(data));
  });

  function createBootScript(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return createBootScript;
})();

/**
 * @private
 */


let cache;

/**
 * @private
 */
let compile = (() => {
  var _ref = asyncToGenerator(function* (dir, env, opts = {}) {
    const { useStrict = false } = opts;
    const local = opts.local || path.join(__dirname, '..', 'src', 'index.js');
    const entry = path.join(dir, 'dist', 'index.js');
    const external = isExternal(dir);
    let banner;

    const assets = yield Promise.all([readdir$1(path.join(dir, 'app', 'models')), readdir$1(path.join(dir, 'db', 'migrate')), readdirRec(path.join(dir, 'app', 'controllers')), readdirRec(path.join(dir, 'app', 'serializers'))]).then(function (types) {
      let [models, migrations, controllers, serializers] = types;

      models = models.filter(isJSFile);
      migrations = migrations.filter(isJSFile);
      controllers = controllers.filter(isJSFile);
      serializers = serializers.filter(isJSFile);

      return new Map([['Application', path.join('app', 'index.js')], ['config', path.join('config', 'environments', `${env}.js`)], ['controllers', controllers], ['database', path.join('config', 'database.js')], ['migrations', migrations], ['models', models], ['routes', path.join('app', 'routes.js')], ['seed', path.join('db', 'seed.js')], ['serializers', serializers]]);
    });

    yield Promise.all([createManifest(dir, assets, {
      useStrict
    }), createBootScript(dir, {
      useStrict
    })]);

    const aliases = {
      app: path.posix.join('/', ...dir.split(path.sep), 'app'),
      LUX_LOCAL: path.posix.join('/', ...local.split(path.sep))
    };

    if (os.platform() === 'win32') {
      const [volume] = dir;
      const prefix = `${volume}:/`;

      Object.assign(aliases, {
        app: aliases.app.replace(prefix, ''),
        LUX_LOCAL: aliases.LUX_LOCAL.replace(prefix, '')
      });
    }

    const bundle = yield rollup.rollup({
      entry,
      onwarn: handleWarning,
      external,
      cache,
      plugins: [alias(Object.assign({
        resolve: ['.js']
      }, aliases)), json(), resolve$1(), eslint({
        cwd: dir,
        parser: 'babel-eslint',
        useEslintrc: false,
        include: [path.join(dir, 'app', '**')],
        exclude: [path.join(dir, 'package.json'), path.join(local, '..', '**')]
      }), babel(Object.assign({}, (yield readBabelConfig(dir)), {
        babelrc: false
      })), lux(path.resolve(path.sep, dir, 'app'))]
    });

    if (NODE_ENV === 'development') {
      cache = bundle;
    }

    yield rmrf$$1(entry);

    banner = template`
    const srcmap = require('source-map-support').install({
      environment: 'node'
    });
  `;

    if (useStrict) {
      banner = `'use strict';\n\n${banner}`;
    }

    return bundle.write({
      banner,
      dest: path.join(dir, 'dist', 'bundle.js'),
      format: 'cjs',
      sourceMap: true,
      useStrict: false
    });
  });

  return function compile(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let build = (() => {
  var _ref = asyncToGenerator(function* (useStrict = false) {
    const spinner = new Ora({
      text: 'Building your application...',
      spinner: 'dots'
    });

    spinner.start();

    yield compile(CWD, NODE_ENV, {
      useStrict
    });

    spinner.stop();
  });

  return function build() {
    return _ref.apply(this, arguments);
  };
})();

const drivers = new Map([['postgres', 'pg'], ['sqlite', 'sqlite3'], ['mysql', 'mysql2'], ['mariadb', 'mariasql'], ['oracle', 'oracle']]);

function driverFor(database = 'sqlite') {
  return drivers.get(database) || 'sqlite3';
}

/**
 * @private
 */
var appTemplate = (name => {
  const normalized = chain(name).pipe(underscore$1).pipe(inflection.classify).value();

  return template`
    import { Application } from 'lux-framework';

    class ${normalized} extends Application {

    }

    export default ${normalized};
  `;
});

/**
 * @private
 */
var configTemplate = ((name, env) => {
  const isTestENV = env === 'test';
  const isProdENV = env === 'production';

  return template`
    export default {
      logging: {
        level: ${isProdENV ? '\'INFO\'' : '\'DEBUG\''},
        format: ${isProdENV ? '\'json\'' : '\'text\''},
        enabled: ${(!isTestENV).toString()},

        filter: {
          params: []
        }
      }
    };
  `;
});

/**
 * @private
 */
var routesTemplate = (() => template`
  export default function routes() {

  }
`);

function indent(amount = 1) {
  return ' '.repeat(amount);
}

/**
 * @private
 */
var dbTemplate = ((name, driver) => {
  const schemaName = underscore$1(name);
  let driverName = driver;
  let template = 'export default {\n';
  let username;

  if (!driverName) {
    driverName = 'sqlite3';
  }

  if (driverName === 'pg') {
    username = 'postgres';
  } else if (driverName !== 'pg' && driverName !== 'sqlite3') {
    username = 'root';
  }

  ['development', 'test', 'production'].forEach(environment => {
    template += `${indent(2)}${environment}: {\n`;

    if (driverName !== 'sqlite3') {
      template += `${indent(4)}pool: 5,\n`;
    }

    template += `${indent(4)}driver: '${driverName}',\n`;

    if (username) {
      template += `${indent(4)}username: '${username}',\n`;
    }

    switch (environment) {
      case 'development':
        template += `${indent(4)}database: '${schemaName}_dev'\n`;
        break;

      case 'test':
        template += `${indent(4)}database: '${schemaName}_test'\n`;
        break;

      case 'production':
        template += `${indent(4)}database: '${schemaName}_prod'\n`;
        break;

      default:
        template += `${indent(4)}database: '${schemaName}_${environment}'\n`;
        break;
    }

    template += `${indent(2)}}`;

    if (environment !== 'production') {
      template += ',\n\n';
    }
  });

  template += '\n};\n';

  return template;
});

/**
 * @private
 */
var seedTemplate = (() => template`
  export default async function seed() {

  }
`);

var version = "1.2.0";












var devDependencies = { "babel-core": "6.24.1", "babel-jest": "20.0.3", "babel-plugin-transform-es2015-modules-commonjs": "6.24.1", "babel-preset-lux": "2.0.2", "codecov": "2.2.0", "eslint-config-airbnb-base": "11.2.0", "eslint-plugin-flowtype": "2.33.0", "eslint-plugin-import": "2.2.0", "eslint-plugin-jest": "20.0.3", "faker": "4.1.0", "flow-bin": "0.46.0", "flow-typed": "2.1.2", "jest": "20.0.3", "jest-cli": "20.0.3", "object.entries": "1.0.4", "remark-cli": "3.0.1", "remark-lint": "6.0.0", "remark-preset-lint-recommended": "2.0.0", "shx": "0.2.2" };

const LUX_VERSION = version;
const BABEL_PRESET_VERSION = devDependencies['babel-preset-lux'];

/**
 * @private
 */
var pkgJSONTemplate = (name$$1 => template`
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

/**
 * @private
 */
var babelrcTemplate = (() => template`
  {
    "presets": ["lux"]
  }
`);

/**
 * @private
 */
var eslintrcTemplate = (() => template`
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

/**
 * @private
 */
var readmeTemplate = (name => template`
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

/**
 * @private
 */
var licenseTemplate = (() => template`
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

/**
 * @private
 */
var gitignoreTemplate = (() => template`
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

const YES = /^y(es)?$/i;

function createPrompt() {
  const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  prompt.setPrompt('');

  return {
    question(text) {
      return new Promise(resolve$$1 => {
        prompt.question(text, answer => {
          resolve$$1(YES.test(answer));
        });
      });
    },

    close() {
      prompt.close();
    }
  };
}

/**
 * TODO: Update the 'routes.js' file when generating a resource within a
 *       namespace.
 */
const NAMESPACED_RESOURCE_MESSAGE = template`

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

const VALID_DRIVERS = ['pg', 'sqlite3', 'mssql', 'mysql', 'mysql2', 'mariasql', 'strong-oracle', 'oracle'];

const DEBUG = 'DEBUG';
const INFO = 'INFO';
const WARN = 'WARN';
const ERROR = 'ERROR';

const FORMATS = new FreezeableSet(['text', 'json']);

FORMATS.freeze();

const LEVELS = new FreezeableMap([[DEBUG, 0], [INFO, 1], [WARN, 2], [ERROR, 3]]);

LEVELS.freeze();

const METHOD_MISSING = typeof Object.entries !== 'function';

/**
 * @private
 */
function entries(source) {
  if (METHOD_MISSING) {
    const keys = Object.keys(source);
    const result = new Array(keys.length);

    return keys.reduce((prev, key, idx) => {
      const next = prev;
      const entry = new Array(2);

      entry[0] = key;
      entry[1] = source[key];

      // $FlowIgnore
      next[idx] = entry;

      return next;
    }, result);
  }

  return Object.entries(source);
}

/**
 * Use this util as a brute force way of tricking flow into understanding intent
 * to extend or combine a type in a polymorphic function.
 *
 * In essence, this function allows you to declare your types for a high order
 * function that wraps the inner logic of this function without flow throwing
 * any type errors. This allows you to properly set the return value of the
 * high order function to whatever you like so consumers of the high order
 * function can still benifit from type inference and safety as long as the
 * return value type declaration is 100% accurate.
 *
 * WARNING:
 * This function should rarely be used as it requires a good understanding of
 * the flow type system to ensure that the function this util wraps is still
 * type safe.
 *
 * @private
 */
function setType(fn) {
  return fn();
}

/**
 * @private
 */
function omit(src, ...omitted) {
  return setType(() => entries(src).filter(([key]) => omitted.indexOf(key) < 0).reduce((result, [key, value]) => Object.assign({}, result, {
    [key]: value
  }), {}));
}

const ANSI = ansiRegex();
const STDOUT = /^(DEBUG|INFO)$/;
const STDERR = /^(WARN|ERROR)$/;

/**
 * @private
 */
function stringify(value, spaces) {
  switch (typeof value) {
    case 'string':
      return value;

    case 'number':
      return String(value);

    case 'undefined':
      return 'undefined';

    default:
      return JSON.stringify(value, null, spaces);
  }
}

/**
 * @private
 */

function formatMessage(data, format) {
  if (data instanceof Error) {
    return data.stack;
  } else if (format === 'json') {
    return stringify(data).replace(ANSI, '');
  }

  return stringify(data, 2);
}

/**
 * @private
 */
function createWriter$1(format) {
  return function write(data) {
    const { level } = data,
          etc = objectWithoutProperties(data, ['level']);
    let { message, timestamp } = etc;
    let output;

    if (format === 'json') {
      output = {};

      if (message && typeof message === 'object' && message.message) {
        output = Object.assign({
          timestamp,
          level,
          message: message.message
        }, omit(message, 'message'));
      } else {
        output = Object.assign({
          timestamp,
          level,
          message
        }, etc);
      }

      output = formatMessage(output, 'json');
    } else {
      let columns = 0;

      if (process.stdout instanceof tty.WriteStream) {
        columns = process.stdout.columns;
      }

      message = formatMessage(message, 'text');

      switch (level) {
        case WARN:
          timestamp = chalk.yellow(`[${timestamp}]`);
          break;

        case ERROR:
          timestamp = chalk.red(`[${timestamp}]`);
          break;

        default:
          timestamp = chalk.dim(`[${timestamp}]`);
          break;
      }

      output = `${timestamp} ${message}\n\n${chalk.dim('-').repeat(columns)}\n`;
    }

    if (STDOUT.test(level)) {
      process.stdout.write(`${output}\n`);
    } else if (STDERR.test(level)) {
      process.stderr.write(`${output}\n`);
    }
  };
}

/**
 * @private
 */
function line(strings, ...values) {
  return insertValues(strings, ...values).replace(/(\r\n|\n|\r|)/gm, '').replace(/\s+/g, ' ').trim();
}

/**
 * @private
 */
function countDigits(num) {
  const digits = Math.floor(Math.log10(num) + 1);

  return digits > 0 && Number.isFinite(digits) ? digits : 1;
}

/**
 * @private
 */
function pad(startTime, endTime, duration) {
  const maxLength = countDigits(endTime - startTime);

  return ' '.repeat(maxLength - countDigits(duration)) + duration;
}

/**
 * @private
 */
const debugTemplate = ({
  path: path$$1,
  stats,
  route,
  method,
  params,
  colorStr,
  startTime,
  endTime,
  statusCode,
  statusMessage,
  remoteAddress
}) => `\
${line`
  Processed ${chalk.cyan(`${method}`)} "${path$$1}" from ${remoteAddress}
  with ${Reflect.apply(colorStr, null, [`${statusCode}`])}
  ${Reflect.apply(colorStr, null, [`${statusMessage}`])} by ${route ? `${chalk.yellow(route.controller.constructor.name)}#${chalk.blue(route.action)}` : null}
`}

${chalk.magenta('Params')}

${JSON.stringify(params, null, 2)}

${chalk.magenta('Stats')}

${stats.map(stat$$1 => {
  const { type, duration, controller } = stat$$1;
  let { name } = stat$$1;

  name = chalk.blue(name);

  if (type === 'action') {
    name = `${chalk.yellow(controller)}#${name}`;
  }

  return `${pad(startTime, endTime, duration)} ms ${name}`;
}).join('\n')}
${pad(startTime, endTime, stats.reduce((total, { duration }) => total + duration, 0))} ms Total
${(endTime - startTime).toString()} ms Actual\
`;

/**
 * @private
 */
const infoTemplate = ({
  path: path$$1,
  method,
  params,
  colorStr,
  startTime,
  endTime,
  statusCode,
  statusMessage,
  remoteAddress
}) => line`
Processed ${chalk.cyan(`${method}`)} "${path$$1}" ${chalk.magenta('Params')} ${JSON.stringify(params)} from ${remoteAddress} in ${(endTime - startTime).toString()} ms with ${Reflect.apply(colorStr, null, [`${statusCode}`])} ${Reflect.apply(colorStr, null, [`${statusMessage}`])}
`;

/**
 * @private
 */
function filterParams(params, ...filtered) {
  return entries(params).map(([key, value]) => [key, filtered.indexOf(key) >= 0 ? '[FILTERED]' : value]).reduce((result, [key, value]) => Object.assign({}, result, {
    [key]: value && typeof value === 'object' && !Array.isArray(value) ? filterParams(value, ...filtered) : value
  }), {});
}

/**
 * @private
 */
function logText(logger, options) {
  const { request, response, startTime } = options;
  const endTime = Date.now();
  const { method, url: { path: path$$1 } } = request;
  const { stats, statusMessage } = response;
  let { params } = request;
  let { statusCode } = response;
  let statusColor;

  params = filterParams(params, ...logger.filter.params);

  if (statusCode >= 200 && statusCode < 400) {
    statusColor = 'green';
  } else {
    statusColor = 'red';
  }

  let colorStr = Reflect.get(chalk__default, statusColor);

  if (typeof colorStr === 'undefined') {
    colorStr = str => str;
  }

  statusCode = String(statusCode);

  const templateData = {
    path: path$$1,
    stats,
    method,
    params,
    colorStr,
    startTime,
    endTime,
    statusCode,
    statusMessage,
    remoteAddress: '::1'
  };

  if (logger.level === DEBUG) {
    logger.debug(debugTemplate(templateData));
  } else {
    logger.info(infoTemplate(templateData));
  }
}

const MESSAGE = 'Processed Request';

/**
 * @private
 */
function logJSON(logger, options) {
  const { request, response } = options;
  const { method, headers, url: { path: path$$1 } } = request;
  const { statusCode: status } = response;
  const userAgent = headers.get('user-agent');
  const protocol = 'HTTP/1.1';

  let { params } = request;
  params = filterParams(params, ...logger.filter.params);

  logger.info({
    message: MESSAGE,

    method,
    path: path$$1,
    params,
    status,
    protocol,
    userAgent,
    remoteAddress: '::1'
  });
}

/**
 * @private
 */
function createRequestLogger(logger) {
  return (req, res, { startTime }) => {
    if (logger.format === 'json') {
      logJSON(logger, {
        startTime,
        request: req,
        response: res
      });
    } else {
      logText(logger, {
        startTime,
        request: req,
        response: res
      });
    }
  };
}

const PATTERN = /(?:,?`|'|").+(?:`|'|"),?/;

/**
 * @private
 */
function sql(strings, ...values) {
  return insertValues(strings, ...values).split(' ').map(part => {
    if (PATTERN.test(part)) {
      return part;
    }

    return part.toUpperCase();
  }).join(' ');
}

/**
 * @class Logger
 * @public
 */
class Logger {

  /**
   * Log a message at the ERROR level.
   *
   * ```javascript
   * logger.warn('HELP!');
   * // => [6/4/16 5:46:53 PM] HELP!
   * ```
   *
   * @method error
   * @param {any} data - The data you wish to log.
   * @return {void}
   * @public
   */


  /**
   * Log a message at the INFO level.
   *
   * ```javascript
   * logger.info('Hello World!');
   * // => [6/4/16 5:46:53 PM] Hello World!
   * ```
   *
   * @method info
   * @param {any} data - The data you wish to log.
   * @return {void}
   * @public
   */


  /**
   * A boolean flag that determines whether or not the logger is enabled.
   *
   * @property enabled
   * @type {Boolean}
   * @public
   */


  /**
   * The output format of log data (text or json).
   *
   * @property format
   * @type {String}
   * @public
   */
  constructor({ level, format, filter, enabled }) {
    let write = K;
    let request = K;

    if (!LUX_CONSOLE && enabled) {
      write = createWriter$1(format);
      request = createRequestLogger(this);
    }

    Object.defineProperties(this, {
      level: {
        value: level,
        writable: false,
        enumerable: true,
        configurable: false
      },
      format: {
        value: format,
        writable: false,
        enumerable: true,
        configurable: false
      },
      filter: {
        value: filter,
        writable: false,
        enumerable: true,
        configurable: false
      },
      enabled: {
        value: Boolean(enabled),
        writable: false,
        enumerable: true,
        configurable: false
      },
      request: {
        value: request,
        writable: false,
        enumerable: false,
        configurable: false
      }
    });

    const levelNum = LEVELS.get(level) || 0;

    LEVELS.forEach((val, key) => {
      Object.defineProperty(this, key.toLowerCase(), {
        value: val >= levelNum ? message => {
          write({
            message,
            level: key,
            timestamp: this.getTimestamp()
          });
        } : K,
        writable: false,
        enumerable: false,
        configurable: false
      });
    });
  }

  /**
   * @method getTimestamp
   * @return {String} The current time as an ISO8601 string.
   * @private
   */


  /**
   * Internal method used for logging requests.
   *
   * @method request
   * @param {Request} request
   * @param {Response} response
   * @param {Object} opts - An options object.
   * @param {Number} opts.startTime - The timestamp from when the request was
   * received.
   * @return {void}
   * @private
   */


  /**
   * Log a message at the WARN level.
   *
   * ```javascript
   * logger.warn('Good Bye World!');
   * // => [6/4/16 5:46:53 PM] Good Bye World!
   * ```
   *
   * @method warn
   * @param {any} data - The data you wish to log.
   * @return {void}
   * @public
   */


  /**
   * Log a message at the DEBUG level.
   *
   * ```javascript
   * logger.debug('Hello World!');
   * // => [6/4/16 5:46:53 PM] Hello World!
   * ```
   *
   * @method debug
   * @param {any} data - The data you wish to log.
   * @return {void}
   * @public
   */


  /**
   * Hackers love logs. It's easy to get sensitive user information from log
   * data if your server has been breached. To prevent leaking sensitive
   * information in a potential attack, blacklist certain keys that should be
   * filtered out of the logs.
   *
   * ```javascript
   * // config/environments/development.js
   * export default {
   *   logging: {
   *     level: 'DEBUG',
   *     format: 'text',
   *     enabled: true,
   *     filter: {
   *       params: ['password']
   *     }
   *   }
   * };
   * ```
   *
   * Now that we've added password to the array of parameters we want to filter
   * out of the logs, let's try to create a new user.
   *
   * ```http
   * POST /users HTTP/1.1
   * Content-Type: application/vnd.api+json
   * Host: 127.0.0.1:4000
   * Connection: close
   * User-Agent: Paw/3.0.14 (Macintosh; OS X/10.12.1) GCDHTTPRequest
   * Content-Length: 188
   *
   * {
   *   "data": {
   *   "type": "users",
   *     "attributes": {
   *       "name": "Zachary Golba",
   *       "email": "zachary.golba@postlight.com",
   *       "password": "vcZxniFYyfnFDcLn%nhe8Vrt"
   *     }
   *   }
   * }
   * ```
   *
   * The request above will yield the following log message.
   *
   * ```text
   * [2016-12-10T18:28:04.610Z] Processed POST "/users" from ::ffff:127.0.0.1
   * with 201 Created by UsersController#create
   *
   * Params
   *
   * {
   *   "data": {
   *     "type": "users",
   *     "attributes": {
   *       "name": "Zachary Golba",
   *       "email": "zachary.golba@postlight.com",
   *       "password": "[FILTERED]"
   *     }
   *   }
   * }
   * ```
   *
   * It worked! The password value did not leak into the log message.
   *
   * @property filter
   * @type {Object}
   * @public
   */

  /**
   * The level your application should log (DEBUG, INFO, WARN, or ERROR).
   *
   * @property level
   * @type {String}
   * @public
   */
  getTimestamp() {
    return new Date().toISOString();
  }
}

/**
 * @private
 */
class InvalidDriverError extends Error {
  constructor(driver) {
    super(line`
      Invalid database driver ${chalk.yellow(driver)} in ./config/database.js.
      Please use one of the following database drivers:
      ${VALID_DRIVERS.map(str => chalk.green(str)).join(', ')}.
    `);
  }
}

/**
 * @private
 */
class ModelMissingError extends Error {
  constructor(name) {
    super(`Could not resolve model by name '${name}'`);
  }
}

/**
 * @private
 */
class MigrationsPendingError extends Error {
  constructor(migrations = []) {
    const pending = migrations.map(str => chalk.yellow(str.substr(0, str.length - 3))).join(', ');

    super(line`
      The following migrations are pending ${pending}.
      Please run ${chalk.green('lux db:migrate')} before starting your application.
    `);
  }
}

/**
 * @private
 */
function createServerError(Source, statusCode) {
  const Target = class Target extends Source {};

  Object.defineProperty(Target, 'name', {
    value: Source.name
  });

  Object.defineProperty(Target.prototype, 'statusCode', {
    value: statusCode
  });

  // $FlowIgnore
  return Target;
}

createServerError(class UniqueConstraintError extends Error {}, 409);

class ConfigMissingError extends Error {
  constructor(environment) {
    super(`Database config not found for environment ${environment}.`);
  }
}

class RecordNotFoundError extends Error {
  constructor({ name, primaryKey }, primaryKeyValue) {
    super(`Could not find ${name} with ${primaryKey} ${stringify(primaryKeyValue)}.`);
  }
}

createServerError(RecordNotFoundError, 404);

/**
 * @private
 */

/**
 * @private
 */

/**
 * @private
 */




/**
 * @private
 */


/**
 * @private
 */

// eslint-disable-line no-unused-vars

/**
 * @private
 */

/**
 * @private
 */


/**
 * @private
 */

/**
 * @private
 */


/**
 * @private
 */


/**
 * @private
 */

// eslint-disable-next-line no-duplicate-imports

/**
 * @private
 */

/**
 * @private
 */


/**
 * @private
 */


/**
 * @private
 */

/**
 * @private
 */

// eslint-disable-next-line no-duplicate-imports


/**
 * @private
 */


/**
 * @private
 */


/**
 * @private
 */


/**
 * @private
 */

/**
 * @private
 */

/**
 * @private
 */

/* eslint-disable no-duplicate-imports */

/* eslint-enable no-duplicate-imports */

/**
 * @class Request
 * @public
 */
class Request {

  constructor(options) {
    Object.assign(this, options);
  }
}

const INT = /^\d+$/;
const CSV = /^(?:[\w\d-]+)(?:,[\w\d-]+){1,}$/;
const NULL = /^null$/;
const BOOL = /^(?:true|false)$/;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}(Z|\+\d{4})$/;
const TRUE = /^true$/;
const DELIMITER = /[_-\s]+/;

function camelize$1(source) {
  return source.split(DELIMITER).reduce((result, part, idx) => {
    if (part[0]) {
      const [first] = part;

      return result + (idx === 0 ? first.toLowerCase() : first.toUpperCase()) + part.slice(1).toLowerCase();
    }

    return result;
  }, '');
}

function fromString(source) {
  if (INT.test(source)) {
    return Number.parseInt(source, 10);
  } else if (BOOL.test(source)) {
    return TRUE.test(source);
  } else if (NULL.test(source)) {
    return null;
  } else if (CSV.test(source)) {
    return source.split(',').map(fromString);
  } else if (DATE.test(source)) {
    return new Date(source);
  }
  return source;
}

function fromObject(source) {
  return entries(source).reduce((target, [k, v]) => {
    const key = camelize$1(k);
    let value = v;

    if (typeof value === 'string') {
      value = fromString(value);
    } else if (isObject(value)) {
      value = fromObject(value);
    }

    if (key === 'include') {
      if (value && !Array.isArray(value)) {
        value = [value];
      }

      value = value.map(item => {
        if (typeof item === 'string') {
          return camelize$1(item);
        }
        return item;
      });
    } else if (key === 'fields' && isObject(value)) {
      value = entries(value).reduce((fields, [resource, names]) => {
        // eslint-disable-next-line no-param-reassign
        fields[resource] = (Array.isArray(names) ? names : [names]).map(item => {
          if (typeof item === 'string') {
            return camelize$1(item);
          }
          return item;
        });
        return fields;
      }, {});
    }

    // eslint-disable-next-line no-param-reassign
    target[key] = value;

    return target;
  }, {});
}

function resolve$2(method, headers) {
  const value = headers.get('x-http-method-override') || method;

  switch (value) {
    case 'GET':
    case 'HEAD':
    case 'POST':
    case 'PATCH':
    case 'DELETE':
    case 'OPTIONS':
      return value;

    default:
      throw new Error(`Method "${value}" is not supported.`);
  }
}

class Headers extends FreezeableMap {
  constructor(value = {}) {
    super(entries(value));
  }

  get(key) {
    return super.get(String(key).toLowerCase());
  }

  has(key) {
    return super.has(String(key).toLowerCase());
  }

  set(key, value) {
    super.set(String(key).toLowerCase(), value);
    return this;
  }

  delete(key) {
    return super.delete(String(key).toLowerCase());
  }
}

class ResponseHeaders extends Headers {

  constructor(handleChange) {
    super();
    this.handleChange = handleChange;
  }

  set(key, value) {
    this.handleChange('SET', [key, value]);
    return super.set(key, value);
  }

  delete(key) {
    this.handleChange('DELETE', [key, null]);
    return super.delete(key);
  }
}

function create$2(req, logger) {
  return new Promise((resolve$$1, reject) => {
    const url$$1 = url.parse(req.url);
    const headers = new Headers(req.headers);
    const request = new Request({
      logger,
      headers,
      url: Object.assign({}, url$$1, { params: [] }),
      params: fromObject(qs.parse(url$$1.query)),
      method: resolve$2(req.method, headers),
      // $FlowIgnore
      encrypted: Boolean(req.connection.encrypted),
      defaultParams: {}
    });

    headers.freeze();

    if (HAS_BODY.test(request.method)) {
      let offset = 0;
      const body = Buffer.allocUnsafe(Number.parseInt(request.headers.get('content-length') || '0', 10) || 0);

      req.on('data', data => {
        data.copy(body, offset);
        offset += data.length;
      }).once('end', () => {
        req.removeAllListeners('end');
        req.removeAllListeners('data');
        req.removeAllListeners('error');

        request.params.data = JSON.parse(body.toString());

        resolve$$1(request);
      }).once('error', err => {
        req.removeAllListeners('end');
        req.removeAllListeners('data');
        req.removeAllListeners('error');

        reject(err);
      });
    } else {
      resolve$$1(request);
    }
  });
}

/* eslint-enable no-use-before-define */

/**
 * @class Response
 * @public
 */
class Response {

  constructor(options) {
    Object.assign(this, options);
  }
}

function create$3(res, logger) {
  return new Response({
    logger,
    stats: [],
    headers: new ResponseHeaders((type, [key, value]) => {
      if (type === 'SET' && value) {
        res.setHeader(key, value);
      } else if (type === 'DELETE') {
        res.removeHeader(key);
      }
    }),
    statusCode: 200,
    statusMessage: 'OK',

    end(body) {
      res.end(body);
    },

    send(body) {
      this.end(body);
    },

    status(code) {
      res.statusCode = code; // eslint-disable-line no-param-reassign
      this.statusCode = code;
      return this;
    },

    getHeader(key) {
      return this.headers.get(key);
    },

    setHeader(key, value) {
      this.headers.set(key, value);
    },

    removeHeader(key) {
      this.headers.delete(key);
    }
  });
}

function createAdapter({ logger }) {
  function adapter(req, res) {
    return Promise.all([create$2(req, logger), create$3(res, logger)]);
  }

  Object.defineProperty(adapter, 'type', {
    value: 'http',
    writable: false,
    enumerable: true,
    configurable: false
  });

  return adapter;
}

function create$4(options) {
  const urlData = url.parse(options.url);
  const params = fromObject(qs.parse(urlData.query));
  const headers = new Headers(options.headers);

  if (options.body) {
    Object.assign(params, options.body);
  }

  headers.freeze();

  return new Request({
    params,
    headers,
    url: Object.assign({}, urlData, { params: [] }),
    logger: options.logger,
    method: resolve$2(options.method, headers),
    encrypted: urlData.protocol === 'https:',
    defaultParams: {}
  });
}

function create$5(options) {
  return new Response({
    stats: [],
    headers: new ResponseHeaders(noop),
    logger: options.logger,
    statusCode: 200,
    statusMessage: 'OK',

    end(body) {
      this.send(body);
    },

    send(body) {
      if (options.resolve) {
        const {
          headers,
          statusCode,
          statusMessage
        } = this;

        options.resolve({
          body,
          headers,
          statusCode,
          statusText: statusMessage
        });
      }
    },

    status(code) {
      this.statusCode = code;
      return this;
    },

    getHeader(key) {
      return this.headers.get(key);
    },

    setHeader(key, value) {
      this.headers.set(key, value);
    },

    removeHeader(key) {
      this.headers.delete(key);
    }
  });
}

function createAdapter$1({ logger }) {
  function adapter({ url: url$$1, body, method, headers, resolve: resolve$$1 }) {
    return Promise.resolve([create$4({
      url: url$$1,
      body,
      method,
      logger,
      headers
    }), create$5({
      logger,
      resolve: resolve$$1
    })]);
  }

  Object.defineProperty(adapter, 'type', {
    value: 'mock',
    writable: false,
    enumerable: true,
    configurable: false
  });

  return adapter;
}

// eslint-disable-next-line no-duplicate-imports


function createDefaultConfig() {
  const isTestENV = NODE_ENV === 'test';
  const isProdENV = NODE_ENV === 'production';

  return {
    server: {
      cors: {
        enabled: false
      }
    },
    adapter: isTestENV ? createAdapter$1 : createAdapter,
    logging: {
      level: isProdENV ? 'INFO' : 'DEBUG',
      format: isProdENV ? 'json' : 'text',
      enabled: !isTestENV,
      filter: {
        params: []
      }
    }
  };
}

function hasOwnProperty$1(target, key) {
  return Reflect.apply(Object.prototype.hasOwnProperty, target, [key]);
}

/**
 * @private
 */
function merge(dest, source) {
  return setType(() => entries(source).reduce((result, [key, value]) => {
    if (hasOwnProperty$1(result, key) && isObject(value)) {
      const currentValue = Reflect.get(result, key);

      if (isObject(currentValue)) {
        return Object.assign({}, result, {
          [key]: merge(currentValue, value)
        });
      }
    }

    return Object.assign({}, result, {
      [key]: value
    });
  }, Object.assign({}, dest)));
}

const NAMESPACE_DELIMITER = /\$-/g;

/**
 * @private
 */
function formatKey(key, formatter) {
  return chain(key).pipe(str => {
    if (formatter) {
      return formatter(str);
    }

    return str;
  }).pipe(underscore$1).pipe(inflection.dasherize).pipe(str => str.replace(NAMESPACE_DELIMITER, '/')).value();
}

const SUFFIX_PATTERN = /^.+(Controller|Down|Serializer|Up)/;

/**
 * @private
 */
function normalize(manifest) {
  return entries(manifest).reduce((obj, [key, value]) => {
    if (SUFFIX_PATTERN.test(key)) {
      const suffix = key.replace(SUFFIX_PATTERN, '$1');
      const stripSuffix = source => source.replace(suffix, '');

      switch (suffix) {
        case 'Controller':
          obj.controllers.set(formatKey(key, stripSuffix), value);
          break;

        case 'Serializer':
          obj.serializers.set(formatKey(key, stripSuffix), value);
          break;

        case 'Up':
        case 'Down':
          obj.migrations.set(formatKey(key), Reflect.construct(Migration, [value]));
          break;

        default:
          break;
      }
    } else {
      switch (key) {
        case 'Application':
        case 'routes':
        case 'seed':
          Reflect.set(obj, formatKey(key), value);
          break;

        case 'config':
          Reflect.set(obj, 'config', Object.assign({}, merge(createDefaultConfig(), Object.assign({}, obj.config, value))));
          break;

        case 'database':
          Reflect.set(obj, 'config', Object.assign({}, obj.config, {
            database: value
          }));
          break;

        default:
          obj.models.set(formatKey(key), value);
          break;
      }
    }

    return obj;
  }, {
    config: {},
    controllers: new FreezeableMap(),
    migrations: new FreezeableMap(),
    models: new FreezeableMap(),
    serializers: new FreezeableMap()
  });
}

/**
 * @private
 */
function bundleFor(path$$1) {
  const manifest = Reflect.apply(require, null, [path.join(path$$1, 'dist', 'bundle')]);

  return chain(manifest).pipe(normalize).pipe(entries).construct(FreezeableMap).value().freeze();
}

/**
 * @private
 */

// eslint-disable-line max-len, no-unused-vars

/**
 * @private
 */

/**
 * @private
 */
function createLoader(path$$1) {
  let bundle;

  return function load(type) {
    if (!bundle) {
      bundle = bundleFor(path$$1);
    }

    return bundle.get(type);
  };
}

/**
 * @private
 */
function connect(path$$1, config = {}) {
  let { pool } = config;

  const {
    host,
    socket,
    driver,
    memory,
    database,
    username,
    password,
    port,
    ssl,
    url: url$$1
  } = config;

  if (VALID_DRIVERS.indexOf(driver) < 0) {
    throw new InvalidDriverError(driver);
  }

  if (pool && typeof pool === 'number') {
    pool = {
      min: pool > 1 ? 2 : 1,
      max: pool
    };
  }

  const knex = require(path.join(path$$1, 'node_modules', 'knex'));
  const usingSQLite = driver === 'sqlite3';
  let filename;

  if (usingSQLite) {
    if (memory) {
      pool = undefined;
      filename = ':memory:';
    } else {
      filename = path.join(path$$1, 'db', `${database || 'default'}_${NODE_ENV}.sqlite`);
    }
  }

  return knex({
    pool,
    connection: DATABASE_URL || url$$1 || {
      ssl,
      host,
      port,
      filename,
      database,
      password,
      user: username,
      socketPath: socket
    },
    debug: false,
    client: driver,
    useNullAsDefault: usingSQLite
  });
}

/**
 * @private
 */
var createMigrations = (() => {
  var _ref = asyncToGenerator(function* (schema) {
    const hasTable = yield schema().hasTable('migrations');

    if (!hasTable) {
      yield schema().createTable('migrations', function (table) {
        table.string('version', 16).primary();
      });
    }

    return true;
  });

  function createMigrations(_x) {
    return _ref.apply(this, arguments);
  }

  return createMigrations;
})();

/**
 * @private
 */
var pendingMigrations = (() => {
  var _ref = asyncToGenerator(function* (appPath, table) {
    const migrations = yield readdir$1(`${appPath}/db/migrate`);
    const versions = yield table().select().then(function (data) {
      return data.map(function ({ version }) {
        return version;
      });
    });

    return migrations.filter(function (migration) {
      return versions.indexOf(migration.replace(/^(\d{16})-.+$/g, '$1')) < 0;
    });
  });

  function pendingMigrations(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return pendingMigrations;
})();

// eslint-disable-next-line no-unused-vars


/**
 * @private
 */
var initialize$1 = (() => {
  var _ref = asyncToGenerator(function* (instance, opts) {
    const { path: path$$1, models, logger, checkMigrations } = opts;
    let { config } = opts;

    config = Reflect.get(config, NODE_ENV);

    if (!config) {
      throw new ConfigMissingError(NODE_ENV);
    }

    const {
      debug = NODE_ENV === 'development'
    } = config;

    Object.defineProperties(instance, {
      path: {
        value: path$$1,
        writable: false,
        enumerable: false,
        configurable: false
      },
      debug: {
        value: debug,
        writable: false,
        enumerable: false,
        configurable: false
      },
      models: {
        value: models,
        writable: false,
        enumerable: false,
        configurable: false
      },
      logger: {
        value: logger,
        writable: false,
        enumerable: false,
        configurable: false
      },
      config: {
        value: config,
        writable: false,
        enumerable: true,
        configurable: false
      },
      schema: {
        value: function () {
          return instance.connection.schema;
        },
        writable: false,
        enumerable: false,
        configurable: false
      },
      connection: {
        value: connect(path$$1, config),
        writable: false,
        enumerable: false,
        configurable: false
      }
    });

    if (config.memory && config.driver === 'sqlite3') {
      const load = createLoader(path$$1);
      const seed = load('seed');
      const migrations = load('migrations');

      yield createMigrations(instance.schema);

      const pending = yield pendingMigrations(path$$1, function () {
        return instance.connection('migrations');
      });

      const runners = pending.map(function (name) {
        const version = name.replace(/^(\d{16})-.+$/g, '$1');
        const key = name.replace(new RegExp(`${version}-(.+)\\.js`), '$1');

        return [version, migrations.get(`${key}-up`)];
      }).filter(function ([, migration]) {
        return Boolean(migration);
      }).reverse().map(function ([version, migration]) {
        return function () {
          const query = migration.run(instance.schema());

          return query.then(function () {
            return instance.connection('migrations').insert({
              version
            });
          });
        };
      });

      yield composeAsync(...runners)();
      yield instance.connection.transaction(function (trx) {
        return seed(trx, instance.connection);
      });
    } else if (cluster.isMaster || cluster.worker && cluster.worker.id === 1) {
      yield createMigrations(instance.schema);

      if (checkMigrations) {
        const pending = yield pendingMigrations(path$$1, function () {
          return instance.connection('migrations');
        });

        if (pending.length) {
          throw new MigrationsPendingError(pending);
        }
      }
    }

    yield Promise.all(Array.from(models.values()).map(function (model) {
      return model.initialize(instance, function () {
        return instance.connection(model.tableName);
      });
    }));

    return instance;
  });

  function initialize(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return initialize;
})();

/**
 * @private
 */
var normalizeModelName = compose(inflection.singularize, inflection.dasherize, underscore$1);

function formatInt(int) {
  return (int / 10).toString().replace('.', '').substr(0, 2);
}

function* padding(char, amount) {
  for (let i = 0; i < amount; i += 1) {
    yield char;
  }
}

function generateTimestamp() {
  const now = new Date();
  const timestamp = now.toISOString().substr(0, 10).split('-').join('') + formatInt(now.getHours()) + formatInt(now.getMinutes()) + formatInt(now.getSeconds()) + formatInt(now.getMilliseconds());

  return timestamp + [...padding('0', 16 - timestamp.length)].join('');
}

/**
 * @private
 */
class Migration {

  constructor(fn) {
    this.fn = fn;
  }

  run(schema) {
    return this.fn(schema);
  }
}

/**
 * @private
 */
class Database {

  constructor({
    path: path$$1,
    models,
    config,
    logger,
    checkMigrations
  }) {
    return initialize$1(this, {
      path: path$$1,
      models,
      config,
      logger,
      checkMigrations
    });
  }

  /**
   * A boolean value representing whether or not connection pool configuration
   * has been supplied. This is used for determining wheter or not transactions
   * will be used when writing to the database.
   *
   * @property hasPool
   * @type {Boolean}
   */
  get hasPool() {
    return Boolean(this.config.pool);
  }

  modelFor(type) {
    const model = this.models.get(normalizeModelName(type));

    if (!model) {
      throw new ModelMissingError(type);
    }

    return model;
  }
}

const VALID_ATTR = /^(\w|-)+:(\w|-)+$/;
const RELATIONSHIP = /^belongs-to|has-(one|many)$/;

/**
 * @private
 */
var modelTemplate = ((name, attrs) => {
  const normalized = chain(name).pipe(underscore$1).pipe(inflection.classify).value();

  return template`
    import { Model } from 'lux-framework';

    class ${normalized} extends Model {
    ${entries((attrs || []).filter(attr => VALID_ATTR.test(attr)).map(attr => attr.split(':')).filter(([, type]) => RELATIONSHIP.test(type)).reduce((types, [related, type]) => {
    const key = chain(type).pipe(underscore$1).pipe(str => inflection.camelize(str, true)).value();

    const value = Reflect.get(types, key);

    if (value) {
      const inverse = inflection.camelize(normalized, true);
      const relatedKey = chain(related).pipe(underscore$1).pipe(str => inflection.camelize(str, true)).value();

      return Object.assign({}, types, {
        [key]: [...value, `${indent(8)}${relatedKey}: {${os.EOL}` + `${indent(10)}inverse: '${inverse}'${os.EOL}` + `${indent(8)}}`]
      });
    }

    return types;
  }, {
    hasOne: [],
    hasMany: [],
    belongsTo: []
  })).filter(([, value]) => value.length).reduce((result, [key, value], index) => chain(result).pipe(str => {
    if (index && str.length) {
      return `${str}${os.EOL.repeat(2)}`;
    }

    return str;
  }).pipe(str => str // eslint-disable-line prefer-template
  + `${indent(index === 0 ? 2 : 6)}static ${key} = {${os.EOL}` + `${value.join(`,${os.EOL.repeat(2)}`)}${os.EOL}` // eslint-disable-line max-len, comma-spacing
  + `${indent(6)}};`).value(), '')}
    }

    export default ${normalized};
  `;
});

/**
 * @private
 */
var serializerTemplate = ((name, attrs) => {
  let normalized = chain(name).pipe(underscore$1).pipe(inflection.classify).value();

  if (!normalized.endsWith('Application')) {
    normalized = inflection.pluralize(normalized);
  }

  const body = entries(attrs.filter(attr => /^(\w|-)+:(\w|-)+$/g.test(attr)).map(attr => attr.split(':')).reduce((obj, parts) => {
    const [, type] = parts;
    let [attr] = parts;
    let {
      hasOne,
      hasMany,
      attributes
    } = obj;

    attr = `${indent(8)}'${inflection.camelize(underscore$1(attr), true)}'`;

    switch (type) {
      case 'belongs-to':
      case 'has-one':
        hasOne = [...hasOne, attr];
        break;

      case 'has-many':
        hasMany = [...hasMany, attr];
        break;

      default:
        attributes = [...attributes, attr];
    }

    return {
      attributes,
      hasOne,
      hasMany
    };
  }, {
    attributes: [],
    belongsTo: [],
    hasOne: [],
    hasMany: []
  })).reduce((result, group, index) => {
    const [key] = group;
    let [, value] = group;
    let str = result;

    if (value.length) {
      value = value.join(',\n');

      if (index && str.length) {
        str += '\n\n';
      }

      str += `${indent(index === 0 ? 2 : 6)}${key} = ` + `[\n${value}\n${indent(6)}];`;
    }

    return str;
  }, '');

  return template`
    import { Serializer } from 'lux-framework';

    class ${normalized}Serializer extends Serializer {
    ${body}
    }

    export default ${normalized}Serializer;
  `;
});

/**
 * @private
 */
var controllerTemplate = ((name, attrs) => {
  let normalized = chain(name).pipe(underscore$1).pipe(inflection.classify).value();

  if (!normalized.endsWith('Application')) {
    normalized = inflection.pluralize(normalized);
  }

  const body = entries(attrs.filter(attr => /^(\w|-)+:(\w|-)+$/g.test(attr)).map(attr => attr.split(':')[0]).reduce((obj, attr) => Object.assign({}, obj, {
    params: [...obj.params, `${indent(8)}'${inflection.camelize(underscore$1(attr), true)}'`]
  }), { params: [] })).reduce((result, group, index) => {
    const [key] = group;
    let [, value] = group;
    let str = result;

    if (value.length) {
      value = value.join(',\n');

      if (index && str.length) {
        str += '\n\n';
      }

      str += `${indent(index === 0 ? 2 : 6)}${key} = ` + `[\n${value}\n${indent(6)}];`;
    }

    return str;
  }, '');

  return template`
    import { Controller } from 'lux-framework';

    class ${normalized}Controller extends Controller {
    ${body}
    }

    export default ${normalized}Controller;
  `;
});

/**
 * @private
 */
var emptyMigrationTemplate = (() => template`
  export function up(schema) {

  }

  export function down(schema) {

  }
`);

/**
 * @private
 */
var modelMigrationTemplate = ((name, attrs) => {
  const indices = ['id'];
  const table = chain(name).pipe(str => str.substr(24)).pipe(underscore$1).pipe(inflection.pluralize).value();

  let body = '';

  if (Array.isArray(attrs)) {
    body = attrs.filter(attr => /^(\w|-)+:(\w|-)+$/g.test(attr)).map(attr => attr.split(':')).filter(([, type]) => !/^has-(one|many)$/g.test(type)).map(attr => {
      let [column, type] = attr;

      column = underscore$1(column);

      if (type === 'belongs-to') {
        type = 'integer';
        column = `${column}_id`;

        if (Array.isArray(indices)) {
          indices.push(column);
        }
      }

      return [column, type];
    }).map((attr, index) => {
      let [column] = attr;
      const [, type] = attr;
      const shouldIndex = indices.indexOf(column) >= 0;

      column = `${indent(index > 0 ? 8 : 0)}table.${type}('${column}')`;
      return shouldIndex ? `${column}.index();` : `${column};`;
    }).join('\n');
  }

  return template`
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
  `;
});

/**
 * @private
 */
var middlewareTemplate = (name => {
  const normalized = chain(name).pipe(underscore$1).pipe(str => inflection.camelize(str, true)).value();

  return template`
    export default function ${normalized}(/*request, response*/) {

    }
  `;
});

/**
 * @private
 */
var utilTemplate = (name => {
  const normalized = chain(name).pipe(underscore$1).pipe(str => inflection.camelize(str, true)).value();

  return template`
    export default function ${normalized}() {

    }
  `;
});

/**
 * @private
 */
function log(data) {
  if (data instanceof Error) {
    process.stdout.write(`${data.stack || data.message}\n`);
  } else {
    process.stderr.write(`${data}\n`);
  }
}

const FORWARD_SLASH = /\//g;

/**
 * @private
 */
function createGenerator({
  dir,
  template,
  hasConflict = exists$$1
}) {
  return (() => {
    var _ref2 = asyncToGenerator(function* (_ref) {
      let { cwd, attrs, onConflict } = _ref,
          opts = objectWithoutProperties(_ref, ['cwd', 'attrs', 'onConflict']);

      const path$$1 = parsePath(cwd, dir, `${opts.name}.js`);
      const name = opts.name.replace(FORWARD_SLASH, '-');
      let action = chalk.green('create');

      yield mkdirRec(path$$1.dir);

      if (yield hasConflict(path$$1.absolute)) {
        const shouldContinue = yield onConflict(path$$1.relative);

        if (shouldContinue && typeof shouldContinue === 'string') {
          yield rmrf$$1(path.join(path$$1.dir, shouldContinue));
          log(`${chalk.red('remove')} ${path.join(dir, shouldContinue)}`);
        } else if (shouldContinue && typeof shouldContinue === 'boolean') {
          action = chalk.yellow('overwrite');
          yield rmrf$$1(path$$1.absolute);
        } else {
          log(`${chalk.yellow('skip')} ${path$$1.relative}`);
          return;
        }
      }

      yield writeFile$1(path$$1.absolute, Buffer.from(template(name, attrs)));
      log(`${action} ${path$$1.relative}`);
    });

    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  })();
}

function detectConflict(path$$1) {
  const { dir, base } = parsePath(path$$1);
  const pattern = new RegExp(`^\\d+-${base.substr(17)}$`);

  return exists$$1(pattern, dir);
}

function createConflictResolver({ cwd, onConflict }) {
  return (() => {
    var _ref = asyncToGenerator(function* (path$$1) {
      if (yield onConflict(path$$1)) {
        const parsed = parsePath(cwd, path$$1);
        const migrations = yield readdir$1(parsed.dir);

        return migrations.find(function (file) {
          return file.substr(17) === parsed.base.substr(17);
        }) || false;
      }

      return false;
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })();
}

/**
 * @private
 */
let controller = (() => {
  var _ref = asyncToGenerator(function* (opts) {
    const { cwd } = opts;
    let { name } = opts;

    const dir = path.join('app', 'controllers');
    const generate = createGenerator({
      dir,
      template: controllerTemplate
    });

    if (!name.endsWith('application')) {
      name = inflection.pluralize(name);
    }

    yield generate(Object.assign({}, opts, {
      cwd,
      name
    }));

    const namespace = path.posix.dirname(name);

    if (namespace !== '.') {
      const hasParent = yield exists$$1(path.join(cwd, dir, ...[...namespace.split('/'), 'application.js']));

      if (!hasParent) {
        yield controller(Object.assign({}, opts, {
          cwd,
          name: `${namespace}/application`,
          attrs: []
        }));
      }
    }
  });

  return function controller(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * @private
 */
let serializer = (() => {
  var _ref2 = asyncToGenerator(function* (opts) {
    const { cwd } = opts;
    let { name } = opts;

    const dir = path.join('app', 'serializers');
    const generate = createGenerator({
      dir,
      template: serializerTemplate
    });

    if (!name.endsWith('application')) {
      name = inflection.pluralize(name);
    }

    yield generate(Object.assign({}, opts, {
      cwd,
      name
    }));

    const namespace = path.posix.dirname(name);

    if (namespace !== '.') {
      const hasParent = yield exists$$1(path.join(cwd, dir, ...[...namespace.split('/'), 'application.js']));

      if (!hasParent) {
        yield serializer(Object.assign({}, opts, {
          cwd,
          name: `${namespace}/application`,
          attrs: []
        }));
      }
    }
  });

  return function serializer(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * @private
 */
function migration(opts) {
  const { cwd, onConflict } = opts;
  let { name } = opts;

  const dir = path.join('db', 'migrate');
  const generate = createGenerator({
    dir,
    template: emptyMigrationTemplate,
    hasConflict: detectConflict
  });

  name = chain(name).pipe(path.posix.basename).pipe(str => `${generateTimestamp()}-${str}`).value();

  return generate(Object.assign({}, opts, {
    cwd,
    name,
    onConflict: createConflictResolver({
      cwd,
      onConflict
    })
  }));
}

/**
 * @private
 */
function modelMigration(opts) {
  const { cwd, onConflict } = opts;
  let { name } = opts;

  const dir = path.join('db', 'migrate');
  const generate = createGenerator({
    dir,
    template: modelMigrationTemplate,
    hasConflict: detectConflict
  });

  name = chain(name).pipe(path.posix.basename).pipe(inflection.pluralize).pipe(str => `${generateTimestamp()}-create-${str}`).value();

  return generate(Object.assign({}, opts, {
    cwd,
    name,
    onConflict: createConflictResolver({
      cwd,
      onConflict
    })
  }));
}

/**
 * @private
 */
let model = (() => {
  var _ref3 = asyncToGenerator(function* (opts) {
    let { name } = opts;
    const generate = createGenerator({
      dir: path.join('app', 'models'),
      template: modelTemplate
    });

    yield modelMigration(Object.assign({ name }, opts));

    name = chain(name).pipe(path.posix.basename).pipe(inflection.singularize).value();

    return generate(Object.assign({}, opts, {
      name
    }));
  });

  return function model(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * @private
 */
function middleware(opts) {
  let { name } = opts;
  const parts = name.split('/');

  name = parts.pop() || name;

  const generate = createGenerator({
    dir: path.join('app', 'middleware', ...parts),
    template: middlewareTemplate
  });

  return generate(Object.assign({}, opts, {
    name
  }));
}

/**
 * @private
 */
function util(opts) {
  let { name } = opts;
  const parts = name.split('/');

  name = parts.pop() || name;

  const generate = createGenerator({
    dir: path.join('app', 'utils', ...parts),
    template: utilTemplate
  });

  return generate(Object.assign({}, opts, {
    name
  }));
}

/**
 * @private
 */
let resource = (() => {
  var _ref4 = asyncToGenerator(function* (opts) {
    yield model(opts);
    yield controller(opts);
    yield serializer(opts);

    if (path.posix.dirname(opts.name) !== '.') {
      log(NAMESPACED_RESOURCE_MESSAGE);
      return;
    }

    const path$$1 = path.join(opts.cwd, 'app', 'routes.js');
    const routes = chain((yield readFile$1(path$$1))).pipe(function (buf) {
      return buf.toString('utf8');
    }).pipe(function (str) {
      return str.split('\n');
    }).pipe(function (lines) {
      return lines.reduce(function (result, line, index, arr) {
        const closeIndex = arr.lastIndexOf('}');
        let str = result;

        if (line && index <= closeIndex) {
          str += `${line}\n`;
        }

        if (index + 1 === closeIndex) {
          str += `  this.resource('${inflection.pluralize(opts.name)}');\n`;
        }

        return str;
      }, '');
    }).value();

    yield writeFile$1(path$$1, Buffer.from(routes));
    log(`${chalk.green('update')} app/routes.js`);
  });

  return function resource(_x4) {
    return _ref4.apply(this, arguments);
  };
})();



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

function generatorFor(type) {
  const normalized = type.toLowerCase();
  const generator = Reflect.get(generators, normalized);

  if (!generator) {
    throw new Error(`Could not find a generator for '${type}'.`);
  }

  return generator;
}

/**
 * @private
 */
let runGenerator = (() => {
  var _ref = asyncToGenerator(function* ({ cwd, type, name, attrs }) {
    const generator = generatorFor(type);
    const prompt = createPrompt();

    yield generator({
      cwd,
      type,
      name,
      attrs,
      onConflict: function (path$$1) {
        return prompt.question(`${chalk.green('?')} ${chalk.red('Overwrite')} ${path$$1}? (Y/n)\r`);
      }
    });

    prompt.close();
  });

  return function runGenerator(_x) {
    return _ref.apply(this, arguments);
  };
})();

// eslint-disable-line max-len, no-duplicate-imports

/**
 * @private
 */
function generate({
  cwd = CWD,
  name,
  type,
  attrs = []
}) {
  return runGenerator({
    cwd,
    name,
    type,
    attrs
  });
}

/**
 * @private
 */
let create = (() => {
  var _ref = asyncToGenerator(function* (name, database) {
    const driver = driverFor(database);
    const project = `${CWD}/${name}`;

    yield mkdir$1(project);

    yield Promise.all([mkdir$1(`${project}/app`), mkdir$1(`${project}/config`), mkdir$1(`${project}/db`)]);

    yield Promise.all([mkdir$1(`${project}/app/models`), mkdir$1(`${project}/app/serializers`), mkdir$1(`${project}/app/controllers`), mkdir$1(`${project}/app/middleware`), mkdir$1(`${project}/app/utils`), mkdir$1(`${project}/config/environments`), mkdir$1(`${project}/db/migrate`)]);

    yield Promise.all([writeFile$1(`${project}/app/index.js`, appTemplate(name)), writeFile$1(`${project}/app/routes.js`, routesTemplate()), writeFile$1(`${project}/config/environments/development.js`, configTemplate(name, 'development')), writeFile$1(`${project}/config/environments/test.js`, configTemplate(name, 'test')), writeFile$1(`${project}/config/environments/production.js`, configTemplate(name, 'production')), writeFile$1(`${project}/config/database.js`, dbTemplate(name, driver)), writeFile$1(`${project}/db/seed.js`, seedTemplate()), writeFile$1(`${project}/README.md`, readmeTemplate(name)), writeFile$1(`${project}/LICENSE`, licenseTemplate()), writeFile$1(`${project}/package.json`, pkgJSONTemplate(name, database)), writeFile$1(`${project}/.babelrc`, babelrcTemplate()), writeFile$1(`${project}/.eslintrc.json`, eslintrcTemplate()), writeFile$1(`${project}/.gitignore`, gitignoreTemplate())]);

    const logOutput = template`
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
  `;

    process.stdout.write(logOutput.substr(0, logOutput.length - 1));
    process.stdout.write(os.EOL);

    yield Promise.all([generate({
      cwd: project,
      type: 'serializer',
      name: 'application'
    }), generate({
      cwd: project,
      type: 'controller',
      name: 'application'
    })]);

    yield exec$1('git init && git add .', {
      cwd: project
    });

    process.stdout.write(`${chalk.green('initialize')} git`);
    process.stdout.write(os.EOL);

    const spinner = new Ora({
      text: 'Installing dependencies from npm...',
      spinner: 'dots'
    });

    spinner.start();

    yield exec$1('npm install', {
      cwd: project
    });

    yield exec$1(`npm install --save --save-exact ${driver}`, {
      cwd: project
    });

    spinner.stop();
  });

  return function create(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

const GITHUB_URL = 'https://github.com/postlight/lux';

/**
 * @private
 */
function fileLink(path$$1, opts = {}) {
  const { line, branch = 'master' } = opts;
  let link = `${GITHUB_URL}/blob/${branch}/${path$$1}`;

  if (line && line >= 0) {
    link += `#${line}`;
  }

  return link;
}

const DB_INTERFACE_URL = fileLink('src/packages/database/interfaces.js', {
  line: 17
});

const CONNECTION_STRING_MESSAGE = template`

    You're using a URL in your database config (config/database.js).

    In that case, Lux assumes you don't need to create or drop your database.
    If you'd like to create or drop a database, set up your database config
    without the url.

    For guidance, see:
    ${DB_INTERFACE_URL}
`;

class DatabaseConfigMissingError extends ReferenceError {
  constructor(environment) {
    super(`Could not find database config for environment "${environment}".`);
  }
}

/**
 * @private
 */
function dbcreate() {
  const load = createLoader(CWD);
  const config = Reflect.get(load('config').database, NODE_ENV);

  if (!config) {
    throw new DatabaseConfigMissingError(NODE_ENV);
  }

  if (config.driver === 'sqlite3') {
    return writeFile$1(`${CWD}/db/${config.database}_${NODE_ENV}.sqlite`, Buffer.from(''));
  }

  if (DATABASE_URL || config.url) {
    process.stderr.write(CONNECTION_STRING_MESSAGE);
    process.stderr.write(os.EOL);
    return Promise.resolve();
  }

  const { schema } = connect(CWD, config);
  const query = `CREATE DATABASE ${config.database}`;

  return schema.raw(query).once('query', () => {
    process.stdout.write(query);
    process.stdout.write(os.EOL);
  });
}

/**
 * @private
 */
function dbdrop() {
  const load = createLoader(CWD);
  const config = Reflect.get(load('config').database, NODE_ENV);

  if (!config) {
    throw new DatabaseConfigMissingError(NODE_ENV);
  }

  if (config.driver === 'sqlite3') {
    return rmrf$$1(`${CWD}/db/${config.database}_${NODE_ENV}.sqlite`);
  }

  if (DATABASE_URL || config.url) {
    process.stderr.write(CONNECTION_STRING_MESSAGE);
    process.stderr.write(os.EOL);
    return Promise.resolve();
  }

  const { schema } = connect(CWD, config);
  const query = `DROP DATABASE IF EXISTS ${config.database}`;

  return schema.raw(query).once('query', () => {
    process.stdout.write(query);
    process.stdout.write(os.EOL);
  });
}

/**
 * @private
 */
let dbmigrate = (() => {
  var _ref = asyncToGenerator(function* () {
    const load = createLoader(CWD);

    const { database: config } = load('config');
    const models = load('models');
    const migrations = load('migrations');

    const { connection, schema } = yield new Database({
      config,
      models,
      path: CWD,
      checkMigrations: false,

      logger: new Logger({
        enabled: false
      })
    });

    const pending = yield pendingMigrations(CWD, function () {
      return connection('migrations');
    });

    if (pending.length) {
      const runners = pending.map(function (name) {
        const version = name.replace(/^(\d{16})-.+$/g, '$1');
        const key = name.replace(new RegExp(`${version}-(.+)\\.js`), '$1');

        return [version, migrations.get(`${key}-up`)];
      }).filter(function ([, migration]) {
        return Boolean(migration);
      }).reverse().map(function ([version, migration]) {
        return function () {
          const query = migration.run(schema());

          return query.on('query', function () {
            process.stdout.write(sql`${query.toString()}`);
            process.stdout.write(os.EOL);
          }).then(function () {
            return connection('migrations').insert({
              version
            });
          });
        };
      });

      yield composeAsync(...runners)();
    }

    return true;
  });

  return function dbmigrate() {
    return _ref.apply(this, arguments);
  };
})();

/**
 * @private
 */
let dbrollback = (() => {
  var _ref = asyncToGenerator(function* () {
    const load = createLoader(CWD);

    const { database: config } = load('config');
    const models = load('models');
    const migrations = load('migrations');

    const { connection, schema } = yield new Database({
      config,
      models,
      path: CWD,
      checkMigrations: false,

      logger: new Logger({
        enabled: false
      })
    });

    const migrationFiles = yield readdir$1(`${CWD}/db/migrate`);

    if (migrationFiles.length) {
      let migration;
      let version = yield connection('migrations').orderBy('version', 'desc').first();

      if (version && version.version) {
        version = version.version;
      }

      const target = migrationFiles.find(function (m) {
        return m.indexOf(version) === 0;
      });

      if (target) {
        migration = target.replace(new RegExp(`${version}-(.+)\\.js`), '$1');
        migration = migrations.get(`${migration}-down`);

        if (migration) {
          const query = migration.run(schema());

          yield query.on('query', function () {
            process.stdout.write(sql`${query.toString()}`);
            process.stdout.write(os.EOL);
          });

          yield connection('migrations').where({
            version
          }).del();
        }
      }
    }
  });

  return function dbrollback() {
    return _ref.apply(this, arguments);
  };
})();

/**
 * @private
 */
function dbseed() {
  const load = createLoader(CWD);
  const { database: config } = load('config');
  const seed = load('seed');
  const models = load('models');

  return new Database({
    config,
    models,
    path: CWD,
    logger: new Logger({
      enabled: false
    })
  }).then(store => store.connection.transaction(trx => seed(trx, store.connection)));
}

/**
 * @private
 */
let destroyType = (() => {
  var _ref = asyncToGenerator(function* (type, name) {
    const normalizedType = type.toLowerCase();
    let normalizedName = name;
    let path$$1;
    let migrations;

    switch (normalizedType) {
      case 'model':
        normalizedName = inflection.singularize(normalizedName);
        path$$1 = `app/${inflection.pluralize(normalizedType)}/${normalizedName}.js`;
        break;

      case 'migration':
        migrations = yield readdir$1(`${CWD}/db/migrate`);

        normalizedName = migrations.find(function (file) {
          return `${normalizedName}.js` === file.substr(17);
        });

        path$$1 = `db/migrate/${normalizedName}`;
        break;

      case 'controller':
      case 'serializer':
        normalizedName = inflection.pluralize(normalizedName);
        path$$1 = `app/${inflection.pluralize(normalizedType)}/${normalizedName}.js`;
        break;

      case 'middleware':
        path$$1 = `app/${normalizedType}/${normalizedName}.js`;
        break;

      case 'util':
        path$$1 = `app/${inflection.pluralize(normalizedType)}/${normalizedName}.js`;
        break;

      default:
        return;
    }

    if (yield exists$$1(`${CWD}/${path$$1}`)) {
      yield rmrf$$1(`${CWD}/${path$$1}`);

      process.stdout.write(`${chalk.red('remove')} ${path$$1}`);
      process.stdout.write(os.EOL);
    }
  });

  return function destroyType(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * @private
 */
let destroy$1 = (() => {
  var _ref2 = asyncToGenerator(function* ({ type, name }) {
    if (type === 'resource') {
      const routes = (yield readFile$1(`${CWD}/app/routes.js`)).toString('utf8').split('\n').reduce(function (lines, line) {
        const pattern = new RegExp(`\\s*this.resource\\(('|"|\`)${inflection.pluralize(name)}('|"|\`)\\);?`);

        return pattern.test(line) ? lines : [...lines, line];
      }, '').join('\n');

      yield Promise.all([destroyType('model', name), destroyType('migration', `create-${inflection.pluralize(name)}`), destroyType('serializer', name), destroyType('controller', name)]);

      yield writeFile$1(`${CWD}/app/routes.js`, routes);

      process.stdout.write(`${chalk.green('update')} app/routes.js`);
      process.stdout.write(os.EOL);
    } else if (type === 'model') {
      yield Promise.all([destroyType(type, name), destroyType('migration', `create-${inflection.pluralize(name)}`)]);
    } else {
      yield destroyType(type, name);
    }
  });

  return function destroy(_x3) {
    return _ref2.apply(this, arguments);
  };
})();

function repl$1() {
  return new Promise((() => {
    var _ref = asyncToGenerator(function* (resolve$$1) {
      const app = yield Reflect.apply(require, null, [path.join(CWD, 'dist', 'boot')]);

      const instance = repl.start({
        prompt: '> '
      });

      instance.once('exit', resolve$$1);

      Object.assign(instance.context, Object.assign({
        app,
        logger: app.logger,
        routes: app.router,
        [app.constructor.name]: app

      }, Array.from(app.models).reduce(function (context, [, model]) {
        return Object.assign({}, context, {
          [model.name]: model
        });
      }, {}), Array.from(app.controllers).reduce(function (context, [, controller]) {
        return Object.assign({}, context, {
          [controller.constructor.name]: controller
        });
      }, {}), Array.from(app.serializers).reduce(function (context, [, serializer]) {
        return Object.assign({}, context, {
          [serializer.constructor.name]: serializer
        });
      }, {})));
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })());
}

/**
 * @private
 */
function* range(start$$1, end) {
  for (let i = start$$1; i <= end; i += 1) {
    yield i;
  }
}

// eslint-disable-next-line no-duplicate-imports


/**
 * @private
 */
class Cluster extends EventEmitter {

  constructor(options) {
    super();

    Object.defineProperties(this, {
      path: {
        value: options.path,
        writable: false,
        enumerable: true,
        configurable: false
      },
      port: {
        value: options.port,
        writable: false,
        enumerable: true,
        configurable: false
      },
      logger: {
        value: options.logger,
        writable: false,
        enumerable: true,
        configurable: false
      },
      workers: {
        value: new Set(),
        writable: false,
        enumerable: true,
        configurable: false
      },
      maxWorkers: {
        value: options.maxWorkers || os.cpus().length,
        writable: false,
        enumerable: true,
        configurable: false
      }
    });

    cluster.setupMaster({
      exec: path.join(options.path, 'dist', 'boot.js')
    });

    process.on('update', changed => {
      changed.forEach(({ name: filename }) => {
        options.logger.info(`${chalk.green('update')} ${filename}`);
      });

      this.reload();
    });

    this.forkAll().then(() => this.emit('ready'));
  }

  fork(retry = true) {
    return new Promise(resolve$$1 => {
      if (this.workers.size < this.maxWorkers) {
        // $FlowIgnore
        const worker$$1 = cluster.fork({
          NODE_ENV,
          PORT: this.port
        });

        const timeout = setTimeout(() => {
          this.logger.info(line`
            Removing worker process: ${chalk.red(`${worker$$1.process.pid}`)}
          `);

          clearTimeout(timeout);

          worker$$1.removeAllListeners();
          worker$$1.kill();

          this.workers.delete(worker$$1);

          resolve$$1(worker$$1);

          if (retry) {
            this.fork(false);
          }
        }, 30000);

        const handleError = err => {
          if (err) {
            this.logger.error(err);
          }

          this.logger.info(line`
            Removing worker process: ${chalk.red(`${worker$$1.process.pid}`)}
          `);

          clearTimeout(timeout);

          worker$$1.removeAllListeners();
          worker$$1.kill();

          this.workers.delete(worker$$1);

          resolve$$1(worker$$1);
        };

        worker$$1.on('message', msg => {
          let data = {};
          let message = msg;

          if (typeof message === 'object') {
            data = omit(message, 'message');
            message = message.message;
          }

          switch (message) {
            case 'ready':
              this.logger.info(line`
                Adding worker process: ${chalk.green(`${worker$$1.process.pid}`)}
              `);

              this.workers.add(worker$$1);

              clearTimeout(timeout);
              worker$$1.removeListener('error', handleError);

              resolve$$1(worker$$1);
              break;

            case 'error':
              handleError(data.error);
              break;

            default:
              break;
          }
        });

        worker$$1.once('error', handleError);
        worker$$1.once('exit', code => {
          const { process: { pid } } = worker$$1;

          if (typeof code === 'number') {
            this.logger.info(line`
              Worker process: ${chalk.red(`${pid}`)} exited with code ${code}
            `);
          }

          this.logger.info(`Removing worker process: ${chalk.red(`${pid}`)}`);

          clearTimeout(timeout);

          worker$$1.removeAllListeners();
          this.workers.delete(worker$$1);

          this.fork();
        });
      }
    });
  }

  shutdown(worker$$1) {
    return new Promise(resolve$$1 => {
      this.workers.delete(worker$$1);

      const timeout = setTimeout(() => worker$$1.kill(), 5000);

      worker$$1.once('disconnect', () => {
        worker$$1.kill();
      });

      worker$$1.once('exit', () => {
        resolve$$1(worker$$1);
        clearTimeout(timeout);
      });

      worker$$1.send('shutdown');
      worker$$1.disconnect();
    });
  }

  reload() {
    if (this.workers.size) {
      const groups = Array.from(this.workers).reduce((arr, item, idx, src) => {
        if ((idx + 1) % 2) {
          const group = src.slice(idx, idx + 2);

          return [...arr, () => Promise.all(group.map(worker$$1 => this.shutdown(worker$$1)))];
        }

        return arr;
      }, []);

      // $FlowIgnore
      return composeAsync(...groups)();
    }

    return this.fork();
  }

  forkAll() {
    return Promise.race([...range(1, this.maxWorkers)].map(() => this.fork()));
  }
}

// eslint-disable-next-line no-duplicate-imports


/**
 * @private
 */
function createCluster(options) {
  return new Cluster(options);
}

/**
 * @private
 */
let serve = (() => {
  var _ref = asyncToGenerator(function* ({
    hot = NODE_ENV === 'development',
    cluster: cluster$$1 = false,
    useStrict = false
  }) {
    const load = createLoader(CWD);
    const { logging } = load('config');
    const logger = new Logger(logging);

    if (hot) {
      const watcher = yield watch$1(CWD);

      watcher.on('change', (() => {
        var _ref2 = asyncToGenerator(function* (changed) {
          yield build(useStrict);
          process.emit('update', changed);
        });

        return function (_x2) {
          return _ref2.apply(this, arguments);
        };
      })());
    }

    createCluster({
      logger,
      path: CWD,
      port: PORT,
      maxWorkers: cluster$$1 ? undefined : 1
    }).once('ready', function () {
      logger.info(`Lux Server listening on port: ${chalk.cyan(`${PORT}`)}`);
    });
  });

  return function serve(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * @private
 */
function test() {
  process.stdout.write('Coming Soon!');
  process.stdout.write(os.EOL);

  return Promise.resolve();
}

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
