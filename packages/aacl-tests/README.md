# AACL Parser Test Suite

Comprehensive test cases for AACL parser validation.

## Overview

This directory contains test cases organized into two categories:

- `cases/valid/` - Valid AACL files that should parse successfully
- `cases/invalid/` - Invalid AACL files that should fail with specific errors

## Test Categories

### Valid Test Cases

Located in `cases/valid/`:

1. **hello.aacl** - Minimal valid agent definition
   - Basic syntax
   - Simple capabilities
   - Path validation check
   - Single emit statement

### Invalid Test Cases

Located in `cases/invalid/`:

1. **invalid_path.aacl** - Path safety violation
   - Contains parent directory reference (`..`)
   - Should trigger: `INVALID_PATH_PARENT_REF`

## Running Tests

### Manual Testing

```bash
# From repository root
cd packages/aacl-parser

# Test valid case
node -e "
const { parseAACL } = require('./src/parser.ts');
const fs = require('fs');
const source = fs.readFileSync('../aacl-tests/cases/valid/hello.aacl', 'utf8');
const result = parseAACL(source);
console.log('Valid test result:', result.success ? 'PASS' : 'FAIL');
if (!result.success) console.error(result.errors);
"

# Test invalid case
node -e "
const { parseAACL } = require('./src/parser.ts');
const { validatePathSafety } = require('./src/ast.ts');
const fs = require('fs');
const source = fs.readFileSync('../aacl-tests/cases/invalid/invalid_path.aacl', 'utf8');
const result = parseAACL(source);
if (result.success) {
  // Check path safety in emit statements
  result.program.agents.forEach(agent => {
    agent.body.forEach(stmt => {
      if (stmt.type === 'EmitStatement') {
        const check = validatePathSafety(stmt.target.value);
        console.log('Path validation:', check.errors.length > 0 ? 'FAIL (expected)' : 'UNEXPECTED PASS');
      }
    });
  });
}
"
```

### Automated Testing (Future)

```bash
# Install test framework
npm install --save-dev jest @types/jest

# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## Test Structure

Each test case should verify:

1. **Lexical Correctness** - Proper tokenization
2. **Syntax Validity** - AST structure matches grammar
3. **Semantic Rules** - Path safety, keyword validation, type checking

## Adding New Tests

### Valid Test Case Template

```aacl
// Test description: [purpose]
// Expected result: Parse success

agent "test-agent" {
  intent "Test purpose";
  
  capability <kind> ["args"];
  
  check <type> <name> expect "rule";
  
  emit "valid/path.json";
}
```

### Invalid Test Case Template

```aacl
// Test description: [what makes it invalid]
// Expected error: [ERROR_CODE]
// Expected message: [error message]

agent "invalid-agent" {
  // Invalid construct here
}
```

## Test Coverage Goals

- ✅ Basic agent parsing
- ✅ Path safety validation
- ⬜ String escape sequences
- ⬜ Array literals
- ⬜ Comments (line and block)
- ⬜ Multiple agents in one file
- ⬜ All statement types
- ⬜ Error recovery
- ⬜ Edge cases (empty strings, special characters)

## Expected Results

### Valid Cases
All files in `cases/valid/` should:
- Parse without errors (`result.success === true`)
- Generate valid AST
- Pass semantic validation

### Invalid Cases
All files in `cases/invalid/` should:
- Trigger specific parse or validation errors
- Error messages should be clear and actionable
- Error locations should be accurate

## Validation Rules Tested

### Path Safety
- ✅ POSIX separators (no backslashes)
- ✅ No parent references (`..`)
- ✅ No absolute paths
- ⬜ No HOME directory pollution

### Syntax
- ✅ Agent definition structure
- ✅ Statement termination (semicolons)
- ✅ Block delimiters (braces)
- ✅ Array syntax (brackets)

### Semantics
- ✅ Known keywords only
- ⬜ Valid capability kinds
- ⬜ Valid check types
- ⬜ Type consistency

## Integration Testing

For integration with the broader system:

```typescript
// Verify parser can be imported
import { parseAACL } from '../aacl-parser/src/parser';
import { validatePathSafety } from '../aacl-parser/src/ast';

// Verify it works with file system operations
import fs from 'fs';
const source = fs.readFileSync('test.aacl', 'utf8');
const result = parseAACL(source);

// Verify AST can be traversed
if (result.success) {
  result.program.agents.forEach(agent => {
    console.log(`Agent: ${agent.name.value}`);
    agent.body.forEach(stmt => {
      console.log(`  Statement: ${stmt.type}`);
    });
  });
}
```

## Related Documentation

- [AACL Specification](../../docs/aacl/00-SPEC.md)
- [Parser README](../aacl-parser/README.md)
- [Semantic Rules](../../docs/aacl/02-SEMANTICS.md)

## Contributing

When adding tests:
1. Include clear comments explaining the test purpose
2. Document expected outcomes
3. Cover both positive and negative cases
4. Test edge cases and boundary conditions
