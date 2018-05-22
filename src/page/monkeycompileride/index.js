import React, {Component} from 'react';
import MonkeyLexer from './components/MonkeyLexer';
import MonkeyCompilerEditer from './components/MonkeyCompilerEditer';
import SourceContainer from './components/SourceContainer';
import OutputContainer from './components/OutputContainer';
// import IDEbanner from './components/IDEbanner';

import './MonkeyCompilerIDE.scss';


class MonkeyCompilerIDE extends Component {
    constructor(props) {
        super(props);
        this.lexer = new MonkeyLexer('');
    }

    onLexingClick(){
        this.lexer = new MonkeyLexer(this.inputInstance.getContent());
    }

    render() {
        return (
            <div className="monkeycompileride">
                {/*<IDEbanner></IDEbanner>*/}
                <div className="idebanner">
                    <ul>
                        <li></li>
                    </ul>
                </div>
                <div className={'controlpanel'}>
                    <SourceContainer></SourceContainer>
                    <MonkeyCompilerEditer
                        ref={(ref) =>{this.inputInstance = ref}}
                        keyWords={this.lexer.getKeyWords()}
                    ></MonkeyCompilerEditer>
                </div>
                <div className="outputpanel">
                    <OutputContainer></OutputContainer>
                </div>
            </div>
        );
    }
}

export default MonkeyCompilerIDE;