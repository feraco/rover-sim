export async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading JSON:', error);
    return null;
  }
}

export async function loadXML(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    const text = await response.text();
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/xml');
  } catch (error) {
    console.error('Error loading XML:', error);
    return null;
  }
}

export async function loadText(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading text:', error);
    return null;
  }
}

export async function loadArduinoBlocks() {
  return await loadJSON('/config/arduinoBlocks.json');
}

export async function loadCustomBlocks() {
  return await loadJSON('/config/customBlocks.json');
}

export async function loadToolbox() {
  return await loadText('/config/toolbox.xml');
}

export async function loadArduinoToolbox() {
  return await loadText('/config/toolbox_arduino.xml');
}

export async function loadLibrary() {
  return await loadXML('/config/library.xml');
}

export async function loadWorld(worldPath) {
  return await loadJSON(worldPath);
}

export async function loadSample(samplePath) {
  return await loadText(samplePath);
}
