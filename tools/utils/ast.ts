import * as ts from 'typescript';

/**
 * Extracts all string literals and template expressions from a TypeScript SourceFile.
 *
 * @param sourceFile - The TypeScript SourceFile to analyze
 * @returns An array of string values found in the source file
 */
export function extractStrings(sourceFile: ts.SourceFile): string[] {
  const strings: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isStringLiteral(node)) {
      strings.push(node.text);
    } else if (ts.isTemplateExpression(node)) {
      // For template expressions, collect the text content
      const templateText = node.getText(sourceFile);
      strings.push(templateText);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return strings;
}

/**
 * Checks if a JavaScript/TypeScript source file contains any string literals or template expressions.
 * This is useful for determining if a script file has translatable content.
 *
 * @param sourceFile - The TypeScript SourceFile to analyze
 * @returns true if the file contains at least one string literal or template expression
 */
export function hasStringLiteral(sourceFile: ts.SourceFile): boolean {
  return extractStrings(sourceFile).length > 0;
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

