import './verifyAction.less'
import preact, {h, render, Component} from 'preact'
import Action from './Action'
import Drawer from './Drawer'

export class VerifyAction extends Component {

  constructor(props) {
	super(props);
  }

  createDrawer() {
	this.drawer = new Drawer({
	  el: this._cvs_wrap,
	})

	this.drawer.on('complete', flag => {
	  console.log('complete', flag)
	})
  }

  freshDrawer() {
	this.props.getCodeAsync(res => {
	  console.log(res)
	  this.drawer.draw(res.text, res.img, res.expectText)
	})
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
		<Action className="verify-action" position="center" ref={c => this._action = c}>
		  <div className="verify-action-container">
			<div className="cvs-wrap" ref={c => this._cvs_wrap = c}></div>
		  </div>
		</Action>
	)
  }

}

export default function (options) {
  return new Promise((resolve, reject) => {
	const el = document.createElement('div');
	document.body.appendChild(el);
	options.promise = {reject, resolve};
	render(<VerifyAction {...options}/>, document.body, el);
  })
}
