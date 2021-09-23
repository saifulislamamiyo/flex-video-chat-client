import React, { Component } from "react";
import Video from "twilio-video";
import { Container, Row, Col, Button, Input } from "reactstrap";

export default class ExampleComp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      worker: "",
      token: "",
      identity: "",
      roomName: "" /* Will store the room name */,
      roomNameErr: false /* Track error for room name TextField. This will    enable us to show an error message when this variable is true */,
      previewTracks: null,
      localMediaAvailable: false /* Represents the availability of a LocalAudioTrack(microphone) and a LocalVideoTrack(camera) */,
      hasJoinedRoom: false,
      activeRoom: null, // Track the current active room
      screenTrack: null,
      showPreview: true
    };
  }

  render() {
    // Hide 'Join Room' button if user has already joined a room.
    let joinOrLeaveRoomButton = this.state.hasJoinedRoom ? (
      <Button color="danger" onClick={this.onLeaveRoom}>
        Hang Up
      </Button>
    ) : (
        <Button color="success" onClick={this.joinRoom}>
          Start Video
        </Button>
    );
    
    return (
      <div>
          <div className="containerS">
              {this.state.showPreview ? (
                  <div className="preview">
                    <div ref="localMedia" 
                    id="local-media"/>
                  </div>
                ) : <div className="remoteContainer">
                <div
                  ref="remoteMedia"
                  id="remote-media"
                />
                </div>}

                <div className="buttonS">
                  {joinOrLeaveRoomButton}
                </div>
          </div>
      </div>
    );
  }
}