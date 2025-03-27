import { SignalMessage } from "@shared/types";

// Configuration for WebRTC
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

export class WebRTCConnection {
  private connection: RTCPeerConnection;
  private stream: MediaStream | null = null;
  private onStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onIceCandidateCallback: ((candidate: RTCIceCandidate) => void) | null = null;

  constructor() {
    this.connection = new RTCPeerConnection(configuration);
    
    // Handle ICE candidates
    this.connection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidateCallback) {
        this.onIceCandidateCallback(event.candidate);
      }
    };
    
    // Handle remote streams
    this.connection.ontrack = (event) => {
      if (event.streams && event.streams[0] && this.onStreamCallback) {
        this.stream = event.streams[0];
        this.onStreamCallback(this.stream);
      }
    };
  }

  // Set callbacks
  public onStream(callback: (stream: MediaStream) => void): void {
    this.onStreamCallback = callback;
  }

  public onIceCandidate(callback: (candidate: RTCIceCandidate) => void): void {
    this.onIceCandidateCallback = callback;
  }

  // Create an offer and set local description
  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);
    return offer;
  }

  // Create an answer and set local description
  public async createAnswer(): Promise<RTCSessionDescriptionInit> {
    const answer = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answer);
    return answer;
  }

  // Set remote description from offer or answer
  public async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    await this.connection.setRemoteDescription(
      new RTCSessionDescription(description)
    );
  }

  // Add ICE candidate from remote peer
  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  // Add local stream to connection
  public addStream(stream: MediaStream): void {
    stream.getTracks().forEach(track => {
      this.connection.addTrack(track, stream);
    });
  }

  // Close the connection
  public close(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.connection.close();
  }
}

// Helper function to create a WebRTC connection and handle signaling
export const createWebRTCConnection = (
  sendSignal: (message: SignalMessage) => void,
  peerId: string,
): WebRTCConnection => {
  const connection = new WebRTCConnection();
  
  // Handle ICE candidates
  connection.onIceCandidate((candidate) => {
    sendSignal({
      type: 'ice-candidate',
      payload: candidate,
      from: 'browser-client',
      to: peerId
    });
  });
  
  return connection;
};
