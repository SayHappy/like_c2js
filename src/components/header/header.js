import React, {Component} from 'react';
import './index.scss';
import {Link} from 'react-router-dom';

class Header extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const defaultValue = {
            headerList: [
                {
                    name: '首页',
                    value: '/'
                },
                {
                    name: '编译器',
                    value: '/IDE'
                }
            ]
        };
        return (
            <div className={'header'}>
                <ul className={'headerlist'}>
                    {
                        defaultValue.headerList.map((item, index) => {
                            return (
                                <li key={index} className={'headeritem'}>
                                    <Link to={item.value}>
                                        {item.name}
                                    </Link>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        )
    }
}

export default Header;
