"""
Message Queue Service

This module provides abstraction for message queue operations.
Supports both Kafka and RabbitMQ for real-time data streaming.
For MVP, uses in-memory queue. In production, switches to Kafka/RabbitMQ.
"""

from typing import Dict, Any, Callable, Optional
from loguru import logger
import asyncio
from enum import Enum


class QueueType(str, Enum):
    """Message queue type enumeration"""
    KAFKA = "kafka"
    RABBITMQ = "rabbitmq"
    MEMORY = "memory"  # For MVP/testing


class MessageQueueService:
    """
    Message queue service abstraction
    
    Handles:
    - Publishing messages to topics/queues
    - Consuming messages from topics/queues
    - Real-time data streaming
    """
    
    def __init__(self, queue_type: QueueType = QueueType.MEMORY):
        """
        Initialize message queue service
        
        Args:
            queue_type: Type of queue to use (Kafka, RabbitMQ, or Memory)
        """
        self.queue_type = queue_type
        self.producer = None
        self.consumer = None
        self._memory_queue: Dict[str, list] = {}  # For MVP in-memory queue
        
        if queue_type == QueueType.KAFKA:
            self._init_kafka()
        elif queue_type == QueueType.RABBITMQ:
            self._init_rabbitmq()
        else:
            logger.info("Using in-memory message queue for MVP")
    
    def _init_kafka(self) -> None:
        """Initialize Kafka producer and consumer"""
        try:
            from kafka import KafkaProducer, KafkaConsumer
            from kafka.admin import KafkaAdminClient, NewTopic
            
            # Initialize Kafka producer
            self.producer = KafkaProducer(
                bootstrap_servers=['localhost:9092'],
                value_serializer=lambda v: str(v).encode('utf-8')
            )
            
            logger.info("✅ Kafka producer initialized")
        except ImportError:
            logger.warning("Kafka not available, falling back to memory queue")
            self.queue_type = QueueType.MEMORY
    
    def _init_rabbitmq(self) -> None:
        """Initialize RabbitMQ connection"""
        try:
            import pika
            
            connection = pika.BlockingConnection(
                pika.ConnectionParameters('localhost')
            )
            self.channel = connection.channel()
            
            logger.info("✅ RabbitMQ connection initialized")
        except ImportError:
            logger.warning("RabbitMQ not available, falling back to memory queue")
            self.queue_type = QueueType.MEMORY
    
    async def publish(self, topic: str, message: Dict[str, Any]) -> None:
        """
        Publish a message to a topic/queue
        
        Args:
            topic: Topic/queue name
            message: Message data to publish
        """
        if self.queue_type == QueueType.KAFKA and self.producer:
            try:
                self.producer.send(topic, value=str(message))
                logger.debug(f"Published to Kafka topic {topic}: {message}")
            except Exception as e:
                logger.error(f"Error publishing to Kafka: {e}")
        elif self.queue_type == QueueType.RABBITMQ and hasattr(self, 'channel'):
            try:
                self.channel.basic_publish(
                    exchange='',
                    routing_key=topic,
                    body=str(message)
                )
                logger.debug(f"Published to RabbitMQ queue {topic}: {message}")
            except Exception as e:
                logger.error(f"Error publishing to RabbitMQ: {e}")
        else:
            # In-memory queue for MVP
            if topic not in self._memory_queue:
                self._memory_queue[topic] = []
            self._memory_queue[topic].append(message)
            logger.debug(f"Published to memory queue {topic}: {message}")
    
    async def consume(
        self, 
        topic: str, 
        callback: Callable[[Dict[str, Any]], None],
        timeout: Optional[float] = None
    ) -> None:
        """
        Consume messages from a topic/queue
        
        Args:
            topic: Topic/queue name
            callback: Function to call for each message
            timeout: Optional timeout in seconds
        """
        if self.queue_type == QueueType.KAFKA:
            try:
                from kafka import KafkaConsumer
                consumer = KafkaConsumer(
                    topic,
                    bootstrap_servers=['localhost:9092'],
                    value_deserializer=lambda m: m.decode('utf-8')
                )
                for message in consumer:
                    callback(message.value)
            except Exception as e:
                logger.error(f"Error consuming from Kafka: {e}")
        elif self.queue_type == QueueType.RABBITMQ and hasattr(self, 'channel'):
            try:
                def on_message(ch, method, properties, body):
                    callback(body.decode('utf-8'))
                
                self.channel.basic_consume(
                    queue=topic,
                    on_message_callback=on_message,
                    auto_ack=True
                )
                self.channel.start_consuming()
            except Exception as e:
                logger.error(f"Error consuming from RabbitMQ: {e}")
        else:
            # In-memory queue for MVP
            if topic in self._memory_queue:
                for message in self._memory_queue[topic]:
                    callback(message)
                self._memory_queue[topic] = []  # Clear after processing

