import { create } from 'zustand';

export const useBlocklyStore = create((set, get) => ({
  workspace: null,
  blocksXml: '',
  generatedCode: '',

  setWorkspace: (workspace) => set({ workspace }),

  setBlocksXml: (xml) => {
    set({ blocksXml: xml });
  },

  setGeneratedCode: (code) => set({ generatedCode: code }),

  loadBlocks: (xml) => {
    const { workspace } = get();
    if (workspace && xml) {
      try {
        workspace.clear();
        const dom = window.Blockly.utils.xml.textToDom(xml);
        window.Blockly.Xml.domToWorkspace(dom, workspace);
        set({ blocksXml: xml });
      } catch (error) {
        console.error('Error loading blocks:', error);
      }
    }
  },

  saveBlocks: () => {
    const { workspace } = get();
    if (workspace) {
      const dom = window.Blockly.Xml.workspaceToDom(workspace);
      const xml = window.Blockly.Xml.domToPrettyText(dom);
      set({ blocksXml: xml });
      return xml;
    }
    return '';
  },

  clearWorkspace: () => {
    const { workspace } = get();
    if (workspace) {
      workspace.clear();
      set({ blocksXml: '', generatedCode: '' });
    }
  },
}));
