import React, {Component} from 'react';
import MonkeyCompilerEditer from './MonkeyCompilerEditer';
import './MonkeyCompilerIDE.scss';


class MonkeyCompilerIDE extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="monkeycompileride">
                <MonkeyCompilerEditer></MonkeyCompilerEditer>
                <button className={'run'}>运行</button>
            </div>
        );
    }
}

export default MonkeyCompilerIDE;