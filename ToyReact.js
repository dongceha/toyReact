class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type)
    }
    setAttribute(name, value) {
        if (name.match(/^on([\s\S]+)$/)) {
            let eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase())
            this.root.addEventListener(eventName, value)
        } else {
            if (name === 'className')
                name = 'class'
            this.root.setAttribute(name, value)
        }
    }
    // 把子节点挂载到当前的节点
    appendChild(vchild) {
        // vchild.mountTo(this.root)
        let range = document.createRange()
        if (this.root.children.length) {
            range.setStartAfter(this.root.lastChild)
            range.setEndAfter(this.root.lastChild)
        } else {
            range.setStart(this.root, 0);
            range.setEnd(this.root, 0)
        }
        vchild.mountTo(range)
    }
    // 所有的组件都会有 一个 mountTo
    mountTo(range) {
        range.deleteContents()
        range.insertNode(this.root)
        // parent.appendChild(this.root)
    }
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content)
    }
    mountTo(range) {
        // parent.appendChild(this.root)

        range.deleteContents()
        range.insertNode(this.root)
    }
}

export class Component {
    constructor() {
        this.children = []
        this.props = Object.create(null)
    }
    mountTo(range) {
        this.range = range
        this.update()
    }
    update() {
        // ====== 弄个占位，防止 下面删除了之后，range 失效
        let placeholder = document.createComment('placeholder')
        let range = document.createRange()
        range.setStart(this.range.endContainer, this.range.endOffset)
        range.setEnd(this.range.endContainer, this.range.endOffset)
        range.insertNode(placeholder)
        // ======

        // 删除之前的内容
        this.range.deleteContents()
        let vnode = this.render()
        vnode.mountTo(this.range)

        // placeholder.parentNode.removeChild(placeholder)
    }
    setAttribute(name, value) {
        this.props[name] = value
        this[name] = value
    }
    // 把 组件的 子节点收集起来，
    appendChild(vchild) {
        this.children.push(vchild)
    }
    setState(state) {
        // 把两个 state merge 起来
        let merge = (oldState, newState) => {
            for (let p in newState) {
                if (typeof newState[p] === 'object') {
                    if (typeof oldState[p] !== 'object') {
                        oldState[p] = {}
                    }
                    merge(oldState[p], newState[p])
                } else {
                    oldState[p] = newState[p]
                }
            }
        }
        if (!this.state && state) {
            this.state = {}
        }
        merge(this.state, state)
        this.update()
    }
}

export let ToyReact = {
    createElement(type, attributes, ...children) {
        let element
        if (typeof type === 'string') {
            element = new ElementWrapper(type)
        } else {
            element = new type()
        }
        for (let name in attributes) {
            element.setAttribute(name, attributes[name])
        }
        let insertChildren = (children) => {
            for (let child of children) {
                
                if (Array.isArray(child)) {  // 防止 传入 {this.children} ，这里的children 就是数组
                    insertChildren(child)
                } else {
                    // 给一个白名单，把这些之外的 都转成 字符串
                    if (
                        !(child instanceof Component) &&
                        !(child instanceof ElementWrapper) &&
                        !(child instanceof TextWrapper)
                    )
                      child = String(child)
                    if (typeof child === 'string') 
                        child = new TextWrapper(child)
                    element.appendChild(child)
                }
            }
        }
        insertChildren(children)
        
        return element
    },
    render(vdom, element) {
        let range = document.createRange()
        if (element.children.length) {
            range.setStartAfter(element.lastChild)
            range.setEndAfter(element.lastChild)
        } else {
            range.setStart(element, 0);
            range.setEnd(element, 0)
        }
        vdom.mountTo(range)
    }
}