
class Node {
    constructor (props) {
      // change here
        this.tokenLiteral = ""
        this.type = ""
    }
    getLiteral() {
	    return this.tokenLiteral
	}
}

class Statement extends Node{ 
	statementNode () {
      this.type = "Statement"
	    return this
	}
}

class Expression extends Node{
    constructor(props) {
        super(props)
        this.type = "Expression"
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
        // change here
        this.type = "Identifier"
    }
}

class LetStatement extends Statement {
    constructor(props) {
        super(props)
        this.token = props.token
        this.name = props.identifier
        this.value = props.expression
        var s = "This is a Let statement, left is an identifer:"
        s += props.identifier.getLiteral()
        s += " right size is value of "
        s += this.value.getLiteral()
        this.tokenLiteral = s

        // change here
        this.type = "LetStatement"
    }
}

class ReturnStatement extends Statement{
  constructor(props) {
    super(props)
    this.token = props.token
    this.expression = props.expression
    var s = "return with " + this.expression.getLiteral()
    this.tokenLiteral = s
    this.type = "ReturnStatement"
  }
}


class ExpressionStatement extends Statement {
  constructor(props) {
    super(props)
    this.token = props.token
    this.expression = props.expression
    var s = "expression: " + this.expression.getLiteral()
    this.tokenLiteral = s
    this.type = "ExpressionStatement"
  }
}

class PrefixExpression extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.operator = props.operator
    this.right = props.expression
    var s = "(" + this.operator + this.right.getLiteral() + " )"
    this.tokenLiteral = s
    this.type = "PrefixExpression"
  }
}

class InfixExpression extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.left = props.leftExpression
    this.operator = props.operator
    this.right = props.rightExpression
    var s = "(" + this.left.getLiteral() + " " + this.operator 
            + this.right.getLiteral() + ")"
    this.tokenLiteral = s
    this.type = "InfixExpression"
  }
}

class IntegerLiteral extends Expression {
    constructor(props) {
        super(props)
        this.token = props.token
        this.value = props.value
        var s = "Integer value is: " + this.token.getLiteral()
        this.tokenLiteral = s
        // change here
        this.type = "Integer"
    }
}

//change here 
class Boolean extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.value = props.value
    var s = "Boolean token with value of " + this.value
    this.tokenLiteral = s
    //change here
    this.type = "Boolean"
  }
}

class BlockStatement extends Statement {
  constructor(props) {
    super(props)
    this.token = props.token
    this.statements = props.statements

    var s = ""
    for (var i = 0; i < this.statements.length; i++) {
      s += this.statements[i].getLiteral()
      s += "\n"
    }

    this.tokenLiteral = s
    // change here
    this.type = "blockStatement"
  }

}

class IfExpression extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.condition = props.condition
    this.consequence = props.consequence
    this.alternative = props.alternative

    var s = "if expression width condtion: " + 
    this.condition.getLiteral()
    s += "\n statements in if block are: "
    s += this.consequence.getLiteral()
    if (this.alternative) {
      s += "\n statements in else block are: "
      s += this.alternative.getLiteral()
    }
    this.tokenLiteral = s

    //change here
    this.type = "IfExpression"
  }
}

class FunctionLiteral extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.parameters = props.parameters
    this.body = props.body

    var s = "It is a nameless function," 

    s += "input parameters are: ("
    for (var i = 0; i < this.parameters.length; i++) {
      s += this.parameters[i].getLiteral()
      s += "\n"
    }
    s += ")\n"

    s += "statements in function body are : {"
    s += this.body.getLiteral()
    s += "}"

    this.tokenLiteral = s

    this.type = "FunctionLiteral"
  }
}

class CallExpression extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.function = props.function
    this.arguments = props.arguments

    var s = "It is a function call : " + 
    this.function.getLiteral()

    s += "\n It is input parameters are: ("
    for (var i = 0; i < this.arguments.length; i++) {
      s += "\n" 
      s += this.arguments[i].getLiteral()
      s += ",\n"
    }

    s += ")"
    this.tokenLiteral = s

    this.type = "CallExpression"
  }
}

class Program {
	constructor () {
	    this.statements = []
      // change 3
      this.type = "program"
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

        this.LOWEST = 0
        this.EQUALS = 1  // ==
        this.LESSGREATER = 2 // < or >
        this.SUM = 3
        this.PRODUCT = 4
        this.PREFIX = 5 //-X or !X
        this.CALL = 6  //myFunction(X)

        this.prefixParseFns = {}
        this.prefixParseFns[this.lexer.IDENTIFIER] = 
        this.parseIdentifier
        this.prefixParseFns[this.lexer.INTEGER] = 
        this.parseIntegerLiteral
        this.prefixParseFns[this.lexer.BANG_SIGN] = 
        this.parsePrefixExpression
        this.prefixParseFns[this.lexer.MINUS_SIGN] =
        this.parsePrefixExpression
        //change here
        this.prefixParseFns[this.lexer.TRUE] = 
        this.parseBoolean
        this.prefixParseFns[this.lexer.FALSE] = 
        this.parseBoolean
        this.prefixParseFns[this.lexer.LEFT_PARENT] = 
        this.parseGroupedExpression
        this.prefixParseFns[this.lexer.IF] = 
        this.parseIfExpression
        this.prefixParseFns[this.lexer.FUNCTION] = 
        this.parseFunctionLiteral

        this.initPrecedencesMap()
        this.registerInfixMap()
    }

    initPrecedencesMap() {
      this.precedencesMap = {}
      this.precedencesMap[this.lexer.EQ] = this.EQUALS
      this.precedencesMap[this.lexer.NOT_EQ] = this.EQUALS
      this.precedencesMap[this.lexer.LT] = this.LESSGREATER
      this.precedencesMap[this.lexer.GT] = this.LESSGREATER
      this.precedencesMap[this.lexer.PLUS_SIGN] = this.SUM
      this.precedencesMap[this.lexer.MINUS_SIGN] = this.SUM
      this.precedencesMap[this.lexer.SLASH] = this.PRODUCT
      this.precedencesMap[this.lexer.ASTERISK] = this.PRODUCT
      this.precedencesMap[this.lexer.LEFT_PARENT] = this.CALL
    }

    peekPrecedence() {
      var p = this.precedencesMap[this.peekToken.getType()]
      if (p !== undefined) {
        return p
      }

      return this.LOWEST
    }

    curPrecedence() {
      var p = this.precedencesMap[this.curToken.getType()]
      if (p !== undefined) {
        return p
      }

      return this.LOWEST
    }

    registerInfixMap() {
      this.infixParseFns = {}
      this.infixParseFns[this.lexer.PLUS_SIGN] = 
      this.parseInfixExpression
      this.infixParseFns[this.lexer.MINUS_SIGN] = 
      this.parseInfixExpression
      this.infixParseFns[this.lexer.SLASH] = 
      this.parseInfixExpression
      this.infixParseFns[this.lexer.ASTERISK] = 
      this.parseInfixExpression
      this.infixParseFns[this.lexer.EQ] = 
      this.parseInfixExpression
      this.infixParseFns[this.lexer.NOT_EQ] = 
      this.parseInfixExpression
      this.infixParseFns[this.lexer.LT] = 
      this.parseInfixExpression
      this.infixParseFns[this.lexer.GT] = 
      this.parseInfixExpression
      //change here
      this.infixParseFns[this.lexer.LEFT_PARENT] = 
      this.parseCallExpression
    }

    parseInfixExpression(caller, left) {
      var props = {}
      props.leftExpression = left
      props.token = caller.curToken
      props.operator = caller.curToken.getLiteral()

      var precedence = caller.curPrecedence()
      caller.nextToken()
      props.rightExpression = caller.parseExpression(precedence)
      return new InfixExpression(props)
    }

    //change here
    parseBoolean(caller) {
      var props = {}
      props.token = caller.curToken
      props.value = caller.curTokenIs(caller.lexer.TRUE)
      return new Boolean(props)
    }
    //change here
    parseGroupedExpression(caller) {
      caller.nextToken()
      var exp = caller.parseExpression(caller.LOWEST)
      if (caller.expectPeek(caller.lexer.RIGHT_PARENT)
          !== true) {
        return null
      }

      return exp
    }

    //change here
    parseIfExpression(caller) {
      var props = {}
      props.token = caller.curToken
      if (caller.expectPeek(caller.lexer.LEFT_PARENT) !==
       true) {
        return null
      }

      caller.nextToken()
      props.condition = caller.parseExpression(caller.LOWEST)

      if (caller.expectPeek(caller.lexer.RIGHT_PARENT) !==
       true) {
        return null
      }

      if (caller.expectPeek(caller.lexer.LEFT_BRACE) !==
       true) {
        return null
      }

      props.consequence = caller.parseBlockStatement(caller)

      if (caller.peekTokenIs(caller.lexer.ELSE) === true) {
        caller.nextToken()
        if (caller.expectPeek(caller.lexer.LEFT_BRACE) !==
         true) {
          return null
        }

        props.alternative = caller.parseBlockStatement(caller)
      }

      return new IfExpression(props)
    }
    // change here
    parseBlockStatement(caller) {
      var props = {}
      props.token = caller.curToken
      props.statements = []

      caller.nextToken()

      while (caller.curTokenIs(caller.lexer.RIGHT_BRACE) !== true) {
        var stmt = caller.parseStatement()
        if (stmt != null) {
          props.statements.push(stmt)
        }

        caller.nextToken()
      }

      return new BlockStatement(props)
    }

    //change here
    parseFunctionLiteral(caller) {
      var props = {}
      props.token = caller.curToken

      if (caller.expectPeek(caller.lexer.LEFT_PARENT) !== true) {
        return null
      }

      props.parameters = caller.parseFunctionParameters(caller)

      if (caller.expectPeek(caller.lexer.LEFT_BRACE) !== true) {
        return null
      }

      props.body = caller.parseBlockStatement(caller)

      return new FunctionLiteral(props)
    }

    //change here
    parseFunctionParameters(caller) {
      var parameters = []
      if (caller.peekTokenIs(caller.lexer.RIGHT_PARENT)) {
        caller.nextToken()
        return parameters
      }

      caller.nextToken()
      var identProp = {}
      identProp.token = caller.curToken
      parameters.push(new Identifier(identProp))

      while (caller.peekTokenIs(caller.lexer.COMMA)) {
        caller.nextToken()
        caller.nextToken()
        var ident = {}
        ident.token = caller.curToken
        parameters.push(new Identifier(ident))
      }

      if (caller.expectPeek(caller.lexer.RIGHT_PARENT) !==
       true) {
        return null
      }

      return parameters
    }

    //change here
    parseCallExpression(caller, fun) {
      var props = {}
      props.token = caller.curToken
      props.function = fun
      props.arguments = caller.parseCallArguments(caller)

      return new CallExpression(props)
    }

    //change here
    parseCallArguments(caller) {
      var args = []
      if (caller.peekTokenIs(caller.lexer.RIGHT_PARENT)) {
        caller.nextToken()
        return args
      }

      caller.nextToken()
      args.push(caller.parseExpression(caller.LOWEST))

      while(caller.peekTokenIs(caller.lexer.COMMA)) {
        caller.nextToken()
        caller.nextToken()
        args.push(caller.parseExpression(caller.LOWEST))
      }

      if (caller.expectPeek(caller.lexer.RIGHT_PARENT)
        !== true) {
        return null
      }

      return args
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
            case this.lexer.RETURN:
              return this.parseReturnStatement()
            default:
              return this.parseExpressionStatement()
        }
    }

    parseReturnStatement() {
      var props = {}
      props.token = this.curToken

      var exprProps = {}
      exprProps.token = this.curToken;
      // change here
      this.nextToken()
      props.expression = this.parseExpression(this.LOWEST)

      if (!this.expectPeek(this.lexer.SEMICOLON)) {
           return null
       }

      return new ReturnStatement(props) 
    }

    createIdentifier() {
       var identProps = {}
       identProps.token = this.curToken
       identProps.value = this.curToken.getLiteral()
       return new Identifier(identProps)
    }

    parseLetStatement() {
       var props = {}
       props.token = this.curToken
       //expectPeek 会调用nextToken将curToken转换为
       //下一个token
       if (!this.expectPeek(this.lexer.IDENTIFIER)) {
          return null
       }

       props.identifier = this.createIdentifier()

       if (!this.expectPeek(this.lexer.ASSIGN_SIGN)) {
           return null
       }

       var exprProps = {}
       exprProps.token = this.curToken
       // change here
       this.nextToken()
       props.expression = this.parseExpression(this.LOWEST)

       if (!this.expectPeek(this.lexer.SEMICOLON)) {
           return null
       }

       var letStatement = new LetStatement(props)
       return letStatement
    }

    parseExpressionStatement() {
       var props = {}
       props.token = this.curToken
       props.expression = this.parseExpression(this.LOWEST)
       var stmt = new ExpressionStatement(props)

       if (this.peekTokenIs(this.lexer.SEMICOLON)) {
           this.nextToken()
       }

       return stmt
    }

    parseExpression(precedence) {
        var prefix = this.prefixParseFns[this.curToken.getType()]
        if (prefix === null) {
            console.log("no parsing function found for token " + 
              this.curToken.getLiteral())
            return null
        }

        var leftExp = prefix(this)
        while (this.peekTokenIs(this.lexer.SEMICOLON) !== true &&
            precedence < this.peekPrecedence()) {
          var infix = this.infixParseFns[this.peekToken.getType()]
          if (infix === null) {
            return leftExp
          }

          this.nextToken()
          leftExp = infix(this, leftExp)
        }

        return leftExp
    }

    parseIdentifier(caller) {
        return caller.createIdentifier()
    }

    parseIntegerLiteral(caller) {
      var intProps = {}
      intProps.token = caller.curToken
      intProps.value = parseInt(caller.curToken.getLiteral(), 10)
      if (isNaN(intProps.value)) {
          console.log("could not parse token as integer")
          return null
      }

      return new IntegerLiteral(intProps)
    }

    parsePrefixExpression(caller) {
      var props = {}
      props.token = caller.curToken
      props.operator = caller.curToken.getLiteral()
      caller.nextToken()
      props.expression = caller.parseExpression(caller.PREFIX)

      return new PrefixExpression(props)
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
            console.log(this.peekError(tokenType))
            return false
        }
    }

    peekError(type) {
      var s = "expected next token to be " + 
      this.lexer.getLiteralByTokenType(type)
      return s
    }
}

export default MonkeyCompilerParser