// Handles paired character insertion and wrapping
// for Editor element in FunctionAddDialog component of Assistant
export const codeFormatter = ({
  content,
  selectionStart,
  selectionEnd,
  key,
}) => {
  const pairs = {
    '"': '"',
    "(": ")",
    "{": "}",
    "[": "]",
  };

  const pair = pairs[key];

  if (key === "Enter") {
    // Check if the cursor is inside a pair of braces or brackets
    const beforeCursor = content.slice(0, selectionStart);
    const afterCursor = content.slice(selectionEnd);

    const previousChar = beforeCursor.slice(-1);
    const nextChar = afterCursor[0];

    // Handle indentation for both braces `{}` and brackets `[]`
    if (
      (previousChar === "{" && nextChar === "}") ||
      (previousChar === "[" && nextChar === "]")
    ) {
      // Find the current line's indentation
      const lines = beforeCursor.split("\n");
      const currentLine = lines[lines.length - 1];
      const currentIndentation = currentLine.match(/^\s*/)[0]; // Leading spaces of the current line

      const indent = "  "; // Two spaces for additional indentation
      const newContent = `${beforeCursor}\n${currentIndentation}${indent}\n${currentIndentation}${afterCursor}`;
      const newCursorStart =
        selectionStart + 1 + currentIndentation.length + indent.length; // Cursor after the new line and indent
      const newCursorEnd = newCursorStart;

      return { newContent, newCursorStart, newCursorEnd };
    }
  }

  if (!pair) {
    // If the key is not in pairs, return the original content and cursor positions
    return {
      newContent: content,
      newCursorStart: selectionStart,
      newCursorEnd: selectionEnd,
    };
  }

  if (selectionStart !== selectionEnd) {
    // If there's a selection, wrap the selected text
    const before = content.slice(0, selectionStart);
    const selected = content.slice(selectionStart, selectionEnd);
    const after = content.slice(selectionEnd);
    const newContent = `${before}${key}${selected}${pair}${after}`;
    return {
      newContent,
      newCursorStart: selectionStart + 1, // Cursor after the opening character
      newCursorEnd: selectionEnd + 1, // Cursor after the closing character
    };
  } else {
    // If there's no selection, insert the pair and place the cursor in the middle
    const before = content.slice(0, selectionStart);
    const after = content.slice(selectionEnd);
    const newContent = `${before}${key}${pair}${after}`;
    return {
      newContent,
      newCursorStart: selectionStart + 1,
      newCursorEnd: selectionStart + 1,
    };
  }
};

// Updates the content and positions the cursor in the editor
export const updateEditorContent = (
  textarea,
  newContent,
  newCursorStart,
  newCursorEnd,
  setContent
) => {
  setContent(newContent);

  // Update the cursor position after DOM re-render
  setTimeout(() => {
    if (textarea) {
      textarea.selectionStart = newCursorStart;
      textarea.selectionEnd = newCursorEnd;
    }
  }, 0);
};

// Handles key down events in the editor
export const handleEditorKeyDown = (event, jsonContent, setContent) => {
  const textarea = event.target;
  const { selectionStart, selectionEnd } = textarea;
  const key = event.key;

  // Call the formatter to process the input
  const { newContent, newCursorStart, newCursorEnd } = codeFormatter({
    content: jsonContent,
    selectionStart,
    selectionEnd,
    key,
  });

  if (newContent !== jsonContent) {
    event.preventDefault();
    updateEditorContent(
      textarea,
      newContent,
      newCursorStart,
      newCursorEnd,
      setContent
    );
  }
};
