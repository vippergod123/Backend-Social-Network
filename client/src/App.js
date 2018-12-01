import React, { Component } from 'react';
import axios from "axios"
import Gallery from "react-grid-gallery"

const captionStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  maxHeight: "240px",
  overflow: "hidden",
  position: "absolute",
  bottom: "0",
  width: "100%",
  color: "white",
  padding: "10px",
  fontSize: "90%"
};

class App extends Component {
    
  constructor(props) {
    super(props);
    this.state = {pictures:[]}
  }
  

  componentDidMount() { 
      axios.get('/flickr')
        .then(res => {
          console.log(res.data);
            this.setState({
              pictures: res.data.photos.photo
          });
        })
      
  }

  render() {
    
    return (
      <div className="container">
          <Gallery 
                    enableImageSelection={false} 
                    rowHeight={280} 
                    enableLightbox = {false}
                    images={this.state.pictures.map((pic, index) => 
                      {
                        return {
                        src: pic.url_l,
                        thumbnail: pic.url_l,
                        thumbnailWidth: pic.width_l,
                        thumbnailHeight: pic.height_l,
                        customOverlay: 
                        (
                          <div style={captionStyle}>
                            <b>{pic.title}</b>
                            <div>Owner: {pic.ownername}</div>
                            <div>Views: {pic.views}</div>
                          </div>
                          )
                        }
                      }
                    )}
            />
      </div>
    );
  }
}

export default App;
