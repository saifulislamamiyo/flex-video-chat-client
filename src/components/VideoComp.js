import React, { Component } from "react";
import Video from "twilio-video";
import { Container, Row, Col, Button, Input } from "reactstrap";

const twilioRuntimeDomain = 'video-svc-5346-dev.twil.io';
const { createLocalVideoTrack } = require('twilio-video');

export default class VideoComp extends Component {
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

    this.joinRoom = this.joinRoom.bind(this);
    this.handleRoomNameChange = this.handleRoomNameChange.bind(this);
    this.roomJoined = this.roomJoined.bind(this);
    this.onLeaveRoom = this.onLeaveRoom.bind(this);
    this.detachParticipantTracks = this.detachParticipantTracks.bind(this);
    this.attachLocalTracks = this.attachLocalTracks.bind(this);
  }

  handleRoomNameChange(e) {
    /* Fetch room name from text field and update state */
    let identity = e.target.value;
    let roomName = e.target.value;
    this.setState({ identity });
    this.setState({ roomName });
  }

  joinRoom() {
    /*
   Show an error message on room name text field if user tries         joining a room without providing a room name. This is enabled by setting `roomNameErr` to true
     */
    // if (!this.state.roomName.trim()) {
    //   this.setState({ roomNameErr: true });
    //   return;
    // }
    this.state.roomName="Khospace Delray Beach";

    console.log("Joining room '" + this.state.roomName + "'...");
    let connectOptions = {
      name: this.state.roomName
    };

    if (this.state.previewTracks) {
      connectOptions.tracks = this.state.previewTracks;
    }
    Video.connect(this.state.token, connectOptions).then(
      this.roomJoined,
      error => {
        alert("Could not connect to Twilio: " + error.message);
      }
    );
  }

  // Screen sharing
  getScreenShare() {
    if (navigator.getDisplayMedia) {
      return navigator.getDisplayMedia({ video: true });
    } else if (navigator.mediaDevices.getDisplayMedia) {
      return navigator.mediaDevices.getDisplayMedia({ video: true });
    } else {
      return navigator.mediaDevices.getUserMedia({
        video: { mediaSource: "screen" }
      });
    }
  }

  // Attach the Tracks to the DOM for others.
  attachTracks(tracks, container) {
    console.log("Saiful: "+tracks);
    tracks.forEach(track => {
      container.appendChild(track.track.attach());
    });
  }

  attachLocalTracks(tracks, container) {
    console.log("SaifulL: "+tracks);
    if(Array.isArray(tracks)){
      tracks.forEach(track => {
        let trackDom = track.track.attach();
        trackDom.style.maxWidth = "15%";
        trackDom.style.position = "absolute";
        trackDom.style.top = "20px";
        trackDom.style.left = "50px";
        trackDom.style.left = "0px";
        trackDom.style.margin = "0";
        container.appendChild(trackDom);
      });
    }
  }
  // Attach the Participant's Tracks to the DOM.
  attachParticipantTracks(participant, container) {
    var tracks = Array.from(participant.tracks.values());
    this.attachTracks(tracks, container);
  }

  // Detach the Tracks from the DOM.
  detachTracks(tracks) {
    tracks.forEach(function(track) {
      track.detach().forEach(function(detachedElement) {
        detachedElement.remove();
      });
    });
  }

  // Detach the Participant's Tracks from the DOM.
  detachParticipantTracks(participant) {
    var tracks = Array.from(participant.tracks.values());
    var previewContainer = this.refs.remoteMedia;
    if (!previewContainer.querySelector("video")) {
      this.detachParticipantTracks({ tracks: tracks }, previewContainer);
    }
  }

  onCreateTask(roomName, customerName, worker, number) {
    fetch(
      `https://${twilioRuntimeDomain}/createvideotask?worker=${encodeURIComponent(
        worker
      )}&customerName=${customerName}&roomName=${roomName}&phoneNumber=${number}`
    )
      .then(res => res.json())
      .then(data => {
        console.log("task data", data);
      });
  }

  roomJoined(room) {
    // Called when a participant joins a room
    console.log("Joined as '" + this.state.identity + "'");
    this.setState({
      activeRoom: room,
      localMediaAvailable: true,
      hasJoinedRoom: true // Removes ‘Join Room’ button and shows ‘Leave Room’
    });

    this.onCreateTask(
      this.state.roomName,
      this.state.roomName,
      localStorage.worker,
      localStorage.number
    );

    // Attach LocalParticipant's tracks to the DOM, if not already attached.
    var previewContainer = this.refs.remoteMedia;

    if (!previewContainer.querySelector("video")) {
      //this.attachParticipantTracks(room.localParticipant, previewContainer);
      this.attachLocalTracks(Array.from(room.localParticipant.tracks.values()), this.refs.remoteMedia);
      //document.getElementById('local-media').innerHTML='';
      
    }
    
    // Participant joining room
    room.on("participantConnected", participant => {
      console.log("Joining: '" + participant.identity + "'");
      participant.on('trackSubscribed', track => {
        console.log(participant.identity+ "have added a track: "+track.kind);
        //var previewContainer = this.refs.remoteMedia;
        //this.attachTracks([track], previewContainer);
        this.setState({
          showPreview: false
        });
        document.getElementById('remote-media').appendChild(track.attach());
        // this.attachLocalTracks(Array.from(room.localParticipant.tracks.values()), this.refs.remoteMedia);
      });
    });

    // Detach all participant’s track when they leave a room.
    room.on("participantDisconnected", participant => {
      console.log("Participant '" + participant.identity + "' left the room");
      // this.detachParticipantTracks(participant);
      //document.getElementById('remote-media').innerHTML='';
      this.onLeaveRoom();
    });

    // Once the local participant leaves the room, detach the Tracks
    // of all other participants, including that of the LocalParticipant.
    room.on("disconnected", () => {
      console.log("Room disconnect.")
      if (this.state.previewTracks) {
        this.state.previewTracks.forEach(track => {
          track.stop();
        });
      }
      this.detachParticipantTracks(room.localParticipant);
      room.participants.forEach(this.detachParticipantTracks);
      this.setState({
        activeRoom: null,
        hasJoinedRoom: false,
        previewTracks: null,
        localMediaAvailable: false,
        showPreview: true
      });
      createLocalVideoTrack().then(track => {
        const localMediaContainer = document.getElementById('local-media');
        if(track.kind == "video"){
          localMediaContainer.appendChild(track.attach());
        } 
      });
    });
  }

  onLeaveRoom() {
    this.state.activeRoom.disconnect();
    document.getElementById('remote-media').innerHTML='';
    document.getElementById('local-media').innerHTML='';
  }

  componentDidMount() {
    fetch(
      `https://${twilioRuntimeDomain}/flexvideotokenizer?Identity=${
        this.state.identity
      }`
    )
      .then(res => res.json())
      .then(data => {
        console.log("data:", data);
        this.setState({
          token: data.token,
          identity: data.identity,
          roomName: Date.now()
        });
        createLocalVideoTrack().then(track => {
          const localMediaContainer = document.getElementById('local-media');
          if(track.kind == "video"){
            localMediaContainer.appendChild(track.attach());
          } 
        });
        window.addEventListener('beforeunload', () => this.onLeaveRoom());
        window.addEventListener('pagehide', () => this.onLeaveRoom);
        //this.joinRoom();
      });
  }
  

  render() {
    // Hide 'Join Room' button if user has already joined a room.
    let joinOrLeaveRoomButton = this.state.hasJoinedRoom ? (
      <Button color="danger" onClick={this.onLeaveRoom}>
        Hang Up
      </Button>
    ) : (
      <div>
        <Button color="success" onClick={this.joinRoom}>
          Start Video
        </Button>
      </div>
    );
    
    return (
      <div>
          <Container fluid={true}>
            <Row style={{ marginTop: 25 }} xs="2">
              <Col xs="5">
                {this.state.showPreview ? (
                  <div className="preview">
                    <div ref="localMedia" 
                    id="local-media"/>
                  </div>
                ) : null}
                <div className="remoteContainer">
                  <div
                    ref="remoteMedia"
                    id="remote-media"
                  />
                </div>
              </Col>
              <Col>
                {joinOrLeaveRoomButton}
              </Col>
            </Row>
          </Container>
      </div>
    );
  }
}
