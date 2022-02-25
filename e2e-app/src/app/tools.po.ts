import {getPage} from '../../baseTest';
import {errors, expect} from '@playwright/test';

/**
 * Sends keys to a currently focused element
 *
 * @param keys list of keys to send
 * https://playwright.dev/docs/api/class-keyboard?_highlight=keyboard#keyboardpresskey-options
 */
export const sendKey = async(key: string) => {
  await getPage().keyboard.press(key);
};

/**
 * Focus the provided element, and wait for this element to be focused, to avoid asynchronous side effet.
 *
 * @param selector element selector to focus
 */
export const focusElement = async(selector: string) => {
  await getPage().focus(selector);
  await expect(getPage().locator(selector)).toBeFocused();
};

const roundBoundingBox = (rect: {x: number, y: number, width: number, height: number}) => {
  rect.x = Math.round(rect.x);
  rect.y = Math.round(rect.y);
  rect.width = Math.round(rect.width);
  rect.height = Math.round(rect.height);

  return rect;
};

/**
 * Returns the element bounding box
 */
export const getBoundingBox = async(selector: string) => {
  const element = await getPage().$(selector);
  const boundingBox = element ? await element.boundingBox() : {x: 0, y: 0, width: 0, height: 0};
  return roundBoundingBox(boundingBox !);
};

/**
 * Returns the caret position ({start, end}) of the given element (must be an input).
 */
export const getCaretPosition = async(selector: string) =>
    await getPage().$eval(selector, (el: HTMLInputElement) => ({start: el.selectionStart, end: el.selectionEnd}));

/**
* Add a custom message on a playwright timeout failure
* This is a workaround, waiting for the followinf PR to be merged:
* {@link https://github.com/microsoft/playwright/pull/4778}
* @template T
* @param {Promise<T>} promise
* @param {string} message
* @return {Promise<T>}
*/
export const timeoutMessage = (promise: Promise<any>, message: string) => {
  return promise.catch(e => {
    if (e instanceof errors.TimeoutError) {
      e.message += '\n' + message;
    }
    throw e;
  });
};

/**
 * @example
 * js `some code with ${json} variables to be stringified`
 * @param code
 * @param variables
 */
export const js = (code: TemplateStringsArray, ...variables: any[]) => {
  let result = '';
  const l = code.length - 1;
  for (let i = 0; i < l; i++) {
    result += code[i] + JSON.stringify(variables[i]);
  }
  result += code[l];
  return result;
};

/**
 * Move the mouse hover the provided element
 * @param selector Element selector
 */
export const mouseMove = async(selector: string) => {
  const rect = await getBoundingBox(selector);
  const x = rect.x + rect.width / 2;
  const y = rect.y + rect.height / 2;
  await getPage().mouse.move(x, y);
};
