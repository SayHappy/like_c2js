import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import './index.scss';
import MonkeyCompilerIDE from '@/page/monkeycompileride';
import Home from './page/home';
import Header from '@/components/header/header';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render((
    <div>
        <BrowserRouter>
            <div>
                <Header></Header>
                <Switch>
                    <Route exact path='/' component={Home}></Route>
                    <Route path='/IDE' component={MonkeyCompilerIDE}></Route>
                </Switch>
            </div>
        </BrowserRouter>
    </div>
), document.getElementById('root'));
registerServiceWorker();
