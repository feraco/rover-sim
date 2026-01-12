export class FilesManager {
  constructor() {
    this.unsaved = false;
    this.modified = false;
    this.files = {};
    this.currentFilename = 'main.py';
    this.onFileChangeCallback = null;
  }

  loadLocalStorageLegacy() {
    let code = localStorage.getItem('pythonCode');
    if (code) {
      let files = {
        'main.py': code
      };
      localStorage.setItem('gearsPythonCode', JSON.stringify(files));
      localStorage.removeItem('pythonCode');
    }
    let modified = localStorage.getItem('pythonModified');
    if (modified) {
      localStorage.setItem('gearsPythonModified', modified);
      localStorage.removeItem('pythonModified');
    }
  }

  loadLocalStorage() {
    this.loadLocalStorageLegacy();
    if (localStorage.getItem('gearsPythonModified') === 'true') {
      this.modified = true;
    }

    const json = localStorage.getItem('gearsPythonCode');
    if (json) {
      const files = JSON.parse(json);
      Object.assign(this.files, files);
    } else {
      this.files['main.py'] = '';
    }
    this.currentFilename = 'main.py';
  }

  saveLocalStorage() {
    if (this.unsaved) {
      this.unsaved = false;
      localStorage.setItem('gearsPythonCode', JSON.stringify(this.files));
      localStorage.setItem('gearsPythonModified', this.modified.toString());
    }
  }

  setToDefault(defaultContent = '') {
    this.files = {};
    this.add('main.py', defaultContent);
    this.select('main.py');
  }

  updateCurrentFile(content) {
    if (this.currentFilename) {
      this.files[this.currentFilename] = content;
      this.unsaved = true;
      this.modified = true;
    }
  }

  getCurrentFilename() {
    return this.currentFilename;
  }

  getCurrentContent() {
    return this.files[this.currentFilename] || '';
  }

  add(filename, content) {
    if (filename in this.files) {
      return;
    }
    this.files[filename] = content;
    this.unsaved = true;
    if (this.onFileChangeCallback) {
      this.onFileChangeCallback();
    }
  }

  select(filename) {
    if (filename in this.files) {
      this.currentFilename = filename;
      if (this.onFileChangeCallback) {
        this.onFileChangeCallback();
      }
      return true;
    }
    return false;
  }

  rename(oldFilename, newFilename) {
    if (oldFilename === newFilename) {
      return true;
    }
    if (newFilename in this.files) {
      return false;
    }
    this.files[newFilename] = this.files[oldFilename];
    delete this.files[oldFilename];
    if (this.currentFilename === oldFilename) {
      this.currentFilename = newFilename;
    }
    this.unsaved = true;
    if (this.onFileChangeCallback) {
      this.onFileChangeCallback();
    }
    return true;
  }

  remove(filename) {
    if (filename === 'main.py') {
      return false;
    }
    if (filename in this.files) {
      delete this.files[filename];
      if (this.currentFilename === filename) {
        this.currentFilename = 'main.py';
      }
      this.unsaved = true;
      if (this.onFileChangeCallback) {
        this.onFileChangeCallback();
      }
      return true;
    }
    return false;
  }

  getFiles() {
    return { ...this.files };
  }

  getFileList() {
    return Object.keys(this.files);
  }

  onFileChange(callback) {
    this.onFileChangeCallback = callback;
  }

  clear() {
    this.files = { 'main.py': '' };
    this.currentFilename = 'main.py';
    this.unsaved = true;
    this.modified = false;
    if (this.onFileChangeCallback) {
      this.onFileChangeCallback();
    }
  }
}

export const filesManager = new FilesManager();
