import React, {Component} from 'react'

class MonkeyCompilerEditer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={'monkeycompilerediter'}
                 contentEditable
            >
            </div>
        )
    }
}

export default MonkeyCompilerEditer;