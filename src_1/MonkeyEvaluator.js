import Node from './MonkeyCompilerParser'

class BaseObject {
	constructor (props) {
		this.INTEGER_OBJ = "INTEGER"
		this.BOOLEAN_OBJ = "BOOLEAN"
		this.NULL_OBJ = "NULL"
		this.ERROR_OBJ = "Error"
		this.RETURN_VALUE_OBJECT = "Return"
		//change 7
		this.FUNCTION_LITERAL = "FunctionLiteral"
		this.FUNCTION_CALL = "FunctionCall"
	}

	type() {return null}

	inspect() {return null}
}

class Integer extends BaseObject {
	constructor(props) {
		super(props)
		this.value = props.value
	}

	inspect () {
		return "integer with value:" + this.value
	}

	type () {
		return this.INTEGER_OBJ
	}
}

class Boolean extends BaseObject {
	constructor (props) {
		super(props)
		this.value = props.value
	}

	type () {
		return this.BOOLEAN_OBJ
	}

	inspect () {
		return "boolean with value: " + this.value
	}
}

class Null extends BaseObject {
	constructor (props) {
		super(props)
	}

	type () {
		return this.NULL_OBJ
	}

	inspect () {
		return "null"
	}
}

class Error extends BaseObject {
	constructor(props) {
		super(props)
		this.msg = props.errMsg
	}

	type () {
		return this.ERROR_OBJ
	}

	inspect () {
		return this.msg
	}
}

class ReturnValues extends BaseObject {
	constructor(props) {
		super(props)
		this.valueObject = props.value
	}

	type () {
		return this.RETURN_VALUE_OBJECT
	}

	inspect() {
		this.msg = "return with : " + this.valueObject.inspect()
		return this.msg
	}
}

//change 8
class FunctionLiteral extends BaseObject {
	constructor(props) {
		super(props)
		this.token = props.token  //对应关键字fn
		this.parameters = props.identifiers
		this.blockStatement = props.blockStatement
	}

	type() {
		return this.FUNCTION_LITERAL
	}

	inspect() {
		var s = "fn(" 
		var identifiers = []
		for (var i = 0; i < this.paremeters.length; i++) {
			identifiers[i] = this.parameters[i].tokenLiteral
		}
		s += identifiers.join(',')
		s += "){\n"
        s += this.blockStatement.tokenLiteral
        s += "\n}"
	}
}

//change 8
class FunctionCall extends BaseObject {
	constructor(props) {
		super(props)
		this.identifiers = props.identifiers
		this.blockStatement = props.blockStatement
		this.enviroment = undefined
	}
}
// change 2
class Enviroment {
	constructor(props) {
		this.map = {}
		//change 10
		this.outer = undefined
	}
	get(name) {
		var obj = this.map[name]
		if (obj != undefined) {
			return obj 
		}
		//change 12 在当前绑定环境找不到变量时，通过回溯
		//查找外层绑定环境是否有给定变量
		if (this.outer != undefined) {
			obj = this.outer.get(name)
		}

		return obj 
	}
	set(name, obj) {
		this.map[name] = obj
	}
}

class MonkeyEvaluator {
	// change 3
	constructor (props) {
		this.enviroment = new Enviroment()
	}

	// change 11
	newEnclosedEnvironment(outerEnv) {
		var env = new Enviroment()
		env.outer = outerEnv
		return env
	}

	eval (node) {
		var props = {}
		switch (node.type) {
			case "program":
			  return this.evalProgram(node)
			  // change 1
			case "LetStatement":
			  var val = this.eval(node.value)
			  if (this.isError(val)) {
			      return val
			  }

			  // change 4
			  this.enviroment.set(node.name.tokenLiteral, val)
			  return val
			  //change 5
			case "Identifier":
			  console.log("variable name is:" + node.tokenLiteral)
			  var value = this.evalIdentifier(node, this.enviroment)
			  console.log("it is binding value is " + value.inspect())
			  return value
			//change 9
			case "FunctionLiteral":
			var props = {}
			props.token = node.token
			props.identifiers = node.parameters
			props.blockStatement = node.body
			return new FunctionCall(props)
			case "CallExpression":
			console.log("execute a function with content:", 
				node.function.tokenLiteral)

			var functionCall = this.eval(node.function)
			if (this.isError(functionCall)) {
				return functionCall
			}

			console.log("evalute function call params:")
			var args = this.evalExpressions(node.arguments)
			if (args.length === 1 && this.isError(args[0])) {
				return args[0]
			}

			for (var i = 0; i < args.length; i++) {
				console.log(args[i].inspect())
			}

			// change 12 执行函数前保留当前绑定环境
			var oldEnviroment = this.enviroment
			//为函数调用创建新的绑定环境
			functionCall.enviroment = this.newEnclosedEnvironment(oldEnviroment)
			//设置新的变量绑定环境
			this.enviroment = functionCall.enviroment
			//将输入参数名称与传入值在新环境中绑定
			for (i = 0; i < functionCall.identifiers.length; i++) {
				var name = functionCall.identifiers[i].tokenLiteral
				var val = args[i]
				this.enviroment.set(name, val)
			}
			//执行函数体内代码
			var result = this.eval(functionCall.blockStatement)
			//执行完函数后，里面恢复原有绑定环境
			this.enviroment = oldEnviroment
			if (result.type() === result.RETURN_VALUE_OBJECT) {
				console.log("function call return with :",
					result.valueObject.inspect())
				return result.valueObject
			}

			return result


			case "Integer":
			  console.log("Integer with value:", node.value)
			  props.value = node.value
			  return new Integer(props)
			case "Boolean":
			  props.value = node.value
			  console.log("Boolean with value:", node.value)
			  return new Boolean(props)
			case "ExpressionStatement":
			  return this.eval(node.expression)
			case "PrefixExpression":
			  var right = this.eval(node.right)
			  if (this.isError(right)) {
			  	return right
			  }

			  var obj =  this.evalPrefixExpression(node.operator, right)
			  console.log("eval prefix expression: ", obj.inspect())
			  return obj
			case "InfixExpression":
			  var left = this.eval(node.left)
			  if (this.isError(left)) {
			  	return left
			  }
			  var right = this.eval(node.right)
			  if (this.isError(right)) {
			  	return right
			  }
			  return this.evalInfixExpression(node.operator, left, right)
			case "IfExpression":
			return this.evalIfExpression(node)
			case "blockStatement":
			return this.evalStatements(node)
		    case "ReturnStatement":
		    var props = {}
		    props.value = this.eval(node.expression)
		    if (this.isError(props.value)) {
		    	return props.value
		    }
		    var obj =  new ReturnValues(props)
		    console.log(obj.inspect())
		    return obj
			default:
			return new Null({})
		}

		return null
	}
	//change 10
	evalExpressions(exps) {
		var result = []
		for(var i = 0; i < exps.length; i++) {
			var evaluated = this.eval(exps[i])
			if (this.isError(evaluated)) {
				return evaluated
			}
			result[i] = evaluated
		}

		return result
	}

	//change 6
	evalIdentifier(node, env) {
		var val = env.get(node.tokenLiteral)
		if (val === undefined) {
			return this.newError("identifier no found:"+node.name)
		}

		return val
	}

	evalProgram (program) {
		var result = null
		for (var i = 0; i < program.statements.length; i++) {
			result = this.eval(program.statements[i])
			if (result.type() === result.RETURN_VALUE_OBJECT) {
				return result.valueObject
			}

			if (result.type() === result.NULL_OBJ) {
				return result
			}

			if (result.type === result.ERROR_OBJ) {
				console.log(result.msg)
				return result
			}
		} 

		return result
	}

	isError(obj) {
		if (obj != undefined) {
			return obj.type() === obj.ERROR_OBJ
		}

		return false
	}

	newError(msg) {
		var props = {}
		props.errMsg = msg
		return new Error(props)
	}

	evalIfExpression(ifNode) {
		console.log("begin to eval if statment")
		var condition = this.eval(ifNode.condition)

		if (this.isError(condition)) {
			return condition
		}

		if (this.isTruthy(condition)) {
			console.log("condition in if holds, exec statements in if block")
			return this.eval(ifNode.consequence)
		} else if (ifNode.alternative != null) {
			console.log("condition in if no holds, exec statements in else block")
			return this.eval(ifNode.alternative)
		} else {
			console.log("condition in if no holds, exec nothing!")
			return null
		}
	}

	isTruthy(condition) {
		if (condition.type() == condition.INTEGER_OBJ) {
			if (condition.value != 0) {
				return true
			}
			return false
		}

		if (condition.type() == condition.BOOLEAN_OBJ) {
			return condition.value
		}

		if (condition.type() == condition.NULL_OBJ) {
			return false
		}

		return true
	}

	evalStatements(node) {
		var result = null
		for (var i = 0; i < node.statements.length; i++) {
			result = this.eval(node.statements[i])
			if (result.type() == result.RETURN_VALUE_OBJECT
				|| result.type() == result.ERROR_OBJ) {
				return result
			}
		}

		return result
	}

	evalInfixExpression(operator, left, right) {
		if (left.type() != right.type()) {
			return  this.newError("type mismatch: " +
				left.type() + " and " + right.type())
		}

		if (left.type() === left.INTEGER_OBJ && 
			right.type() === right.INTEGER_OBJ) {
			return this.evalIntegerInfixExpression(
				operator, left, right)
		}

		var props = {}
		if (operator == '==') {
			props.value = (left.vaule == right.value)
			console.log("result on boolean operation of " + operator 
				+ " is " + props.value)
			return new Boolean(props)
		} else if (operator == '!=') {
			props.value = (left.value != right.value)
			console.log("result on boolean operation of " + operator 
				+ " is " + props.value)
			return new Boolean(props)
		}

		return  this.newError("unknown operator: "+ operator)
	}

	evalIntegerInfixExpression(operator, left, right) {
		var leftVal = left.value
		var rightVal = right.value
		var props = {}
		var resultType = "integer"

		switch (operator) {
			case "+":
			  props.value = leftVal + rightVal
			  break;
			case "-":
			  props.value = leftVal - rightVal
			  break;
			case "*":
			  props.value = leftVal * rightVal
			  break;
			case "/":
			  props.value = leftVal / rightVal
			  break;
			case "==":
			  resultType = "boolean"
			  props.value = (leftVal === rightVal)
			  break;
			 case "!=":
			   resultType = "boolean"
			   props.value = (leftVal !== rightVal)
			   break
			 case ">":
			   resultType = "boolean"
			   props.value = (leftVal > rightVal)
			   break
			 case "<":
			   resultType = "boolean"
			   props.value = (leftVal < rightVal)
			   break
			default:
			  return this.newError("unknown operator for Integer")
		}
		console.log("eval infix expression result is:",
			props.value)
		var result = null
		if (resultType === "integer") {
			result = new Integer(props)
		} else if (resultType === "boolean") {
			result = new Boolean(props)
		}
		
		return result
	}

	evalPrefixExpression(operator, right) {
		switch (operator) {
			case "!":
			  return this.evalBangOperatorExpression(right)
			case "-":
			  return this.evalMinusPrefixOperatorExpression(right)
			default:
			  return this.newError("unknown operator:", operator, right.type())
		}
	}

	evalBangOperatorExpression(right) {
		var props = {}
		if (right.type() === right.BOOLEAN_OBJ) {
			if (right.value === true) {
				props.value = false
			}

			if (right.value === false) {
				props.value = true
			}
		}

		if (right.type() === right.INTEGER_OBJ) {
			if (right.value === 0) {
				props.value = true
			} else {
				props.value = false
			}
		}

		if (right.type() === right.NULL_OBJ) {
			props.value = true
		}

		return new Boolean(props)
	}

	evalMinusPrefixOperatorExpression(right) {
		if (right.type() !== right.INTEGER_OBJ) {
			return new this.newError("unknown operaotr:- ", right.type())
		}

		var props = {}
		props.value = -right.value
		return new Integer(props)
	}

   
}

export default MonkeyEvaluator