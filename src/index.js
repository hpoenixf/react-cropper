import React, { Component } from 'react';
import './App.css';
import ReactDOM from 'react-dom'

class ImageUploader extends Component {
  render() {
    return (
     <form className="image-upload-form" method="post" encType="multipart/form-data" >
       <input type="file" name="inputOfFile" ref="imgInput" id="imgInput" onChange={this.props.handleImgChange}/>
       <button onClick={this.props.getCropData}>获取裁剪参数</button>
     </form>
    )
  }
}

class Cropper extends Component {
  constructor() {
    super()
    this.state = {
      imageValue: null
    }
  }
  handleImgChange = e => {
    let fileReader = new FileReader()
    fileReader.readAsDataURL(e.target.files[0])
    fileReader.onload = e => {
      this.setState({...this.state, imageValue: e.target.result})
    }
  }


  setSize = () => {
    let img = this.refs.img
    let widthNum = parseInt(this.props.width, 10)
    let heightNum = parseInt(this.props.height, 10)
    this.setState({
      ...this.state,
      naturalSize: {
        width: img.naturalWidth,
        height: img.naturalHeight
      }
    })
    let imgStyle = img.style
    imgStyle.height = 'auto'
    imgStyle.width = 'auto'
    let principalStyle = ReactDOM.findDOMNode(this.refs.selectArea).parentElement.style
    const ratio = img.width / img.height
    // 设置图片大小、位置
    if (img.width > img.height) {
      imgStyle.width = principalStyle.width = this.props.width
      imgStyle.height = principalStyle.height = widthNum / ratio + 'px'
      principalStyle.marginTop = (widthNum - parseInt(principalStyle.height, 10)) / 2 + 'px'
      principalStyle.marginLeft = 0
    } else {
      imgStyle.height = principalStyle.height = this.props.height
      imgStyle.width = principalStyle.width = heightNum * ratio + 'px'
      principalStyle.marginLeft = (heightNum - parseInt(principalStyle.width, 10)) / 2 + 'px'
      principalStyle.marginTop = 0
    }
    // 设置选择框样式
    let selectAreaStyle = ReactDOM.findDOMNode(this.refs.selectArea).style
    let principalHeight = parseInt(principalStyle.height, 10)
    let principalWidth = parseInt(principalStyle.width, 10)
    if (principalWidth > principalHeight) {
      selectAreaStyle.top = principalHeight * 0.1 + 'px'
      selectAreaStyle.width = selectAreaStyle.height = principalHeight * 0.8 + 'px'
      selectAreaStyle.left = (principalWidth - parseInt(selectAreaStyle.width, 10)) / 2 + 'px'
    } else {
      selectAreaStyle.left = principalWidth * 0.1 + 'px'
      selectAreaStyle.width = selectAreaStyle.height = principalWidth * 0.8 + 'px'
      selectAreaStyle.top = (principalHeight - parseInt(selectAreaStyle.height, 10)) / 2 + 'px'
    }
  }
  getCropData = e => {
    e.preventDefault()
    let SelectArea = ReactDOM.findDOMNode(this.refs.selectArea).style

    let a = {
      width: parseInt(SelectArea.width, 10),
      height: parseInt(SelectArea.height, 10),
      left: parseInt(SelectArea.left, 10),
      top: parseInt(SelectArea.top, 10)
    }
    a.radio = this.state.naturalSize.width / a.width

    console.log(a)
    return a
  }
  render() {
    return (
     <div>
      <ImageUploader handleImgChange={this.handleImgChange} getCropData={this.getCropData}/>
       <div className="image-principal">
         <img src={this.state.imageValue} alt="" className="img" ref="img" onLoad={this.setSize}/>
         <SelectArea ref="selectArea"></SelectArea>
       </div>
     </div>
    )
  }
}


class SelectArea extends Component {
  constructor () {
    super()
    this.state = {
      selectArea: null,
      el: null,
      container: null,
      resizeArea: null
    }
  }
  componentDidMount() {
    this.moveBind = this.move.bind(this)
    this.stopBind = this.stop.bind(this)
    const container = ReactDOM.findDOMNode(this.refs.selectArea).parentElement
    this.setState({...this.state, container})
  }
  dragStart = e => {
    const el = e.target
    const container = this.state.container
    let selectArea = {
      posLeft: e.clientX,
      posTop: e.clientY,
      left: e.clientX - el.offsetLeft,
      top: e.clientY - el.offsetTop,
      maxMoveX: container.offsetWidth - el.offsetWidth,
      maxMoveY: container.offsetHeight - el.offsetHeight,
    }
    this.setState({ ...this.state, selectArea, el})
    document.addEventListener('mousemove', this.moveBind, false)
    document.addEventListener('mouseup', this.stopBind, false)
  }
  move(e) {
    if (!this.state || !this.state.el || !this.state.selectArea) {
      return
    }
    let selectArea = this.state.selectArea
    let newPosLeft = e.clientX- selectArea.left
    let newPosTop = e.clientY - selectArea.top
    // 控制移动范围
    if (newPosLeft <= 0) {
      newPosLeft = 0
    } else if (newPosLeft > selectArea.maxMoveX) {
      newPosLeft = selectArea.maxMoveX
    }
    if (newPosTop <= 0) {
      newPosTop = 0
    } else if (newPosTop > selectArea.maxMoveY) {
      newPosTop = selectArea.maxMoveY
    }
    let elStyle = this.state.el.style
    elStyle.left = newPosLeft + 'px'
    elStyle.top = newPosTop + 'px'
  }
  resize(type, e) {
    if (!this.state || !this.state.el || !this.state.resizeArea) {
      return
    }
    let container = this.state.container
    const containerHeight = container.offsetHeight
    const containerWidth = container.offsetWidth
    const containerLeft = parseInt(container.style.left || 0, 10)
    const containerTop = parseInt(container.style.top || 0, 10)
    let resizeArea = this.state.resizeArea
    let el = this.state.el
    let elStyle = el.style
    if (type === 'right' || type === 'bottom') {
      let length
      if (type === 'right') {
        length = resizeArea.width + e.clientX - resizeArea.posLeft
      } else {
        length = resizeArea.height + e.clientY - resizeArea.posTop
      }
      if (parseInt(el.style.left, 10) + length > containerWidth || parseInt(el.style.top, 10) + length > containerHeight) {
        const w = containerWidth - parseInt(el.style.left, 10)
        const h = containerHeight - parseInt(el.style.top, 10)
        elStyle.width = elStyle.height = Math.min(w, h) + 'px'
      } else {
        elStyle.width = length + 'px'
        elStyle.height = length + 'px'
      }
    } else {
      let posChange
      let newPosLeft
      let newPosTop
      if (type === 'left') {
        posChange = resizeArea.posLeft - e.clientX
      } else {
        posChange = resizeArea.posTop - e.clientY
      }
      newPosLeft = resizeArea.left - posChange
      // 防止过度缩小
      if (newPosLeft > resizeArea.left + resizeArea.width) {
        elStyle.left = resizeArea.left + resizeArea.width + 'px'
        elStyle.top = resizeArea.top + resizeArea.height + 'px'
        elStyle.width = elStyle.height = '2px'
        return
      }
      newPosTop = resizeArea.top - posChange
      // 到达边界
      if (newPosLeft <= containerLeft || newPosTop < containerTop) {
        // 让选择框到图片最左边
        let newPosLeft2 = resizeArea.left -containerLeft
        // 判断顶部会不会超出边界
        if (newPosLeft2 < resizeArea.top) {
          // 未超出边界
          elStyle.top = resizeArea.top - newPosLeft2 + 'px'
          elStyle.left = containerLeft + 'px'
        } else {
          // 让选择框到达图片顶部
          elStyle.top = containerTop + 'px'
          elStyle.left = resizeArea.left + containerTop - resizeArea.top + 'px'
        }
      } else {
        if (newPosLeft < 0) {
          elStyle.left = 0;
          elStyle.width = Math.min(resizeArea.width + posChange - newPosLeft, containerWidth) + 'px'
          elStyle.top = newPosTop - newPosLeft;
          elStyle.height = Math.min(resizeArea.height + posChange - newPosLeft, containerHeight) + 'px'
          return;
        }
        if (newPosTop < 0) {
          elStyle.left = newPosLeft - newPosTop;
          elStyle.width = Math.min(resizeArea.width + posChange - newPosTop, containerWidth) + 'px'
          elStyle.top = 0;
          elStyle.height = Math.min(resizeArea.height + posChange - newPosTop, containerHeight) + 'px'
          return;
        }
        elStyle.left = newPosLeft + 'px'
        elStyle.top = newPosTop + 'px'
        elStyle.width = resizeArea.width + posChange + 'px'
        elStyle.height = resizeArea.height + posChange + 'px'
      }
    }
  }
  stop() {
    document.removeEventListener('mousemove', this.moveBind , false)
    document.removeEventListener('mousemove', this.resizeBind , false)
    document.removeEventListener('mouseup', this.stopBind, false)
    this.setState({...this.state, el: null, resizeArea: null, selectArea: null})
  }
  componentWillUnmount() {
    this.stop()
  }
  resizeStart = (e, type) => {
    e.stopPropagation()
    const el = e.target.parentElement
    let resizeArea = {
      posLeft: e.clientX,
      posTop: e.clientY,
      width: el.offsetWidth,
      height: el.offsetHeight,
      left: parseInt(el.style.left, 10),
      top: parseInt(el.style.top, 10)
    }
    this.setState({ ...this.state, resizeArea, el})
    this.resizeBind = this.resize.bind(this, type)
    document.addEventListener('mousemove', this.resizeBind, false)
    document.addEventListener('mouseup', this.stopBind, false)
  }

  render() {
    return (
     <div className="select-area" onMouseDown={ this.dragStart} ref="selectArea" >
       <div className="top-resize" onMouseDown={ event => this.resizeStart(event, 'top')}></div>
       <div className="right-resize" onMouseDown={ event => this.resizeStart(event, 'right')}></div>
       <div className="bottom-resize" onMouseDown={ event => this.resizeStart(event, 'bottom')}></div>
       <div className="left-resize" onMouseDown={ event => this.resizeStart(event, 'left')}></div>
       <div className="right-bottom-resize" onMouseDown={ event => this.resizeStart(event, 'right')}></div>
       <div className="left-top-resize" onMouseDown={ event => this.resizeStart(event, 'left')}></div>
     </div>
    )
  }
}

ReactDOM.render((
 <Cropper width="200px" height="200px"/>
), document.getElementById('root'))

