// AST Type Definitions for AACL Parser
// No external dependencies - pure TypeScript types

export type Position = {
    line: number;
    column: number;
    offset: number;
};

export type SourceLocation = {
    start: Position;
    end: Position;
};

export type ASTNode = {
    type: string;
    loc?: SourceLocation;
};

// ============================================================================
// Program and Top-Level Nodes
// ============================================================================

export type Program = ASTNode & {
    type: 'Program';
    agents: AgentDefinition[];
};

export type AgentDefinition = ASTNode & {
    type: 'AgentDefinition';
    name: StringLiteral;
    body: Statement[];
};

// ============================================================================
// Statements
// ============================================================================

export type Statement =
    | IntentStatement
    | CapabilityStatement
    | CheckStatement
    | EmitStatement;

export type IntentStatement = ASTNode & {
    type: 'IntentStatement';
    value: StringLiteral;
};

export type CapabilityStatement = ASTNode & {
    type: 'CapabilityStatement';
    kind: Identifier;
    args?: ArrayLiteral;
};

export type CheckStatement = ASTNode & {
    type: 'CheckStatement';
    checkType: Identifier;
    name: Identifier;
    expectation: StringLiteral;
};

export type EmitStatement = ASTNode & {
    type: 'EmitStatement';
    target: StringLiteral;
};

// ============================================================================
// Literals and Identifiers
// ============================================================================

export type StringLiteral = ASTNode & {
    type: 'StringLiteral';
    value: string;
    raw: string;
};

export type ArrayLiteral = ASTNode & {
    type: 'ArrayLiteral';
    elements: StringLiteral[];
};

export type IntegerLiteral = ASTNode & {
    type: 'IntegerLiteral';
    value: number;
    raw: string;
};

export type BooleanLiteral = ASTNode & {
    type: 'BooleanLiteral';
    value: boolean;
};

export type Identifier = ASTNode & {
    type: 'Identifier';
    name: string;
};

// ============================================================================
// Token Types for Lexer
// ============================================================================

export enum TokenType {
    // Keywords
    AGENT = 'AGENT',
    INTENT = 'INTENT',
    CAPABILITY = 'CAPABILITY',
    CHECK = 'CHECK',
    EMIT = 'EMIT',
    EXPECT = 'EXPECT',
    TRUE = 'TRUE',
    FALSE = 'FALSE',

    // Literals
    STRING = 'STRING',
    INTEGER = 'INTEGER',
    IDENTIFIER = 'IDENTIFIER',

    // Punctuation
    LBRACE = 'LBRACE',
    RBRACE = 'RBRACE',
    LBRACKET = 'LBRACKET',
    RBRACKET = 'RBRACKET',
    SEMICOLON = 'SEMICOLON',
    COMMA = 'COMMA',

    // Special
    EOF = 'EOF',
    NEWLINE = 'NEWLINE',
    WHITESPACE = 'WHITESPACE',
    COMMENT = 'COMMENT',
}

export type Token = {
    type: TokenType;
    value: string;
    loc: SourceLocation;
    raw?: string;
};

// ============================================================================
// Parser Result Types
// ============================================================================

export type ParseResult =
    | { success: true; program: Program; errors: never[] }
    | { success: false; program: null; errors: ParseError[] };

export type ParseError = {
    message: string;
    loc?: SourceLocation;
    type: 'syntax' | 'semantic' | 'lexical';
};

// ============================================================================
// Validation Types
// ============================================================================

export type ValidationRule = {
    name: string;
    validate: (node: ASTNode, context: ValidationContext) => ValidationResult;
};

export type ValidationContext = {
    filePath?: string;
    repoRoot?: string;
    strictMode?: boolean;
};

export type ValidationResult =
    | { valid: true; warnings?: string[] }
    | { valid: false; errors: string[] };

// ============================================================================
// Path Safety Validation
// ============================================================================

export type PathSafetyCheck = {
    hasPOSIXSeparators: boolean;
    noParentReferences: boolean;
    noAbsolutePath: boolean;
    noBackslashes: boolean;
    errors: string[];
};

export function validatePathSafety(path: string): PathSafetyCheck {
    const errors: string[] = [];

    const hasPOSIXSeparators = !path.includes('\\');
    if (!hasPOSIXSeparators) {
        errors.push('INVALID_PATH_BACKSLASH: Path contains backslash character');
    }

    const segments = path.split('/');
    const noParentReferences = !segments.includes('..');
    if (!noParentReferences) {
        errors.push('INVALID_PATH_PARENT_REF: Path contains parent directory reference (..)');
    }

    const noAbsolutePath = !path.startsWith('/') && !(/^[A-Za-z]:/.test(path));
    if (!noAbsolutePath) {
        errors.push('INVALID_PATH_ABSOLUTE: Path is absolute, must be relative');
    }

    const noBackslashes = !path.includes('\\');

    return {
        hasPOSIXSeparators,
        noParentReferences,
        noAbsolutePath,
        noBackslashes,
        errors
    };
}
