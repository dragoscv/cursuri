# AACL Specification v0.1.0

## Overview

AACL (AI Agent Course Language) is a declarative domain-specific language for defining AI agents, their capabilities, validations, and intent declarations.

## Core Concepts

### Agent Definition

An agent is the primary unit in AACL, representing an autonomous AI entity with specific capabilities and behaviors.

```aacl
agent "agent-name" {
  intent "description of agent purpose";
  capability <kind> ["arg1", "arg2"];
  check <type> <name> expect "validation-rule";
  emit <target>;
}
```

### Keywords

- **agent**: Declares a new agent definition
- **intent**: Describes the agent's primary purpose (string literal)
- **capability**: Declares an agent capability with optional arguments
- **check**: Defines validation rules the agent must satisfy
- **emit**: Specifies output targets or artifacts

### Data Types

- **String**: Quoted strings with escape sequences (\n, \t, \", \\)
- **Integer**: Whole numbers (decimal notation)
- **Boolean**: `true` or `false`
- **Array**: Ordered list `["item1", "item2"]`
- **Object**: Key-value pairs `{ key: "value" }`

### Comments

- Single-line: `// comment`
- Multi-line: `/* comment */`

## Semantic Rules

### Path Safety

1. All artifact paths must use POSIX forward slashes (`/`)
2. No backslashes (`\`) allowed in paths
3. No parent directory references (`..`)
4. No absolute paths (must be relative to repository root)
5. All outputs relative to `out/` directory
6. No writes to HOME directory

### Validation

- Unknown keywords are rejected
- Type checking enforced for all literals
- Capability kinds must be recognized
- Check types must be valid

## Example

```aacl
agent "search-assistant" {
  intent "Perform intelligent web searches and synthesize results";

  capability search ["web", "semantic"];
  capability memory ["recall", "store"];

  check path "output" expect "posix-safe";
  check type "capability" expect "recognized";

  emit "results/search-output.json";
}
```

## Reserved Keywords

- agent
- intent
- capability
- check
- emit
- expect
- true
- false

## Future Extensions

- Import/module system
- Agent composition and inheritance
- Conditional capability activation
- Event-driven triggers
