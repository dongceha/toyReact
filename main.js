// console.log('hell')
import {ToyReact, Component} from './ToyReact'

// class MyComponent extends Component{
//     render() {
//         return <div>
//             <span>span</span>
//             <div>
//                 {true}
//                 {this.children}
//             </div>
//         </div>
//     }
// }
class Board extends Component {
    renderSquare(i) {
      return <Square value={i} />;
    }
    render() {
        return (
          <div>
            <div className="board-row">
              {this.renderSquare(0)}
              {this.renderSquare(1)}
              {this.renderSquare(2)}
            </div>
            <div className="board-row">
              {this.renderSquare(3)}
              {this.renderSquare(4)}
              {this.renderSquare(5)}
            </div>
            <div className="board-row">
              {this.renderSquare(6)}
              {this.renderSquare(7)}
              {this.renderSquare(8)}
            </div>
          </div>
        );
    }
}
class Square extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: null
        }
    }
    render() {
      return (
        <button className="square" onClick={() => this.setState({value: 'x'})}>
          {this.state.value ? this.state.value : ''}
        </button>
      );
    }
}

let a = <Board></Board>
// console.log(a)
// document.body.appendChild(a)

ToyReact.render(
    a, 
    document.body
)