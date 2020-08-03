class ElementWrapper {
    constructor(type) {
        this.type = type
        this.props = Object.create(null)
        this.children = []
        // this.root = document.createElement(type)
    }
    setAttribute(name, value) {
        // if (name.match(/^on([\s\S]+)$/)) {
        //     let eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase())
        //     this.root.addEventListener(eventName, value)
        // } else {
        //     if (name === 'className')
        //         name = 'class'
        //     this.root.setAttribute(name, value)
        // }
        this.props[name] = value
    }
    // 把子节点挂载到当前的节点
    appendChild(vchild) {
        // vchild.mountTo(this.root)
        // let range = document.createRange()
        // if (this.root.children.length) {
        //     range.setStartAfter(this.root.lastChild)
        //     range.setEndAfter(this.root.lastChild)
        // } else {
        //     range.setStart(this.root, 0);
        //     range.setEnd(this.root, 0)
        // }
        // vchild.mountTo(range)
        this.children.push(vchild)
    }
    get vdom() {
        return {
            type: this.type,
            props: this.props,
            children: this.children.map(child => child.vdom)
        }
    }
    // 所有的组件都会有 一个 mountTo
    mountTo(range) {
        this.range = range
        range.deleteContents()
        let element = document.createElement(this.type)
        for (let name in this.props) {
            let value = this.props[name]

            if (name.match(/^on([\s\S]+)$/)) {
                let eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase())
                element.addEventListener(eventName, value)
            } else {
                if (name === 'className')
                    name = 'class'
                element.setAttribute(name, value)
            }

            // element.setAttribute(name, value)
        }

        for (let child of this.children) {
            let range = document.createRange()
            if (element.children.length) {
                range.setStartAfter(element.lastChild)
                range.setEndAfter(element.lastChild)
            } else {
                range.setStart(element, 0);
                range.setEnd(element, 0)
            }
            child.mountTo(range)
        }

        range.insertNode(element)
        // parent.appendChild(this.root)
    }
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content)
        this.type = '#text'
        this.children = []
        this.props = Object.create(null)
    }
    mountTo(range) {
        this.range = range
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
    get type() {
        return this.constructor.name
    }
    update() {
        let vdom = this.render()
        if (this.vdom) {
            // console.log(vnode)
            let isSameNode = (node1, node2) => {
                if (node1.type !== node2.type) return false
                for (let name in node1.props) {
                    if (
                        typeof node1.props[name] === 'function' && 
                        typeof node2.props[name] === 'function' &&
                        node1.props[name].toString() === node2.props[name].toString()
                    ) {
                        continue
                    }
                    if (
                        typeof node1.props[name] === 'object' && 
                        typeof node2.props[name] === 'object' &&
                        JSON.stringify(node1.props[name]) === JSON.stringify(node2.props[name])
                    ) {
                        continue
                    }
                    // console.log(node1.props[name], node2.props[name])
                    if (node1.props[name] !== node2.props[name]) return false
                }
                if (Object.keys(node1.props).length !== Object.keys(node2.props).length) return false
                return true
            }
            let isSameTree = (node1, node2) => {
                if (!isSameNode(node1, node2)) return false
                if (node1.children.length !== node2.children.length) return false
                for (let i = 0; i < node1.children.length; i ++) {
                    // console.log(node1, node1.children)
                    if (!isSameTree(node1.children[i], node2.children[i])) return false
                }
                return true
            }
            let replace = (newTree, oldTree) => {
                console.log(isSameTree(newTree, oldTree))
                if (isSameTree(newTree, oldTree)) return

                if (!isSameNode(newTree, oldTree)) {
                    console.log('render', newTree, oldTree)
                    return newTree.mountTo(oldTree.range);
                } else {
                    for (let i = 0; i < newTree.children.length; i ++) {
                        replace(newTree.children[i], oldTree.children[i])
                    }
                }
            }
            replace(vdom, this.vdom)
        } else {
            vdom.mountTo(this.range)
        }
        this.vdom = vdom
    }
    setAttribute(name, value) {
        this.props[name] = value
        this[name] = value
    }
    get vdom() {
        return this.render().vdom
    }
    // 把 组件的 子节点收集起来，
    appendChild(vchild) {
        this.children.push(vchild)
    }
    setState(state) {
        // 把两个 state merge 起来
        let merge = (oldState, newState) => {
            for (let p in newState) {
                if (typeof newState[p] === 'object' && newState[p] !== null) {
                    if (typeof oldState[p] !== 'object') {
                        if (newState[p] instanceof Array) 
                          oldState[p] = []
                        else
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
                    if (child === null || child === void 0) child = ''

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