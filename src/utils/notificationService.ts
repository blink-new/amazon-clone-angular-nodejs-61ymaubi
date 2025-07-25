import { blink } from '../blink/client'
import { Booking, Event } from '../types'

export const sendBookingConfirmation = async (booking: Booking, event: Event) => {
  try {
    const emailHtml = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a365d 0%, #3182ce 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: rgba(255,255,255,0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">🎫</span>
          </div>
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Booking Confirmed!</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9; font-weight: 300;">Your tickets are ready for pickup</p>
        </div>
        
        <!-- Event Details -->
        <div style="padding: 40px 30px; background: #f8fafc;">
          <div style="background: white; border-radius: 16px; padding: 30px; margin-bottom: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
            <h2 style="color: #1a365d; margin: 0 0 25px 0; font-size: 28px; font-weight: 700; line-height: 1.2;">${event.title}</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
              <div style="padding: 15px; background: #f7fafc; border-radius: 12px; border-left: 4px solid #3182ce;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 20px; margin-right: 10px;">📅</span>
                  <strong style="color: #4a5568; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Date</strong>
                </div>
                <span style="color: #2d3748; font-size: 16px; font-weight: 600;">${new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div style="padding: 15px; background: #f7fafc; border-radius: 12px; border-left: 4px solid #3182ce;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 20px; margin-right: 10px;">🕐</span>
                  <strong style="color: #4a5568; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Time</strong>
                </div>
                <span style="color: #2d3748; font-size: 16px; font-weight: 600;">${event.time}</span>
              </div>
              <div style="padding: 15px; background: #f7fafc; border-radius: 12px; border-left: 4px solid #3182ce;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 20px; margin-right: 10px;">📍</span>
                  <strong style="color: #4a5568; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Venue</strong>
                </div>
                <span style="color: #2d3748; font-size: 16px; font-weight: 600;">${event.venue}</span>
              </div>
              <div style="padding: 15px; background: #f7fafc; border-radius: 12px; border-left: 4px solid #3182ce;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 20px; margin-right: 10px;">🎫</span>
                  <strong style="color: #4a5568; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Seats</strong>
                </div>
                <span style="color: #2d3748; font-size: 16px; font-weight: 600;">${booking.seat_count} seat${booking.seat_count > 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <!-- Booking Summary -->
            <div style="border-top: 2px solid #e2e8f0; padding-top: 25px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                  <strong style="color: #4a5568; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Booking Reference</strong><br>
                  <code style="background: #edf2f7; padding: 8px 12px; border-radius: 8px; color: #2d3748; font-size: 16px; font-weight: 600; letter-spacing: 1px;">${booking.booking_reference || booking.id.slice(-8).toUpperCase()}</code>
                </div>
                <div style="text-align: right;">
                  <strong style="color: #4a5568; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Total Amount</strong><br>
                  <span style="font-size: 32px; color: #38a169; font-weight: 700;">$${booking.total_amount.toFixed(2)}</span>
                </div>
              </div>
              <div style="background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 12px; padding: 15px; margin-top: 20px;">
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 24px; margin-right: 12px;">✅</span>
                  <div>
                    <strong style="color: #22543d; font-size: 16px;">Payment Confirmed</strong><br>
                    <span style="color: #2f855a; font-size: 14px;">Your booking is confirmed and tickets are ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- QR Code Section -->
          <div style="background: white; border-radius: 16px; padding: 30px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; margin-bottom: 25px;">
            <h3 style="color: #1a365d; margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">📱 Digital Ticket</h3>
            <div style="background: #f7fafc; border-radius: 16px; padding: 25px; margin-bottom: 20px;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&format=png&margin=20&data=${encodeURIComponent(JSON.stringify({
                bookingId: booking.id,
                eventId: booking.event_id,
                seats: booking.seat_count,
                customerEmail: booking.customer_email,
                reference: booking.booking_reference || booking.id.slice(-8).toUpperCase()
              }))}" alt="Ticket QR Code" style="border: 3px solid #e2e8f0; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            </div>
            <p style="color: #4a5568; margin: 0; font-size: 16px; line-height: 1.5;">
              <strong>Present this QR code at the venue entrance</strong><br>
              <span style="font-size: 14px; opacity: 0.8;">Screenshots are acceptable • Keep this email handy</span>
            </p>
          </div>
          
          <!-- Important Information -->
          <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
            <h4 style="color: #1a365d; margin: 0 0 20px 0; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 10px;">ℹ️</span>
              Important Information
            </h4>
            <div style="background: #fffaf0; border-left: 4px solid #f6ad55; padding: 20px; border-radius: 0 12px 12px 0; margin-bottom: 20px;">
              <ul style="color: #744210; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>Arrive early:</strong> Please arrive at least 30 minutes before the event starts</li>
                <li><strong>Valid ID required:</strong> Bring identification that matches the booking name</li>
                <li><strong>Digital tickets:</strong> Screenshots of the QR code are perfectly acceptable</li>
                <li><strong>Need help?</strong> Contact our support team for any booking changes</li>
                <li><strong>Weather policy:</strong> Check our website for weather-related updates</li>
              </ul>
            </div>
            
            <!-- Contact Support -->
            <div style="text-align: center; padding: 20px; background: #f7fafc; border-radius: 12px;">
              <h5 style="color: #2d3748; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Need assistance?</h5>
              <p style="color: #4a5568; margin: 0 0 15px 0; font-size: 14px;">Our support team is here to help</p>
              <a href="mailto:support@tickethub.com" style="background: #3182ce; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Contact Support</a>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #2d3748; color: white; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700;">🎉 Thank you for choosing TicketHub!</h3>
            <p style="margin: 0; font-size: 16px; opacity: 0.8;">Your entertainment, our passion</p>
          </div>
          <div style="border-top: 1px solid #4a5568; padding-top: 20px;">
            <p style="margin: 0; font-size: 14px; opacity: 0.7;">
              © 2024 TicketHub. All rights reserved.<br>
              <a href="mailto:support@tickethub.com" style="color: #63b3ed; text-decoration: none;">support@tickethub.com</a> • 
              <a href="#" style="color: #63b3ed; text-decoration: none;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </div>
    `

    const emailText = `
BOOKING CONFIRMATION - TicketHub
================================

🎫 Your booking is confirmed!

EVENT DETAILS:
Event: ${event.title}
Date: ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${event.time}
Venue: ${event.venue}
Seats: ${booking.seat_count} seat${booking.seat_count > 1 ? 's' : ''}

BOOKING SUMMARY:
Booking Reference: ${booking.booking_reference || booking.id.slice(-8).toUpperCase()}
Customer: ${booking.customer_name}
Email: ${booking.customer_email}
Total Amount: $${booking.total_amount.toFixed(2)}
Payment Status: Confirmed

IMPORTANT REMINDERS:
• Arrive at least 30 minutes before the event starts
• Bring a valid ID that matches the booking name
• Present your QR code at the venue entrance
• Screenshots of the QR code are acceptable
• Contact support@tickethub.com for any assistance

Thank you for choosing TicketHub!
Your entertainment, our passion.

© 2024 TicketHub. All rights reserved.
    `

    const result = await blink.notifications.email({
      to: booking.customer_email,
      from: 'bookings@tickethub.com',
      replyTo: 'support@tickethub.com',
      subject: `🎫 Booking Confirmed - ${event.title} | Ref: ${booking.booking_reference || booking.id.slice(-8).toUpperCase()}`,
      html: emailHtml,
      text: emailText
    })

    console.log('✅ Booking confirmation email sent successfully:', result.messageId)
    return result
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error)
    throw error
  }
}

export const sendEventReminder = async (booking: Booking, event: Event, reminderType: 'day_before' | 'hour_before' = 'day_before') => {
  try {
    const timeText = reminderType === 'day_before' ? 'tomorrow' : 'in 1 hour'
    const urgencyColor = reminderType === 'day_before' ? '#9f7aea' : '#f56565'
    
    const emailHtml = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, #667eea 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: rgba(255,255,255,0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">⏰</span>
          </div>
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Event Reminder</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9; font-weight: 300;">Your event is ${timeText}!</p>
        </div>
        
        <!-- Event Details -->
        <div style="padding: 40px 30px; background: #f8fafc;">
          <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; margin-bottom: 25px;">
            <h2 style="color: #1a365d; margin: 0 0 25px 0; font-size: 28px; font-weight: 700; line-height: 1.2;">${event.title}</h2>
            
            <div style="background: #fff5f5; border: 2px solid #fed7d7; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 24px; margin-right: 12px;">🚨</span>
                <strong style="color: #c53030; font-size: 18px;">Event starts ${timeText}!</strong>
              </div>
              <p style="color: #742a2a; margin: 0; font-size: 16px; line-height: 1.5;">
                📅 <strong>${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at <strong>${event.time}</strong><br>
                📍 <strong>${event.venue}</strong>
              </p>
            </div>
            
            <!-- Checklist -->
            <div style="background: #f0fff4; border: 2px solid #9ae6b4; border-radius: 12px; padding: 25px;">
              <h3 style="color: #22543d; margin: 0 0 15px 0; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
                <span style="font-size: 24px; margin-right: 10px;">✅</span>
                Pre-Event Checklist
              </h3>
              <ul style="color: #2f855a; margin: 0; padding-left: 20px; line-height: 2;">
                <li><strong>QR Code Ready:</strong> Have your digital ticket accessible</li>
                <li><strong>Valid ID:</strong> Bring identification matching your booking</li>
                <li><strong>Arrive Early:</strong> Plan to arrive 30 minutes before start time</li>
                <li><strong>Check Weather:</strong> Dress appropriately for outdoor events</li>
                <li><strong>Parking Info:</strong> Review venue parking options in advance</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 25px; padding: 20px; background: #f7fafc; border-radius: 12px;">
              <p style="color: #4a5568; margin: 0 0 15px 0; font-size: 16px;">
                <strong>Booking Reference:</strong> 
                <code style="background: #edf2f7; padding: 6px 12px; border-radius: 6px; color: #2d3748; font-weight: 600; margin-left: 8px;">${booking.booking_reference || booking.id.slice(-8).toUpperCase()}</code>
              </p>
              <p style="color: #4a5568; margin: 0; font-size: 14px;">
                ${booking.seat_count} seat${booking.seat_count > 1 ? 's' : ''} • $${booking.total_amount.toFixed(2)}
              </p>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
            <h3 style="color: #1a365d; margin: 0 0 20px 0; font-size: 20px; font-weight: 700; text-align: center;">Quick Actions</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <a href="mailto:support@tickethub.com?subject=Booking%20${booking.booking_reference || booking.id.slice(-8).toUpperCase()}" style="background: #3182ce; color: white; padding: 15px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; text-align: center; display: block;">
                📧 Contact Support
              </a>
              <a href="#" style="background: #38a169; color: white; padding: 15px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; text-align: center; display: block;">
                🗺️ Get Directions
              </a>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #2d3748; color: white; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="margin: 0; font-size: 16px;">
            Have an amazing time at <strong>${event.title}</strong>! 🎉<br>
            <span style="font-size: 14px; opacity: 0.7;">
              <a href="mailto:support@tickethub.com" style="color: #63b3ed; text-decoration: none;">support@tickethub.com</a>
            </span>
          </p>
        </div>
      </div>
    `

    const result = await blink.notifications.email({
      to: booking.customer_email,
      from: 'reminders@tickethub.com',
      replyTo: 'support@tickethub.com',
      subject: `⏰ Reminder: ${event.title} is ${timeText}! | Ref: ${booking.booking_reference || booking.id.slice(-8).toUpperCase()}`,
      html: emailHtml,
      text: `Event Reminder: ${event.title} is ${timeText} at ${event.time} at ${event.venue}. Don't forget your ticket and ID!`
    })

    console.log('✅ Event reminder email sent successfully:', result.messageId)
    return result
  } catch (error) {
    console.error('❌ Error sending event reminder email:', error)
    throw error
  }
}

export const sendBookingCancellation = async (booking: Booking, event: Event) => {
  try {
    const refundAmount = booking.total_amount * 0.9 // 90% refund (10% cancellation fee)
    
    const emailHtml = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #e53e3e 0%, #fc8181 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: rgba(255,255,255,0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">❌</span>
          </div>
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Booking Cancelled</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9; font-weight: 300;">Your refund is being processed</p>
        </div>
        
        <!-- Cancellation Details -->
        <div style="padding: 40px 30px; background: #f8fafc;">
          <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; margin-bottom: 25px;">
            <h2 style="color: #1a365d; margin: 0 0 25px 0; font-size: 24px; font-weight: 700;">Cancelled Event</h2>
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 20px;">${event.title}</h3>
            <p style="color: #4a5568; margin: 0 0 20px 0; font-size: 16px;">
              📅 ${new Date(event.date).toLocaleDateString()} at ${event.time}<br>
              📍 ${event.venue}
            </p>
            
            <!-- Refund Information -->
            <div style="background: #f0fff4; border: 2px solid #9ae6b4; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
              <h4 style="color: #22543d; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">💰 Refund Details</h4>
              <div style="color: #2f855a; line-height: 1.8;">
                <p style="margin: 0 0 10px 0;"><strong>Original Amount:</strong> $${booking.total_amount.toFixed(2)}</p>
                <p style="margin: 0 0 10px 0;"><strong>Cancellation Fee:</strong> $${(booking.total_amount * 0.1).toFixed(2)}</p>
                <p style="margin: 0; font-size: 18px;"><strong>Refund Amount:</strong> <span style="font-size: 24px; font-weight: 700;">$${refundAmount.toFixed(2)}</span></p>
              </div>
            </div>
            
            <div style="background: #fffaf0; border: 2px solid #f6ad55; border-radius: 12px; padding: 20px;">
              <p style="color: #744210; margin: 0; font-size: 16px; line-height: 1.6;">
                <strong>⏱️ Processing Time:</strong> Your refund will be processed within 3-5 business days and will appear on your original payment method.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 25px; padding: 20px; background: #f7fafc; border-radius: 12px;">
              <p style="color: #4a5568; margin: 0; font-size: 16px;">
                <strong>Booking Reference:</strong> 
                <code style="background: #edf2f7; padding: 6px 12px; border-radius: 6px; color: #2d3748; font-weight: 600; margin-left: 8px;">${booking.booking_reference || booking.id.slice(-8).toUpperCase()}</code>
              </p>
            </div>
          </div>
          
          <!-- Support Section -->
          <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
            <h3 style="color: #1a365d; margin: 0 0 20px 0; font-size: 20px; font-weight: 700; text-align: center;">Need Help?</h3>
            <p style="color: #4a5568; margin: 0 0 20px 0; text-align: center; font-size: 16px;">
              Our support team is here to assist you with any questions about your cancellation or refund.
            </p>
            <div style="text-align: center;">
              <a href="mailto:support@tickethub.com?subject=Cancellation%20${booking.booking_reference || booking.id.slice(-8).toUpperCase()}" style="background: #3182ce; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: 600; display: inline-block;">
                📧 Contact Support
              </a>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #2d3748; color: white; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="margin: 0; font-size: 16px;">
            We're sorry to see you go! 😔<br>
            <span style="font-size: 14px; opacity: 0.7;">
              We hope to serve you again soon • <a href="mailto:support@tickethub.com" style="color: #63b3ed; text-decoration: none;">support@tickethub.com</a>
            </span>
          </p>
        </div>
      </div>
    `

    const result = await blink.notifications.email({
      to: booking.customer_email,
      from: 'cancellations@tickethub.com',
      replyTo: 'support@tickethub.com',
      subject: `❌ Booking Cancelled - ${event.title} | Refund Processing | Ref: ${booking.booking_reference || booking.id.slice(-8).toUpperCase()}`,
      html: emailHtml,
      text: `Booking Cancelled: ${event.title}. Refund of $${refundAmount.toFixed(2)} will be processed within 3-5 business days. Booking Reference: ${booking.booking_reference || booking.id.slice(-8).toUpperCase()}`
    })

    console.log('✅ Booking cancellation email sent successfully:', result.messageId)
    return result
  } catch (error) {
    console.error('❌ Error sending booking cancellation email:', error)
    throw error
  }
}

export const sendWelcomeEmail = async (userEmail: string, userName: string) => {
  try {
    const emailHtml = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: rgba(255,255,255,0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">🎉</span>
          </div>
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Welcome to TicketHub!</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9; font-weight: 300;">Your gateway to amazing experiences</p>
        </div>
        
        <!-- Welcome Content -->
        <div style="padding: 40px 30px; background: #f8fafc;">
          <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; margin-bottom: 25px;">
            <h2 style="color: #1a365d; margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">Hi ${userName}! 👋</h2>
            <p style="color: #4a5568; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
              Thank you for joining TicketHub! We're excited to help you discover and book amazing events, from blockbuster movies to live concerts and sporting events.
            </p>
            
            <!-- Features Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
              <div style="text-align: center; padding: 20px; background: #f7fafc; border-radius: 12px;">
                <span style="font-size: 32px; display: block; margin-bottom: 10px;">🎬</span>
                <h4 style="color: #2d3748; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Movies</h4>
                <p style="color: #4a5568; margin: 0; font-size: 14px;">Latest blockbusters and indie films</p>
              </div>
              <div style="text-align: center; padding: 20px; background: #f7fafc; border-radius: 12px;">
                <span style="font-size: 32px; display: block; margin-bottom: 10px;">🎵</span>
                <h4 style="color: #2d3748; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Concerts</h4>
                <p style="color: #4a5568; margin: 0; font-size: 14px;">Live music from top artists</p>
              </div>
              <div style="text-align: center; padding: 20px; background: #f7fafc; border-radius: 12px;">
                <span style="font-size: 32px; display: block; margin-bottom: 10px;">⚽</span>
                <h4 style="color: #2d3748; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Sports</h4>
                <p style="color: #4a5568; margin: 0; font-size: 14px;">Exciting games and matches</p>
              </div>
              <div style="text-align: center; padding: 20px; background: #f7fafc; border-radius: 12px;">
                <span style="font-size: 32px; display: block; margin-bottom: 10px;">🎭</span>
                <h4 style="color: #2d3748; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Theater</h4>
                <p style="color: #4a5568; margin: 0; font-size: 14px;">Broadway shows and plays</p>
              </div>
            </div>
            
            <!-- Getting Started -->
            <div style="background: #f0fff4; border: 2px solid #9ae6b4; border-radius: 12px; padding: 25px; margin-top: 25px;">
              <h3 style="color: #22543d; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">🚀 Getting Started</h3>
              <ul style="color: #2f855a; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Browse events by category or search for specific shows</li>
                <li>Select your preferred seats with our interactive seat map</li>
                <li>Complete your booking with secure payment processing</li>
                <li>Receive digital tickets with QR codes via email</li>
                <li>Present your QR code at the venue for easy entry</li>
              </ul>
            </div>
          </div>
          
          <!-- Call to Action -->
          <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; text-align: center;">
            <h3 style="color: #1a365d; margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">Ready to explore?</h3>
            <p style="color: #4a5568; margin: 0 0 25px 0; font-size: 16px;">
              Discover amazing events happening near you and book your tickets today!
            </p>
            <a href="#" style="background: #3182ce; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px;">
              🎫 Browse Events
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #2d3748; color: white; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 15px 0; font-size: 16px;">
            Welcome to the TicketHub family! 🎉
          </p>
          <p style="margin: 0; font-size: 14px; opacity: 0.7;">
            Questions? We're here to help! <a href="mailto:support@tickethub.com" style="color: #63b3ed; text-decoration: none;">support@tickethub.com</a>
          </p>
        </div>
      </div>
    `

    const result = await blink.notifications.email({
      to: userEmail,
      from: 'welcome@tickethub.com',
      replyTo: 'support@tickethub.com',
      subject: '🎉 Welcome to TicketHub - Your Entertainment Journey Starts Here!',
      html: emailHtml,
      text: `Welcome to TicketHub, ${userName}! Discover amazing events and book tickets with ease. Browse movies, concerts, sports, and theater events. Get started today!`
    })

    console.log('✅ Welcome email sent successfully:', result.messageId)
    return result
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    throw error
  }
}