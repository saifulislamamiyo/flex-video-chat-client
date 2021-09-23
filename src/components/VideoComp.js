import React, { Component } from "react";
import Video from "twilio-video";
import { Alert, Button } from "reactstrap";

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
      showPreview: true,
      isWaiting: false,
      alertData: ""
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
    this.setState({
      identity: "Khospace Delray Beach",
      isWaiting: true,
      alertData: "Joining room... "
    });

    console.log("Joining room '" + this.state.roomName + "'...");
    let connectOptions = {
      name: this.state.roomName
    };

    Video.connect(this.state.token, connectOptions).then(
      this.roomJoined,
      error => {
        alert("Could not connect to Twilio: " + error.message);
      }
    );
  }


  // Attach the Tracks to the DOM for others.
  attachTracks(tracks, container) {
    console.log("Saiful: attaching tracks:  "+tracks);
    tracks.forEach(track => {
      container.appendChild(track.track.attach());
    });
  }

  attachLocalTracks(tracks, container) {
    console.log("Saiful: adding local tracks:  "+tracks);
    if(Array.isArray(tracks)){
      tracks.forEach(track => {
        let trackDom = track.track.attach();
        trackDom.style.maxWidth = "15%";
        trackDom.style.position = "absolute";
        trackDom.style.top = "-30%";
        trackDom.style.left = "10%";
        trackDom.style.margin = "0";
        trackDom.style.zIndex = "1";
        trackDom.id = "localVDO";
        if (track.kind == 'video'){
          container.appendChild(trackDom);
        }
      });
    }
  }
  // Attach the Participant's Tracks to the DOM.
  attachParticipantTracks(participant, container) {
    console.log("Saiful: already found participants: "+participant.identity);
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
    console.log("room name: "+this.state.roomName);
    this.setState({
      activeRoom: room,
      localMediaAvailable: true,
      hasJoinedRoom: true, 
      showPreview: false,
      alertData: "Joined a room, waiting for an agent..."
    });

    this.onCreateTask(
      this.state.roomName,
      this.state.identity,
      localStorage.worker,
      localStorage.number
    );

    // Attach LocalParticipant's tracks to the DOM, if not already attached.
    var previewContainer = this.refs.remoteMedia;
    console.log(document.getElementById('remote-media').children);

    // add participant tracks
    // room.participants.forEach((participant) => {
    //   this.attachParticipantTracks(participant, this.refs.remoteMedia);
    // });

    // if (!previewContainer.querySelector("video")) {
      //this.attachParticipantTracks(room.localParticipant, previewContainer);
      this.attachLocalTracks(Array.from(room.localParticipant.tracks.values()), this.refs.remoteMedia);
      //document.getElementById('local-media').innerHTML='';
      let childElements = document.getElementById('remote-media').children;
      for(var i=0; i<childElements.length; i++){
        var child = childElements[i];
        console.log("Saiful: id is: "+child.id);
        if(child.id != 'localVDO'){
          document.getElementById('remote-media').removeChild(child);
        }
      }
    // }
    
    // Participant joining room
    room.on("participantConnected", participant => {
      console.log("Agent joined: '" + participant.identity + "'");
      participant.on('trackSubscribed', track => {
        console.log(participant.identity+ "have added a track: "+track.kind);
        //var previewContainer = this.refs.remoteMedia;
        //this.attachTracks([track], previewContainer);
        this.setState({
          alertData: "Agent "+participant.identity+" has joined the room."
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
        showPreview: true,
        isWaiting: false
      });
      createLocalVideoTrack().then(track => {
        const localMediaContainer = document.getElementById('local-media');
        if(track.kind == "video"){
          localMediaContainer.appendChild(track.attach());
        } 
      });
      var remoteContainer = document.getElementById('remote-media');
        if(remoteContainer){
          document.getElementById('remote-media').innerHTML='';
        }
    });
  }

  onLeaveRoom() {
    this.setState({
      alertData: ""
    });
    this.state.activeRoom.disconnect();
    var remoteContainer = document.getElementById('remote-media');
    if(remoteContainer){
      document.getElementById('remote-media').innerHTML='';
    }
    var localContainer = document.getElementById('local-media');
    if(localContainer){
      document.getElementById('local-media').innerHTML='';
    }
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
          roomName: 't-'+Date.now()
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
        var remoteContainer = document.getElementById('remote-media');
        if(remoteContainer){
          document.getElementById('remote-media').innerHTML='';
        }
      });
  }
  

  render() {
    // Hide 'Join Room' button if user has already joined a room.
    let connectingButton = (
      <Button color="warning" disabled>
          Connecting...
      </Button>
    );
    let defaultJoinOrLeaveRoomButton = this.state.isWaiting ? connectingButton : (
      <div>
        <Button color="success" onClick={this.joinRoom}>
          Start Video
        </Button>
      </div>
    );
    let joinOrLeaveRoomButton = this.state.hasJoinedRoom ? (
      <Button color="danger" onClick={this.onLeaveRoom}>
        Hang Up
      </Button>
    ) : defaultJoinOrLeaveRoomButton ;
    
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
                <div color="primary" className="alertS" ref="alert" id="alert-data">
                  {this.state.alertData}
                </div>
          </div>
      </div>
    );
  }
}
