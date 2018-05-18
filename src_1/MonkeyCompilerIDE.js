import React , {Component} from 'react'
import * as bootstrap from 'react-bootstrap'
import MonkeyLexer from './MonkeyLexer'
import MonkeyCompilerEditer from './MonkeyCompilerEditer'
import MonkeyCompilerParser from './MonkeyCompilerParser'

class MonkeyCompilerIDE extends Component {
    constructor(props) {
        super(props)
        this.lexer = new MonkeyLexer("")
    }
    // change here
    onLexingClick () {
      this.lexer = new MonkeyLexer(this.inputInstance.getContent())
      this.parser = new MonkeyCompilerParser(this.lexer)
      this.parser.parseProgram()
      this.program = this.parser.program
      for (var i = 0; i < this.program.statements.length; i++) {
          console.log(this.program.statements[i].getLiteral())
      }
    }

    render () {
        // change here
        return (
          <bootstrap.Panel header="Monkey Compiler" bsStyle="success">
            <MonkeyCompilerEditer 
             ref={(ref) => {this.inputInstance = ref}}
             keyWords={this.lexer.getKeyWords()}/>
            <bootstrap.Button onClick={this.onLexingClick.bind(this)} 
             style={{marginTop: '16px'}}
             bsStyle="danger">
              Parsing
            </bootstrap.Button>
          </bootstrap.Panel>
          );
    }
}

export default MonkeyCompilerIDE