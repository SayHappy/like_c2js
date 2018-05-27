import React, {Component} from 'react'
import {Icon} from 'antd';

class IDEbanner extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="idebanner"
            >
                <Icon  type="caret-right" />
            </div>
        )
    }
}

export default IDEbanner;