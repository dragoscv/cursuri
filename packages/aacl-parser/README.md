# AACL Parser

A zero-dependency TypeScript parser for AACL (AI Agent Course Language).

## Overview

The AACL Parser provides lexical analysis, syntax parsing, and AST generation for AACL source files. It implements a recursive descent parser with comprehensive error handling and semantic validation.

## Features

- ✅ Zero external dependencies
- ✅ Full TypeScript type definitions
- ✅ Comprehensive error reporting
- ✅ Source location tracking
- ✅ Comment support (line and block)
- ✅ String escape sequences
- ✅ Path safety validation

## Installation

```bash
# In the cursuri repository
cd packages/aacl-parser
npm install
npm run build
```

## Usage

### Basic Parsing

```typescript
import { parseAACL } from './packages/aacl-parser/src/parser';

const source = `
agent "hello" {
  intent "A simple greeting agent";
  capability greet ["user", "world"];
  emit "results/output.txt";
}
`;

const result = parseAACL(source);

if (result.success) {
  console.log('Parsed successfully:', result.program);
} else {
  console.error('Parse errors:', result.errors);
}
```

### Using Individual Components

```typescript
import { Lexer } from './packages/aacl-parser/src/lexer';
import { Parser } from './packages/aacl-parser/src/parser';

// Tokenize
const lexer = new Lexer(source);
const tokens = lexer.tokenize();

// Parse
const parser = new Parser(tokens);
const result = Parser.parse(source);
```

### Path Validation

```typescript
import { validatePathSafety } from './packages/aacl-parser/src/ast';

const check = validatePathSafety('results/output.json');

if (check.errors.length > 0) {
  console.error('Path safety errors:', check.errors);
}
```

## API Reference

### `parseAACL(input: string): ParseResult`

Main parsing function that returns a `ParseResult`.

**Returns:**
- `{ success: true, program: Program, errors: [] }` on success
- `{ success: false, program: null, errors: ParseError[] }` on failure

### `class Lexer`

Tokenizes AACL source code.

**Methods:**
- `tokenize(): Token[]` - Returns array of tokens

### `class Parser`

Parses tokens into an AST.

**Static Methods:**
- `parse(input: string): ParseResult` - Parse AACL source

### `validatePathSafety(path: string): PathSafetyCheck`

Validates path according to AACL semantic rules.

**Returns:**
```typescript
{
  hasPOSIXSeparators: boolean;
  noParentReferences: boolean;
  noAbsolutePath: boolean;
  noBackslashes: boolean;
  errors: string[];
}
```

## AST Structure

The parser generates a typed AST with the following node types:

- `Program` - Root node containing agent definitions
- `AgentDefinition` - Agent declaration with body
- `IntentStatement` - Intent declaration
- `CapabilityStatement` - Capability with optional arguments
- `CheckStatement` - Validation check
- `EmitStatement` - Output declaration
- `StringLiteral` - String value
- `ArrayLiteral` - Array of strings
- `Identifier` - Named identifier

## Error Handling

The parser provides detailed error information:

```typescript
type ParseError = {
  message: string;
  loc?: SourceLocation;
  type: 'syntax' | 'semantic' | 'lexical';
};
```

## Examples

See the `examples/aacl/` directory for sample AACL files:

- `hello.aacl` - Minimal example
- `agent-search.aacl` - Advanced example with multiple capabilities

## Semantic Validation

The parser enforces AACL semantic rules:

1. **Path Safety**: POSIX separators, no `..`, no absolute paths
2. **Keyword Validation**: Only recognized keywords allowed
3. **Type Safety**: String escaping, array homogeneity
4. **Capability Validation**: Recognized capability kinds
5. **Check Validation**: Valid check types and expectations

## Development

```bash
# Type check
npx tsc --noEmit

# Run tests (when available)
npm test
```

## Related Documentation

- [AACL Specification](../../docs/aacl/00-SPEC.md)
- [Grammar Definition](../../docs/aacl/01-GRAMMAR.ebnf)
- [Semantic Rules](../../docs/aacl/02-SEMANTICS.md)

## License

Part of the cursuri project.
