import classNames from "classnames";
import React, { FunctionComponent, RefObject, TextareaHTMLAttributes, useEffect, useRef } from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  refObject?: RefObject<HTMLTextAreaElement>;
  hideBorder?: boolean;
}

const AutoSizeTextarea: FunctionComponent<Props> = ({
  minRows,
  refObject,
  hideBorder,
  ...props
}) => {
  // Default parameters
  minRows = minRows || props.rows || 3;

  // Refs
  /**
   * Used if no ref is supplied. If a ref is provided through props, that one
   * is used instead.
   */
  const defaultRef = useRef<HTMLTextAreaElement>(null);

  // Prefer provided ref, otherwise, use defaultRef
  const textareaRef: RefObject<HTMLTextAreaElement> = refObject || defaultRef;

  // Functions
  const updateTextareaSize = (): void => {
    const textareaEl = textareaRef.current;

    if (textareaEl === null) return;

    // Pretty hacky but it works
    // 1. Collapse the textarea to automatic size / reflow text
    textareaEl.style['height'] = ``;
    // 2. Update height of textarea to fit content. `rows` attribute will beat this
    // @NOTE 11 = padding
    textareaEl.style['height'] = `${textareaEl.scrollHeight + 11}px`;
  };

  /** Update height of textarea to fit content */
  useEffect(() => {
    // Update size on every browser resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateTextareaSize);
    }
  }, []);
  useEffect(() => {
    // Update size on every render #yolo
    updateTextareaSize();
  });


  return (
    <textarea
      {...props}
      rows={minRows}
      className={classNames('textarea auto-size-textarea', props.className, {
        'textarea--no-border': hideBorder === true,
      })}
      ref={textareaRef}
    />
  );
};

export default AutoSizeTextarea;
