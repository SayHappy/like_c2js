/*
* author:郝栩彬
* date:2018年5月18日
* des:词法解析器
* */

class Token { // 单个token信息
    constructor(type, literal, lineNumber) {
        this.type = type;
        this.literal = literal;
        this.lineNumber = lineNumber;
    }

    getType() {
        return this.type;
    }

    getLiteral() {
        return this.literal;
    }

    getLineNumber() {
        return this.lineNumber;
    }
}

class MonkeyLexer { // 词法解析器类
    constructor(sourceCode) {
        this.initTokenType(); // 初始化所有标识符类型
        this.initKeywords();
        this.sourceCode = sourceCode;
        this.position = 0;
        this.readPosition = 0; // 读取位置
        this.lineCount = 0; // 行数
        this.ch = ''; // 读取到的字符

        this.observer = null;
        this.observerContext = null;

    }

    initTokenType() {
        this.ILLEGAL = -2;
        this.EOF = -1; // 结尾
        this.LET = 0;
        this.IDENTIFIER = 1; // 变量
        this.ASSIGN_SIGN = 2; // 等号
        this.PLUS_SIGN = 3; // 加号
        this.INTEGER = 4; // 数字
        this.SEMICOLON = 5; // 分号

        this.MINUS_SIGN = 8; // 负号
        this.BANG_SIGN = 9;
        this.ASTERISK = 10; // 称号
        this.SLASH = 11; // 除法
        this.LT = 12; // 大于号
        this.GT = 13; // 小于号
        this.COMMA = 14; // 逗号

        this.FUNCTION = 15;
        this.TRUE = 16;
        this.FALSE = 17;
        this.RETURN = 18;

        this.LEFT_BRACE = 19;
        this.RIGHT_BRACE = 20;
        this.EQ = 21;
        this.NOT_EQ = 22;
        this.LEFT_ = 23;
        this.RIGHT_PARENT = 24;
    }

    initKeywords() { // 初始化关键词
        this.keyWordMap = new Map();
        this.keyWordMap['let'] = new Token(this.LET, 'let', 0);
        this.keyWordMap['if'] = new Token(this.IF, 'if', 0);
        this.keyWordMap['else'] = new Token(this.ELSE, 'else', 0);
        this.keyWordMap['fn'] = new Token(this.FUNCTION, 'fn', 0);
        this.keyWordMap['true'] = new Token(this.TRUE, 'true', 0);
        this.keyWordMap['false'] = new Token(this.FALSE, 'false', 0);
        this.keyWordMap['return'] = new Token(this.RETURN, ' return', 0)

    }

    readChar() { // 字符读取
        if (this.readPosition >= this.sourceCode.length) {
            this.ch = -1
        } else {
            this.ch = this.sourceCode[this.readPosition];
        }

        this.readPosition++;
    }

    peekChar() { // 获取下一个字符
        if (this.readPosition >= this.sourceCode.length) {
            return 0;
        } else {
            return this.sourceCode[this.readPosition];
        }
    }

    skipWhiteSpaceAndNewLine() { // 跳过空行
        while (this.ch === ' ' || this.ch === '\t'
        || this.ch === '\u00a0'
        || this.ch === '\n') {
            if (this.ch === '\t' || this.ch === '\n') {
                this.lineCount++;
            }
            this.readChar();
        }
    }

    nextToken() {
        let tok;
        this.skipWhiteSpaceAndNewLine();
        let lineCount = this.lineCount;
        let needReadChar = true;
        this.position = this.readPosition;

        switch (this.ch) {
            case '=':
                if (this.peekChar() === '=') {
                    this.readChar();
                    tok = new Token(this.Eq, '==', lineCount)
                } else {
                    tok = new Token(this.ASSIGN_SIGN, '=', lineCount);
                }
                break;
            case ';':
                tok = new Token(this.SEMICOLON, ';', lineCount);
                break;
            case '+':
                tok = new Token(this.PLUS_SIGN, '+', lineCount);
                break;
            case -1:
                tok = new Token(this.EOF, '', lineCount);
                break;
            case '-':
                tok = new Token(this.MINUS_SIGN, '-', lineCount);
                break;
            case '!':
                if (this.peekChar() === '=') {
                    this.readChar();
                    tok = new Token(this.NOT_EQ, '!=', lineCount);
                } else {
                    tok = new Token(this.BANG_SIGN, '!', lineCount);
                }
                break;
            case '*':
                tok = new Token(this.ASTERISK, '*', lineCount);
                break;
            case '/':
                tok = new Token(this.SLASH, '/', lineCount);
                break;
            case '<':
                tok = new Token(this.LT, '<', lineCount);
                break;
            case '>':
                tok = new Token(this.GT, '>', lineCount);
                break;
            case ',':
                tok = new Token(this.COMMA, ',', lineCount);
                break;
            case '{':
                tok = new Token(this.LEFT_BRACE, '{', lineCount);
                break;
            case '}':
                tok = new Token(this.RIGHT_BRACE, '}', lineCount);
                break;
            case '(':
                tok = new Token(this.LEFT_PARENT, '(', lineCount);
                break;
            case ')':
                tok = new Token(this.RIGHT_BRACE, ')', lineCount);
                break;
            default:
                let res = this.readIdentifier();
                if (res !== false) {
                    if (this.keyWordMap[res] !== undefined) {
                        tok = this.keyWordMap[res]; // 返回关键字
                    } else {
                        tok = new Token(this.IDENTIFIER, res, lineCount);
                    }
                } else {
                    res = this.readNumber();
                    if (res !== false) {
                        tok = new Token(this.INTEGER, res, lineCount);
                    }
                }
                if (res === false) {
                    tok = undefined;
                }
                needReadChar = false;
        }
        if (needReadChar === true) {
            this.readChar();
        }
        if (tok !== undefined) {
            this.notifyObserver(tok); // 记录每个TOKEN前后信息
        }
        return tok;
    }

    notifyObserver(token) { // 通知观察者
        if(this.observer !== null) {
            this.observer.notifyTokenCreation(token,
                this.observerContext, this.position-1,
                this.readPosition)
        }
    }

    isLetter(ch) {
        const regx = /^[_a-zA-Z]$/;
        return regx.test(ch);
    }

    readIdentifier() { // 变量读取
        let identifier = '';
        while (this.isLetter(this.ch)) {
            identifier += this.ch;
            this.readChar();
        }

        return identifier.length > 0 ? identifier : false;
    }

    isDigit(ch) { // 判断数字
        const regx = /^[0-9]$/;
        return regx.test(ch);
    }

    readNumber() {
        let number = '';
        while (this.isDigit(this.ch)) {
            number += this.ch;
            this.readChar()
        }
        return number.length > 0 ? number : false;
    }

    lexing() {
        this.readChar(); // 读取第一个字符
        this.tokens = [];
        let token = this.nextToken();
        while (token !== undefined && token.getType() !== this.EOF){
            this.tokens.push(token);
            token = this.nextToken();
        }
        this.tokens.push(token);
    }
}

export default MonkeyLexer;