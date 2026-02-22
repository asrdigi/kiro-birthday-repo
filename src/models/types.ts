/**
 * Core data model interfaces and types for the Birthday WhatsApp Messenger
 */

/**
 * Friend record containing all required information for birthday messaging
 */
export interface Friend {
  /** Unique identifier (row number or generated) */
  id: string;
  
  /** Friend's full name */
  name: string;
  
  /** Date of birth (parsed date object) */
  birthdate: Date;
  
  /** Language code for message generation (e.g., 'es', 'hi', 'fr') */
  motherTongue: string;
  
  /** WhatsApp phone number in E.164 format (+1234567890) */
  whatsappNumber: string;
  
  /** Country name for timezone lookup */
  country: string;
  
  /** IANA timezone (e.g., 'America/New_York') */
  timezone: string;
}

/**
 * Record of a sent birthday message stored in the database
 */
export interface SentMessageRecord {
  /** Auto-incremented primary key */
  id: number;
  
  /** Friend identifier (references Friend.id) */
  friendId: string;
  
  /** Calendar year the message was sent */
  year: number;
  
  /** WhatsApp message ID (if available) */
  messageId: string | null;
  
  /** The actual message content that was sent */
  messageContent: string;
  
  /** Timestamp when the message was sent */
  timestamp: Date;
  
  /** Delivery status of the message */
  deliveryStatus: 'sent' | 'failed' | 'pending';
}

/**
 * Birthday event detected by the scheduler
 */
export interface BirthdayEvent {
  /** Friend whose birthday it is */
  friend: Friend;
  
  /** Local time in the friend's timezone (ISO string representation) */
  localTime: string;
  
  /** Whether a message should be sent for this event */
  shouldSend: boolean;
}

/**
 * Result of a WhatsApp message delivery attempt
 */
export interface DeliveryResult {
  /** Whether the message was successfully delivered */
  success: boolean;
  
  /** WhatsApp message ID (if successful) */
  messageId?: string;
  
  /** Timestamp of the delivery attempt */
  timestamp: Date;
  
  /** Error message (if delivery failed) */
  error?: string;
}

/**
 * Result of validating a friend record
 */
export interface ValidationResult {
  /** Whether the record is valid */
  isValid: boolean;
  
  /** Array of validation error messages (empty if valid) */
  errors: string[];
}
