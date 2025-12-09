import * as ts from 'typescript';

/**
 * Checks if a JavaScript/TypeScript source file contains any string literals or template expressions.
 * This is useful for determining if a script file has translatable content.
 *
 * @param sourceFile - The TypeScript SourceFile to analyze
 * @returns true if the file contains at least one string literal or template expression
 */
export function hasStringLiteral(sourceFile: ts.SourceFile): boolean {
  let hasString = false;

  function visit(node: ts.Node) {
    if (hasString) return;

    if (ts.isStringLiteral(node) || ts.isTemplateExpression(node)) {
      hasString = true;
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return hasString;
}

/**
 * Checks if a JavaScript/TypeScript file content contains any string literals or template expressions.
 *
 * @param content - The file content as a string
 * @param filename - Optional filename for better error messages
 * @returns true if the content contains at least one string literal or template expression
 */
export function hasStringLiteralInContent(content: string, filename: string = 'file.js'): boolean {
  const sourceFile = ts.createSourceFile(
    filename,
    content,
    ts.ScriptTarget.Latest,
    true,
  );

  return hasStringLiteral(sourceFile);
}
