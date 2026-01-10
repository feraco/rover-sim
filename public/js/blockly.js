var blockly = new function() {
  var self = this;

  // Apple Glass Dark Theme for Blockly
  self.theme = Blockly.Theme.defineTheme('appleGlassTheme', {
    'base': Blockly.Themes.Classic,
    'startHats': true,
    'blockStyles': {
      'logic_blocks': {
        'colourPrimary': '#0a84ff',
        'colourSecondary': '#0066cc',
        'colourTertiary': '#004999'
      },
      'loop_blocks': {
        'colourPrimary': '#30d158',
        'colourSecondary': '#28a745',
        'colourTertiary': '#1e7e34'
      },
      'math_blocks': {
        'colourPrimary': '#bf5af2',
        'colourSecondary': '#9933cc',
        'colourTertiary': '#7722aa'
      },
      'text_blocks': {
        'colourPrimary': '#ff9f0a',
        'colourSecondary': '#ff8800',
        'colourTertiary': '#cc6600'
      },
      'list_blocks': {
        'colourPrimary': '#ff375f',
        'colourSecondary': '#ff0033',
        'colourTertiary': '#cc0029'
      },
      'variable_blocks': {
        'colourPrimary': '#ff453a',
        'colourSecondary': '#ff3b30',
        'colourTertiary': '#cc2e26'
      },
      'procedure_blocks': {
        'colourPrimary': '#5e5ce6',
        'colourSecondary': '#4c4acc',
        'colourTertiary': '#3a3899'
      }
    },
    'categoryStyles': {
      'logic_category': {
        'colour': '#0a84ff'
      },
      'loop_category': {
        'colour': '#30d158'
      },
      'math_category': {
        'colour': '#bf5af2'
      },
      'text_category': {
        'colour': '#ff9f0a'
      },
      'list_category': {
        'colour': '#ff375f'
      },
      'variable_category': {
        'colour': '#ff453a'
      },
      'procedure_category': {
        'colour': '#5e5ce6'
      }
    },
    'componentStyles': {
      'workspaceBackgroundColour': 'transparent',
      'toolboxBackgroundColour': 'rgba(0, 0, 0, 0.3)',
      'toolboxForegroundColour': '#ffffff',
      'flyoutBackgroundColour': 'rgba(0, 0, 0, 0.5)',
      'flyoutForegroundColour': '#cccccc',
      'flyoutOpacity': 0.95,
      'scrollbarColour': 'rgba(10, 132, 255, 0.5)',
      'scrollbarOpacity': 0.6,
      'insertionMarkerColour': '#0a84ff',
      'insertionMarkerOpacity': 0.5,
      'markerColour': '#0a84ff',
      'cursorColour': '#0a84ff'
    },
    'fontStyle': {
      'family': '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      'weight': '500',
      'size': 12
    }
  });

  var options = {
    toolbox : null,
    zoom: {
      controls: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2
    },
    move: {
      wheel: true
    },
    collapse : true,
    comments : true,
    disable : true,
    maxBlocks : Infinity,
    trashcan : false,
    horizontalLayout : false,
    toolboxPosition : 'start',
    css : true,
    media: 'blockly-12.3.0/media',
    rtl : RTL,
    scrollbars : true,
    sounds : true,
    oneBasedIndex : false,
    theme: self.theme,
    renderer: 'zelos',  // Modern renderer with rounded blocks
    grid: {
      spacing: 25,
      length: 3,
      colour: 'rgba(255, 255, 255, 0.05)',
      snap: true
    }
  };

  this.unsaved = false;
  this.generator = null;  // Will be set in init
  this.generatorType = 'arduino';  // Track current generator type

  this.mirror = true;

  // Method to switch generators
  this.setGenerator = function(type) {
    if (type == 'arduino') {
      self.generator = arduino_generator;
      self.generatorType = 'arduino';
    } else if (type == 'python') {
      self.generator = ev3dev2_generator;
      self.generatorType = 'python';
    }
  };

  // Run on page load
  this.init = function() {
    // Zelos renderer with start hats enabled
    Blockly.zelos.Renderer.prototype.makeConstants_ = function() {
      var constants = new Blockly.zelos.ConstantProvider();
      constants.ADD_START_HATS = true;
      return constants;
    };

    const script = document.createElement('script');
    script.src = 'blockly-12.3.0/msg/' + LANG + '.js';
    script.addEventListener('load', function() {
      // Set Arduino as the default generator
      self.generator = arduino_generator;
      
      self.loadCustomBlocks()
        .then(self.loadToolBox)
        .then(function() {
          self.generator.load();
          arduino_generator.load();  // Initialize Arduino generator too
        });
    });
    document.head.appendChild(script);
  };

  // Load toolbox
  this.loadToolBox = function() {
    return fetch('toolbox_arduino.xml')
      .then(response => response.text())
      .then(function(response) {
        response = i18n.replace(response);
        self.toolboxXml = (new DOMParser()).parseFromString(response, "text/xml");
        options.toolbox = self.toolboxXml.getElementById('toolbox');
        self.workspace = Blockly.inject('blocklyHiddenDiv', options);
        self.displayedWorkspace = Blockly.inject('blocklyDiv', options);
        self.minimap = new Minimap(self.displayedWorkspace);
        self.minimap.init();
        self.displayedWorkspace.addChangeListener(self.mirrorEvent);
        self.registerCustomToolboxes();

        self.loadDefaultWorkspace();

        self.workspace.addChangeListener(Blockly.Events.disableOrphans);
        self.displayedWorkspace.addChangeListener(Blockly.Events.disableOrphans);
        // self.loadLocalStorage();
        setTimeout(self.loadLocalStorage, 200);
        setTimeout(function(){
          self.workspace.addChangeListener(self.checkModified);
        }, 1000);
      });
  };

  // Filter blocks from toolbox. Load from URL.
  this.loadToolboxFilterURL = function(url) {
    return fetch(url)
      .then(function(response) {
        if (response.ok) {
          return response.text();
        } else {
          toastMsg(i18n.get('#sim-not_found#'));
          return Promise.reject(new Error('invalid_blocks_filter'));
        }
      })
      .then(function(response) {
        self.loadToolboxFilter(JSON.parse(response));
      });
  };

  // Filter blocks from toolbox
  this.loadToolboxFilter = function(filter) {
    if (typeof self.displayedWorkspace == 'undefined') {
      setTimeout(function(){ self.loadToolboxFilter(filter); }, 500);
      return;
    }

    let filteredXml = self.toolboxXml.cloneNode(true);

    if (typeof filter.deny != 'undefined') {
      if (typeof filter.deny.categories != 'undefined') {
        for (let deny of filter.deny.categories) {
          let toRemove = filteredXml.querySelector('[name="' + deny + '"]');
          if (toRemove) {
            toRemove.remove();
          }
        }
      }
      if (typeof filter.deny.blocks != 'undefined') {
        for (let deny of filter.deny.blocks) {
          let toRemove = filteredXml.querySelector('[type="' + deny + '"]').remove();
          if (toRemove) {
            toRemove.remove();
          }
        }
      }
    }

    if (typeof filter.show != 'undefined') {
      if (typeof filter.show.categories != 'undefined') {
        for (let show of filter.show.categories) {
          filteredXml.querySelector('[name="' + show + '"]').setAttribute('hidden', false);
        }
      }
    }

    self.displayedWorkspace.updateToolbox(filteredXml.getElementById('toolbox'));
  };

  // Register variables and procedures toolboxes callbacks
  this.registerCustomToolboxes = function() {
    self.displayedWorkspace.registerToolboxCategoryCallback('VARIABLE2', function(workspace) {
      var xmlList = [];
      var button = document.createElement('button');
      button.setAttribute('text', '%{BKY_NEW_VARIABLE}');
      button.setAttribute('callbackKey', 'CREATE_VARIABLE');

      workspace.registerButtonCallback('CREATE_VARIABLE', function(button) {
        Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace());
        setTimeout(function(){
          self.displayedWorkspace.toolbox.refreshSelection()
        }, 100);
      });

      xmlList.push(button);

      var blockList = Blockly.Variables.flyoutCategoryBlocks(self.workspace);
      xmlList = xmlList.concat(blockList);
      return xmlList;
    });

    self.displayedWorkspace.registerToolboxCategoryCallback('PROCEDURE2', function(workspace){
      let blocks = self.workspace.getToolboxCategoryCallback('PROCEDURE')(self.workspace);
      for (let block of blocks) {
        if (block.type == 'procedures_callnoreturn' || block.type == 'procedures_callreturn') {
          block.inline = true;
          block.inputs = {};
          for (let i=0; i<block.extraState.params.length; i++) {
            block.inputs['ARG' + i] = {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 0
                }
              }
            }
          }
        }
      }
      return blocks;
    });
  };

  // mirror from displayed to actual (hidden) workspace
  this.mirrorEvent = function(primaryEvent) {
    if (self.mirror == false) {
      return;
    }
    if (primaryEvent.isUiEvent) {
      return;
    }
    if (
      primaryEvent.type == Blockly.Events.BLOCK_CREATE
      && primaryEvent.xml.tagName == 'shadow'
    ) {
      let id1 = primaryEvent.blockId;
      let parentId = self.displayedWorkspace.getBlockById(id1).parentBlock_.id;
      let blockIds = [];
      self.displayedWorkspace.getAllBlocks().forEach(function(block){
        blockIds.push(block.id);
      });

      let block2 = null;
      self.workspace.getAllBlocks().forEach(function(block){
        if (
          block.isShadow_
          && block.parentBlock_.id == parentId
          && blockIds.indexOf(block.id) == -1
        ) {
          block2 = block;
        }
      });

      if (block2 != null) {
        let id2 = block2.id;

        block2.id = id1;
        self.workspace.blockDB_[id1] = self.workspace.blockDB_[id2];
        delete self.workspace.blockDB_[id2];

        return;
      }
    }
    if (typeof primaryEvent.varType != 'undefined') {
      primaryEvent.varType = ' ';
    }
    var json = primaryEvent.toJson();
    json.varType = '';
    var secondaryEvent = Blockly.Events.fromJson(json, self.workspace);
    secondaryEvent.run(true);

    if (primaryEvent.type == Blockly.Events.BLOCK_CREATE) {
      self.assignOrphenToPage(blocklyPanel.currentPage);
    }
    if (primaryEvent.type == Blockly.Events.VAR_DELETE) {
      self.displayedWorkspace.getToolbox().refreshSelection()
    }
  };

  // Load default workspace
  this.loadDefaultWorkspace = function() {
    let xmlText =
      '<xml xmlns="https://developers.google.com/blockly/xml">' +
        '<block type="when_started" id="Q!^ZqS4/(a/0XL$cIi-~" x="63" y="38" deletable="false"><data>Main</data></block>' +
      '</xml>';
    self.loadXmlText(xmlText);
  };

  // Load custom blocks
  this.loadCustomBlocks = function() {
    return fetch('customBlocks.json?v=3cd8436f')
      .then(response => response.text())
      .then(function(response) {
        let json = JSON.parse(i18n.replace(response));
        Blockly.defineBlocksWithJsonArray(json);
        
        // Load Arduino blocks
        return fetch('arduinoBlocks.json');
      })
      .then(response => response.text())
      .then(function(response) {
        let json = JSON.parse(response);
        Blockly.defineBlocksWithJsonArray(json);
      });
  };

  // Mark workspace as unsaved
  this.checkModified = function(e) {
    if (e.type != Blockly.Events.UI) {
      self.unsaved = true;
      blocklyPanel.showSave();
    }
  };

  // get xmlText
  this.getXmlText = function() {
    var xml = Blockly.Xml.workspaceToDom(self.workspace);
    return Blockly.Xml.domToText(xml);
  };

  // Save to local storage
  this.saveLocalStorage = function() {
    if (self.workspace && self.unsaved) {
      self.unsaved = false;
      blocklyPanel.hideSave();
      localStorage.setItem('blocklyXML', self.getXmlText());
    }
  };

  // load xmlText to workspace
  this.loadXmlText = function(xmlText) {
    let oldXmlText = self.getXmlText();
    if (xmlText) {
      try {
        let dom = Blockly.utils.xml.textToDom(xmlText);
        self.workspace.clear();
        Blockly.Xml.domToWorkspace(dom, self.workspace);
        self.assignOrphenToPage('Main');
        self.showPage('Main');

        let pages = [];
        self.workspace.getAllBlocks().forEach(function(block){
          if (pages.indexOf(block.data) == -1) {
            pages.push(block.data);
          }
        });
        blocklyPanel.loadPagesOptions(pages);
      }
      catch (err) {
        console.log(err);
        if (err.name == 'Error') {
          toastMsg('Invalid Blocks');
          self.loadXmlText(oldXmlText);
        }
      }
    }
  };

  // import functions from xmlText to workspace
  this.importXmlTextFunctions = function(xmlText) {
    if (xmlText) {
      try {
        let procs = [];
        let dom = Blockly.utils.xml.textToDom(xmlText);

        // Save all functions
        dom.querySelectorAll('[type="procedures_defnoreturn"]').forEach(function(block){
          procs.push(block);
        });
        dom.querySelectorAll('[type="procedures_defreturn"]').forEach(function(block){
          procs.push(block);
        });

        // Empty dom
        dom = Blockly.utils.xml.textToDom('<xml xmlns="https://developers.google.com/blockly/xml"></xml>');
        procs.forEach(function(block){
          dom.append(block);
        });

        Blockly.Xml.domToWorkspace(dom, self.workspace);
        self.assignOrphenToPage('Main');

        let pages = [];
        self.workspace.getAllBlocks().forEach(function(block){
          if (pages.indexOf(block.data) == -1) {
            pages.push(block.data);
          }
        });
        blocklyPanel.loadPagesOptions(pages);

        self.showPage('Main');
      }
      catch (err) {
        console.log(err);
        toastMsg('Invalid Blocks');
      }
    }
  };

  // Load from local storage
  this.loadLocalStorage = function() {
    self.loadXmlText(localStorage.getItem('blocklyXML'));
  };

  // Clear all blocks from displayed workspace
  this.clearDisplayedWorkspace = function() {
    self.mirror = false;
    self.displayedWorkspace.clear();
    setTimeout(function() {
      self.mirror = true;
    }, 200);
  };

  // Delete all blocks in page
  this.deleteAllInPage = function(page) {
    let blocks = self.workspace.getAllBlocks();
    blocks.forEach(function(block){
      if (block.data == page) {
        block.data = '';
        block.dispose();
      }
    });
    self.unsaved = true;
    blocklyPanel.showSave();
  };

  // Copy blocks of specified page into displayed workspace
  this.showPage = function(page) {
    self.mirror = false;
    self.displayedWorkspace.clear();

    let xy = null;
    self.workspace.getAllBlocks().forEach(function(block){
      if (block.parentBlock_ == null && block.data == page) {
        let dom = Blockly.Xml.blockToDomWithXY(block);
        xy = block.getRelativeToSurfaceXY();
        let displayedBlock = Blockly.Xml.domToBlock(dom, self.displayedWorkspace);
        displayedBlock.moveBy(xy.x, xy.y);
      }
    });
    self.workspace.getAllBlocks().forEach(function(block){
      if (
        block.data != page
        && (block.type == 'procedures_defnoreturn' || block.type == 'procedures_defreturn')
      ) {
        let dom = Blockly.Xml.blockToDom(block);
        let displayedBlock = Blockly.Xml.domToBlock(dom, self.displayedWorkspace);
        if (xy) {
          displayedBlock.moveBy(xy.x, xy.y);
        }
        displayedBlock.setMovable(false);
        displayedBlock.setCollapsed(true);
        displayedBlock.setDeletable(false);
        displayedBlock.getDescendants().forEach(function(desc){
          desc.setDeletable(false);
        });
        displayedBlock.svgGroup_.style.display = 'none';
      }
    });
    self.displayedWorkspace.scrollCenter();
    setTimeout(function() {
      self.mirror = true;
    }, 200);
  };

  // Assign orphen blocks to current page
  this.assignOrphenToPage = function(page) {
    let blocks = self.workspace.getAllBlocks();
    blocks.forEach(function(block){
      if (typeof block.data == 'undefined' || ! block.data) {
        block.data = page;
      }
    });
  };

  // Change page name
  this.changePageName = function(from, to) {
    self.assignOrphenToPage(from);
    let blocks = self.workspace.getAllBlocks();
    blocks.forEach(function(block){
      if (block.data == from) {
        block.data = to;
      }
    });
    self.unsaved = true;
    blocklyPanel.showSave();
  };

  // Copy page
  this.copyPage = function(from, to) {
    let blocks = self.workspace.getAllBlocks();
    blocks.forEach(function(block){
      if (block.parentBlock_ == null && block.data == from && block.type != 'when_started') {
        let dom = Blockly.Xml.blockToDom(block);
        let newBlock = Blockly.Xml.domToBlock(dom, self.workspace);
        newBlock.data = to;
        newBlock.getDescendants().forEach(function(desc){
          desc.data = to;
        })
        let xy = block.getRelativeToSurfaceXY();
        newBlock.moveBy(xy.x, xy.y);
      }
    });
    self.unsaved = true;
    blocklyPanel.showSave();
  };

  // Move blocks
  this.moveSelected = function(selected, to) {
    function moveBlock(block, to) {
      block.data = to;
      block.getChildren().forEach(function(desc) {
        moveBlock(desc, to);
      });
    }

    moveBlock(self.workspace.getBlockById(selected.id), to);
  };
}

