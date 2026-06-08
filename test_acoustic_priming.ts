import { GoogleGenAI, Modality, Type } from '@google/genai';

const ai = new GoogleGenAI({});

async function main() {
  const session = await ai.live.connect({
    model: 'gemini-3.1-flash-live-preview',
    config: {
      responseModalities: [Modality.AUDIO],
      outputAudioTranscription: {},
      realtimeInputConfig: {
        // Disable automatic VAD to give us manual control
        automaticActivityDetection: { disabled: true },
      },
      tools: [
        {
          functionDeclarations: [
            {
              name: 'fetch_payload',
              description: 'Fetches the massive, complex text instruction task payload.'
            },
            {
              name: 'execute_code',
              description: 'Executes the given code string for the task.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  code_string: { type: Type.STRING }
                },
                required: ['code_string']
              }
            }
          ]
        }
      ]
    },
    callbacks: {
      onmessage: (msg: any) => {
        if (msg.serverContent?.modelTurn?.parts) {
          // Typically an audio response or text transcription
          const hasAudio = msg.serverContent.modelTurn.parts.some((p: any) => !!p.inlineData);
          if (hasAudio) {
            console.log("-> [Agent Audio Chunk Received]");
          }
        }

        if (msg.toolCall) {
          const call = msg.toolCall.functionCalls[0];
          console.log(`-> [Tool Call]: ${call.name}`, call.args);

          // Extract thought signature
          // Gemini 3.1 enforces strict sequential tool calling. 
          // The thoughtSignature might be attached at the toolCall or part level.
          let thoughtSignature = msg.toolCall.thoughtSignature;
          if (!thoughtSignature && msg.serverContent?.modelTurn?.parts) {
             for (const part of msg.serverContent.modelTurn.parts) {
                 if (part.thoughtSignature) {
                    thoughtSignature = part.thoughtSignature;
                 }
             }
          }

          if (call.name === 'fetch_payload') {
            console.log("-> Injecting complex text payload with thoughtSignature.");
            // Build the envelope manually to avoid the SDK "Error: Tool response parameters are required" crash wrapper
            const envelope: any = {
              toolResponse: {
                functionResponses: [
                  {
                    id: call.id,
                    name: call.name,
                    response: { result: "COMPLEX INSTRUCTION: execute the task by executing the code `console.log('Phase 2 Complete')`" }
                  }
                ]
              }
            };

            // Exactly position thoughtSignature at the root of the toolResponse envelope
            if (thoughtSignature) {
              envelope.toolResponse.thoughtSignature = thoughtSignature;
            }

            // Using pure JSON send over the websocket reference
            (session as any).conn.send(JSON.stringify(envelope));
          } else if (call.name === 'execute_code') {
            console.log("-> Executing code mock.");
            const envelope: any = {
              toolResponse: {
                functionResponses: [
                  {
                    id: call.id,
                    name: call.name,
                    response: { result: "Code executed successfully" }
                  }
                ]
              }
            };
            if (thoughtSignature) {
              envelope.toolResponse.thoughtSignature = thoughtSignature;
            }

            (session as any).conn.send(JSON.stringify(envelope));
          }
        }

        if (msg.serverContent?.turnComplete) {
          console.log("-> Agent turn complete.");
          // We don't exit here immediately in case it executes multiple tool calls
        }
      }
    }
  });

  console.log("Connected to Gemini Live Session.");

  // Simulate human sending audio via sendRealtimeInput JSON (bypassing limits if needed)
  console.log("Triggering manual tool fetch with audio simulation...");

  // Mock base64 PCM audio chunk
  const mockAudioBase64 = Buffer.alloc(16000 * 2).toString('base64'); // 1s of 16kHz audio

  // Activity start
  (session as any).conn.send(JSON.stringify({
    realtimeInput: { activityStart: {} }
  }));

  // But realistically, if it's just raw silence, the model might not invoke the tool. 
  // Let's ALSO send a clientContent message to ensure the model *actually* knows to invoke Phase Two
  // in case the mock audio fails to transcribe as "Fetch payload".
  (session as any).conn.send(JSON.stringify({
    clientContent: {
      turns: [{ role: 'user', parts: [{ text: "Agent, initiate phase two. Fetch your text payload." }] }],
      turnComplete: false
    }
  }));

  // Send the simulated audio chunk
  (session as any).conn.send(JSON.stringify({
    realtimeInput: {
      audio: {
        mimeType: "audio/pcm;rate=16000",
        data: mockAudioBase64
      }
    }
  }));

  // Activity End signals turn complete for VAD-disabled setup
  (session as any).conn.send(JSON.stringify({
    realtimeInput: { activityEnd: {} }
  }));

  // Also enforce turn completion internally
  (session as any).conn.send(JSON.stringify({
    clientContent: { turnComplete: true }
  }));
}

main().catch(console.error);
