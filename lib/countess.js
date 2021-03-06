'use babel';

/******************************************************************************
* CounteSS Atom Wrapper
*
* This module is designed to be the wrapper to tie the CounteSS module to the
* Atom platform. It manages when and how the CounteSS module is used.
******************************************************************************/


import CounteSS from './countess-sys';
import { CompositeDisposable } from 'atom';

export default {

  /*********************************************************************
  * Static variables.
  *********************************************************************/
  subscriptions: null,


  /*********************************************************************
  * initialize everything once the CounteSS Wrapper is attached to Atom
  *********************************************************************/
  activate (state) {
    this.countess = new CounteSS();
    this.isActive = true;

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'countess:toggle': () => this.toggle()
    }));

    setTimeout(this.initBuffer.bind(this));
  },


  /*********************************************************************
  * Initialze the first buffer, if ready
  *********************************************************************/
  initBuffer () {
    if (this.countess.editor) {
      this.bufferChange = this.countess.editor.getBuffer().onDidStopChanging(this.live.bind(this));
      this.editorChange = atom.workspace.onDidChangeActiveTextEditor(this.changeEditor.bind(this));
      this.live();
    } else {
      console.info("NO ACTIVE BUFFER FOUND");
    }
  },


  /*********************************************************************
  * Clean up after our selves.
  *********************************************************************/
  deactivate () {
    this.subscriptions.dispose();
  },


  /*********************************************************************
  * Call this function when the editor changes.
  *********************************************************************/
  changeEditor (editor) {
    if (editor) {
      this.bufferChange.dispose();
      this.countess.removeAnnotations();
      this.countess.editor = editor;
      this.bufferChange = this.countess.editor.getBuffer().onDidStopChanging(this.live.bind(this));
      this.live();
    }
  },


  /*********************************************************************
  * Suppose to return an object that can be retrieved when package is
  * activated, but right now it does not matter.
  *********************************************************************/
  serialize () {
    return {};
  },


  /*********************************************************************
  * call back to analyze the buffer text again.
  *********************************************************************/
  live () {
    if (this.isActive) {
      this.countess.removeAnnotations();
      this.countess.analyze();
    }
  },


  /*********************************************************************
  * Turn the engine on or off to not waste CPU time and power
  *********************************************************************/
  toggle () {
    this.isActive = !this.isActive;
    if (this.isActive) {
      console.log('CounteSS is ACTIVE');
      this.countess.analyze();
    } else {
      this.countess.removeAnnotations();
      console.log('CounteSS is INACTIVE');
    }
  }
};
