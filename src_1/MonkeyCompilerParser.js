
class Node {
    constructor (props) {
        this.tokenLiteral = ""
    }
    getLiteral() {
	    return this.tokenLiteral
	}
}

class Statement extends Node{ 
	statementNode () {
	    return this
	}
}

class Expression extends Node{
    constructor(props) {
        super(props)
        this.tokenLiteral = props.token.getLiteral()
    }
    expressionNode () {
        return this
    }
}

class Identifier extends Expression {
    constructor(props) {
        super(props)
        this.tokenLiteral = props.token.getLiteral()
        this.token = props.token
        this.value = ""
    }
}

class LetStatement extends Statement {
    constructor(props) {
        super(props)
        this.token = props.token
        this.name = props.identifier
        this.value = props.expression
        var s = "This is a Let statement, left is an identifer:"
        s += props.identifer.getLiteral()
        s += " right size is value of "
        s += this.value.getLiteral()
        this.tokenLiteral = s
    }
}

class Program {
	constructor () {
	    this.statements = []
	}

    getLiteral() {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral()
        } else {
            return ""
        }
    }
}

class MonkeyCompilerParser {
    constructor(lexer) {
        this.lexer = lexer
        this.lexer.lexing()
        this.tokenPos = 0
        this.curToken = null
        this.peekToken = null
        this.nextToken()
        this.nextToken()
        this.program = new Program()
    }

    nextToken() {
        /*
        一次必须读入两个token,这样我们才了解当前解析代码的意图
        例如假设当前解析的代码是 5; 那么peekToken就对应的就是
        分号，这样解析器就知道当前解析的代码表示一个整数
        */
        this.curToken = this.peekToken
        this.peekToken = this.lexer.tokens[this.tokenPos]
        this.tokenPos++
    }

    parseProgram() {
        while (this.curToken.getType() !== this.lexer.EOF) {
            var stmt = this.parseStatement()
            if (stmt !== null) {
                this.program.statements.push(stmt)
            }
            this.nextToken()
        }
        return this.program
    }

    parseStatement() {
        switch (this.curToken.getType()) {
            case this.lexer.LET:
              return this.parseLetStatement()
            default:
              return null
        }
    }

    parseLetStatement() {
       var props = {}
       props.token = this.curToken
       //expectPeek 会调用nextToken将curToken转换为
       //下一个token
       if (!this.expectPeek(this.lexer.IDENTIFIER)) {
          return null
       }
       var identProps = {}
       identProps.token = this.curToken
       identProps.value = this.curToken.getLiteral()
       props.identifer = new Identifier(identProps)

       if (!this.expectPeek(this.lexer.ASSIGN_SIGN)) {
           return null
       }

       if (!this.expectPeek(this.lexer.INTEGER)) {
           return null
       }

       var exprProps = {}
       exprProps.token = this.curToken
       props.expression = new Expression(exprProps)
       var letStatement = new LetStatement(props)
       return letStatement
    }

    curTokenIs (tokenType) {
        return this.curToken.getType() === tokenType
    }

    peekTokenIs(tokenType) {
        return this.peekToken.getType() === tokenType
    }

    expectPeek(tokenType) {
        if (this.peekTokenIs(tokenType)) {
            this.nextToken()
            return true
        } else {
            return false
        }
    }
}

export default MonkeyCompilerParser