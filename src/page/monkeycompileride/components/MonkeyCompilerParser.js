/*
* auth:郝梓淳
* desc:语法表达式解析
* */

class Node {
    constructor(props) {
        this.tokenLiteral = '';
        this.type = '';
    }

    getLiteral() {
        return this.tokenLiteral;
    }
}

class Statement extends Node {
    statementNode() {
        this.type = 'Statement';
        return this;
    }
}

class Expression extends Node{
    constructor(props) {
        super(props);
        this.type
    }
}