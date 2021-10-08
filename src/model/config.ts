/**
 * @fileoverview Defines the model configs.
 */

import { KeyboardLayouts } from "./enums";
import { State } from "./state";

/**
 * The input method config.
 */

export class Config {
  /** The input tool states. */
  states: Record<string, State> = {};

  /** The  fuzzy expansion paris. */
  fuzzyExpansions: string[] = [];

  /** The punctuationReg. */
  punctuationReg = /[^a-z0-9 \r]/i

  /** The regexp for editor chars. */
  editorCharReg = /[a-z]/i;

  /** The pageup chars. */
  pageupCharReg = /xyz/g;

  /** The pagedown chars. */
  pagedownCharReg = /xyz/g;

  /** The page size. */
  pageSize = 5;

  /** The maximum allowed input length. */
  maxInputLen = 40;

  /** The request number. */
  requestNum = 50;

  /** Whether automatically highlight the fetched candidates. */
  autoHighlight = true;

  /** Whether enables the user dictionary. */
  enableUserDict = true;

  /** The keyboard layout. */
  layout = KeyboardLayouts.STANDARD;

  /** The select keys. */
  selectKeys = '1234567890';

  /** The candidate window properties */
  candidateProps = {
    /** True to show the Candidate window, false to hide it. */
    visible: true,
    /* True if the candidate window should be rendered vertical, false to make it horizontal. */
    vertical: false,
    /** The total number of candidates for the candidate window. */
    totalCandidates: 8
  };


  /** Transform before the popup editor opened. */
  preTransform(c: string) {
    console.log(c);
    return '';
  }

  /**
   * Transform when the popup editor opened.
   */
  transform(context: string, c: string) {
    console.log('tranform', context, c);
    return c;
  }

  /**
   * Transform when the popup editor is going to close.
   */
  postTransform(c: string) {
    return c;
  }

  /**
   * Transform the character on the editor text.
   */
  transformView(text: string) {
    console.log('transformView', text);
    return text;
  }

}