export class PythonExecutor {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.skulptLoaded = false;
    this.outputCallback = null;
    this.errorCallback = null;
    this.suspensionResolve = null;
  }

  async loadSkulpt() {
    if (this.skulptLoaded) {
      return;
    }

    if (!window.Sk) {
      await new Promise((resolve, reject) => {
        const script1 = document.createElement('script');
        script1.src = '/vendor/skulpt/0.11.0/skulpt.min.js';
        script1.onload = () => {
          const script2 = document.createElement('script');
          script2.src = '/vendor/skulpt/0.11.0/skulpt-stdlib.js';
          script2.onload = resolve;
          script2.onerror = reject;
          document.body.appendChild(script2);
        };
        script1.onerror = reject;
        document.body.appendChild(script1);
      });
    }

    this.skulptLoaded = true;
    this.configureSkulpt();
  }

  configureSkulpt() {
    if (!window.Sk) {
      return;
    }

    window.Sk.configure({
      output: (text) => {
        if (this.outputCallback) {
          this.outputCallback(text);
        }
      },
      read: (filename) => {
        if (window.Sk.builtinFiles && window.Sk.builtinFiles['files'][filename]) {
          return window.Sk.builtinFiles['files'][filename];
        }
        throw new Error(`File not found: ${filename}`);
      },
      __future__: window.Sk.python3
    });
  }

  async run(code, robot, world) {
    if (!this.skulptLoaded) {
      await this.loadSkulpt();
    }

    this.isRunning = true;
    this.isPaused = false;

    try {
      const promise = window.Sk.misceval.asyncToPromise(() => {
        return window.Sk.importMainWithBody('<stdin>', false, code, true);
      });

      await promise;
      this.isRunning = false;
    } catch (error) {
      this.isRunning = false;
      if (this.errorCallback) {
        this.errorCallback(error.toString());
      }
      throw error;
    }
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (window.Sk && window.Sk.hardInterrupt) {
      window.Sk.hardInterrupt();
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    if (this.suspensionResolve) {
      this.suspensionResolve();
      this.suspensionResolve = null;
    }
  }

  setOutputCallback(callback) {
    this.outputCallback = callback;
  }

  setErrorCallback(callback) {
    this.errorCallback = callback;
  }

  async sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
