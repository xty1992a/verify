/**
 * Created by TY-xie on 2018/3/29.
 */
import './index.less'
import {css, getParentByClassName, isMobile, getObjectURL, dataURLtoBlob, rdm} from '../tools'
import request from '../tools/request'

const defaultOptions = {
  toast: console.log,
}

class EmitAble {
  task = {}

  on(event, callback) {
	this.task[event] = callback
  }

  fire(event, payload) {
	this.task[event] && this.task[event](payload)
  }
}

export class Verify extends EmitAble {

}
