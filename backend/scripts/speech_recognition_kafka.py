import speech_recognition as sr
from kafka import KafkaProducer
import json
from datetime import datetime

KAFKA_TOPIC = 'recognized-text'
KAFKA_BOOTSTRAP_SERVERS = 'localhost:9092'

def list_microphones():
    print("Available microphone devices:")
    for index, name in enumerate(sr.Microphone.list_microphone_names()):
        print(f"{index}: {name}")

def recognize_speech_from_mic(device_index=None):
    recognizer = sr.Recognizer()
    try:
        mic = sr.Microphone(device_index=device_index)
        with mic as source:
            if not hasattr(source, 'stream') or source.stream is None:
                print("Error: The selected device index does not correspond to a valid input/capture device.")
                return
    except OSError as e:
        print(f"Could not initialize microphone: {e}")
        return
    except Exception as e:
        print(f"Error initializing microphone: {e}")
        return
    producer = KafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    print("Adjusting for ambient noise, please wait...")
    try:
        with mic as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
    except Exception as e:
        print(f"Error during ambient noise adjustment: {e}")
        return
    print("Start speaking. Press Ctrl+C to stop.")

    def callback(recognizer, audio):
        try:
            print("Recognizing (realtime)...")
            text = recognizer.recognize_google(audio, language="en-US")
            print("You said (English):", text)
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            message = {
                "timestamp": timestamp,
                "text": text
            }
            producer.send(KAFKA_TOPIC, message)
            producer.flush()
        except sr.UnknownValueError:
            print("Sorry, could not understand the audio.")
        except sr.RequestError as e:
            print(f"Could not request results from Google Speech Recognition service; {e}")

    stop_listening = recognizer.listen_in_background(mic, callback, phrase_time_limit=2)
    try:
        while True:
            pass  # Keep the main thread alive
    except KeyboardInterrupt:
        print("\nRecognition stopped by user.")
        stop_listening(wait_for_stop=False)
        producer.close()

if __name__ == "__main__":
    list_microphones()
    # Prompt user to enter device index
    device_index_input = input("Enter the device index to use for microphone (or press Enter to use default): ")
    if device_index_input.strip() == "":
        device_index = None
    else:
        try:
            device_index = int(device_index_input)
        except ValueError:
            print("Invalid input. Using default microphone.")
            device_index = None
    recognize_speech_from_mic(device_index)
