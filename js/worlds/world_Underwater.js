var world_Underwater = new function() {
  World_Base.call(this);
  this.parent = {};
  for (p in this) {
    this.parent[p] = this[p];
  }

  var self = this;

  this.name = 'underwater';
  this.shortDescription = 'Underwater Tank';
  this.longDescription =
    '<p>Neutral-buoyancy tank with high drag for prop-driven robots.</p>' +
    '<p>Use for underwater trials without affecting land physics.</p>';
  this.thumbnail = 'images/worlds/default_thumbnail.png';

  this.optionsConfigurations = [
    {
      option: 'gravity',
      title: 'Effective Gravity (cm/s^2)',
      type: 'float',
      help: 'Set to 0 for neutral buoyancy; negative values pull downward.'
    },
    {
      option: 'linearDamping',
      title: 'Linear Drag',
      type: 'float',
      help: 'Higher values add water drag to all moving parts (0-0.99).'
    },
    {
      option: 'angularDamping',
      title: 'Angular Drag',
      type: 'float',
      help: 'Rotational drag applied to moving bodies (0-0.99).'
    }
  ];

  this.defaultOptions = Object.assign(this.defaultOptions, {
    imageURL: '',
    imageScale: 1,
    length: 400,
    width: 400,
    wall: true,
    wallHeight: 20,
    wallThickness: 5,
    wallColor: '#102d3f',
    groundFriction: 0.5,
    wallFriction: 0.2,
    groundRestitution: 0.0,
    wallRestitution: 0.0,
    gravity: 0,
    linearDamping: 0.92,
    angularDamping: 0.9
  });

  // Set options, including default
  this.setOptions = function(options) {
    self.mergeOptionsWithDefault(options);

    // Clamp damping between 0 and 0.99 to avoid Ammo instability
    function clampDamping(val) {
      val = parseFloat(val);
      if (isNaN(val)) {
        return 0;
      }
      if (val < 0) {
        return 0;
      }
      if (val > 0.99) {
        return 0.99;
      }
      return val;
    }

    self.options.linearDamping = clampDamping(self.options.linearDamping);
    self.options.angularDamping = clampDamping(self.options.angularDamping);
    self.options.gravity = parseFloat(self.options.gravity);
    if (isNaN(self.options.gravity)) {
      self.options.gravity = 0;
    }

    self.physics = {
      gravity: new BABYLON.Vector3(0, self.options.gravity, 0),
      linearDamping: self.options.linearDamping,
      angularDamping: self.options.angularDamping,
      disableDownforce: true
    };

    return this.parent.setOptions(options);
  };

  // Run on page load
  this.init = function() {
    Object.assign(self.options, self.defaultOptions);
  };
}

// Init class
world_Underwater.init();

if (typeof worlds == 'undefined') {
  var worlds = [];
}
worlds.push(world_Underwater);
