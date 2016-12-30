"use strict";

const
  React = require('react'),
  ReactDOM = require('react-dom'),
  Router = require('react-router').Router,
  Route = require('react-router').Route,
  IndexRoute = require('react-router').IndexRoute,
  Link = require('react-router').Link,
  BrowserHistory = require('react-router').browserHistory;

class MainPage extends React.Component {
  render() {
    return (
      <div>
        <Navigation />
        {this.props.children}
      </div>
    )
  }
}

class StartPage extends React.Component {
  render() {
    return (
      <div className="start-page">
        <h1>Welcome to {this.props.route.title}!</h1>
      </div>
    );
  }
}

class Photos extends React.Component {
  render() {
    return (
      <div className="photos">
        <PhotoUpload />
        <PhotoList photos={this.props.route.photos} />
      </div>
    );
  }
}

class PhotoUpload extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      message: ""
    }
  }

  render() {
    return (
      <div className="photo-upload">
        <h3>{this.state.message}</h3>
        <form action="/photos" method="post" encType="multipart/form-data">
          <input type="file" name="uploadImages" multiple="true" />
          <input type="text" name="dir" />
          <input type="submit" name="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

class PhotoList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      photos: this.props.photos
    }
  }

  render() {
    return (
      <div className="photo-list">
        {this.state.photos.map(item => <Photo key={item} src={item} />)}
      </div>
    );
  }
}

class Photo extends React.Component {
  render() {
    return <div>
      <hr />
      <p>{this.props.src}</p>
      <img src={this.props.src} width="360" />
      <br />
      <a href={this.props.src}>Download</a>
      <hr />
    </div>
  }
}

class SlideShow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: 0,
      total: 0,
      imgLocalURL: ""
    }
  }

  loadImage() {
    const _this = this;

    var myHeaders = new Headers();
    myHeaders.append('pragma', 'no-cache');
    myHeaders.append('cache-control', 'no-cache');

    var myInit = {
      method: 'GET',
      headers: myHeaders,
    };

    console.log("load")

    Promise.all([
      fetch(new Request("/API/currentImage"), myInit).then(function (response) {
        return response.blob();
      }),
      fetch(new Request("/API/length"), myInit).then(function (response) {
        return response.text();
      }),
      fetch(new Request("/API/currentId"), myInit).then(function (response) {
        return response.text();
      })
    ]).then(values => {
      _this.setState({
        id: values[2],
        total: values[1],
        imgLocalURL: URL.createObjectURL(values[0])
      }
      )
      setTimeout(() => _this.loadImage(), 5000);
    });
  }

  componentDidMount() {
    this.loadImage();
  }

  render() {
    const imageDivStyle = { position: 'fixed', height: '100%', width: '100%', top: '0', left: '0', background: '#000000' }
    const imageStyle = { height: '100%', position: 'absolute', margin: 'auto', top: '0', left: '0', right: '0', bottom: '0' }
    const labelDivStyle = { position: 'fixed', top: '0', left: '10', background: '#000000' }
    const labelStyle = { background: '#FFFFFF' }
    return (
      <div className="slide-show">
        <div style={imageDivStyle}>
          <img id="image" style={imageStyle} src={this.state.imgLocalURL} />
        </div>
        <div style={labelDivStyle}>
          <p style={labelStyle} id="iid" >{this.state.id}</p>
          <p style={labelStyle} id="iof" >{this.state.total}</p>
        </div>
      </div>
    );
  }
}

class Navigation extends React.Component {
  render() {
    return (
      <aside className="primary-aside">
        <ul>
          {/* <li><Link to="/">Home</Link></li>
          <li><Link to="/photos">Photos</Link></li>
          <li><Link to="/slideshow">Slideshow</Link></li> */}
          <li><a href="/">Home</a></li>
          <li><a href="/photos">Photos</a></li>
          <li><a href="/slideshow">Slideshow</a></li>
        </ul>
      </aside>
    )
  }
}

preloadState = JSON.parse(preloadState)

ReactDOM.render(
  <Router history={BrowserHistory}>
    <Route path="/" component={MainPage}>
      <IndexRoute component={StartPage} title={preloadState.title} />
    </Route>
    <Route path="/photos" component={MainPage} >
      <IndexRoute component={Photos} photos={preloadState.photos} />
    </Route>
    <Route path="/slideshow" component={MainPage}>
      <IndexRoute component={SlideShow} title={preloadState.title} />
    </Route>
  </Router>,
  document.getElementById("app")
);