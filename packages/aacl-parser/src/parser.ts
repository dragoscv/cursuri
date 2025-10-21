// AACL Parser - Recursive Descent Parser
// No external dependencies

import { Token, TokenType, ParseResult, ParseError, Program, AgentDefinition, Statement, IntentStatement, CapabilityStatement, CheckStatement, EmitStatement, StringLiteral, ArrayLiteral, Identifier, SourceLocation } from './ast';
import { Lexer } from './lexer';

export class Parser {
    private tokens: Token[];
    private position: number;
    private errors: ParseError[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.position = 0;
        this.errors = [];
    }

    public static parse(input: string): ParseResult {
        try {
            const lexer = new Lexer(input);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const program = parser.parseProgram();

            if (parser.errors.length > 0) {
                return {
                    success: false,
                    program: null,
                    errors: parser.errors,
                };
            }

            return {
                success: true,
                program,
                errors: [],
            };
        } catch (error) {
            return {
                success: false,
                program: null,
                errors: [{
                    message: error instanceof Error ? error.message : String(error),
                    type: 'lexical',
                }],
            };
        }
    }

    private parseProgram(): Program {
        const agents: AgentDefinition[] = [];

        while (!this.isAtEnd()) {
            if (this.check(TokenType.EOF)) {
                break;
            }

            try {
                const agent = this.parseAgentDefinition();
                agents.push(agent);
            } catch (error) {
                this.errors.push({
                    message: error instanceof Error ? error.message : String(error),
                    loc: this.currentToken().loc,
                    type: 'syntax',
                });
                this.synchronize();
            }
        }

        return {
            type: 'Program',
            agents,
        };
    }

    private parseAgentDefinition(): AgentDefinition {
        const startLoc = this.currentToken().loc;

        this.consume(TokenType.AGENT, 'Expected "agent" keyword');

        const name = this.parseStringLiteral();

        this.consume(TokenType.LBRACE, 'Expected "{" after agent name');

        const body: Statement[] = [];
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            body.push(this.parseStatement());
        }

        this.consume(TokenType.RBRACE, 'Expected "}" to close agent body');

        return {
            type: 'AgentDefinition',
            name,
            body,
            loc: this.combineLocations(startLoc, this.previousToken().loc),
        };
    }

    private parseStatement(): Statement {
        if (this.check(TokenType.INTENT)) {
            return this.parseIntentStatement();
        }
        if (this.check(TokenType.CAPABILITY)) {
            return this.parseCapabilityStatement();
        }
        if (this.check(TokenType.CHECK)) {
            return this.parseCheckStatement();
        }
        if (this.check(TokenType.EMIT)) {
            return this.parseEmitStatement();
        }

        throw new Error(`Unexpected token: ${this.currentToken().value}`);
    }

    private parseIntentStatement(): IntentStatement {
        const startLoc = this.currentToken().loc;

        this.advance(); // consume 'intent'

        const value = this.parseStringLiteral();

        this.consume(TokenType.SEMICOLON, 'Expected ";" after intent statement');

        return {
            type: 'IntentStatement',
            value,
            loc: this.combineLocations(startLoc, this.previousToken().loc),
        };
    }

    private parseCapabilityStatement(): CapabilityStatement {
        const startLoc = this.currentToken().loc;

        this.advance(); // consume 'capability'

        const kind = this.parseIdentifier();

        let args: ArrayLiteral | undefined;
        if (this.check(TokenType.LBRACKET)) {
            args = this.parseArrayLiteral();
        }

        this.consume(TokenType.SEMICOLON, 'Expected ";" after capability statement');

        return {
            type: 'CapabilityStatement',
            kind,
            args,
            loc: this.combineLocations(startLoc, this.previousToken().loc),
        };
    }

    private parseCheckStatement(): CheckStatement {
        const startLoc = this.currentToken().loc;

        this.advance(); // consume 'check'

        const checkType = this.parseIdentifier();
        const name = this.parseIdentifier();

        this.consume(TokenType.EXPECT, 'Expected "expect" in check statement');

        const expectation = this.parseStringLiteral();

        this.consume(TokenType.SEMICOLON, 'Expected ";" after check statement');

        return {
            type: 'CheckStatement',
            checkType,
            name,
            expectation,
            loc: this.combineLocations(startLoc, this.previousToken().loc),
        };
    }

    private parseEmitStatement(): EmitStatement {
        const startLoc = this.currentToken().loc;

        this.advance(); // consume 'emit'

        const target = this.parseStringLiteral();

        this.consume(TokenType.SEMICOLON, 'Expected ";" after emit statement');

        return {
            type: 'EmitStatement',
            target,
            loc: this.combineLocations(startLoc, this.previousToken().loc),
        };
    }

    private parseStringLiteral(): StringLiteral {
        const token = this.currentToken();

        if (token.type !== TokenType.STRING) {
            throw new Error(`Expected string literal, got ${token.type}`);
        }

        this.advance();

        return {
            type: 'StringLiteral',
            value: token.value,
            raw: token.raw || token.value,
            loc: token.loc,
        };
    }

    private parseArrayLiteral(): ArrayLiteral {
        const startLoc = this.currentToken().loc;

        this.consume(TokenType.LBRACKET, 'Expected "["');

        const elements: StringLiteral[] = [];

        if (!this.check(TokenType.RBRACKET)) {
            do {
                elements.push(this.parseStringLiteral());
            } while (this.match(TokenType.COMMA));
        }

        this.consume(TokenType.RBRACKET, 'Expected "]"');

        return {
            type: 'ArrayLiteral',
            elements,
            loc: this.combineLocations(startLoc, this.previousToken().loc),
        };
    }

    private parseIdentifier(): Identifier {
        const token = this.currentToken();

        if (token.type !== TokenType.IDENTIFIER) {
            throw new Error(`Expected identifier, got ${token.type}`);
        }

        this.advance();

        return {
            type: 'Identifier',
            name: token.value,
            loc: token.loc,
        };
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.currentToken().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) {
            this.position++;
        }
        return this.previousToken();
    }

    private isAtEnd(): boolean {
        return this.currentToken().type === TokenType.EOF || this.position >= this.tokens.length;
    }

    private currentToken(): Token {
        return this.tokens[this.position] || this.tokens[this.tokens.length - 1];
    }

    private previousToken(): Token {
        return this.tokens[this.position - 1];
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) {
            return this.advance();
        }

        throw new Error(`${message} at line ${this.currentToken().loc.start.line}`);
    }

    private synchronize(): void {
        this.advance();

        while (!this.isAtEnd()) {
            if (this.previousToken().type === TokenType.SEMICOLON) {
                return;
            }

            switch (this.currentToken().type) {
                case TokenType.AGENT:
                case TokenType.INTENT:
                case TokenType.CAPABILITY:
                case TokenType.CHECK:
                case TokenType.EMIT:
                    return;
            }

            this.advance();
        }
    }

    private combineLocations(start: SourceLocation, end: SourceLocation): SourceLocation {
        return {
            start: start.start,
            end: end.end,
        };
    }
}

// Convenience function
export function parseAACL(input: string): ParseResult {
    return Parser.parse(input);
}
