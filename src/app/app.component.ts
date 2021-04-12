import { Component, OnInit, NgZone } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { map } from 'rxjs/operators';
import recognizeMicrophone from 'watson-speech/speech-to-text/recognize-microphone';
import synthesize from 'watson-speech/text-to-speech/synthesize';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private ngZone: NgZone) {}

  title = 'voice-recognition';
  voiceText: string;
  isListening: boolean;
  stream: any;
  ttsToken = {};

  ngOnInit() {
    console.log('Initiating...');
  }

  onVoiceListen() {
    console.log('listening...');
    this.voiceText = '';
    this.isListening = true;
    fetch('/api/stt/token')
      .then((res) => {
        return res.json();
      })
      .then((token) => {
        try {
          this.stream = recognizeMicrophone(
            Object.assign(token, {
              objectMode: true,
              format: false,
            })
          );
        } catch (error) {
          alert('Voice recognition not supported in this browser.');
        }
        this.stream.on('data', (data) => {
          console.log('data is', data);
          if (data.results && data.results[0] && data.results[0].final) {
            this.ngZone.run(() => {
              this.stream.stop();
              console.log('stopping to listen');
              this.isListening = false;
              this.setTtsToken();
            });
          } else if (data.results && data.results.length) {
            this.ngZone.run(() => {
              const { transcript } = data.results[0].alternatives[0];
              console.log(transcript);
              this.voiceText = transcript;
            });
          }
        });
        this.stream.on('error', (err) => {
          console.log(err);
        });
      })
      .catch(console.error);
  }

  async setTtsToken() {
    const res = await fetch('/api/tts/token');
    const ttsToken = await res.json();
    this.ttsToken = ttsToken;
  }

  speak() {
    const audio = synthesize(
      Object.assign(this.ttsToken, {
        text: this.voiceText,
      })
    );
    audio.onerror = (err) => {
      console.log('audio error: ', err);
    };
  }

  onVoiceStop() {
    this.isListening = false;
    this.stream.stop();
  }
}
