class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type)
    }
    setAttribute(name, value) {
        this.root.setAttribute(name, value)
    }
    // 把子节点挂载到当前的节点
    appendChild(vchild) {
        vchild.mountTo(this.root)
    }
    // 所有的组件都会有 一个 mountTo
    mountTo(parent) {
        parent.appendChild(this.root)
    }
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content)
    }
    mountTo(parent) {
        parent.appendChild(this.root)
    }
}

export class Component {
    constructor() {
        this.children = []
    }
    mountTo(parent) {
        let vnode = this.render()
        vnode.mountTo(parent)
    }
    setAttribute(name, value) {
        this[name] = value
    }
    // 把 组件的 子节点收集起来，
    appendChild(vchild) {
        this.children.push(vchild)
    }
}

export let ToyReact = {
    createElement(type, attributes, ...children) {
        console.log(arguments)
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
        vdom.mountTo(element)
    }
}