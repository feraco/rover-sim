var webserialUploader = new function() {
  var self = this;

  var STK = {
    GET_SYNC: 0x30,
    LOAD_ADDRESS: 0x55,
    PROG_PAGE: 0x64,
    READ_SIGN: 0x75,
    CRC_EOP: 0x20
  };

  this.state = {
    port: null,
    reader: null,
    writer: null,
    hexBytes: null,
    pageSize: 128
  };

  this.log = function(msg) {
    if (self.$log) {
      var line = document.createElement('div');
      line.textContent = msg;
      self.$log.append(line);
      self.$log.scrollTop = self.$log.scrollHeight;
    }
  };

  this.error = function(msg) {
    self.log('Error: ' + msg);
  };

  this.setBusy = function(busy) {
    if (self.$uploadBtn) {
      self.$uploadBtn.disabled = busy;
    }
    if (self.$connectBtn) {
      self.$connectBtn.disabled = busy;
    }
  };

  this.openDialog = function() {
    var $body = $('<div class="uploaderBody"></div>');
    var $intro = $('<p>Select a HEX file, connect your Arduino Uno over USB, then click Upload. Works in Chrome/Edge over HTTPS or localhost.</p>');
    var $fileRow = $('<div class="uploaderRow"></div>');
    var $fileBtn = $('<button type="button" class="btn">Choose HEX</button>');
    var $fileName = $('<span class="fileName">No file chosen</span>');
    $fileRow.append($fileBtn).append($fileName);

    var $connectRow = $('<div class="uploaderRow"></div>');
    var $connectBtn = $('<button type="button" class="btn">Connect Uno (Web Serial)</button>');
    var $portLabel = $('<span class="portLabel">Not connected</span>');
    $connectRow.append($connectBtn).append($portLabel);

    var $uploadRow = $('<div class="uploaderRow"></div>');
    var $uploadBtn = $('<button type="button" class="btn btn-primary">Upload</button>');
    $uploadRow.append($uploadBtn);

    var $log = $('<div class="uploaderLog"></div>');

    $body.append($intro, $fileRow, $connectRow, $uploadRow, $log);

    var $buttons = $('<button type="button" class="btn btn-light">Close</button>');
    var $dlg = dialog('Upload to Arduino (beta)', $body, $buttons, 'uploaderDialog');

    $buttons.click(function() {
      self.closePort();
      $dlg.close();
    });

    self.$log = $log[0];
    self.$connectBtn = $connectBtn[0];
    self.$uploadBtn = $uploadBtn[0];

    $fileBtn.on('click', function() {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.hex,application/octet-stream';
      input.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) { return; }
        var reader = new FileReader();
        reader.onload = function() {
          try {
            self.state.hexBytes = self.parseHex(reader.result);
            $fileName.text(file.name + ' (' + self.state.hexBytes.length + ' bytes)');
            self.log('HEX loaded. Size: ' + self.state.hexBytes.length + ' bytes.');
          } catch(err) {
            self.state.hexBytes = null;
            self.error('HEX parse failed: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
      input.dispatchEvent(new MouseEvent('click'));
    });

    $connectBtn.on('click', async function() {
      try {
        await self.connect();
        $portLabel.text('Connected');
      } catch(err) {
        self.error(err.message || err.toString());
      }
    });

    $uploadBtn.on('click', async function() {
      if (!self.state.hexBytes) {
        self.error('Choose a HEX file first.');
        return;
      }
      try {
        self.setBusy(true);
        if (!self.state.port) {
          await self.connect();
          $portLabel.text('Connected');
        }
        await self.uploadHex(self.state.hexBytes);
        self.log('Upload complete. Resetting board.');
      } catch(err) {
        self.error(err.message || err.toString());
      } finally {
        self.setBusy(false);
      }
    });
  };

  this.closePort = async function() {
    try {
      if (self.state.reader) {
        await self.state.reader.cancel();
        self.state.reader.releaseLock();
      }
      if (self.state.writer) {
        await self.state.writer.close();
      }
      if (self.state.port) {
        await self.state.port.close();
      }
    } catch(e) {}
    self.state.port = null;
    self.state.reader = null;
    self.state.writer = null;
  };

  this.connect = async function() {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial not supported in this browser. Use Chrome/Edge on HTTPS or localhost.');
    }
    self.log('Requesting serial port...');
    self.state.port = await navigator.serial.requestPort();
    await self.state.port.open({ baudRate: 115200 });
    self.state.reader = self.state.port.readable.getReader();
    self.state.writer = self.state.port.writable.getWriter();
    await self.resetBoard();
    self.log('Port opened.');
  };

  this.resetBoard = async function() {
    try {
      if (self.state.port.setSignals) {
        await self.state.port.setSignals({ dataTerminalReady: false, requestToSend: false });
        await new Promise(r => setTimeout(r, 50));
        await self.state.port.setSignals({ dataTerminalReady: true, requestToSend: true });
        await new Promise(r => setTimeout(r, 50));
      }
    } catch(e) {
      self.log('Reset warn: ' + e.message);
    }
  };

  this.write = async function(bytes) {
    await self.state.writer.write(new Uint8Array(bytes));
  };

  this.readResponse = async function(minLen, timeoutMs) {
    var deadline = Date.now() + (timeoutMs || 800);
    var out = [];
    while (Date.now() < deadline) {
      var res = await self.state.reader.read();
      if (res.value) {
        for (var i=0; i<res.value.length; i++) { out.push(res.value[i]); }
      }
      if (res.done) {
        break;
      }
      if (out.length >= minLen) {
        break;
      }
    }
    return out;
  };

  this.transact = async function(bytes, expectLen) {
    await self.write(bytes);
    var resp = await self.readResponse(expectLen || 2, 1200);
    if (resp.length < 2 || resp[0] != 0x14 || resp[resp.length - 1] != 0x10) {
      throw new Error('Protocol sync failed. Got: ' + resp.join(','));
    }
    return resp;
  };

  this.sync = async function() {
    for (var i=0; i<5; i++) {
      try {
        await self.transact([STK.GET_SYNC, STK.CRC_EOP]);
        return;
      } catch(e) {
        await new Promise(r => setTimeout(r, 50));
      }
    }
    throw new Error('Unable to sync with bootloader. Press reset and try again.');
  };

  this.readSignature = async function() {
    var resp = await self.transact([STK.READ_SIGN, STK.CRC_EOP], 5);
    return resp.slice(1, resp.length - 1);
  };

  this.loadAddress = async function(wordAddress) {
    var high = (wordAddress >> 8) & 0xFF;
    var low = wordAddress & 0xFF;
    await self.transact([STK.LOAD_ADDRESS, low, high, STK.CRC_EOP]);
  };

  this.progPage = async function(chunk) {
    var sizeHigh = (chunk.length >> 8) & 0xFF;
    var sizeLow = chunk.length & 0xFF;
    var cmd = [STK.PROG_PAGE, sizeHigh, sizeLow, 0x46];
    cmd = cmd.concat(Array.from(chunk));
    cmd.push(STK.CRC_EOP);
    await self.transact(cmd);
  };

  this.uploadHex = async function(hexBytes) {
    if (!self.state.port) {
      throw new Error('Not connected.');
    }
    self.log('Syncing...');
    await self.sync();
    var sig = await self.readSignature();
    self.log('Signature: ' + sig.map(function(b){return '0x' + b.toString(16).padStart(2,'0');}).join(' '));

    var pageSize = self.state.pageSize;
    var padded = hexBytes.slice();
    var padLen = pageSize - (padded.length % pageSize);
    if (padLen > 0 && padLen < pageSize) {
      for (var p=0; p<padLen; p++) { padded.push(0xFF); }
    }

    for (var offset=0; offset<padded.length; offset += pageSize) {
      var page = padded.slice(offset, offset + pageSize);
      var wordAddress = (offset / 2) & 0xFFFF;
      await self.loadAddress(wordAddress);
      await self.progPage(page);
      var sent = Math.min(offset + pageSize, padded.length);
      self.log('Wrote ' + sent + ' / ' + padded.length + ' bytes');
    }
  };

  this.parseHex = function(text) {
    var lines = text.split(/\r?\n/);
    var bytes = [];
    lines.forEach(function(line) {
      line = line.trim();
      if (line.length === 0) { return; }
      if (line[0] !== ':') { throw new Error('Invalid HEX line'); }
      var len = parseInt(line.substr(1, 2), 16);
      var addr = parseInt(line.substr(3, 4), 16);
      var type = parseInt(line.substr(7, 2), 16);
      var data = line.substr(9, len * 2);
      if (type === 0x00) {
        for (var i=0; i<len; i++) {
          var byteStr = data.substr(i * 2, 2);
          bytes[addr + i] = parseInt(byteStr, 16);
        }
      }
    });
    // fill gaps with 0xFF
    for (var i=0; i<bytes.length; i++) {
      if (typeof bytes[i] === 'undefined') { bytes[i] = 0xFF; }
    }
    return bytes;
  };
}();
