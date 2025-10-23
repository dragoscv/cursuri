# AACL Semantic Rules v0.1.0

## Validation Rules

### 1. Path Safety Rules

#### Rule: POSIX-Only Paths

**Description**: All file paths must use POSIX forward slash separators.

**Rationale**: Ensures cross-platform compatibility and prevents Windows-specific path issues.

**Validation**:

```typescript
function validatePOSIXPath(path: string): boolean {
  return !path.includes('\\');
}
```

**Examples**:

- ✅ Valid: `"results/output.json"`
- ✅ Valid: `"data/models/agent.bin"`
- ❌ Invalid: `"results\\output.json"`

#### Rule: No Parent Directory References

**Description**: Paths cannot contain `..` to prevent directory traversal.

**Rationale**: Security measure to prevent writes outside designated output areas.

**Validation**:

```typescript
function validateNoParentRef(path: string): boolean {
  const segments = path.split('/');
  return !segments.includes('..');
}
```

**Examples**:

- ✅ Valid: `"results/output.json"`
- ❌ Invalid: `"../../../etc/passwd"`
- ❌ Invalid: `"results/../config.json"`

#### Rule: No Absolute Paths

**Description**: All paths must be relative to the repository root.

**Rationale**: Prevents unintended writes to system directories.

**Validation**:

```typescript
function validateRelativePath(path: string): boolean {
  return !path.startsWith('/') && !/^[A-Za-z]:/.test(path);
}
```

**Examples**:

- ✅ Valid: `"out/results.json"`
- ❌ Invalid: `"/tmp/output.txt"`
- ❌ Invalid: `"C:/Windows/System32/file.dll"`

#### Rule: No HOME Directory Pollution

**Description**: Output paths must not resolve to user HOME directory.

**Rationale**: Prevents unintended modification of user environment.

**Validation**: Runtime check that resolved absolute path is not under HOME.

### 2. Keyword Validation

#### Rule: Known Keywords Only

**Description**: Only recognized keywords are allowed in agent definitions.

**Valid Keywords**:

- `agent`
- `intent`
- `capability`
- `check`
- `emit`
- `expect`
- `true`
- `false`

**Validation**:

```typescript
function validateKeyword(keyword: string): boolean {
  const validKeywords = [
    'agent',
    'intent',
    'capability',
    'check',
    'emit',
    'expect',
    'true',
    'false',
  ];
  return validKeywords.includes(keyword);
}
```

### 3. Type Safety Rules

#### Rule: String Literal Escaping

**Description**: String literals must properly escape special characters.

**Supported Escapes**:

- `\n` - newline
- `\t` - tab
- `\"` - quote
- `\\` - backslash

**Example**:

```aacl
intent "Process files with \"special\" characters\nand newlines";
```

#### Rule: Array Homogeneity

**Description**: Arrays can only contain string literals in v0.1.0.

**Examples**:

- ✅ Valid: `["web", "semantic", "fast"]`
- ❌ Invalid: `["web", 42, true]` (mixed types)

### 4. Capability Validation

#### Rule: Recognized Capability Kinds

**Description**: Capability kinds must be from a predefined set or follow naming conventions.

**Common Kinds**:

- `search` - information retrieval
- `memory` - storage and recall
- `analysis` - data processing
- `communication` - external interactions
- `validation` - checking and verification

**Validation**: Extensible through configuration.

### 5. Check Statement Validation

#### Rule: Valid Check Types

**Description**: Check statements must specify recognized validation types.

**Valid Types**:

- `path` - validate file path safety
- `type` - validate data types
- `security` - security-related checks
- `format` - format validation
- `range` - numeric range checks

**Example**:

```aacl
check path "output" expect "posix-safe";
check type "capability" expect "recognized";
check security "access" expect "read-only";
```

### 6. Emit Target Validation

#### Rule: Valid Output Paths

**Description**: Emit targets must be valid relative paths following all path safety rules.

**Example**:

```aacl
emit "results/analysis.json";  // ✅ Valid
emit "../config.json";         // ❌ Invalid - parent ref
```

## Semantic Error Messages

### Path Errors

- `INVALID_PATH_BACKSLASH`: Path contains backslash character
- `INVALID_PATH_PARENT_REF`: Path contains parent directory reference (..)
- `INVALID_PATH_ABSOLUTE`: Path is absolute, must be relative
- `HOME_POLLUTION_RISK`: Path would resolve to HOME directory

### Keyword Errors

- `UNKNOWN_KEYWORD`: Unrecognized keyword in agent definition
- `UNEXPECTED_TOKEN`: Syntax error in statement

### Type Errors

- `TYPE_MISMATCH`: Value does not match expected type
- `INVALID_ARRAY_ELEMENT`: Array contains non-string element
- `INVALID_ESCAPE_SEQUENCE`: Unknown escape sequence in string

### Capability Errors

- `UNKNOWN_CAPABILITY_KIND`: Capability kind not recognized
- `MISSING_CAPABILITY_ARGS`: Required arguments missing

### Check Errors

- `UNKNOWN_CHECK_TYPE`: Check type not recognized
- `INVALID_EXPECTATION`: Expectation format invalid

## Validation Workflow

1. **Lexical Analysis**: Tokenize input, validate string escapes
2. **Syntax Analysis**: Parse tokens into AST, check structure
3. **Semantic Analysis**: Validate keywords, types, paths
4. **Path Safety Check**: Verify all paths meet safety criteria
5. **Output Validation**: Ensure no HOME pollution, all outputs in designated area

## Runtime Checks

Beyond parse-time validation, runtime must verify:

- Resolved absolute paths stay within repository
- No writes to HOME directory
- File operations succeed atomically (temp → fsync → rename)
- SHA256 verification of critical outputs
