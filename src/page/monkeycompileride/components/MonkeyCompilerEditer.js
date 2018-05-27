import React, {Component} from 'react'
import {Modal, Button, Card} from 'antd';
import rangy from 'rangy/lib/rangy-selectionsaverestore';
import MonkeyLexer from './MonkeyLexer'

class MonkeyCompilerEditer extends Component {
    constructor(props) {
        super(props);
        this.keyWords = props.keyWords;
        // 初始化上一段的行数
        rangy.init(); // 初始化光标获取
        this.keyWordElementArray = []; // 默认关键词列表
        this.identifierElementArray = []; // 变量列表
        this.textNodeArray = [];
        // 几种标签
        this.keyWordClass = 'keyword';
        this.lineNodeClass = 'line';
        this.lineSpanNode = 'LineSpan';
        this.identifierClass = 'Identifier';
        this.spanToTokenMap = {};
        this.keyToIngore = ['Enter', 'ArrowUp', 'ArrowDown',
            'ArrowLeft', 'ArrowRight']; // 忽略回车空格上下左右
    }

    changeNode(n) {
        const f = n.childNodes;
        for (let c in f) {
            this.changeNode(f[c]); // 递归到最终字符节点
        }
        if (n.data) {
            this.lastBegin = 0; // 每一行读取 初始化起始位置0
            n.keyWordCount = 0;
            n.identifierCount = 0;
            const lexer = new MonkeyLexer(n.data);
            this.lexer = lexer;
            lexer.setLexingOberver(this, n); // 注册lexer中token监听函数
            lexer.lexing();
        }
    }

    notifyTokenCreation(token, elementNode, begin, end) { // 注册的监听函数
        const e = {};
        e.node = elementNode;
        e.begin = begin;
        e.end = end;
        e.token = token;

        if (this.keyWords[token.getLiteral()] !== undefined) {
            elementNode.keyWordCount++;
            this.keyWordElementArray.push(e)
        }

        if (elementNode.keyWordCount === 0 && token.getType() === this.lexer.IDENTIFIER) {
            elementNode.identifierCount++;
            this.identifierElementArray.push(e);
        }

    }

    changeSpaceToNBSP(str) { // 将空格变为字符
        let s = '';
        for (let i = 0; i < str.length; i++) {
            if (str[i] === ' ') {
                s += '\u00a0'
            } else {
                s += str[i]
            }
        }

        return s;
    }

    hightLightKeyWord(token, elementNode, begin, end) {
        let strBefore = elementNode.data.substr(this.lastBegin,
            begin - this.lastBegin);
        strBefore = this.changeSpaceToNBSP(strBefore);

        const textNode = document.createTextNode(strBefore);
        const parentNode = elementNode.parentNode;
        parentNode.insertBefore(textNode, elementNode);
        this.textNodeArray.push(textNode);

        const span = document.createElement('span');
        span.classList.add(this.keyWordClass);
        span.appendChild(document.createTextNode(token.getLiteral()));
        parentNode.insertBefore(span, elementNode);

        this.lastBegin = end - 1;
        elementNode.keyWordCount--;

    }


    hightLightSyntax() { // 遍历关键词数组 将其高亮
        this.textNodeArray = [];
        this.keyWordElementArray.map((item) => {
            this.currentElement = item.node;
            this.hightLightKeyWord(item.token, item.node, item.begin, item.end);
            if (this.currentElement.keyWordCount === 0) {
                const end = this.currentElement.data.length;
                let lastText = this.currentElement.data.substr(
                    this.lastBegin,
                    end
                );
                lastText = this.changeSpaceToNBSP(lastText);
                const parent = this.currentElement.parentNode;
                const lastNode = document.createTextNode(lastText);
                parent.insertBefore(lastNode, this.currentElement);
                this.textNodeArray.push(lastNode);
                parent.removeChild(this.currentElement);
            }
        });
        this.keyWordElementArray = []; // 处理结束后置空
    }

    getCaretLineNode() { // 获取变动的每一行的数据
        const sel = document.getSelection();
        // 光标所在位置
        const nd = sel.anchorNode;
        // 节点是编辑器，返回
        if (nd.className === 'monkeycompilerediter' || nd.innerHTML === '<br>') {
            return false;
        }
        // 光标所在node节点
        // 查看其父节点是否是span,如果不是，
        // 我们插入一个span节点用来表示光标所在的行
        let currentLineSpan = null;
        const elements = document.getElementsByClassName(this.lineSpanNode);
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element.contains(nd)) {
                currentLineSpan = element;
                // 确定所包含的span
            }
            while (element.classList.length > 0) {
                // 移除所有的class 重新赋值
                element.classList.remove(element.classList.item(0));
            }
            element.classList.add(this.lineSpanNode);
            element.classList.add(this.lineNodeClass + i);
        }
        // 如果已经被加入span就返回 否则添加进span
        if (currentLineSpan !== null) {
            return currentLineSpan;
        } else {
            const divElements = this.divInstance.childNodes;
            let l = 0; // 初始行号
            // 计算一下当前光标所在节点的前面有多少个div节点，
            // 前面的div节点数就是光标所在节点的行数
            for (let i = 0; i < divElements.length; i++) {
                if (divElements[i].tagName === 'DIV' &&
                    divElements[i].contains(nd)) {
                    l = i;
                    break;
                }
            }
            // 如果是第一行就是0个；
            let spanNode = document.createElement('span');
            spanNode.classList.add(this.lineSpanNode);
            spanNode.classList.add(this.lineNodeClass + l);
            nd.parentNode.replaceChild(spanNode, nd);
            spanNode.appendChild(nd);
            return spanNode;

        }

    }

    errorHandling() {
        // 阻止浏览器创建font标签
        const fontList = this.divInstance.getElementsByTagName('font');
        for (let i = 0; i < fontList.length; i++) {
            fontList[i].parentNode.removeChild(fontList[i]);
        }

    }

    // 关键字标注部分
    // 关键字标注部分
    preparePopoverForIdentifers() {
        if (this.textNodeArray.length > 0) {
            for (let i = 0; i < this.textNodeArray.length; i++) {
                // 将text 节点中的文本提交给词法解析器抽取关键词
                this.changeNode(this.textNodeArray[i]);
                // 为解析出的identifier字符串添加鼠标取词功能
                this.addPopoverByIdentifierArray();
            }
            this.textNodeArray = [];
        } else {
            this.addPopoverByIdentifierArray();
        }
    }

    addPopoverByIdentifierArray() {
        // 该函数逻辑跟hightLoghtSyntax一摸一样
        for (let i = 0; i < this.identifierElementArray.length; i++) {
            var e = this.identifierElementArray[i];
            this.currentElement = e.node;
            // 找到每个变量类型起始和末尾，给他们添加span
            this.addPopoverSpanToIdentifier(e.token, e.node,
                e.begin, e.end);

            if (this.currentElement.identifierCount === 0) {
                const end = this.currentElement.data.length;
                let lastText = this.currentElement.data.substr(this.lastBegin,
                    end);
                lastText = this.changeSpaceToNBSP(lastText);
                const parent = this.currentElement.parentNode;
                const lastNode = document.createTextNode(lastText);
                parent.insertBefore(lastNode, this.currentElement);
                parent.removeChild(this.currentElement);
            }
        }
        // 处理完后数组置空;
        this.identifierElementArray = [];
    }

    addPopoverSpanToIdentifier(token, elementNode, begin, end) {
        let strBefore = elementNode.data.substr(this.lastBegin,
            begin - this.lastBegin);
        strBefore = this.changeSpaceToNBSP(strBefore);
        let textNode = document.createTextNode(strBefore);
        let parentNode = elementNode.parentNode;
        parentNode.insertBefore(textNode, elementNode);

        const span = document.createElement('span');
        span.onmouseenter = (this.handleIdentifierOnMouseOver).bind(this);
        span.onmouseout = (this.handleIdentifierOnMouseOut).bind(this);
        span.classList.add(this.identifierClass);
        span.appendChild(document.createTextNode(token.getLiteral()));
        span.token = token;
        parentNode.insertBefore(span, elementNode);
        this.lastBegin = end - 1;
        elementNode.identifierCount--;
    }

    handleIdentifierOnMouseOver(e) {
        e.currentTarget.isOver = true;
        var token = e.currentTarget.token;
        const popoverStyle = {};
        popoverStyle.positionLeft = e.clientX + 20;
        popoverStyle.positionTop = e.currentTarget.offsetTop - e.currentTarget.offsetHeight;
        popoverStyle.title = "Syntax";
        popoverStyle.show = 'block';
        popoverStyle.content = "name: " + token.getLiteral() + " Type: " + token.getType()
            + "\nLine: " + e.target.parentNode.classList[1];
        this.setState(Object.assign({}, this.state, {popoverStyle}));
    }

    handleIdentifierOnMouseOut() {
        this.initPopoverControl()
    }

    initPopoverControl() {
        const popoverStyle = {};
        popoverStyle.placement = "right";
        popoverStyle.positionLeft = -100;
        popoverStyle.positionTop = -100;
        popoverStyle.content = "";
        popoverStyle.show = 'none';
        this.setState(Object.assign({}, this.state, {popoverStyle}))
    }

    // 关键字标注部分
    // 关键字标注部分

    onDivContentChange(evt) {
        this.errorHandling();
        // 设置行号
        this.setState({
            totalIndex: this.divInstance.childNodes.length - 1
        });

        // 一些BUG处理
        if (this.keyToIngore.indexOf(evt.key) >= 0) {
            return;
        } else if (
            this.divInstance.childNodes.length === 1 &&
            this.divInstance.firstChild.innerText === ''
        ) {
            return;
        } else if (!this.divInstance.innerText) {
            return;
        }

        let bookmark = undefined;
        if (evt.key !== 'Enter') {
            bookmark = rangy.getSelection().getBookmark(this.divInstance);
        }

        // 判断行数 前后行数差大于1 全部重新刷新
        let lineCount = this.divInstance.childNodes.length || 0;
        if (lineCount - this.lastLineCount < 0) {
            this.lastLineCount = lineCount;

            const childs = this.divInstance.childNodes;
            for (let i = 0; i < childs.length; i++) {
                let innerText = childs[i].innerText;
                childs[i].innerHTML = '';
                childs[i].innerText = innerText;
            }
            // //把所有相邻的text node 合并成一个
            this.divInstance.normalize();
            this.changeNode(this.divInstance);
            this.hightLightSyntax();
            this.preparePopoverForIdentifers(); // 变量设值
            return;
        }
        this.lastLineCount = lineCount;
        // 获取光标所在行的
        // 并换成普通的内容 重新处理
        const currentLine = this.getCaretLineNode();

        if (!currentLine) {
            return;
        }
        for (let i = 0; i < currentLine.childNodes.length; i++) {
            if (currentLine.childNodes[i].className
                === this.keyWordClass ||
                currentLine.childNodes[i].className === this.identifierClass) {
                const child = currentLine.childNodes[i];
                const t = document.createTextNode(child.innerText);
                currentLine.replaceChild(t, child);
            }
        }
        // 把所有相邻的text node 合并成一个
        currentLine.normalize();
        this.identifierElementArray = [];
        this.changeNode(currentLine);
        this.hightLightSyntax();
        this.preparePopoverForIdentifers(); // 变量设值

        // 光标恢复

        if (evt.key !== 'Enter') {
            rangy.getSelection().moveToBookmark(bookmark);
        }


    }

    // 生命周期
    componentWillMount() {
        this.setState({
            totalIndex: 0,
            popoverStyle: {
                placement: "right",
                positionLeft: -100,
                positionTop: -100,
                content: "",
                show: 'none'
            }
        })
    }

    getIndexList(index) {
        const list = [];
        for (var i = 1; i <= index; i++) {
            list.push(
                <li key={i} className="indexitem">{i}</li>
            )
        }
        return list;
    }

    onDivPaste(e) {
        // 出现粘贴时
        e.preventDefault();
        Modal.confirm({
            title: '提示',
            content: '多行插入正在开发~'
        })
    }

    render() {
        const list = this.getIndexList(this.state.totalIndex);
        return (
            <div className={'monkeycompilereditercontainer'}>
                <ul className={'indexcontainer'}
                >
                    <li>0</li>
                    {list}
                </ul>
                <div className={'monkeycompilerediter'}
                     contentEditable
                     onPaste={this.onDivPaste.bind(this)}
                     onKeyUp={this.onDivContentChange.bind(this)}
                     ref={(ref) => {
                         this.divInstance = ref
                     }}
                >
                </div>
                <Card
                    title={this.state.popoverStyle.title}
                    style={{
                    display: this.state.popoverStyle.show,
                    width: '200px', position: 'absolute',
                    left: this.state.popoverStyle.positionLeft,
                    top: this.state.popoverStyle.positionTop
                }}>
                    {this.state.popoverStyle.content}
                </Card>
            </div>
        )
    }
}

export default MonkeyCompilerEditer;