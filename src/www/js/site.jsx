"use strict";

const
  React = require('react'),
  ReactDOM = require('react-dom'),

  Router = require('react-router').Router,
  Route = require('react-router').Route,
  IndexRoute = require('react-router').IndexRoute,
  Link = require('react-router').Link,
  BrowserHistory = require('react-router').browserHistory,
  LinkContainer = require('react-router-bootstrap').LinkContainer,

  Alert = require('react-bootstrap').Alert,
  PageHeader = require('react-bootstrap').PageHeader,
  Jumbotron = require('react-bootstrap').Jumbotron,
  Form = require('react-bootstrap').Form,
  FormGroup = require('react-bootstrap').FormGroup,
  ControlLabel = require('react-bootstrap').ControlLabel,
  FormControl = require('react-bootstrap').FormControl,
  HelpBlock = require('react-bootstrap').HelpBlock,
  Button = require('react-bootstrap').Button,
  Panel = require('react-bootstrap').Panel,
  Image = require('react-bootstrap').Image,

  Row = require('react-bootstrap').Row,
  Col = require('react-bootstrap').Col,

  Nav = require('react-bootstrap').Nav,
  Navbar = require('react-bootstrap').Navbar,
  NavItem = require('react-bootstrap').NavItem;

class MainPage extends React.Component {
  render() {
    return (
      <div>
        <Navigation />
        {this.props.children}
        <hr />
        {this.props.route.owner}
      </div>
    )
  }
}

class StartPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      total: 0
    }
  }

  loadImageCount() {
    const _this = this;

    var myHeaders = new Headers();
    myHeaders.append('pragma', 'no-cache');
    myHeaders.append('cache-control', 'no-cache');

    var myInit = {
      method: 'GET',
      headers: myHeaders,
    };

    fetch(new Request("/API/length"), myInit).then(function (response) {
      const total = response.text().then(function (text) {
        _this.setState({
          total: text
        });
      })
    });
  }

  componentDidMount() {
    this.setState
    this.loadImageCount();
  }

  componentWillUnmount() {

  }

  render() {
    return (
      <Jumbotron>
        <h1>Welcome to the Webcenter!</h1>
        <p>This page is still in development.</p>
        <p>Currently there are {this.state.total} images on the server.</p>
      </Jumbotron>
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

function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
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
      <Jumbotron>
        <h3>{this.state.message}</h3>
        <Form action="/photos" method="post" encType="multipart/form-data">
          <FieldGroup
            id="uploadImages"
            name="uploadImages"
            type="file"
            label="Images"
            help="Images that should be uploaded to the server"
            multiple="true"
            />
          <FieldGroup
            id="dir"
            name="dir"
            type="text"
            label="Directory"
            help="Directory the files should be uploaded to"
            />
          <Button type="submit" id="submit" name="submit" value="Send" >
            Submit
          </Button>
        </Form>
      </Jumbotron>
    );
  }
}

class PhotoList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      photos: []
    }
  }

  loadImagePaths() {
    const _this = this;

    var myHeaders = new Headers();
    myHeaders.append('pragma', 'no-cache');
    myHeaders.append('cache-control', 'no-cache');

    var myInit = {
      method: 'GET',
      headers: myHeaders,
    };

    fetch(new Request("/API/imagePaths"), myInit).then(function (response) {
      const total = response.json().then(function (json) {
        _this.setState({
          photos: json
        });
      })
    });
  }

  componentDidMount() {
    this.loadImagePaths();
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
    return (
      <div>
        <Panel header={this.props.src}>
          <Row>
            <Col xs={12} md={6}>
              <img src={this.props.src} className="img-responsive center-block" />
            </Col>
            <Col xs={12} md={6}>
              <a href={this.props.src}>Download</a>
            </Col>
          </Row>
        </Panel>
      </div>
    )
  }
}

class SlideShow extends React.Component {
  constructor(props) {
    super(props);
    this.running = false;
    this.state = {
      id: 0,
      total: 0,
      imgLocalURL: ""
    };
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
      if (_this.running) {
        _this.setState({
          id: parseInt(values[2]) + 1,
          total: values[1],
          imgLocalURL: URL.createObjectURL(values[0])
        });
        setTimeout(() => _this.loadImage(), 1000);
      }
    });
  }

  componentDidMount() {
    this.running = true;
    this.loadImage();
  }

  componentWillUnmount() {
    this.running = false;
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

class Impressum extends React.Component {
  render() {
    return (
      <div>
        <p>Markus Weninger</p>
        <br />
        <p>Richard-Wagner-Straße 19/1</p>
        <p>4020</p>
        <p>Linz</p>
        <p>Österreich</p>
        <br />
        <p>markusw92@yahoo.de</p>
      </div>
    );
  }
}

class Navigation extends React.Component {
  render() {
    return (
      <Navbar inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Home</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <LinkContainer to="/photos">
              <NavItem eventKey={1}>Photos</NavItem>
            </LinkContainer>
            <LinkContainer to="/slideshow">
              <NavItem eventKey={2}>Slideshow</NavItem>
            </LinkContainer>
            <LinkContainer to="/impressum">
              <NavItem eventKey={3}>Impressum</NavItem>
            </LinkContainer>
          </Nav>
          <Nav pullRight>
            {/*<NavItem eventKey={1} href="#">Link Right</NavItem>
        <NavItem eventKey={2} href="#">Link Right</NavItem>*/}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

preloadState = JSON.parse(preloadState)

ReactDOM.render(
  <Router history={BrowserHistory}>
    <Route path="/" component={MainPage} owner={preloadState.owner} >
      <IndexRoute component={StartPage} />
      <Route component={Photos} path="photos" />
      <Route component={SlideShow} path="slideshow" />
      <Route component={Impressum} path="impressum" />
    </Route>
  </Router>,
  document.getElementById("app")
);