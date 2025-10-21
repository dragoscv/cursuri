// AACL Lexer - Tokenizes AACL source code
// No external dependencies

import { Token, TokenType, Position, SourceLocation } from './ast';

export class Lexer {
    private input: string;
    private position: number;
    private line: number;
    private column: number;
    private tokens: Token[];

    constructor(input: string) {
        this.input = input;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
    }

    public tokenize(): Token[] {
        while (this.position < this.input.length) {
            this.skipWhitespaceAndComments();

            if (this.position >= this.input.length) {
                break;
            }

            const token = this.nextToken();
            if (token) {
                this.tokens.push(token);
            }
        }

        // Add EOF token
        this.tokens.push({
            type: TokenType.EOF,
            value: '',
            loc: this.currentLocation(),
        });

        return this.tokens;
    }

    private nextToken(): Token | null {
        const start = this.currentPosition();
        const char = this.currentChar();

        // String literals
        if (char === '"') {
            return this.readString();
        }

        // Numbers
        if (this.isDigit(char) || (char === '-' && this.isDigit(this.peekChar()))) {
            return this.readNumber();
        }

        // Identifiers and keywords
        if (this.isIdentifierStart(char)) {
            return this.readIdentifierOrKeyword();
        }

        // Single-character tokens
        switch (char) {
            case '{':
                this.advance();
                return this.makeToken(TokenType.LBRACE, '{', start);
            case '}':
                this.advance();
                return this.makeToken(TokenType.RBRACE, '}', start);
            case '[':
                this.advance();
                return this.makeToken(TokenType.LBRACKET, '[', start);
            case ']':
                this.advance();
                return this.makeToken(TokenType.RBRACKET, ']', start);
            case ';':
                this.advance();
                return this.makeToken(TokenType.SEMICOLON, ';', start);
            case ',':
                this.advance();
                return this.makeToken(TokenType.COMMA, ',', start);
            default:
                throw new Error(`Unexpected character: ${char} at line ${this.line}, column ${this.column}`);
        }
    }

    private readString(): Token {
        const start = this.currentPosition();
        let value = '';
        let raw = '';

        this.advance(); // Skip opening quote
        raw += '"';

        while (this.position < this.input.length && this.currentChar() !== '"') {
            if (this.currentChar() === '\\') {
                raw += this.currentChar();
                this.advance();

                const escapeChar = this.currentChar();
                raw += escapeChar;

                switch (escapeChar) {
                    case 'n':
                        value += '\n';
                        break;
                    case 't':
                        value += '\t';
                        break;
                    case '"':
                        value += '"';
                        break;
                    case '\\':
                        value += '\\';
                        break;
                    default:
                        throw new Error(`Invalid escape sequence: \\${escapeChar}`);
                }
                this.advance();
            } else {
                const char = this.currentChar();
                value += char;
                raw += char;
                this.advance();
            }
        }

        if (this.currentChar() !== '"') {
            throw new Error(`Unterminated string at line ${this.line}`);
        }

        this.advance(); // Skip closing quote
        raw += '"';

        return {
            type: TokenType.STRING,
            value,
            raw,
            loc: this.makeLocation(start),
        };
    }

    private readNumber(): Token {
        const start = this.currentPosition();
        let value = '';

        if (this.currentChar() === '-') {
            value += this.currentChar();
            this.advance();
        }

        while (this.isDigit(this.currentChar())) {
            value += this.currentChar();
            this.advance();
        }

        return {
            type: TokenType.INTEGER,
            value,
            raw: value,
            loc: this.makeLocation(start),
        };
    }

    private readIdentifierOrKeyword(): Token {
        const start = this.currentPosition();
        let value = '';

        while (this.isIdentifierPart(this.currentChar())) {
            value += this.currentChar();
            this.advance();
        }

        // Check if it's a keyword
        const type = this.getKeywordType(value);

        return {
            type,
            value,
            loc: this.makeLocation(start),
        };
    }

    private getKeywordType(value: string): TokenType {
        const keywords: Record<string, TokenType> = {
            agent: TokenType.AGENT,
            intent: TokenType.INTENT,
            capability: TokenType.CAPABILITY,
            check: TokenType.CHECK,
            emit: TokenType.EMIT,
            expect: TokenType.EXPECT,
            true: TokenType.TRUE,
            false: TokenType.FALSE,
        };

        return keywords[value] || TokenType.IDENTIFIER;
    }

    private skipWhitespaceAndComments(): void {
        while (this.position < this.input.length) {
            const char = this.currentChar();

            // Skip whitespace
            if (this.isWhitespace(char)) {
                this.advance();
                continue;
            }

            // Skip line comments
            if (char === '/' && this.peekChar() === '/') {
                this.advance(); // Skip first /
                this.advance(); // Skip second /
                while (this.position < this.input.length && this.currentChar() !== '\n') {
                    this.advance();
                }
                continue;
            }

            // Skip block comments
            if (char === '/' && this.peekChar() === '*') {
                this.advance(); // Skip /
                this.advance(); // Skip *
                while (this.position < this.input.length - 1) {
                    if (this.currentChar() === '*' && this.peekChar() === '/') {
                        this.advance(); // Skip *
                        this.advance(); // Skip /
                        break;
                    }
                    this.advance();
                }
                continue;
            }

            break;
        }
    }

    private currentChar(): string {
        return this.input[this.position] || '';
    }

    private peekChar(): string {
        return this.input[this.position + 1] || '';
    }

    private advance(): void {
        if (this.currentChar() === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        this.position++;
    }

    private isWhitespace(char: string): boolean {
        return /\s/.test(char);
    }

    private isDigit(char: string): boolean {
        return /[0-9]/.test(char);
    }

    private isIdentifierStart(char: string): boolean {
        return /[a-zA-Z_]/.test(char);
    }

    private isIdentifierPart(char: string): boolean {
        return /[a-zA-Z0-9_-]/.test(char);
    }

    private currentPosition(): Position {
        return {
            line: this.line,
            column: this.column,
            offset: this.position,
        };
    }

    private currentLocation(): SourceLocation {
        const pos = this.currentPosition();
        return { start: pos, end: pos };
    }

    private makeLocation(start: Position): SourceLocation {
        return {
            start,
            end: this.currentPosition(),
        };
    }

    private makeToken(type: TokenType, value: string, start: Position): Token {
        return {
            type,
            value,
            loc: this.makeLocation(start),
        };
    }
}
