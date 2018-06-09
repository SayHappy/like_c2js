/*
* auth:郝梓淳
* desc:语法表达式解析
* */

class Node { // 语法树节点
    constructor(props) {
        this.tokenLiteral = '';
        this.type = '';
    }

    getLiteral() {
        return this.tokenLiteral;
    }
}

class Statement extends Node { // 代码块
    statementNode() {
        this.type = 'Statement';
        return this;
    }
}

class Expression extends Node { // 表达式
    constructor(props) {
        super(props);
        this.type = 'Expression';
        this.tokenLiteral = props.token.getLiteral();
    }

    expressionNode() {
        return this;
    }
}

//几种默认表达式
//几种默认表达式
class LetStatement extends Statement {
    constructor(props) {
        super(props);
        this.token = props.token;
        this.name = props.identifier;
        this.value = props.expression;
        let s = "This is a Let statement, left is an identifer:";
        s += props.identifier.getLiteral();
        s += " right size is value of ";
        s += this.value.getLiteral();
        this.tokenLiteral = s;
        this.type = "LetStatement";
    }
}

class ReturnStatement extends Statement {
}

class ExpressionStatement extends Statement {
    constructor(props) {
        super(props);
        this.token = props.token;
        this.expression = props.expression;
        const s = "expression: " + this.expression.getLiteral();
        this.tokenLiteral = s;
        this.type = "ExpressionStatement";
    }
}

class BlockStatement extends Statement {
}

class Identifier extends Expression {
    constructor(props) {
        super(props);
        this.tokenLiteral = props.token.getLiteral();
        this.token = props.token;
        this.value = "";
        // change here
        this.type = "Identifier";
    }
}

class PrefixExpression extends Expression {
    constructor(props) {
        super(props);
        this.token = props.token;
        this.operator = props.operator;
        this.right = props.expression;
        var s = "(" + this.operator + this.right.getLiteral() + " )";
        this.tokenLiteral = s;
        this.type = "PrefixExpression";
    }
}

class InfixExpression extends Expression {
    constructor(props) {
        super(props);
        this.token = props.token;
        this.left = props.leftExpression;
        this.operator = props.operator;
        this.right = props.rightExpression;
        const s = "(" + this.left.getLiteral() + " " + this.operator
            + this.right.getLiteral() + ")";
        this.tokenLiteral = s;
        this.type = "InfixExpression"
    }
}

class IntegerLiteral extends Expression {
    constructor(props) {
        super(props);
        this.token = props.token;
        this.value = props.value;
        const s = "Integer value is: " + this.token.getLiteral();
        this.tokenLiteral = s;
        // change here
        this.type = "Integer";
    }
}

class Boolen extends Expression {
}

class IfExpression extends Expression {
}

class FunctionLiteral extends Expression {
}

class CallExpression extends Expression {
}

//几种默认表达式
//几种默认表达式

class Program {
    constructor() {
        this.statements = [];
        this.type = 'program';
    }

    getLiteral() {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral();
        } else {
            return "";
        }
    }
}

class MonkeyCompilerParser {
    constructor(lexer) {
        this.lexer = lexer; // 调用词法解析器
        this.lexer.lexing();
        this.tokenPos = 0; // 正在读取token的位置
        this.curToken = null; // 前一个Token
        this.peekToken = null;// 后一个token
        this.nextToken();
        this.nextToken(); // 一共读取两个token
        this.program = new Program();

        // 优先级
        this.LOWEST = 0;
        this.EQUALS = 1;
        this.LESSGREATER = 2;
        this.SUM = 3;
        this.PRODUCT = 4;
        this.PREFIX = 5; // 前序
        this.CALL = 6; // 函数执行

        // 前序表达式处理
        // 在处理正常表达式时都需要处理一遍前序表达式

        this.prefixParseFns = new Map();
        this.prefixParseFns[this.lexer.IDENTIFIER] =
            this.parseIdentifier;
        this.prefixParseFns[this.lexer.INTEGER] =
            this.parseIntegerLiteral;
        this.prefixParseFns[this.lexer.BANG_SIGN] =
            this.parsePrefixExpression;
        this.prefixParseFns[this.lexer.MINUS_SIGN] =
            this.parsePrefixExpression;
        // 在这里添加其他规则

        this.initPrecedencesMap();
        this.registerInfixMap();

    }


    // 初始化相关

    // 初始化标运算符优先级
    initPrecedencesMap() {
        this.precedencesMap = new Map();
        this.precedencesMap[this.lexer.EQ] = this.EQUALS;
        this.precedencesMap[this.lexer.NOT_EQ] = this.EQUALS;
        this.precedencesMap[this.lexer.LT] = this.LESSGREATER;
        this.precedencesMap[this.lexer.GT] = this.LESSGREATER;
        this.precedencesMap[this.lexer.PLUS_SIGN] = this.SUM;
        this.precedencesMap[this.lexer.MINUS_SIGN] = this.SUM;
        this.precedencesMap[this.lexer.SLASH] = this.PRODUCT;
        this.precedencesMap[this.lexer.ASTERISK] = this.PRODUCT;
        this.precedencesMap[this.lexer.LEFT_PARENT] = this.CALL;
    }

    // 注册中序表达式
    registerInfixMap() {
        this.infixParseFns = new Map();
        this.infixParseFns[this.lexer.PLUS_SIGN] =
            this.parseInfixExpression;
        this.infixParseFns[this.lexer.MINUS_SIGN] =
            this.parseInfixExpression;
        // this.infixParseFns[this.lexer.SLASH] =
        //     this.parseInfixExpression;
        // this.infixParseFns[this.lexer.ASTERISK] =
        //     this.parseInfixExpression;
        this.infixParseFns[this.lexer.EQ] =
            this.parseInfixExpression;
        // this.infixParseFns[this.lexer.NOT_EQ] =
        //     this.parseInfixExpression;
        // this.infixParseFns[this.lexer.LT] =
        //     this.parseInfixExpression;
        // this.infixParseFns[this.lexer.GT] =
        //     this.parseInfixExpression;
        // //change here
        // this.infixParseFns[this.lexer.LEFT_PARENT] =
        //     this.parseCallExpression;
    }

    // 获取运算符
    peekPrecedence() {
        const p = this.precedencesMap[this.peekToken.getType()];
        if (p !== undefined) {
            return p;
        }

        return this.LOWEST;// 返回0优先级
    }

    curPrecedence() {
        const p = this.precedencesMap[this.curToken.getType()];
        if (p !== undefined) {
            return p;
        }

        return this.LOWEST;
    }

    // 初始化相关

    // 处理token相关
    nextToken() {
        this.curToken = this.peekToken;
        this.peekToken = this.lexer.tokens[this.tokenPos];
        this.tokenPos++;
    }

    curTokenIs(tokenType) {
        return this.curToken.getType() === tokenType;
    }

    peekTokenIs(tokenType) {
        return this.peekToken.getType() === tokenType;
    }

    expectPeek(tokenType) {
        if (this.peekTokenIs(tokenType)) {
            this.nextToken();
            return true
        } else {
            console.log(this.peekError(tokenType));
            return false
        }
    }

    peekError(type) {
        const s = "expected next token to be " +
            this.lexer.getLiteralByTokenType(type)
        return s
    }

    // 处理token相关

    // 执行相关
    parseProgram() {
        while (this.curToken.getType() !== this.lexer.EOF) {
            const stmt = this.parseStatement(); // 读取token后执行解析;
            if (stmt !== null) {
                this.program.statements.push(stmt)
            }
            this.nextToken();
        }
        return this.program;
    }

    parseStatement() {
        switch (this.curToken.getType()) {
            case this.lexer.LET:
                return this.parseLetStatement();
            case this.lexer.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    // 执行相关

    // 解析函数们

    // 解析let
    createIdentifier() {
        const identProps = {};
        identProps.token = this.curToken;
        identProps.value = this.curToken.getLiteral();
        return new Identifier(identProps);
    }

    parseExpression(precedence) {
        // 先处理前序表达式
        let prefix = this.prefixParseFns[this.curToken.getType()];
        if (prefix === null) {
            console.log('no parsing function found for token' +
                this.curToken.getLiteral());
            return null;
        }
        // 用注册的函数调用左表达式
        let leftExp = prefix(this);
        // 当未到达分好接吻
        while (this.peekTokenIs(this.lexer.SEMICOLON) !== true
            && precedence< this.peekPrecedence() // 优先级判断
            ) {
            const infix = this.infixParseFns[this.peekToken.getType()];
            if(infix === null) {
                return leftExp;
            }
            this.nextToken();
            leftExp = infix(this, leftExp);
        }
        return leftExp;
    }

    // 注册中序表达式解析
    parseInfixExpression(caller, left) {
        const props = {};
        props.leftExpression = left;
        props.token = caller.curToken;
        props.operator = caller.curToken.getLiteral();

        const precedence = caller.curPrecedence();
        caller.nextToken();
        props.rightExpression = caller.parseExpression(precedence);
        return new InfixExpression(props);
    }

    parsePrefixExpression(caller) {
        const props = {};
        props.token = caller.curToken;
        props.operator = caller.curToken.getLiteral();
        caller.nextToken();
        props.expression = caller.parseExpression(caller.PREFIX);

        return new PrefixExpression(props);
    }

    parseIdentifier(caller) {
        return caller.createIdentifier;
    }

    parseIntegerLiteral(caller) {
        const intProps = {};
        intProps.token = caller.curToken;
        intProps.value = parseInt(caller.curToken.getLiteral());
        if (isNaN(intProps.value)) {
            console.log("could not parse token as integer");
            return null;
        }

        return new IntegerLiteral(intProps);
    }

    parseLetStatement() {
        let props = {};
        props.token = this.curToken;

        if (!this.expectPeek(this.lexer.IDENTIFIER)) {
            return null;
        }
        // 读取第一个变量
        props.identifier = this.createIdentifier();

        if (!this.expectPeek(this.lexer.ASSIGN_SIGN)) {
            return null;
        }
        // 读取等号后面的表达式
        // const exprProps = {};
        // exprProps.token = this.curToken;

        this.nextToken();
        // 调用表达式处理
        props.expression = this.parseExpression(this.LOWEST);

        if (!this.expectPeek(this.lexer.SEMICOLON)) {
            return null;
        }

        const letStatement = new LetStatement(props);
        console.log(letStatement.getLiteral());
        return letStatement;
    }

    // 解析函数们
}

export default MonkeyCompilerParser