# Speech to Text Feature

This feature implements real-time speech recognition using a Python script that captures microphone audio, performs speech-to-text conversion using Google Speech Recognition API, and streams recognized text to a Kafka topic.

## Components

- **speech_recognition_kafka.py**: Python script that captures audio from a microphone, recognizes speech in real-time, and sends recognized text messages to a Kafka topic (`recognized-text`).

- **Kafka**: Message broker used to transport recognized text messages from the Python script to the backend service.

- **Backend KafkaTextProcessingService**: Consumes messages from Kafka topic `recognized-text`, processes them, and produces messages to Kafka topic `processed-text`.

- **Backend KafkaConsumerService**: Consumes messages from Kafka topic `processed-text` and streams them to the frontend via Server-Sent Events (SSE).

- **Frontend**: Subscribes to SSE endpoint to receive recognized text messages and displays them in real-time.

## Workflow Visualization

```mermaid
graph LR
    A[Python Speech Recognition Script]
    B[Kafka Topic: recognized-text]
    C[Backend KafkaTextProcessingService]
    D[Kafka Topic: processed-text]
    E[Backend KafkaConsumerService]
    F[Frontend SSE Client]

    A -->|Sends recognized text| B
    B -->|Consumed by| C
    C -->|Sends processed text| D
    D -->|Consumed by| E
    E -->|Streams via SSE| F
```

## Setup and Usage

1. **Kafka Setup**: Ensure Kafka is installed and running on `localhost:9092`.

   - To start Kafka, follow these steps:

     - Start Zookeeper (if required):
       ```
       bin/zookeeper-server-start.sh config/zookeeper.properties
       ```
     - Start Kafka broker:
       ```
       bin/kafka-server-start.sh config/server.properties
       ```

   - Alternatively, if using Docker, run:
     ```
     docker-compose up -d kafka zookeeper
     ```

2. **Python Dependencies**: Install required Python packages:
   ```
   pip install SpeechRecognition kafka-python
   ```

3. **Running the Script**:
   - List available microphone devices:
     ```
     python speech_recognition_kafka.py
     ```
   - Enter the device index to use for microphone input or press Enter to use the default device.
   - The script will adjust for ambient noise and start recognizing speech in real-time.
   - Recognized text messages are sent to the Kafka topic `recognized-text`.

4. **Backend and Frontend**:
   - Backend consumes Kafka messages and streams them to frontend via SSE.
   - Frontend displays recognized text in real-time.

## Optimization Notes

- Ambient noise adjustment duration is set to 0.2 seconds for faster startup.
- Phrase time limit for recognition is set to 1 second for more frequent updates.
- Kafka producer flush is batched to improve throughput.

## Troubleshooting

- Ensure microphone device index is correct.
- Verify Kafka broker is running and accessible.
- Check network connectivity between components.

## Future Improvements

- Implement streaming recognition for lower latency.
- Add support for multiple languages.
- Enhance error handling and logging.
