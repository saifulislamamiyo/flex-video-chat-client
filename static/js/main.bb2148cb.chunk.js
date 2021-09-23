(this["webpackJsonpsite-video-chat-client"]=this["webpackJsonpsite-video-chat-client"]||[]).push([[0],{205:function(e,t,a){"use strict";a.r(t);var o=a(7),n=a(81),i=a.n(n),c=(a(88),a.p,a(89),a(21)),r=a(22),s=a(8),d=a(24),l=a(23),m=a(20),h=a.n(m),u=a(206),v=a(2),f="video-svc-5346-dev.twil.io",k=a(20).createLocalVideoTrack,g=function(e){Object(d.a)(a,e);var t=Object(l.a)(a);function a(e){var o;return Object(c.a)(this,a),(o=t.call(this,e)).state={worker:"",token:"",identity:"",roomName:"",roomNameErr:!1,previewTracks:null,localMediaAvailable:!1,hasJoinedRoom:!1,activeRoom:null,screenTrack:null,showPreview:!0,isWaiting:!1,alertData:""},o.joinRoom=o.joinRoom.bind(Object(s.a)(o)),o.handleRoomNameChange=o.handleRoomNameChange.bind(Object(s.a)(o)),o.roomJoined=o.roomJoined.bind(Object(s.a)(o)),o.onLeaveRoom=o.onLeaveRoom.bind(Object(s.a)(o)),o.detachParticipantTracks=o.detachParticipantTracks.bind(Object(s.a)(o)),o.attachLocalTracks=o.attachLocalTracks.bind(Object(s.a)(o)),o}return Object(r.a)(a,[{key:"handleRoomNameChange",value:function(e){var t=e.target.value,a=e.target.value;this.setState({identity:t}),this.setState({roomName:a})}},{key:"joinRoom",value:function(){this.setState({identity:"Khospace Delray Beach",isWaiting:!0,alertData:"Joining room... "}),console.log("Joining room '"+this.state.roomName+"'...");var e={name:this.state.roomName};h.a.connect(this.state.token,e).then(this.roomJoined,(function(e){alert("Could not connect to Twilio: "+e.message)}))}},{key:"attachTracks",value:function(e,t){console.log("Saiful: attaching tracks:  "+e),e.forEach((function(e){t.appendChild(e.track.attach())}))}},{key:"attachLocalTracks",value:function(e,t){console.log("Saiful: adding local tracks:  "+e),Array.isArray(e)&&e.forEach((function(e){var a=e.track.attach();a.style.maxWidth="15%",a.style.position="absolute",a.style.top="-30%",a.style.left="10%",a.style.margin="0",a.style.zIndex="1",a.id="localVDO","video"==e.kind&&t.appendChild(a)}))}},{key:"attachParticipantTracks",value:function(e,t){console.log("Saiful: already found participants: "+e.identity);var a=Array.from(e.tracks.values());this.attachTracks(a,t)}},{key:"detachTracks",value:function(e){e.forEach((function(e){e.detach().forEach((function(e){e.remove()}))}))}},{key:"detachParticipantTracks",value:function(e){var t=Array.from(e.tracks.values()),a=this.refs.remoteMedia;a.querySelector("video")||this.detachParticipantTracks({tracks:t},a)}},{key:"onCreateTask",value:function(e,t,a,o){fetch("https://".concat(f,"/createvideotask?worker=").concat(encodeURIComponent(a),"&customerName=").concat(t,"&roomName=").concat(e,"&phoneNumber=").concat(o)).then((function(e){return e.json()})).then((function(e){console.log("task data",e)}))}},{key:"roomJoined",value:function(e){var t=this;console.log("Joined as '"+this.state.identity+"'"),console.log("room name: "+this.state.roomName),this.setState({activeRoom:e,localMediaAvailable:!0,hasJoinedRoom:!0,showPreview:!1,alertData:"Joined a room, waiting for an agent..."}),this.onCreateTask(this.state.roomName,this.state.identity,localStorage.worker,localStorage.number);this.refs.remoteMedia;console.log(document.getElementById("remote-media").children),this.attachLocalTracks(Array.from(e.localParticipant.tracks.values()),this.refs.remoteMedia);for(var a=document.getElementById("remote-media").children,o=0;o<a.length;o++){var n=a[o];console.log("Saiful: id is: "+n.id),"localVDO"!=n.id&&document.getElementById("remote-media").removeChild(n)}e.on("participantConnected",(function(e){console.log("Agent joined: '"+e.identity+"'"),e.on("trackSubscribed",(function(a){console.log(e.identity+"have added a track: "+a.kind),t.setState({alertData:"Agent "+e.identity+" has joined the room."}),document.getElementById("remote-media").appendChild(a.attach())}))})),e.on("participantDisconnected",(function(e){console.log("Participant '"+e.identity+"' left the room"),t.onLeaveRoom()})),e.on("disconnected",(function(){console.log("Room disconnect."),t.state.previewTracks&&t.state.previewTracks.forEach((function(e){e.stop()})),t.detachParticipantTracks(e.localParticipant),e.participants.forEach(t.detachParticipantTracks),t.setState({activeRoom:null,hasJoinedRoom:!1,previewTracks:null,localMediaAvailable:!1,showPreview:!0,isWaiting:!1}),k().then((function(e){var t=document.getElementById("local-media");"video"==e.kind&&t.appendChild(e.attach())})),document.getElementById("remote-media")&&(document.getElementById("remote-media").innerHTML="")}))}},{key:"onLeaveRoom",value:function(){this.setState({alertData:""}),this.state.activeRoom.disconnect(),document.getElementById("remote-media")&&(document.getElementById("remote-media").innerHTML=""),document.getElementById("local-media")&&(document.getElementById("local-media").innerHTML="")}},{key:"componentDidMount",value:function(){var e=this;fetch("https://".concat(f,"/flexvideotokenizer?Identity=").concat(this.state.identity)).then((function(e){return e.json()})).then((function(t){console.log("data:",t),e.setState({token:t.token,identity:t.identity,roomName:"t-"+Date.now()}),k().then((function(e){var t=document.getElementById("local-media");"video"==e.kind&&t.appendChild(e.attach())})),window.addEventListener("beforeunload",(function(){return e.onLeaveRoom()})),window.addEventListener("pagehide",(function(){return e.onLeaveRoom})),document.getElementById("remote-media")&&(document.getElementById("remote-media").innerHTML="")}))}},{key:"render",value:function(){var e=Object(v.jsx)(u.a,{color:"warning",disabled:!0,children:"Connecting..."}),t=this.state.isWaiting?e:Object(v.jsx)("div",{children:Object(v.jsx)(u.a,{color:"success",onClick:this.joinRoom,children:"Start Video"})}),a=this.state.hasJoinedRoom?Object(v.jsx)(u.a,{color:"danger",onClick:this.onLeaveRoom,children:"Hang Up"}):t;return Object(v.jsx)("div",{children:Object(v.jsxs)("div",{className:"containerS",children:[this.state.showPreview?Object(v.jsx)("div",{className:"preview",children:Object(v.jsx)("div",{ref:"localMedia",id:"local-media"})}):Object(v.jsx)("div",{className:"remoteContainer",children:Object(v.jsx)("div",{ref:"remoteMedia",id:"remote-media"})}),Object(v.jsx)("div",{className:"buttonS",children:a}),Object(v.jsx)("div",{color:"primary",className:"alertS",ref:"alert",id:"alert-data",children:this.state.alertData})]})})}}]),a}(o.Component);o.Component;var y=function(){return Object(v.jsx)("div",{className:"App",children:Object(v.jsx)(g,{})})};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));a(204);i.a.render(Object(v.jsx)(y,{}),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))},88:function(e,t,a){},89:function(e,t,a){}},[[205,1,2]]]);
//# sourceMappingURL=main.bb2148cb.chunk.js.map