import './verifyAction.less'
import preact, {h, render, Component} from 'preact'
import Action from './Action'
import Drawer from './Drawer'

const dftOptions = {
  width: 200,
  height: 100,
  ratio: 2,
  iconSize: 20,
  iconTop: 30,
  iconRight: 30,
  fontSize: 20,
  getCodeAsync: () => {
  },
}

export class VerifyAction extends Component {

  state = {
	expectText: '',
	complete: false,
  }

  constructor(props) {
	super(props);
  }

  createDrawer() {
	this.drawer = new Drawer({
	  el: this._cvs_wrap,
	  ...this.props,
	})

	this.drawer.on('complete', flag => {
	  !flag && this.freshDrawer()
	  this.setState({complete: flag})
	})

	this.drawer.on('refresh', () => {
	  this.freshDrawer()
	})
  }

  freshDrawer() {
	if (!this.props.getCodeAsync) return
	this.props.getCodeAsync(({text, expectText, img}) => {
	  this.setState({expectText: expectText})
	  this.drawer.draw(text, img, expectText)
	})
  }

  confirm = () => {
	if (!this.state.complete) return
	this._action.close(() => {
	  this.props.promise.resolve({
		success: true,
	  })
	})

  }

  cancel = () => {
	this.props.promise.resolve({
	  success: false,
	})
  }

  getStyle = () => {
	let {width, height} = this.props
	return `
	width: ${width}px;
	height: ${height}px;
	`
  }

  componentDidMount() {
	setTimeout(() => {
	  this._action.show();
	  this.createDrawer()
	  this.freshDrawer()
	}, 20);
  }

  render(props, state, context) {
	return (
		<Action onCancel={this.cancel} className="verify-action" position="center" ref={c => this._action = c}>
		  <div className="verify-action-container">
			<div className="cvs-wrap" ref={c => this._cvs_wrap = c} style={this.getStyle()}></div>
			<p className="tip-text">请依次点击{this.state.expectText}</p>

			<button onClick={this.confirm}
					disabled={!this.state.complete}
					className={`btn ${this.state.complete ? 'btn-success' : 'btn-disabled'}`}>确定
			</button>
		  </div>
		</Action>
	)
  }

}

export default function (options) {
  options = {...dftOptions, ...options}
  if (!options || typeof options !== 'object') throw new Error('options is required !')

  if (typeof options.getCodeAsync !== 'function') throw new Error('getCodeAsync is required and must be an function !')

  return new Promise((resolve, reject) => {
	const el = document.createElement('div');
	document.body.appendChild(el);
	options.promise = {reject, resolve};
	render(<VerifyAction {...options}/>, document.body, el);
  })
}
