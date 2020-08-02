// console.log('hell')
import {ToyReact, Component} from './ToyReact'

class MyComponent extends Component{
    render() {
        return <div>
            <span>span</span>
            <div>
                {true}
                {this.children}
            </div>
        </div>
    }

}

let a = <MyComponent name="a">
    <div>children</div>
</MyComponent>
// console.log(a)
// document.body.appendChild(a)

ToyReact.render(
    a, 
    document.body
)