import React, {Component} from 'react';
import {Icon} from 'antd';
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

    onLexingClick() {
        this.lexer = new MonkeyLexer(this.inputInstance.getContent());
    }

    render() {
        return (
            <div className="monkeycompileride">
                {/*<IDEbanner></IDEbanner>*/}
                <div className="idebanner">
                    <ul className={'idebannercontainer'}>
                        <li className={'idebanneritem'}>
                            <Icon style={{color:'green'}} type="caret-right"/>
                        </li>
                    </ul>
                </div>
                <div className={'controlpanel'}>
                    <SourceContainer></SourceContainer>
                    <MonkeyCompilerEditer
                        ref={(ref) => {
                            this.inputInstance = ref
                        }}
                        keyWords={this.lexer.getKeyWords()}
                    ></MonkeyCompilerEditer>
                </div>
            </div>
        );
    }
}

export default MonkeyCompilerIDE;